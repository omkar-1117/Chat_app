const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI;

const getMongoHostLabel = (uri) => {
  try {
    return uri.replace(/^mongodb(?:\+srv)?:\/\//, '').split('/')[0];
  } catch (error) {
    return 'unknown-host';
  }
};

const io = socketIo(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../client/build/index.html'))
  );
}

// Track online users: { socketId -> { userId, username, roomId } }
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`⚡ New connection: ${socket.id}`);

  // User joins a room
  socket.on('join_room', async ({ roomId, userId, username }) => {
    socket.join(roomId);
    onlineUsers.set(socket.id, { userId, username, roomId });

    // Update room members online count
    const usersInRoom = [...onlineUsers.values()].filter((u) => u.roomId === roomId);
    const uniqueUsers = [...new Map(usersInRoom.map((u) => [u.userId, u])).values()];

    io.to(roomId).emit('room_users', { roomId, users: uniqueUsers });

    // System message
    socket.to(roomId).emit('user_joined', { username, roomId });

    // Send recent message history
    try {
      const messages = await Message.find({ room: roomId })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      socket.emit('message_history', messages.reverse());
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  });

  // Handle new message
  socket.on('send_message', async ({ roomId, userId, content, username, avatar }) => {
    try {
      const message = new Message({
        room: roomId,
        sender: userId,
        content,
        type: 'text',
      });
      await message.save();

      const populated = await Message.findById(message._id).populate('sender', 'username avatar');

      io.to(roomId).emit('receive_message', {
        _id: populated._id,
        content: populated.content,
        sender: populated.sender,
        room: roomId,
        createdAt: populated.createdAt,
        type: 'text',
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomId, username, isTyping }) => {
    socket.to(roomId).emit('user_typing', { username, isTyping });
  });

  // Leave room
  socket.on('leave_room', ({ roomId, username }) => {
    socket.leave(roomId);
    onlineUsers.delete(socket.id);
    socket.to(roomId).emit('user_left', { username, roomId });

    const usersInRoom = [...onlineUsers.values()].filter((u) => u.roomId === roomId);
    const uniqueUsers = [...new Map(usersInRoom.map((u) => [u.userId, u])).values()];
    io.to(roomId).emit('room_users', { roomId, users: uniqueUsers });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      const { roomId, username } = user;
      onlineUsers.delete(socket.id);
      socket.to(roomId).emit('user_left', { username, roomId });

      const usersInRoom = [...onlineUsers.values()].filter((u) => u.roomId === roomId);
      const uniqueUsers = [...new Map(usersInRoom.map((u) => [u.userId, u])).values()];
      io.to(roomId).emit('room_users', { roomId, users: uniqueUsers });
    }
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env. Add your MongoDB Atlas connection string and restart.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${getMongoHostLabel(MONGODB_URI)}`);
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('MongoDB connection failed.');
    console.error(`Target: ${getMongoHostLabel(MONGODB_URI)}`);
    console.error('Check your Atlas username/password, database user permissions, and Network Access IP allowlist.');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
