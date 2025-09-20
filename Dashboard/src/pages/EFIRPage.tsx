"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BASE_URL = "http://127.0.0.1:4000";

export default function EFIRPage() {
  const [efirs, setEfirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTourist, setSelectedTourist] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch FIRs
  useEffect(() => {
    const fetchEfirs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/police/efirs`);
        const data = await res.json();
        if (data.success) {
          setEfirs(data.data || []);
        } else {
          setError("Failed to load FIRs");
        }
      } catch (err) {
        setError("Error fetching FIRs");
      } finally {
        setLoading(false);
      }
    };
    fetchEfirs();
  }, []);

  // Fetch tourist details
  const fetchTouristDetails = async (touristId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/tourist/details/${touristId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTourist(data.data);
        setOpenDialog(true);
      } else {
        setSelectedTourist({ error: "Tourist not found" });
        setOpenDialog(true);
      }
    } catch (err) {
      setSelectedTourist({ error: "Error fetching tourist details" });
      setOpenDialog(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading FIRs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-500 p-6">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Active E-FIRs</h2>

      {efirs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No FIRs filed yet.
          </CardContent>
        </Card>
      ) : (
        efirs.map((f) => (
          <Card key={f.efirId || f._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                FIR ID: {f.efirId}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Tourist ID:</strong>{" "}
                <Button
                  variant="link"
                  className="p-0 text-blue-600"
                  onClick={() => fetchTouristDetails(f.touristId)}
                >
                  {f.touristId}
                </Button>
              </div>
              <div>
                <strong>Incident:</strong> {f.incidentDetails}
              </div>
              <div>
                <strong>Location:</strong> {f.location}
              </div>
              <div>
                <strong>Date/Time:</strong>{" "}
                {new Date(f.dateTime).toLocaleString()}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    f.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : f.status === "under_review"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {f.status}
                </span>
              </div>
              {f.attachments && f.attachments.length > 0 && (
                <div>
                  <strong>Attachments:</strong>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {f.attachments.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt="attachment"
                        className="h-24 w-24 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Tourist Details Dialog */}
{/* Tourist Details Dialog */}
<Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Tourist Details</DialogTitle>
    </DialogHeader>
    {selectedTourist ? (
      selectedTourist.error ? (
        <div className="text-red-500">{selectedTourist.error}</div>
      ) : (
        <div className="space-y-3">
          <div>
            <strong>ID:</strong> {selectedTourist.digitalId?.digitalId}
          </div>
          <div>
            <strong>Status:</strong> {selectedTourist.digitalId?.status}
          </div>
          <div>
            <strong>Security Score:</strong>{" "}
            {selectedTourist.digitalId?.securityScore}
          </div>
          <div>
            <strong>Itinerary:</strong>{" "}
            {selectedTourist.digitalId?.itinerarySummary?.destinations?.length > 0
              ? selectedTourist.digitalId.itinerarySummary.destinations
                  .map(
                    (d: any) =>
                      `${d.location} (${new Date(
                        d.startDate
                      ).toLocaleDateString()} - ${new Date(
                        d.endDate
                      ).toLocaleDateString()})`
                  )
                  .join(", ")
              : "N/A"}
          </div>
          <div>
            <strong>Emergency Contacts:</strong>{" "}
            {selectedTourist.digitalId?.emergencyContactsEncrypted
              ? "Encrypted (secured)"
              : "N/A"}
          </div>
          <div>
            <strong>Expiry:</strong>{" "}
            {new Date(
              selectedTourist.digitalId?.expiryAt
            ).toLocaleDateString()}
          </div>
        </div>
      )
    ) : (
      <div>Loading...</div>
    )}
  </DialogContent>
</Dialog>

    </div>
  );
}
