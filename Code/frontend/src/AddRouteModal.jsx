import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const AddRouteModal = ({ isOpen, onClose }) => {
  const [busStops, setBusStops] = useState([]);
  const [formData, setFormData] = useState({
    routeCode: '',
    routeName: '',
    description: '',
    originStop: '',
    originDepartureTime: '',
    destinationStop: '',
    destinationArrivalTime: '',
    stops: [], // intermediate stops [{ stop: '', arrivalTime: '', departureTime: '' }]
    daysAvailable: [],
    defaultDepartureTime: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/busstops`);
        setBusStops(res.data);
      } catch {
        toast.error('Failed to fetch bus stops');
      }
    };
    fetchBusStops();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDaysToggle = (day) => {
    setFormData(prev => {
      const days = prev.daysAvailable.includes(day)
        ? prev.daysAvailable.filter(d => d !== day)
        : [...prev.daysAvailable, day];
      return { ...prev, daysAvailable: days };
    });
  };

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, { stop: '', arrivalTime: '', departureTime: '' }]
    }));
  };

  const handleStopChange = (index, field, value) => {
    const newStops = [...formData.stops];
    newStops[index][field] = value;
    setFormData(prev => ({ ...prev, stops: newStops }));
  };

  const removeStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, stops: newStops }));
  };

  const handleSubmit = async () => {
    const { routeCode, routeName, originStop, destinationStop } = formData;
    if (!routeCode || !routeName || !originStop || !destinationStop) {
      toast.error('Please fill all required fields: Route Code, Name, Origin, Destination');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/routes`, formData);
      toast.success('Route added successfully!');
      setFormData({
        routeCode: '',
        routeName: '',
        description: '',
        originStop: '',
        originDepartureTime: '',
        destinationStop: '',
        destinationArrivalTime: '',
        stops: [],
        daysAvailable: [],
        defaultDepartureTime: ''
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add route');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content scrollable-modal" onClick={e => e.stopPropagation()}>
        <h2>Add Route</h2>

        <div className="modal-input-container">
          <input className="modal-input" name="routeCode" placeholder="Route Code" value={formData.routeCode} onChange={handleChange} />
          <input className="modal-input" name="routeName" placeholder="Route Name" value={formData.routeName} onChange={handleChange} />
          <input className="modal-input" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        </div>

        <h4>Route Stops</h4>
        <div className="origin-destination-container">
          <div>
            <label>Origin Stop</label>
            <select className="modal-input" name="originStop" value={formData.originStop} onChange={handleChange}>
              <option value="">Select Origin Stop</option>
              {busStops.map(bs => <option key={bs._id} value={bs._id}>{bs.stopName}</option>)}
            </select>
            <input className="modal-input" name="originDepartureTime" type="time" value={formData.originDepartureTime} onChange={handleChange} />
          </div>

          <div>
            <label>Destination Stop</label>
            <select className="modal-input" name="destinationStop" value={formData.destinationStop} onChange={handleChange}>
              <option value="">Select Destination Stop</option>
              {busStops.map(bs => <option key={bs._id} value={bs._id}>{bs.stopName}</option>)}
            </select>
            <input className="modal-input" name="destinationArrivalTime" type="time" value={formData.destinationArrivalTime} onChange={handleChange} />
          </div>
        </div>

        <h4>Intermediate Stops</h4>
        <div className="stops-container">
          {formData.stops.map((stop, index) => (
            <div key={index} className="stop-item">
              <select className="modal-input" value={stop.stop} onChange={e => handleStopChange(index, 'stop', e.target.value)}>
                <option value="">Select Stop</option>
                {busStops.map(bs => <option key={bs._id} value={bs._id}>{bs.stopName}</option>)}
              </select>
              <input className="modal-input" type="time" value={stop.arrivalTime} onChange={e => handleStopChange(index, 'arrivalTime', e.target.value)} />
              <input className="modal-input" type="time" value={stop.departureTime} onChange={e => handleStopChange(index, 'departureTime', e.target.value)} />
              <button className="modal-button-danger" onClick={() => removeStop(index)}>Remove</button>
            </div>
          ))}
        </div>
        <button className="modal-button-secondary" onClick={addStop}>Add Intermediate Stop</button>


        <h4>Days Available</h4>
        <div className="days-container">
          {daysOfWeek.map(day => (
            <div
              key={day}
              className={`day-item ${formData.daysAvailable.includes(day) ? 'selected' : ''}`}
              onClick={() => handleDaysToggle(day)}
            >
              {day}
            </div>
          ))}
        </div>

        <input className="modal-input" name="defaultDepartureTime" type="time" placeholder="Default Departure Time" value={formData.defaultDepartureTime} onChange={handleChange} />

        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button-secondary">Cancel</button>
          <button onClick={handleSubmit} className="modal-button-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Route'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRouteModal;
