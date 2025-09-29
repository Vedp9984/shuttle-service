import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import './Modal.css';

const API_BASE_URL = 'http://localhost:5000';

const EditJourneyModal = ({ isOpen, onClose, journeyId }) => {
  const [formData, setFormData] = useState({
    date: '',
    originDepartureTime: '',
    destinationArrivalTime: '',
    vehicleNumber: '',
    driverEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [driverId, setDriverId] = useState(null);

  // Fetch journey data on mount
  useEffect(() => {
    if (!isOpen || !journeyId) return;

    const fetchJourney = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/journeys/${journeyId}`);
        const journey = res.data;
        setFormData({
          date: journey.date.slice(0,10),
          originDepartureTime: journey.originDepartureTime,
          destinationArrivalTime: journey.destinationArrivalTime,
          vehicleNumber: journey.vehicle.plateNumber,
          driverEmail: journey.driver.email
        });
        setVehicleData(journey.vehicle);
        setDriverId(journey.driver._id);
      } catch (err) {
        toast.error('Failed to fetch journey.');
      }
    };

    fetchJourney();
  }, [isOpen, journeyId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateVehicle = async () => {
    if (!formData.vehicleNumber) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vehicles/by-plate-number?plateNumber=${formData.vehicleNumber}`);
      setVehicleData(res.data);
    } catch {
      toast.error('Vehicle not found');
      setVehicleData(null);
    }
  };

  const validateDriver = async () => {
    if (!formData.driverEmail) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/${formData.driverEmail}`);
      const user = res.data;
      if (!user || user.role !== 'Driver') {
        toast.error('No driver found with this email');
        setDriverId(null);
        return;
      }
      setDriverId(user.id);
    } catch {
      toast.error('Driver not found');
      setDriverId(null);
    }
  };

  const handleUpdate = async () => {
    if (!vehicleData || !driverId) {
      toast.error('Please validate vehicle and driver before updating.');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/journeys/${journeyId}`, {
        date: formData.date,
        originDepartureTime: formData.originDepartureTime,
        destinationArrivalTime: formData.destinationArrivalTime,
        vehicle: vehicleData._id,
        driver: driverId,
        totalSeats: vehicleData.totalSeats
      });
      toast.success('Journey updated successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to update journey');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Journey</h2>

        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />

        <input
          name="originDepartureTime"
          placeholder="Origin Departure Time"
          value={formData.originDepartureTime}
          onChange={handleChange}
        />

        <input
          name="destinationArrivalTime"
          placeholder="Destination Arrival Time"
          value={formData.destinationArrivalTime}
          onChange={handleChange}
        />

        <input
          name="vehicleNumber"
          placeholder="Vehicle Plate Number"
          value={formData.vehicleNumber}
          onChange={handleChange}
          onBlur={validateVehicle}
        />

        <input
          name="driverEmail"
          placeholder="Driver Email"
          value={formData.driverEmail}
          onChange={handleChange}
          onBlur={validateDriver}
        />

        <div className="modal-buttons">
          <button className="modal-button-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-button-primary" onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update Journey'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditJourneyModal;
