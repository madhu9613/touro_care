import { Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  touristName: string;
  timestamp: string;
  isNew?: boolean;
}

const alertStyles = {
  critical: {
    border: "border-alert-critical/50",
    bg: "bg-alert-critical/10",
    badge: "bg-alert-critical text-white",
    dot: "bg-alert-critical"
  },
  high: {
    border: "border-alert-high/50", 
    bg: "bg-alert-high/10",
    badge: "bg-alert-high text-white",
    dot: "bg-alert-high"
  },
  medium: {
    border: "border-alert-medium/50",
    bg: "bg-alert-medium/10", 
    badge: "bg-alert-medium text-white",
    dot: "bg-alert-medium"
  },
  low: {
    border: "border-alert-low/50",
    bg: "bg-alert-low/10",
    badge: "bg-alert-low text-white", 
    dot: "bg-alert-low"
  }
};

export function AlertCard({ 
  id, 
  type, 
  title, 
  description, 
  location, 
  touristName, 
  timestamp,
  isNew = false
}: AlertCardProps) {
  const styles = alertStyles[type];

  return (
    <Card className={cn(
      "transition-all hover:shadow-md", 
      styles.border, 
      styles.bg,
      isNew && "ring-2 ring-primary/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", styles.dot, isNew && "animate-pulse")} />
            <Badge className={cn("text-xs font-medium", styles.badge)}>
              {type.toUpperCase()}
            </Badge>
            {isNew && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                NEW
              </Badge>
            )}
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
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Alert ID: {id}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 text-xs">
            Respond
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}