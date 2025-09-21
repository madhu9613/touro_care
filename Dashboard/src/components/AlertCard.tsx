// components/AlertCard.tsx
import { Clock, MapPin, User, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AlertCardProps {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | string;
  title: string;
  description: string;
  location: string | { lat: number; lng: number };
  touristName: string;
  timestamp: string;
  status: 'open' | 'acknowledged' | 'accepted' | 'resolved';
  acceptedBy?: { _id: string; name: string; email: string };
  isNew?: boolean;
  onAccept?: (alertId: string) => Promise<void>;
  currentUserId?: string;
}

const alertStyles = {
  critical: { border: "border-alert-critical/50", bg: "bg-alert-critical/10", badge: "bg-alert-critical text-white", dot: "bg-alert-critical" },
  high:     { border: "border-alert-high/50",     bg: "bg-alert-high/10",     badge: "bg-alert-high text-white",     dot: "bg-alert-high" },
  medium:   { border: "border-alert-medium/50",   bg: "bg-alert-medium/10",   badge: "bg-alert-medium text-white",   dot: "bg-alert-medium" },
  low:      { border: "border-alert-low/50",      bg: "bg-alert-low/10",      badge: "bg-alert-low text-white",      dot: "bg-alert-low" },
};

export function AlertCard({
  id,
  type,
  title,
  description,
  location,
  touristName,
  timestamp,
  status,
  acceptedBy,
  isNew = false,
  onAccept,
  currentUserId
}: AlertCardProps) {
  const styles = alertStyles[type] || alertStyles.low;
  const [isAccepting, setIsAccepting] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsAccepting(true);
    try {
      await onAccept(id);
      toast({ title: "Alert Accepted", description: "You have successfully accepted this alert." });
    } catch {
      toast({ title: "Error", description: "Failed to accept the alert.", variant: "destructive" });
    } finally {
      setIsAccepting(false);
    }
  };

  const isAcceptedByCurrentUser = acceptedBy && currentUserId && acceptedBy._id === currentUserId;
  const isAccepted = status === 'accepted';

  // Safely render location
  const renderLocation = () => {
    if (typeof location === "string") return location;
    if (location && typeof location === "object") return `Lat: ${location.lat}, Lng: ${location.lng}`;
    return "-";
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      styles.border,
      styles.bg,
      isNew && "ring-2 ring-primary/50",
      isAccepted && "border-primary/50 bg-primary/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", styles.dot, isNew && "animate-pulse")} />
            <Badge className={cn("text-xs font-medium", styles.badge)}>{type.toUpperCase()}</Badge>
            {isNew && <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">NEW</Badge>}
            {isAccepted && <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">ACCEPTED</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <h4 className="font-semibold text-foreground leading-tight">{title}</h4>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{touristName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{renderLocation()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Alert ID: {id}</span>
          </div>
          {isAccepted && acceptedBy && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Accepted by: {isAcceptedByCurrentUser ? 'You' : acceptedBy.name}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {!isAccepted && onAccept && (
            <Button size="sm" className="flex-1 text-xs" onClick={handleAccept} disabled={isAccepting}>
              {isAccepting ? "Accepting..." : "Accept Alert"}
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1 text-xs">Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
