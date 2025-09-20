import { Users, AlertTriangle, Shield, MapPin, Activity, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { AlertCard } from "@/components/AlertCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Mock data for demonstration
const stats = [
  {
    title: "Active Tourists",
    value: "1,247",
    change: { value: "+12%", type: "increase" as const },
    icon: <Users className="h-4 w-4" />,
    variant: "default" as const
  },
  {
    title: "Active Alerts", 
    value: "8",
    change: { value: "+3", type: "increase" as const },
    icon: <AlertTriangle className="h-4 w-4" />,
    variant: "warning" as const
  },
  {
    title: "High Risk Zones",
    value: "3",
    change: { value: "No change", type: "neutral" as const },
    icon: <Shield className="h-4 w-4" />,
    variant: "danger" as const
  },
  {
    title: "Safe Zones",
    value: "15",
    change: { value: "+2", type: "increase" as const },
    icon: <MapPin className="h-4 w-4" />,
    variant: "success" as const
  }
];

const recentAlerts = [
  {
    id: "ALT-001",
    type: "critical" as const,
    title: "Tourist Missing - Prolonged Inactivity",
    description: "No activity detected for 4+ hours in restricted forest area",
    location: "Kaziranga National Park, Sector 4",
    touristName: "Sarah Johnson (UK Tourist)",
    timestamp: "2 min ago",
    isNew: true
  },
  {
    id: "ALT-002", 
    type: "high" as const,
    title: "Geo-fence Violation",
    description: "Tourist entered high-risk zone without proper clearance",
    location: "Indo-Myanmar Border, Moreh",
    touristName: "David Kim (Digital ID: TID-9847)",
    timestamp: "15 min ago",
    isNew: true
  },
  {
    id: "ALT-003",
    type: "medium" as const,
    title: "Panic Button Activated",
    description: "Tourist activated emergency SOS signal", 
    location: "Tawang Monastery Area",
    touristName: "Maria Garcia (Digital ID: TID-7623)",
    timestamp: "1 hour ago"
  }
];

const systemHealth = [
  { name: "GPS Tracking", status: "online", percentage: 98 },
  { name: "Alert System", status: "online", percentage: 100 },
  { name: "AI Detection", status: "online", percentage: 95 },
  { name: "Database", status: "online", percentage: 99 }
];

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and incident management system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            System Health
          </Button>
          <Button size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Recent Alerts</CardTitle>
                  <CardDescription>
                    Latest incidents requiring immediate attention
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert) => (
                <AlertCard key={alert.id} {...alert} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">System Health</CardTitle>
              <CardDescription>
                Real-time system component status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth.map((system) => (
                <div key={system.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{system.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="bg-success/10 text-success border-success/20"
                      >
                        {system.status}
                      </Badge>
                      <span className="text-muted-foreground">{system.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={system.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription>
                Emergency response shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Create Emergency Alert
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Locate Tourist
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Generate E-FIR
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Update Geo-fence
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}