import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const UpdateVehicleModal = ({ isOpen, onClose }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
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

  const fetchVehicles = async () => {
    if (!isOpen) return;
    
    setFetching(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
      setVehicles(response.data);
    } catch (err) {
      toast.error('Failed to fetch vehicles. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [isOpen]);

  const handleVehicleSelect = async (id) => {
    setSelectedVehicleId(id);
    if (!id) {
      // Reset form if no vehicle selected
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
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/${id}`);
      const vehicle = response.data;
      
      // Set form data from vehicle data
      setFormData({
        plateNumber: vehicle.plateNumber || '',
        model: vehicle.model || '',
        manufacturer: vehicle.manufacturer || '',
        year: vehicle.year || new Date().getFullYear(),
        totalSeats: vehicle.totalSeats || '',
        standingCapacity: vehicle.standingCapacity || 0,
        owner: {
          name: vehicle.owner?.name || '',
          phoneNumber: vehicle.owner?.phoneNumber || '',
          email: vehicle.owner?.email || '',
          address: vehicle.owner?.address || ''
        },
        status: vehicle.status || 'Active',
        color: vehicle.color || '',
        vin: vehicle.vin || ''
      });
    } catch (err) {
      toast.error('Failed to fetch vehicle details.');
    }
  };

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
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle to update.');
      return;
    }

    const { plateNumber, model, standingCapacity, owner } = formData;
    
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
      console.log('Updating vehicle data:', payload);
      await axios.put(`${API_BASE_URL}/api/vehicles/${selectedVehicleId}`, payload);
      toast.success('Vehicle updated successfully!');
      fetchVehicles(); // Refresh the list
      setSelectedVehicleId(''); // Reset selection
    } catch (err) {
      console.error('Error updating vehicle:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      'Failed to update vehicle. Check the console for details.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Update Vehicle</h2>
        
        {fetching ? (
          <p>Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p>No vehicles available.</p>
        ) : (
          <select
            value={selectedVehicleId}
            onChange={(e) => handleVehicleSelect(e.target.value)}
            className="modal-select"
          >
            <option value="">Select a vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.plateNumber} - {vehicle.model}
              </option>
            ))}
          </select>
        )}
        
        {selectedVehicleId && (
          <>
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
                onClick={handleUpdate} 
                className="modal-button-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Vehicle'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateVehicleModal;
