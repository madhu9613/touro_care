import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MapPage from "./pages/MapPage";
import TouristsPage from "./pages/TouristsPage";
import EFIRPage from "./pages/EFIRPage";
import SecurityPage from "./pages/SecurityPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/Login"; // add login page
import AlertPage from "./pages/AlertsPage";

import "leaflet/dist/leaflet.css";
import { useAuth } from "./hooks/useAuth"; // custom hook for auth state

const queryClient = new QueryClient();

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || !user.roles.includes("admin")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedLayout>
                <MapPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tourists"
            element={
              <ProtectedLayout>
                <TouristsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/efir"
            element={
              <ProtectedLayout>
                <EFIRPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedLayout>
                <SecurityPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedLayout>
                <AlertPage />
              </ProtectedLayout>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col">
              <DashboardHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  {/* Placeholder routes for navigation items */}
                  {/* <Route path="/map" element={<MapPage/>} /> */}
                  {/* <Route path="/tourists" element={<TouristsPage/>} /> */}
                  {/* <Route path="/alerts" element={<AlertsPage/>} /> */}
                  {/* <Route path="/analytics" element={<AnalyticsPage/>} / */}
                  {/* <Route path="/efir" element={<EFIRPage/>} /> */}
                  {/* <Route path="/security" element={<SecurityPage/>} /> */}
                  {/* <Route path="/settings" element={<SettingsPage/>} /> */}
                  {/* Catch-all route */}
                  {/* <Route path="*" element={<NotFound />} /> */}
                {/* </Routes> */}
              {/* </main> */}
            {/* </div> */}
          {/* </div> */}
        {/* </SidebarProvider>  */}
        
        {/* */} 

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
