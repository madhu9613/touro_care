import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MapPage from "./pages/MapPage";
import TouristsPage from "./pages/TouristsPage";
import AlertsPage from "./pages/AlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import EFIRPage from "./pages/EFIRPage";
import SecurityPage from "./pages/SecurityPage";
import SettingsPage from "./pages/SettingsPage";
import "leaflet/dist/leaflet.css";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col">
              <DashboardHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  {/* Placeholder routes for navigation items */}
                  <Route path="/map" element={<MapPage/>} />
                  <Route path="/tourists" element={<TouristsPage/>} />
                  {/* <Route path="/alerts" element={<AlertsPage/>} /> */}
                  {/* <Route path="/analytics" element={<AnalyticsPage/>} / */}
                  <Route path="/efir" element={<EFIRPage/>} />
                  <Route path="/security" element={<SecurityPage/>} />
                  <Route path="/settings" element={<SettingsPage/>} />
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
