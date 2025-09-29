import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const SearchVehicleModal = ({ isOpen, onClose, onVehicleSelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setLoading(true);
    try {
      // 👉 Call backend multi-field search
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/search/query`, {
        params: { value: searchValue }
      });

      setSearchResults(response.data);

      if (response.data.length === 0) {
        toast.info('No vehicles found');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error searching for vehicles';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (vehicle) => {
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Search Vehicle</h2>

        {/* Search input */}
        <div className="search-controls">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by ID, License, Owner, or Type"
            className="search-input"
          />

          <button
            onClick={handleSearch}
            className="modal-button-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Results</h3>
            <div className="results-list">
              {searchResults.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="result-item"
                  onClick={() => handleSelect(vehicle)}
                >
                  <div><strong>ID:</strong> {vehicle.vehicleId}</div>
                  <div><strong>License:</strong> {vehicle.licensePlate}</div>
                  <div><strong>Owner:</strong> {vehicle.ownerName}</div>
                  <div><strong>Type:</strong> {vehicle.vehicleType}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default SearchVehicleModal;
