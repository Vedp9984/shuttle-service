import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const RemoveBusStopModal = ({ isOpen, onClose }) => {
  const [busStopId, setBusStopId] = useState('');

  const handleDelete = async () => {
    if (!busStopId.trim()) {
      toast.error('Please enter a Bus Stop ID to delete.');
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/busstops/${busStopId}`);
      toast.success('Bus Stop deleted successfully!');
      setBusStopId('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete bus stop');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Remove Bus Stop</h2>
        <p>Enter the Bus Stop ID you want to delete:</p>
        <input
          type="text"
          placeholder="Bus Stop ID"
          value={busStopId}
          onChange={e => setBusStopId(e.target.value)}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button-secondary">Cancel</button>
          <button onClick={handleDelete} className="modal-button-danger">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default RemoveBusStopModal;
