import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertCard } from "@/components/AlertCard";

const alerts = [
  { id: "ALT-101", type: "critical", title: "SOS Activated", description: "Emergency button pressed", location: "Delhi Airport", touristName: "John Doe", timestamp: "Just now" },
  { id: "ALT-102", type: "high", title: "Geo-fence Violation", description: "Entered restricted zone", location: "Indo-China Border", touristName: "Amit Sharma", timestamp: "10 min ago" }
];

export default function AlertsPage() {
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
          {alerts.map((alert) => (
            <AlertCard key={alert.id} {...alert} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
