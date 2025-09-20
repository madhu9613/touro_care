import { useEffect, useState } from "react";
import { Users, AlertTriangle, Shield, MapPin, Activity, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { AlertCard } from "@/components/AlertCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const BASE_URL = "http://localhost:4000";

export default function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Compute stats dynamically
  const touristCount = users.filter((u) => u.roles.includes("tourist")).length;
  const policeCount = users.filter((u) => u.roles.includes("police")).length;
  const adminCount = users.filter((u) => u.roles.includes("admin")).length;

  const stats = [
    {
      title: "Active Tourists",
      value: touristCount.toString(),
      change: { value: "Live", type: "neutral" as const },
      icon: <Users className="h-4 w-4" />,
      variant: "default" as const,
    },
    {
      title: "Police Officers",
      value: policeCount.toString(),
      change: { value: "Live", type: "neutral" as const },
      icon: <Shield className="h-4 w-4" />,
      variant: "danger" as const,
    },
    {
      title: "Admins",
      value: adminCount.toString(),
      change: { value: "Live", type: "neutral" as const },
      icon: <Shield className="h-4 w-4" />,
      variant: "success" as const,
    },
  ];


  const systemHealth = [
    { name: "GPS Tracking", status: "online", percentage: 98 },
    { name: "Alert System", status: "online", percentage: 100 },
    { name: "AI Detection", status: "online", percentage: 95 },
    { name: "Database", status: "online", percentage: 99 },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">Real-time monitoring and incident management</p>
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

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>All system users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul className="space-y-2">
              {users
              .filter((u) => !u.roles.includes("admin"))
              .map((u) => (
                <li
                  key={u._id}
                  className="border rounded p-2 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{u.name || "Unnamed"}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {u.roles.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>


      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemHealth.map((system) => (
            <div key={system.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{system.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
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
    </div>
  );
}
