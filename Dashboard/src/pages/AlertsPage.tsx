


import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertCard } from "@/components/AlertCard";
import { initWebSocket } from "../utils/wsUtils";



export default function AlertsPage() {
  // Initial static alerts
  const [alerts, setAlerts] = useState([
    { id: "ALT-101", type: "critical", title: "SOS Activated", description: "Emergency button pressed", location: "Delhi Airport", touristName: "John Doe", timestamp: "Just now" },
    { id: "ALT-102", type: "high", title: "Geo-fence Violation", description: "Entered restricted zone", location: "Indo-China Border", touristName: "Amit Sharma", timestamp: "10 min ago" }
  ]);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket("ws://localhost:5001"); // Replace with your server URL

    ws.onopen = () => console.log("✅ Connected to WS server");

    ws.onmessage = (event) => {
      try {
        const { topic, payload } = JSON.parse(event.data);

        if (topic === "emergency_contact" || topic === "authorities") {
          // Create a new alert object compatible with AlertCard
          const newAlert = {
            id: `ALT-${Date.now()}`,
            type: "critical",
            title: payload.type === "SOS_ALERT" ? "SOS Activated" : "Authority Alert",
            description: payload.message,
            location: payload.location ? JSON.stringify(payload.location) : "Unknown",
            touristName: payload.touristId,
            timestamp: "Just now"
          };

          // Add to alerts list
          setAlerts((prev) => [newAlert, ...prev]);
        }
      } catch (err) {
        console.error("WS message parse error:", err);
      }
    };

    ws.onclose = () => console.log("❌ WS disconnected");

    return () => ws.close();

  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Alert Center</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? <p>No active alerts</p> : alerts.map((alert) => <AlertCard key={alert._id || alert.alertId} {...alert} />)}
        </CardContent>
      </Card>
    </div>
  );
}
