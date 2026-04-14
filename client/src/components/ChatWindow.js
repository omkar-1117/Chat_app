import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';

const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ type: 'date', label: msgDate, id: `date-${msgDate}` });
    }
    groups.push(msg);
  });
  return groups;
};

const ChatWindow = ({
  room,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  onlineUsers,
  currentUser,
}) => {
  const [input, setInput] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
    onTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    onTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
  };

  const grouped = groupMessagesByDate(messages);

  const renderMessage = (msg, index) => {
    if (msg.type === 'date') {
      return (
        <div key={msg.id} className="date-divider">
          <span>{msg.label}</span>
        </div>
      );
    }
    if (msg.type === 'system') {
      return (
        <div key={msg._id} className="system-message">
          {msg.content}
        </div>
      );
    }

    const isOwn = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
    const prevMsg = grouped[index - 1];
    const isConsecutive =
      prevMsg &&
      prevMsg.type !== 'date' &&
      prevMsg.type !== 'system' &&
      (prevMsg.sender?._id === msg.sender?._id || prevMsg.sender === msg.sender?._id) &&
      new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 5 * 60 * 1000;

    return (
      <div key={msg._id} className={`message-wrapper ${isOwn ? 'own' : ''} ${isConsecutive ? 'consecutive' : ''}`}>
        {!isOwn && !isConsecutive && (
          <img
            src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.username}&background=7c6aff&color=fff`}
            alt={msg.sender?.username}
            className="avatar message-avatar"
            width={32}
            height={32}
          />
        )}
        {!isOwn && isConsecutive && <div className="avatar-placeholder"></div>}

        <div className="message-content-wrapper">
          {!isOwn && !isConsecutive && (
            <span className="message-sender">{msg.sender?.username}</span>
          )}
          <div className="message-bubble">
            <p className="message-text">{msg.content}</p>
            <span className="message-time">{formatTime(msg.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-room-icon">{room.icon || '💬'}</div>
          <div>
            <h2 className="chat-room-name">{room.name}</h2>
            {room.description && (
              <p className="chat-room-desc">{room.description}</p>
            )}
          </div>
        </div>
        <div className="chat-header-right">
          <button
            className={`users-toggle-btn ${showUsers ? 'active' : ''}`}
            onClick={() => setShowUsers(!showUsers)}
            title="Online users"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {onlineUsers.length > 0 && (
              <span className="online-count">{onlineUsers.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="chat-body">
        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="messages-empty">
              <div className="empty-room-icon">{room.icon || '💬'}</div>
              <p>No messages yet. Be the first to say something!</p>
            </div>
          ) : (
            grouped.map((item, index) => renderMessage(item, index))
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="typing-text">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.join(', ')} are typing...`}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Online users panel */}
        {showUsers && (
          <div className="online-users-panel">
            <div className="online-panel-header">
              Online — {onlineUsers.length}
            </div>
            <div className="online-users-list">
              {onlineUsers.length === 0 ? (
                <p className="no-users">No users online</p>
              ) : (
                onlineUsers.map((u) => (
                  <div key={u.userId} className="online-user-item">
                    <div className="online-avatar-wrap">
                      <img
                        src={`https://ui-avatars.com/api/?name=${u.username}&background=7c6aff&color=fff&size=64`}
                        alt={u.username}
                        className="avatar"
                        width={30}
                        height={30}
                      />
                      <span className="online-dot"></span>
                    </div>
                    <span className="online-username">{u.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder={`Message #${room.name}`}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={`send-btn ${input.trim() ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="input-hint">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default ChatWindow;
