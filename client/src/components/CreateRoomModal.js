import React, { useState } from 'react';
import './CreateRoomModal.css';

const ICONS = ['💬', '🚀', '🎮', '🎵', '📚', '💡', '🌍', '🔥', '⚡', '🎨', '🏆', '🤝'];

const CreateRoomModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '', icon: '💬', isPrivate: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Room name is required');
      return;
    }
    setLoading(true);
    try {
      await onCreate(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal create-room-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create a Room</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Icon picker */}
          <div className="form-group">
            <label className="form-label">Room Icon</label>
            <div className="icon-picker">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${form.icon === icon ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Room Name *</label>
            <input
              className="input"
              type="text"
              name="name"
              placeholder="e.g. general, random, gaming..."
              value={form.name}
              onChange={handleChange}
              maxLength={30}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description <span className="optional">(optional)</span></label>
            <input
              className="input"
              type="text"
              name="description"
              placeholder="What is this room about?"
              value={form.description}
              onChange={handleChange}
              maxLength={120}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="btn-spinner"></span> Creating...</>
              ) : (
                <>{form.icon} Create Room</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
