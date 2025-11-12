import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';
import moment from 'moment';

const API_BASE_URL = 'http://localhost:5000';

const AddJourneyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    routeCode: '',
    date: '',
    originDepartureTime: '',
    destinationArrivalTime: '',
    vehicleNumber: '',
    driverEmail: ''
  });

  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [vehicleData, setVehicleData] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fetch route using code
  const fetchRouteDetails = async () => {
    if (!formData.routeCode) {
      toast.error('Please enter a route code.');
      return;
    }

    try {
      const resId = await axios.get(`${API_BASE_URL}/api/routes/code/${formData.routeCode}`);
      const routeId = resId.data.id;

      const resRoute = await axios.get(`${API_BASE_URL}/api/routes/${routeId}`);
      const route = resRoute.data;
      setRouteData(route);

      // Prefill times
      setFormData(prev => ({
        ...prev,
        originDepartureTime: route.originDepartureTime || '',
        destinationArrivalTime: route.destinationArrivalTime || ''
      }));

      

      // Generate available dates
      const dayMap = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
      const routeDays = route.daysAvailable.map(d => dayMap[d]);
      const dates = [];
      const today = moment();
      for (let i = 0; i < 30; i++) {
        const date = today.clone().add(i, 'days');
        if (routeDays.includes(date.day())) dates.push(date.format('YYYY-MM-DD'));
      }
      setAvailableDates(dates);

      toast.success('Route fetched successfully!');
    } catch (err) {
      toast.error('Route not found with this code.');
      setRouteData(null);
      setAvailableDates([]);
    }
  };

  // Validate vehicle
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

  // Validate driver
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

  // Recalculate submit button state
  useEffect(() => {
    setCanSubmit(routeData && vehicleData && driverId && formData.date);
  }, [routeData, vehicleData, driverId, formData.date]);

  // Submit journey
  const handleSubmit = async () => {
    console.log('Submitting journey...', formData);
    if (!canSubmit) return;

    setLoading(true);
    try {
      const journeyPayload = {
        route: routeData._id,
        date: formData.date,
        originDepartureTime: formData.originDepartureTime,
        destinationArrivalTime: formData.destinationArrivalTime,
        vehicle: vehicleData._id,
        driver: driverId,
        totalSeats: vehicleData.totalSeats
      };

      console.log('Journey payload:', journeyPayload);

      await axios.post(`${API_BASE_URL}/api/journeys`, journeyPayload);
      toast.success('Journey added successfully!');

      // Reset all
      setFormData({
        routeCode: '',
        date: '',
        originDepartureTime: '',
        destinationArrivalTime: '',
        vehicleNumber: '',
        driverEmail: ''
      });
      setRouteData(null);
      setAvailableDates([]);
      setVehicleData(null);
      setDriverId(null);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add journey';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Journey</h2>

        <div className="route-fetch-row">
          <input
            name="routeCode"
            placeholder="Route Code"
            value={formData.routeCode}
            onChange={handleChange}
          />
          <button type="button" onClick={fetchRouteDetails}>Fetch Route</button>
        </div>

        {availableDates.length > 0 && (
          <select
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={{ backgroundColor: '#000', color: '#fff' }}
          >
            <option value="">Select Date</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        )}

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
          <button onClick={onClose} className="modal-button-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            className="modal-button-primary"
            disabled={!canSubmit || loading}
          >
            {loading ? 'Adding...' : 'Add Journey'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddJourneyModal;
