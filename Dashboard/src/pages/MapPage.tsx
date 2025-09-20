"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const BASE_URL = "http://127.0.0.1:4000";

// custom marker icon (fixes default missing icons in Leaflet + Vite/Next)
const touristIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

export default function MapPage() {
  const [tourists, setTourists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Fetch active tourists
  useEffect(() => {
    const fetchTourists = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/police/active`);
        const data = await res.json();
        if (data.success) {
          setTourists(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching tourists:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTourists();

    // refresh every 10s
    const interval = setInterval(fetchTourists, 10000);
    return () => clearInterval(interval);
  }, []);

  // Search filter
  const filtered = tourists.filter((t) =>
    t.touristId.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Live Map View</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search Tourist ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
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
          <div className="w-full h-[600px] rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Loading map...
              </div>
            ) : (
              <MapContainer
                center={[28.6, 77.2]} // Default center (Delhi/NCR)
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {filtered.map((t) => (
                  <Marker
                    key={t.touristId}
                    position={[t.lat, t.lon]}
                    icon={touristIcon}
                  >
                    <Popup>
                      <div>
                        <strong>Tourist ID:</strong> {t.touristId}
                        <br />
                        <strong>Last Seen:</strong>{" "}
                        {new Date(t.ts).toLocaleString()}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
