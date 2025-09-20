import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, PlusCircle } from "lucide-react";

export default function TouristsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tourist Management</h2>
        <div className="flex gap-2">
          <Input placeholder="Search Tourist..." className="w-64" />
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Tourist
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Tourists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">TID-9847</td>
                  <td className="p-3">David Kim</td>
                  <td className="p-3">South Korea</td>
                  <td className="p-3 text-green-600">Active</td>
                  <td className="p-3">5 min ago</td>
                  <td className="p-3">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">TID-7623</td>
                  <td className="p-3">Maria Garcia</td>
                  <td className="p-3">Spain</td>
                  <td className="p-3 text-red-600">Critical</td>
                  <td className="p-3">1 hr ago</td>
                  <td className="p-3">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
