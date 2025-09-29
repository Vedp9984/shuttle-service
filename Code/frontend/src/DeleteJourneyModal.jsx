import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Modal.css';

const API_BASE_URL = 'http://localhost:5000';

const DeleteJourneyModal = ({ isOpen, onClose, journeyId, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/journeys/${journeyId}`);
      toast.success('Journey deleted successfully!');
      onDeleted(); // callback to refresh list
      onClose();
    } catch {
      toast.error('Failed to delete journey');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Confirm Delete Journey</h2>
        <p>Are you sure you want to delete this journey?</p>

        <div className="modal-buttons">
          <button className="modal-button-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-button-primary" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteJourneyModal;
