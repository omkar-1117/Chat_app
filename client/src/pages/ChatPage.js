import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import CreateRoomModal from '../components/CreateRoomModal';
import './ChatPage.css';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const prevRoomRef = useRef(null);

  // Fetch rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms');
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('message_history', (history) => {
      setMessages(history);
    });

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('room_users', ({ roomId, users }) => {
      if (activeRoom && roomId === activeRoom._id) {
        setOnlineUsers(users);
      }
    });

    socket.on('user_typing', ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        }
        return prev.filter((u) => u !== username);
      });
    });

    socket.on('user_joined', ({ username }) => {
      setMessages((prev) => [
        ...prev,
        { _id: Date.now(), type: 'system', content: `${username} joined the room`, createdAt: new Date() },
      ]);
    });

    socket.on('user_left', ({ username }) => {
      setMessages((prev) => [
        ...prev,
        { _id: Date.now() + 1, type: 'system', content: `${username} left the room`, createdAt: new Date() },
      ]);
    });

    return () => {
      socket.off('message_history');
      socket.off('receive_message');
      socket.off('room_users');
      socket.off('user_typing');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket, activeRoom]);

  // Join/leave rooms
  useEffect(() => {
    if (!socket) return;

    if (prevRoomRef.current) {
      socket.emit('leave_room', {
        roomId: prevRoomRef.current._id,
        username: user.username,
      });
    }

    if (activeRoom) {
      setMessages([]);
      setTypingUsers([]);
      socket.emit('join_room', {
        roomId: activeRoom._id,
        userId: user._id,
        username: user.username,
      });
    }

    prevRoomRef.current = activeRoom;
  }, [activeRoom, socket, user]);

  const sendMessage = (content) => {
    if (!socket || !activeRoom || !content.trim()) return;
    socket.emit('send_message', {
      roomId: activeRoom._id,
      userId: user._id,
      content: content.trim(),
      username: user.username,
      avatar: user.avatar,
    });
  };

  const handleTyping = (isTyping) => {
    if (!socket || !activeRoom) return;
    socket.emit('typing', { roomId: activeRoom._id, username: user.username, isTyping });
  };

  const handleCreateRoom = async (roomData) => {
    try {
      const { data } = await axios.post('/api/rooms', roomData);
      setRooms((prev) => [data, ...prev]);
      setActiveRoom(data);
      setShowCreateRoom(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(`/api/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      if (activeRoom?._id === roomId) setActiveRoom(null);
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  return (
    <div className="chat-page">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        onCreateRoom={() => setShowCreateRoom(true)}
        onDeleteRoom={handleDeleteRoom}
        user={user}
        onLogout={logout}
        loadingRooms={loadingRooms}
      />

      <div className="chat-main">
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            messages={messages}
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            typingUsers={typingUsers}
            onlineUsers={onlineUsers}
            currentUser={user}
          />
        ) : (
          <div className="chat-empty">
            <div className="empty-content">
              <div className="empty-icon">⚡</div>
              <h2 className="empty-title">Welcome to ChatWave</h2>
              <p className="empty-subtitle">Select a room from the sidebar or create a new one to start chatting</p>
              <button className="btn btn-primary" onClick={() => setShowCreateRoom(true)}>
                + Create a Room
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
};

export default ChatPage;
