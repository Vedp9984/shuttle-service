import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css'; // Enhanced modal styles
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000'; // adjust your port if needed

const AddBusStopModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    stopName: '',
    latitude: '',
    longitude: '',
    address: ''
  });
  const [loading, setLoading] = useState(false); // prevent multiple submissions

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const { stopName, latitude, longitude } = formData;

    if (!stopName || !latitude || !longitude) {
      toast.error('Stop Name, Latitude, and Longitude are required.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/busstops`, formData);
      toast.success('Bus Stop added successfully!');
      setFormData({ stopName: '', latitude: '', longitude: '', address: '' });
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add bus stop';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Bus Stop</h2>
        <input
          name="stopName"
          placeholder="Stop Name"
          value={formData.stopName}
          onChange={handleChange}
        />
        <input
          name="latitude"
          placeholder="Latitude"
          type="number"
          value={formData.latitude}
          onChange={handleChange}
        />
        <input
          name="longitude"
          placeholder="Longitude"
          type="number"
          value={formData.longitude}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address (Optional)"
          value={formData.address}
          onChange={handleChange}
        />
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            className="modal-button-primary"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Bus Stop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBusStopModal;
