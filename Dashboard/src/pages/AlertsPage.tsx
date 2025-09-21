import { useState, useEffect } from "react";
import { AlertCard } from "../components/AlertCard";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Alert {
  _id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | string;
  message: string;
  location: string | { lat: number; lng: number };
  touristId: string;
  touristName: string;
  status: 'open' | 'acknowledged' | 'accepted' | 'resolved';
  acceptedBy?: { _id: string; name: string; email: string };
  createdAt: string;
}

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const BASE_URL = "http://localhost:4000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId") || "123"; // fallback

  useEffect(() => {
    fetchAlerts();
    setupWebSocket();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/alert`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAlerts(data.alerts);
    } catch {
      toast({ title: "Error", description: "Failed to fetch alerts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:5001`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.topic === "alert_updated") {
        setAlerts(prev =>
          prev.map(alert =>
            alert._id === message.payload.alertId ? { ...alert, ...message.payload } : alert
          )
        );
      }

      if (message.topic === "emergency_contact" || message.topic === "authorities") {
        fetchAlerts();
      }
    };
  };

  const handleAcceptAlert = async (alertId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/alert/${alertId}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setAlerts(prev =>
        prev.map(alert =>
          alert._id === alertId ? { ...alert, status: "accepted", acceptedBy: data.alert.acceptedBy } : alert
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to accept alert",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alerts Dashboard</h2>
        <div className="text-sm text-muted-foreground">{alerts.length} active alerts</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alerts.map(alert => (
          <AlertCard
            key={alert._id}
            id={alert._id}
            type={alert.type}
            title={alert.message}
            description={`Alert from ${alert.touristName}`}
            location={alert.location}
            touristName={alert.touristName}
            timestamp={new Date(alert.createdAt).toLocaleString()}
            status={alert.status}
            acceptedBy={alert.acceptedBy}
            isNew={alert.status === "open"}
            onAccept={handleAcceptAlert}
            currentUserId={currentUserId}
          />
        ))}

        {alerts.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No active alerts
          </div>
        )}
      </div>
    </div>
  );
}
