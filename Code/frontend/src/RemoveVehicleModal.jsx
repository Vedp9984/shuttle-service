import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css';
import { toast } from 'react-toastify';
import { FaSearch, FaTrashAlt, FaExclamationTriangle, FaBus, FaIdCard, FaAddressCard, FaList } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000';

const RemoveVehicleModal = ({ isOpen, onClose }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mode, setMode] = useState('options'); // 'options', 'browse', 'byId', 'byPlate'
  const [directId, setDirectId] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setMode('options');
      setSelectedVehicle('');
      setSearchTerm('');
      setConfirmDelete(false);
      setDirectId('');
      setPlateNumber('');
    }
  }, [isOpen]);

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

  // Only fetch vehicles when in browse mode
  useEffect(() => {
    if (mode === 'browse') {
      fetchVehicles();
    }
  }, [mode]);

  const filteredVehicles = vehicles.filter(vehicle => 
    (vehicle.plateNumber && vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (vehicle.model && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vehicle.manufacturer && vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vehicle.owner && vehicle.owner.name && vehicle.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRemove = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle to remove.');
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    try {
      console.log('Removing vehicle with ID:', selectedVehicle);
      await axios.delete(`${API_BASE_URL}/api/vehicles/${selectedVehicle}`);
      toast.success('Vehicle removed successfully!');
      setSelectedVehicle('');
      setConfirmDelete(false);
      fetchVehicles(); // Refresh the list
    } catch (err) {
      console.error('Error removing vehicle:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      'Failed to remove vehicle. Check the console for details.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveById = async () => {
    if (!directId) {
      toast.error('Please enter a vehicle ID');
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/vehicles/${directId}`);
      toast.success('Vehicle removed successfully!');
      setDirectId('');
      setMode('options');
    } catch (err) {
      console.error('Error removing vehicle:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to remove vehicle. ID may be invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveByPlate = async () => {
    if (!plateNumber) {
      toast.error('Please enter a plate number');
      return;
    }

    setLoading(true);
    try {
      // First find the vehicle by plate number
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`, {
        params: { plateNumber }
      });
      
      if (response.data.length === 0) {
        toast.error('No vehicle found with that plate number');
        setLoading(false);
        return;
      }
      
      // Remove the first matching vehicle
      const vehicleId = response.data[0]._id;
      await axios.delete(`${API_BASE_URL}/api/vehicles/${vehicleId}`);
      toast.success('Vehicle removed successfully!');
      setPlateNumber('');
      setMode('options');
    } catch (err) {
      console.error('Error removing vehicle:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to remove vehicle');
    } finally {
      setLoading(false);
    }
  };

  // Reset confirm state when selection changes
  useEffect(() => {
    setConfirmDelete(false);
  }, [selectedVehicle]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2><FaTrashAlt /> Remove Vehicle</h2>

        {mode === 'options' && (
          <div className="removal-options">
            <h3>Select Removal Method</h3>
            <div className="options-grid">
              <div className="option-card" onClick={() => setMode('browse')}>
                <div className="option-icon"><FaList /></div>
                <h4>Browse All Vehicles</h4>
                <p>View a list of all vehicles and select one to remove</p>
              </div>
              
              <div className="option-card" onClick={() => setMode('byId')}>
                <div className="option-icon"><FaIdCard /></div>
                <h4>Remove by ID</h4>
                <p>Enter the vehicle ID to remove it directly</p>
              </div>
              
              <div className="option-card" onClick={() => setMode('byPlate')}>
                <div className="option-icon"><FaAddressCard /></div>
                <h4>Remove by Plate Number</h4>
                <p>Enter the vehicle's plate number to remove it</p>
              </div>
            </div>
          </div>
        )}
        
        {mode === 'byId' && (
          <div className="direct-removal">
            <button className="back-button" onClick={() => setMode('options')}>
              ← Back to Options
            </button>
            <h3>Remove Vehicle by ID</h3>
            <p className="instruction-text">Enter the unique identifier of the vehicle you want to remove</p>
            <input
              type="text"
              value={directId}
              onChange={(e) => setDirectId(e.target.value)}
              placeholder="Vehicle ID (e.g., 60d5ec9af682d22fb878a928)"
              className="id-input"
            />
            <div className="warning-box">
              <FaExclamationTriangle className="warning-icon" />
              <p>Warning: This action cannot be undone. The vehicle will be permanently removed.</p>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setMode('options')} className="modal-button-secondary">Cancel</button>
              <button 
                onClick={handleRemoveById} 
                className="modal-button-danger"
                disabled={loading || !directId}
              >
                {loading ? 'Removing...' : 'Remove Vehicle'}
              </button>
            </div>
          </div>
        )}
        
        {mode === 'byPlate' && (
          <div className="direct-removal">
            <button className="back-button" onClick={() => setMode('options')}>
              ← Back to Options
            </button>
            <h3>Remove Vehicle by Plate Number</h3>
            <p className="instruction-text">Enter the license plate number of the vehicle you want to remove</p>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="Plate Number (e.g., MH01AB1234)"
              className="id-input"
            />
            <div className="warning-box">
              <FaExclamationTriangle className="warning-icon" />
              <p>Warning: This action cannot be undone. The vehicle will be permanently removed.</p>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setMode('options')} className="modal-button-secondary">Cancel</button>
              <button 
                onClick={handleRemoveByPlate} 
                className="modal-button-danger"
                disabled={loading || !plateNumber}
              >
                {loading ? 'Removing...' : 'Remove Vehicle'}
              </button>
            </div>
          </div>
        )}
        
        {mode === 'browse' && (
          <>
            {fetching ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading vehicles...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="empty-state">
                <p>No vehicles available to remove.</p>
                <button className="back-button" onClick={() => setMode('options')}>
                  ← Back to Options
                </button>
              </div>
            ) : (
              <>
                <button className="back-button" onClick={() => setMode('options')}>
                  ← Back to Options
                </button>
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by plate number, model, or owner name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="vehicle-cards-container">
                  {filteredVehicles.length === 0 ? (
                    <p className="no-results">No vehicles match your search criteria.</p>
                  ) : (
                    filteredVehicles.map(vehicle => (
                      <div 
                        key={vehicle._id} 
                        className={`vehicle-card ${selectedVehicle === vehicle._id ? 'selected' : ''}`}
                        onClick={() => setSelectedVehicle(vehicle._id)}
                      >
                        <div className="vehicle-card-header">
                          <span className="vehicle-plate">{vehicle.plateNumber || 'No Plate'}</span>
                          <span className={`status-badge ${vehicle.status?.toLowerCase()}`}>
                            {vehicle.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="vehicle-card-body">
                          <div className="vehicle-info-row">
                            <span className="vehicle-model">{vehicle.model || 'Unknown Model'}</span>
                            <span className="vehicle-manufacturer">{vehicle.manufacturer || ''}</span>
                          </div>
                          <div className="vehicle-info-row">
                            <span className="vehicle-seats">Seats: {vehicle.totalSeats || '0'}</span>
                            <span className="vehicle-year">{vehicle.year || ''}</span>
                          </div>
                          <div className="vehicle-owner">
                            Owner: {vehicle.owner?.name || 'Unknown'}
                          </div>
                        </div>
                        <div className="vehicle-card-footer">
                          <div className="selection-indicator"></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {selectedVehicle && confirmDelete && (
                  <div className="confirm-delete-warning">
                    <FaExclamationTriangle className="warning-icon" />
                    <p>Are you sure you want to permanently remove this vehicle?</p>
                    <p>This action cannot be undone.</p>
                  </div>
                )}
                
                <div className="modal-buttons">
                  <button onClick={() => setMode('options')} className="modal-button-secondary">Back</button>
                  {selectedVehicle && (
                    <button
                      onClick={handleRemove}
                      className={`modal-button-danger ${confirmDelete ? 'confirm' : ''}`}
                      disabled={loading}
                    >
                      {loading ? 'Removing...' : confirmDelete ? 'Yes, Remove Vehicle' : 'Remove Vehicle'}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
        
        {mode === 'options' && (
          <div className="modal-buttons">
            <button onClick={onClose} className="modal-button-secondary">Close</button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .removal-options {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .option-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .option-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          border-color: #40a9ff;
        }
        
        .option-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
          color: #1890ff;
        }
        
        .option-card h4 {
          margin-top: 0;
          color: #333;
        }
        
        .option-card p {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0;
        }
        
        .direct-removal {
          display: flex;
          flex-direction: column;
        }
        
        .instruction-text {
          margin-bottom: 20px;
          color: #666;
        }
        
        .id-input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 20px;
        }
        
        .warning-box {
          background-color: #fff2f0;
          border: 1px solid #ffccc7;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        
        .warning-icon {
          color: #ff4d4f;
          font-size: 24px;
          margin-right: 15px;
          flex-shrink: 0;
        }
        
        .back-button {
          align-self: flex-start;
          background: none;
          border: none;
          color: #1890ff;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 5px;
          margin-bottom: 15px;
          font-size: 14px;
        }
        
        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 0;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .search-box {
          position: relative;
          margin-bottom: 20px;
        }
        
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }
        
        .search-input {
          width: 100%;
          padding: 10px 10px 10px 35px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .vehicle-cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
          max-height: 400px;
          overflow-y: auto;
          padding: 5px;
          margin-bottom: 20px;
        }
        
        .vehicle-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .vehicle-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .vehicle-card.selected {
          border-color: #ff4d4f;
          box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
        }
        
        .vehicle-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .vehicle-plate {
          font-weight: bold;
          font-size: 16px;
        }
        
        .status-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.active {
          background-color: #52c41a;
          color: white;
        }
        
        .status-badge.maintenance {
          background-color: #faad14;
          color: white;
        }
        
        .status-badge.inactive {
          background-color: #d9d9d9;
          color: #666;
        }
        
        .vehicle-card-body {
          margin-bottom: 10px;
        }
        
        .vehicle-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .vehicle-model {
          font-weight: 500;
        }
        
        .vehicle-owner {
          font-size: 13px;
          color: #666;
          margin-top: 8px;
        }
        
        .confirm-delete-warning {
          background-color: #fff2f0;
          border: 1px solid #ffccc7;
          border-radius: 4px;
          padding: 15px;
          margin-top: 20px;
          text-align: center;
        }
        
        .warning-icon {
          color: #ff4d4f;
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .modal-button-danger {
          background-color: #ff4d4f;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .modal-button-danger:hover {
          background-color: #ff7875;
        }
        
        .modal-button-danger.confirm {
          background-color: #a8071a;
        }
        
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 20px;
          color: #666;
        }
        
        .selection-indicator {
          height: 3px;
          background-color: transparent;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          transition: background-color 0.2s;
        }
        
        .vehicle-card.selected .selection-indicator {
          background-color: #ff4d4f;
        }
      `}</style>
    </div>
  );
};

export default RemoveVehicleModal;
