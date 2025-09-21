"use client";
import { useEffect, useState } from "react";
import { connectWS, disconnectWS } from "../utils/wsUtils";

interface Alert {
  touristId: string;
  type: string;
  message: string;
  location?: { lat: number; lng: number };
  contact?: string;
  timestamp: string;
}

export default function AlertPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing alerts from backend
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/admin/alerts"); // adjust path if needed
        const data = await res.json();
        if (data.success) {
          setAlerts(data.alerts);
        }
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Connect to WebSocket for real-time updates
connectWS("ws://localhost:5001", (msg) => {
  console.log("WS message received:", msg);
  const { topic, payload } = msg;
  if (topic === "emergency_contact" || topic === "authorities") {
    setAlerts((prev) => [payload, ...prev]);
  }
});


    return () => disconnectWS();

  }, []);

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-4">Alerts Dashboard</h2>
      {loading && <p>Loading alerts...</p>}
      {!loading && alerts.length === 0 && <p>No alerts yet.</p>}

      <ul className="space-y-3">
        {alerts.map((alert, idx) => (
          <li
            key={idx}
            className="p-4 rounded-lg shadow-md bg-gray-800 border border-gray-700"
          >
            <p>
              <strong>Type:</strong> {alert.type}
            </p>
            <p>
              <strong>Message:</strong> {alert.message}
            </p>
            {alert.contact && (
              <p>
                <strong>Contact:</strong> {alert.contact}
              </p>
            )}
            {alert.location && (
              <p>
                <strong>Location:</strong> {alert.location.lat},{" "}
                {alert.location.lng}
              </p>
            )}
            <p>
              <strong>Time:</strong>{" "}
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
