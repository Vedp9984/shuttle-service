import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const RemoveRouteModal = ({ isOpen, onClose }) => {
  const [routeCode, setRouteCode] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch route by code
  const fetchRoute = async () => {
    if (!routeCode.trim()) {
      toast.error('Please enter a Route Code');
      return;
    }

    setFetching(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/routes?routeCode=${routeCode}`);
      if (!res.data || res.data.length === 0) {
        toast.error('Route not found');
        setRouteData(null);
      } else {
        setRouteData(res.data[0]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch route');
    } finally {
      setFetching(false);
    }
  };

  const handleRemove = async () => {
    if (!routeData) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/routes/${routeData._id}`);
      toast.success(`Route '${routeData.routeCode}' removed successfully!`);
      setRouteCode('');
      setRouteData(null);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove route');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Remove Route</h2>

        {!routeData && (
          <>
            <input
              className="modal-input"
              placeholder="Enter Route Code"
              value={routeCode}
              onChange={e => setRouteCode(e.target.value)}
            />
            <button
              className="modal-button-primary"
              onClick={fetchRoute}
              disabled={fetching}
            >
              {fetching ? 'Fetching...' : 'Fetch Route'}
            </button>
          </>
        )}

        {routeData && (
          <>
            <div className="modal-input-container">
              <p><strong>Route Code:</strong> {routeData.routeCode}</p>
              <p><strong>Route Name:</strong> {routeData.routeName}</p>
              <p><strong>Origin:</strong> {routeData.originStop.stopName}</p>
              <p><strong>Destination:</strong> {routeData.destinationStop.stopName}</p>
            </div>

            <div className="modal-buttons">
              <button onClick={onClose} className="modal-button-secondary">Cancel</button>
              <button
                onClick={handleRemove}
                className="modal-button-danger"
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Remove Route'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RemoveRouteModal;
