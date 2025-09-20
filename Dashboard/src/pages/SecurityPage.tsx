import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SecurityPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Security</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Enable 2FA</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span>Session Timeout</span>
            <span className="text-muted-foreground">30 min</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
