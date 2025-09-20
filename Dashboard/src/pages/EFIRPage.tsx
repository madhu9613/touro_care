import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EFIRPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">E-FIR System</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            File New FIR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create FIR
          </Button>
          <div className="mt-4 text-muted-foreground">
            No FIRs filed yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
