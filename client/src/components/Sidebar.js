import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({
  rooms,
  activeRoom,
  onSelectRoom,
  onCreateRoom,
  onDeleteRoom,
  user,
  onLogout,
  loadingRooms,
}) => {
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRightClick = (e, room) => {
    e.preventDefault();
    if (room.creator?._id === user._id || room.creator === user._id) {
      setContextMenu({ x: e.clientX, y: e.clientY, room });
    }
  };

  const closeContextMenu = () => setContextMenu(null);

  return (
    <aside className="sidebar" onClick={closeContextMenu}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon-sm">⚡</span>
          <span className="sidebar-brand">ChatWave</span>
        </div>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <img src={user.avatar} alt={user.username} className="avatar" width={36} height={36} />
        <div className="sidebar-user-info">
          <span className="sidebar-username">{user.username}</span>
          <span className="sidebar-status">
            <span className="status-dot"></span> Online
          </span>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sidebar-search-input"
        />
      </div>

      {/* Rooms header */}
      <div className="sidebar-section-header">
        <span>Rooms</span>
        <button className="create-room-btn" onClick={onCreateRoom} title="Create Room">+</button>
      </div>

      {/* Room list */}
      <div className="sidebar-rooms">
        {loadingRooms ? (
          <div className="rooms-loading">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="room-skeleton"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rooms-empty">
            {search ? 'No rooms found' : 'No rooms yet. Create one!'}
          </div>
        ) : (
          filtered.map((room) => (
            <div
              key={room._id}
              className={`room-item ${activeRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => onSelectRoom(room)}
              onContextMenu={(e) => handleRightClick(e, room)}
            >
              <div className="room-icon">{room.icon || '💬'}</div>
              <div className="room-info">
                <span className="room-name">{room.name}</span>
                {room.description && (
                  <span className="room-desc">{room.description}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item danger"
            onClick={() => {
              onDeleteRoom(contextMenu.room._id);
              closeContextMenu();
            }}
          >
            🗑 Delete Room
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
