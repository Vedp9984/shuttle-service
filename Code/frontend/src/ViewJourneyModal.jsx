import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EditJourneyModal from './EditJourneyModal';
import DeleteJourneyModal from './DeleteJourneyModal';
import './Modal.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000';

const ViewJourneysModal = ({ isOpen, onClose }) => {
  const [journeys, setJourneys] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [editJourneyId, setEditJourneyId] = useState(null);
  const [deleteJourneyId, setDeleteJourneyId] = useState(null);

  const fetchJourneys = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/journeys`);
      setJourneys(res.data);
    } catch {
      toast.error('Failed to fetch journeys');
    }
  };

  useEffect(() => {
    if (isOpen) fetchJourneys();
  }, [isOpen]);

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleRefresh = () => fetchJourneys();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content journey-modal" onClick={e => e.stopPropagation()}>
        <h2 style={{ color: '#fff' }}>All Journeys</h2>

        {journeys.length === 0 ? (
          <p style={{ color: '#ccc' }}>No journeys found.</p>
        ) : (
          <div className="journey-list">
            {journeys.map(journey => (
              <div key={journey._id} className="journey-card dark-card">
                <div className="journey-header">
                  <strong>ID:</strong> <span className="id-text">{journey._id}</span>
                  <div className="journey-actions">
                    <button className="btn btn-edit" onClick={() => setEditJourneyId(journey._id)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => setDeleteJourneyId(journey._id)}>Delete</button>
                    <button className="btn btn-details" onClick={() => toggleExpand(journey._id)}>
                      {expandedIds.includes(journey._id) ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedIds.includes(journey._id) && (
                  <div className="journey-details dark-card-details">
                    <p><strong>Date:</strong> {journey.date.slice(0,10)}</p>
                    <p><strong>Origin Departure:</strong> {journey.originDepartureTime}</p>
                    <p><strong>Destination Arrival:</strong> {journey.destinationArrivalTime}</p>
                    <p><strong>Total Seats:</strong> {journey.totalSeats}</p>

                    {journey.route && (
                      <div className="route-info">
                        <p><strong>Route:</strong> {journey.route.routeName} ({journey.route.routeCode})</p>
                        <p><strong>Stops Path:</strong></p>
                        <div className="stops-flow">
                          <span className="stop">{journey.route.originStop?.stopName}</span>
                          {console.log(journey.route.stops)}
                          {journey.route.stops?.map((s, idx) => (
                            <React.Fragment key={idx}>
                              <span className="arrow">→</span>
                              <span className="stop">{s.stop?.stopName}</span>
                            </React.Fragment>
                          ))}
                          <span className="arrow">→</span>
                          <span className="stop">{journey.route.destinationStop?.stopName}</span>
                        </div>
                      </div>
                    )}

                    {journey.vehicle && (
                      <p><strong>Vehicle:</strong> {journey.vehicle.plateNumber}</p>
                    )}

                    {journey.driver && (
                      <p><strong>Driver:</strong> {journey.driver.firstName} {journey.driver.lastName} ({journey.driver.email})</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button-secondary">Close</button>
          <button onClick={handleRefresh} className="modal-button-primary">Refresh</button>
        </div>

        {/* Edit Journey Modal */}
        {editJourneyId && (
          <EditJourneyModal
            isOpen={!!editJourneyId}
            onClose={() => setEditJourneyId(null)}
            journeyId={editJourneyId}
          />
        )}

        {/* Delete Journey Modal */}
        {deleteJourneyId && (
          <DeleteJourneyModal
            isOpen={!!deleteJourneyId}
            onClose={() => setDeleteJourneyId(null)}
            journeyId={deleteJourneyId}
            onDeleted={() => {
              setDeleteJourneyId(null);
              fetchJourneys();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ViewJourneysModal;
