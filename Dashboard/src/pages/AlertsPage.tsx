// frontend/pages/alertpage.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertCard } from "@/components/AlertCard";
import { initWebSocket } from "../utils/wsUtils";

const BASE_URL = "http://localhost:4000";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  // Fetch active alerts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(`${BASE_URL}/api/alerts/active`);
        const data = await res.json();
        if (data.success) setAlerts(data.alerts);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    }
    fetchAlerts();
  }, []);

  // WebSocket for live updates
  useEffect(() => {
    initWebSocket((topic, payload) => {
      if (topic === "emergency_contact" || topic === "authorities") {
        setAlerts((prev) => [payload, ...prev]);
      }
    });
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
