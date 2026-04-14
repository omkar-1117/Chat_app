const express = require('express');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all public rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('creator', 'username avatar')
      .populate('lastMessage')
      .sort({ lastActivity: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a room
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, isPrivate, icon } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name is required' });

    const existing = await Room.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: 'Room name already exists' });

    const room = await Room.create({
      name: name.trim(),
      description: description?.trim() || '',
      creator: req.user._id,
      members: [req.user._id],
      isPrivate: isPrivate || false,
      icon: icon || '💬',
    });

    await room.populate('creator', 'username avatar');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get room by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join a room
router.post('/:id/join', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json({ message: 'Joined room', room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a room (creator only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
