import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, PlusCircle, X } from "lucide-react";

interface Tourist {
  _id: string;
  name: string;
  email: string;
  phone: string;
  walletId: string;
  org: string;
  roles: string[];
  kycStatus: string;
  digitalIdStatus: string;
  createdAt: string;
}

interface TouristDetails {
  digitalId: Tourist;
  blockchain: any;
  recentEvents: any[];
  recentLocations: any[];
  recentAlerts: any[];
}

export default function TouristsPage() {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedTourist, setSelectedTourist] = useState<TouristDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTourists() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // JWT saved after login
        const res = await fetch("http://localhost:4000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }

        const data = await res.json();
        setTourists(data.data || []);
      } catch (err: any) {
        console.error("Failed to fetch tourists:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTourists();
  }, []);

  const handleViewClick = async (walletId: string) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/tourist/details/${walletId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!data.success) {
        setDetailsError(data.message || "Failed to fetch tourist details");
        setSelectedTourist(null);
      } else {
        setSelectedTourist(data.data);
      }
    } catch (err: any) {
      console.error(err);
      setDetailsError("Something went wrong while fetching details");
      setSelectedTourist(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filtered = tourists.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.walletId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tourist Management</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search Tourist..."
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
          {loading && <div>Loading tourists...</div>}
          {error && <div className="text-red-600">Error: {error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">KYC</th>
                    <th className="p-3">Digital ID</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id} className="border-b">
                      <td className="p-3">{t.walletId}</td>
                      <td className="p-3">{t.name}</td>
                      <td className="p-3">{t.email}</td>
                      <td className="p-3">{t.phone || "—"}</td>
                      <td
                        className={`p-3 ${
                          t.kycStatus === "verified"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {t.kycStatus}
                      </td>
                      <td
                        className={`p-3 ${
                          t.digitalIdStatus === "active"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {t.digitalIdStatus}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewClick(t.walletId)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-3 text-center text-muted-foreground">
                        No tourists found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tourist Details Modal (Dark Theme) */}
      {selectedTourist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-lg w-11/12 max-w-3xl p-6 relative shadow-lg">
            <button
              onClick={() => setSelectedTourist(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {detailsLoading ? (
              <div>Loading details...</div>
            ) : detailsError ? (
              <div className="text-red-400">{detailsError}</div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <h3 className="text-xl font-bold">Tourist Details</h3>
                <p>
                  <strong>Name:</strong> {selectedTourist.digitalId.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedTourist.digitalId.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedTourist.digitalId.phone || "—"}
                </p>
                <p>
                  <strong>Wallet ID:</strong> {selectedTourist.digitalId.walletId}
                </p>
                <p>
                  <strong>KYC Status:</strong> {selectedTourist.digitalId.kycStatus}
                </p>
                <p>
                  <strong>Digital ID Status:</strong> {selectedTourist.digitalId.digitalIdStatus}
                </p>

                <h4 className="font-semibold mt-4">Blockchain Data:</h4>
                <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-gray-100">
                  {JSON.stringify(selectedTourist.blockchain, null, 2)}
                </pre>

                <h4 className="font-semibold mt-4">Recent Events:</h4>
                <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-gray-100">
                  {JSON.stringify(selectedTourist.recentEvents, null, 2)}
                </pre>

                <h4 className="font-semibold mt-4">Recent Locations:</h4>
                <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-gray-100">
                  {JSON.stringify(selectedTourist.recentLocations, null, 2)}
                </pre>

                <h4 className="font-semibold mt-4">Recent Alerts:</h4>
                <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-gray-100">
                  {JSON.stringify(selectedTourist.recentAlerts, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
