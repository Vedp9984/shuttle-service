import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const AddVehicleModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    manufacturer: '',
    year: new Date().getFullYear(),
    totalSeats: '',
    standingCapacity: 0,
    owner: {
      name: '',
      phoneNumber: '',
      email: '',
      address: ''
    },
    status: 'Active',
    color: '',
    vin: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested owner properties
    if (name.startsWith('owner.')) {
      const ownerProp = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        owner: {
          ...prev.owner,
          [ownerProp]: value
        }
      }));
    } 
      else if (['totalSeats', 'standingCapacity', 'year'].includes(name)) {
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value) // ✅ convert to number or allow empty
    }));
  }else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const { plateNumber, model, standingCapacity, owner } = formData;
    console.log('Submitting vehicle with data:', formData);
    // Validate required fields
    if (!plateNumber || !model || !standingCapacity || !owner.name) {
      toast.error('Vehicle Plate Number, Model, Total Seats, and Owner Name are required.');
      return;
    }

    // Create a payload with proper type conversion for numeric fields
    const payload = {
      ...formData,
      year: parseInt(formData.year) || new Date().getFullYear(),
      totalSeats: parseInt(formData.totalSeats) || 0,
      standingCapacity: parseInt(formData.standingCapacity) || 0
    };

    setLoading(true);

    try {
      // Log the payload for debugging
      console.log('Sending vehicle data:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/vehicles`, payload);
      console.log('Server response:', response.data);
      
      toast.success('Vehicle added successfully!');
      
      // Reset form data
      setFormData({
        plateNumber: '',
        model: '',
        manufacturer: '',
        year: new Date().getFullYear(),
        totalSeats: '',
        standingCapacity: 0,
        owner: {
          name: '',
          phoneNumber: '',
          email: '',
          address: ''
        },
        status: 'Active',
        color: '',
        vin: ''
      });
      
      onClose();
    } catch (err) {
      console.error('Error adding vehicle:', err.response?.data || err.message);
      
      // Show more detailed error from the server if available
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      'Failed to add vehicle. Check the console for details.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Vehicle</h2>
        
        <h3 className="modal-section-header">Vehicle Information</h3>
        <input
          name="plateNumber"
          placeholder="Plate Number (e.g., MH01AB1234)"
          value={formData.plateNumber}
          onChange={handleChange}
        />
        <div className="form-row">
          <input
            name="manufacturer"
            placeholder="Manufacturer (e.g., Toyota)"
            value={formData.manufacturer}
            onChange={handleChange}
            className="half-width"
          />
          <input
            name="model"
            placeholder="Model (e.g., Corolla)"
            value={formData.model}
            onChange={handleChange}
            className="half-width"
          />
        </div>
        
        <div className="form-row">
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={formData.year}
            onChange={handleChange}
            className="half-width"
          />
          <input
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleChange}
            className="half-width"
          />
        </div>
        
        <div className="form-row">
          <input
            type="number"
            name="totalSeats"
            placeholder="Total Seats"
            value={formData.totalSeats}
            onChange={handleChange}
            className="half-width"
          />
          <input
            type="number"
            name="standingCapacity"
            placeholder="Standing Capacity"
            value={formData.standingCapacity}
            onChange={handleChange}
            className="half-width"
          />
        </div>
        
        <input
          name="vin"
          placeholder="Vehicle Identification Number (VIN)"
          value={formData.vin}
          onChange={handleChange}
        />
        
        <div className="form-row">
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            className="full-width"
          >
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <h3 className="modal-section-header">Owner Information</h3>
        <input
          name="owner.name"
          placeholder="Owner Name"
          value={formData.owner.name}
          onChange={handleChange}
        />
        <input
          name="owner.phoneNumber"
          placeholder="Owner Phone Number"
          value={formData.owner.phoneNumber}
          onChange={handleChange}
        />
        <input
          name="owner.email"
          placeholder="Owner Email"
          value={formData.owner.email}
          onChange={handleChange}
        />
        <input
          name="owner.address"
          placeholder="Owner Address"
          value={formData.owner.address}
          onChange={handleChange}
        />
        
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button-secondary">Cancel</button>
          <button 
            onClick={handleSubmit} 
            className="modal-button-primary"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;
