import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  className?: string;
}

const variantStyles = {
  default: "border-border bg-card",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-destructive/30 bg-destructive/5", 
  success: "border-success/30 bg-success/5"
};

const changeStyles = {
  increase: "text-success bg-success/10 border-success/20",
  decrease: "text-destructive bg-destructive/10 border-destructive/20",
  neutral: "text-muted-foreground bg-muted/10 border-border"
};

export function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  variant = 'default',
  className 
}: StatCardProps) {
  return (
    <Card className={cn(variantStyles[variant], "transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          {change && (
            <Badge 
              variant="outline" 
              className={cn("text-xs px-2 py-1", changeStyles[change.type])}
            >
              {change.value}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}