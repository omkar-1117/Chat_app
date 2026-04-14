const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Update room's lastMessage and lastActivity on save
messageSchema.post('save', async function () {
  try {
    await mongoose.model('Room').findByIdAndUpdate(this.room, {
      lastMessage: this._id,
      lastActivity: new Date(),
    });
  } catch (err) {
    console.error('Error updating room last message:', err);
  }
});

module.exports = mongoose.model('Message', messageSchema);
