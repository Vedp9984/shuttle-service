import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config";

const Tracking = () => {
  const [buses, setBuses] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(API_BASE_URL); // connect to backend socket.io
    setSocket(s);

    s.on("busLocationUpdate", (data) => {
      setBuses(data);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen p-6 bg-yellow-50">
      <h2 className="text-3xl font-bold mb-6 text-center">Live Bus Tracking</h2>
      <div className="space-y-4">
        {buses.map((bus) => (
          <div key={bus._id} className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <p className="font-semibold">{bus.busNumber}</p>
              <p>
                Location: {bus.currentLatitude?.toFixed(4)}, {bus.currentLongitude?.toFixed(4)}
              </p>
              <p>Status: {bus.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tracking;
