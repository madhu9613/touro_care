import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

export default function MapPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Live Map View</h2>
        <div className="flex gap-2">
          <Input placeholder="Search Tourist ID..." className="w-64" />
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Real-time Tourist Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            🌍 Map Component Integration (Leaflet/Google Maps)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
