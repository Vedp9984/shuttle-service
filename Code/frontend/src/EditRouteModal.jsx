import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const EditRouteModal = ({ isOpen, onClose }) => {
  const [busStops, setBusStops] = useState([]);
  const [routeCodeInput, setRouteCodeInput] = useState('');
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch all bus stops once
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

  // Fetch route by code
  const fetchRoute = async () => {
    if (!routeCodeInput.trim()) {
      toast.error('Please enter a Route Code');
      return;
    }

    setFetching(true);
    try {
      const id = await axios.get(`${API_BASE_URL}/api/routes/code/${routeCodeInput}`);
      console.log('Route ID response:', id);
      if (!id.data || id.data.length === 0) {
        toast.error('Route not found');
        setFetching(false);
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/api/routes/${id.data.id}`);
      const data = res.data;
       console.log('Fetched route data:', data);
      // Map stops to always use bus stop _id
      const stops = (data.stops || []).map(s => ({
        stop: typeof s.stop === 'object' ? s.stop._id : s.stop,
        arrivalTime: s.arrivalTime || '',
        departureTime: s.departureTime || ''
      }));

      setFormData({
        _id: data._id,
        routeCode: data.routeCode || '',
        routeName: data.routeName || '',
        description: data.description || '',
        originStop: data.originStop?._id || data.originStop || '',
        originDepartureTime: data.originDepartureTime || '',
        destinationStop: data.destinationStop?._id || data.destinationStop || '',
        destinationArrivalTime: data.destinationArrivalTime || '',
        stops,
        daysAvailable: data.daysAvailable || [],
        defaultDepartureTime: data.defaultDepartureTime || '',
        isActive: data.isActive ?? true
      });

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch route');
    } finally {
      setFetching(false);
    }
  };

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

  const prepareDataForBackend = (data) => ({
    routeCode: data.routeCode,
    routeName: data.routeName,
    description: data.description,
    isActive: data.isActive,
    originStop: data.originStop,
    originDepartureTime: data.originDepartureTime,
    destinationStop: data.destinationStop,
    destinationArrivalTime: data.destinationArrivalTime,
    stops: data.stops.map(s => ({
      stop: s.stop,
      arrivalTime: s.arrivalTime,
      departureTime: s.departureTime
    })),
    daysAvailable: data.daysAvailable,
    defaultDepartureTime: data.defaultDepartureTime
  });

  const handleUpdate = async () => {
    if (!formData) return;
    const dataToSend = prepareDataForBackend(formData);

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/routes/${formData._id}`, dataToSend);
      toast.success('Route updated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update route');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content scrollable-modal" onClick={e => e.stopPropagation()}>
        <h2>Update Route</h2>

        {!formData && (
          <>
            <input
              className="modal-input"
              placeholder="Enter Route Code"
              value={routeCodeInput}
              onChange={e => setRouteCodeInput(e.target.value)}
            />
            <button className="modal-button-primary" onClick={fetchRoute} disabled={fetching}>
              {fetching ? 'Fetching...' : 'Fetch Route'}
            </button>
          </>
        )}

        {formData && (
          <>
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
              <button onClick={handleUpdate} className="modal-button-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Route'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditRouteModal;
