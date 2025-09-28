import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const Booking = () => {
  const { routeId } = useParams();
  const [route, setRoute] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/routes/${routeId}`);
        setRoute(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoute();
  }, [routeId]);

  const handleBooking = async () => {
    if (!selectedSchedule) {
      alert("Please select a schedule");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/bookings`,
        { scheduleId: selectedSchedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingStatus("Booking successful!");
    } catch (err) {
      console.error(err);
      setBookingStatus("Booking failed.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-yellow-50">
      {route ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">{route.routeName}</h2>
          <p className="text-gray-600 mb-4">{route.description}</p>

          <label className="block mb-2">Select Schedule:</label>
          <select
            className="w-full border px-3 py-2 rounded mb-4"
            value={selectedSchedule}
            onChange={(e) => setSelectedSchedule(e.target.value)}
          >
            <option value="">-- Select --</option>
            {route.schedules?.map((s) => (
              <option key={s._id} value={s._id}>
                {new Date(s.departureTime).toLocaleString()} - Seats: {s.availableSeats}
              </option>
            ))}
          </select>

          <button
            onClick={handleBooking}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 py-2 rounded font-semibold"
          >
            Book Now
          </button>

          {bookingStatus && <p className="mt-4 text-green-600">{bookingStatus}</p>}
        </div>
      ) : (
        <p>Loading route...</p>
      )}
    </div>
  );
};

export default Booking;
