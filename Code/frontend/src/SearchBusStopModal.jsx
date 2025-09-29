import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const SearchBusStopModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.warn('Please enter a stop name or ID');
      return;
    }
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/busstops?search=${query}`);
      setResults(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Search Bus Stop</h2>

        <div className="modal-input-container">
          <input
            className="modal-input"
            placeholder="Enter Stop Name or ID"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="modal-button-primary" onClick={handleSearch}>Search</button>
        </div>

        <div className="search-results">
          {results.length > 0 ? (
            <ul>
              {results.map(bs => (
                <li key={bs._id} className="search-result-item">
                  <span className="stop-name">{bs.stopName}</span>
                  <span className="stop-id">(ID: {bs._id})</span>
                  <span className="stop-address">{bs.address || 'No address'}</span>
                  <span className={`status ${bs.isActive ? 'active' : 'inactive'}`}>
                    {bs.isActive ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="no-results">No results found</p>}
        </div>

        <button className="modal-button-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SearchBusStopModal;
