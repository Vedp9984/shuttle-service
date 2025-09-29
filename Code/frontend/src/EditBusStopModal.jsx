import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const EditBusStopModal = ({ isOpen, onClose }) => {
  const [busStopId, setBusStopId] = useState('');
  const [formData, setFormData] = useState({
    stopName: '',
    latitude: '',
    longitude: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async () => {
  if (!busStopId.trim()) {
    toast.error('Bus Stop ID is required.');
    return;
  }

  // Create a request body with only fields that have values
  const updateData = {};
  for (const key in formData) {
    if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
      updateData[key] = formData[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    toast.warn('No fields entered to update.');
    return;
  }

  try {
    await axios.put(`${API_BASE_URL}/api/busstops/${busStopId}`, updateData);
    toast.success('Bus Stop updated successfully!');
    setBusStopId('');
    setFormData({ stopName: '', latitude: '', longitude: '', address: '' });
    onClose();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update bus stop');
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Bus Stop</h2>

        <input
          placeholder="Bus Stop ID"
          value={busStopId}
          onChange={e => setBusStopId(e.target.value)}
        />
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
          <button onClick={handleSubmit} className="modal-button-primary">Update</button>
          <button onClick={onClose} className="modal-button-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditBusStopModal;
