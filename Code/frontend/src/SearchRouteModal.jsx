import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const SearchRouteModal = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      toast.error('Please enter a route name or ID');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/routes?search=${encodeURIComponent(searchText)}`);
      setResults(res.data);
      if (res.data.length === 0) toast.info('No routes found');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to search routes');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content scrollable-modal" onClick={e => e.stopPropagation()}>
        <h2>Search Route</h2>
        <input
          className="modal-input"
          placeholder="Enter Route Name or ID"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <button className="modal-button-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>

        {results.length > 0 && (
          <div className="search-results">
            <ul>
              {results.map(route => (
                <li key={route._id} className="search-result-item">
                  <div>
                    <strong>{route.routeCode}</strong>: {route.routeName}
                  </div>
                  <div>
                    <span><strong>Origin:</strong> {route.originStop.stopName}</span>
                    <span><strong>Destination:</strong> {route.destinationStop.stopName}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRouteModal;
