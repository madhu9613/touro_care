import { useState } from "react";
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  FileText,
  Shield,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Live Map", url: "/map", icon: Map },
  { title: "Tourist Management", url: "/tourists", icon: Users },
  { title: "Alert Center", url: "/alerts", icon: AlertTriangle },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "E-FIR System", url: "/efir", icon: FileText },
];

const systemItems = [
  { title: "Security", url: "/security", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isMainGroupExpanded = navigationItems.some((item) => isActive(item.url));

  const getNavClasses = (active: boolean) =>
    active 
      ? "bg-primary/20 text-primary border-r-2 border-primary font-medium" 
      : "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-dashboard-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-border">
          {state === "expanded" && (
            <div>
              <h2 className="text-lg font-bold text-primary">Tourist Safety</h2>
              <p className="text-xs text-muted-foreground">Monitoring Dashboard</p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2"}>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-10">
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavClasses(active)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {state === "expanded" && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Navigation */}
        <SidebarGroup className="px-2 mt-auto">
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2"}>
            System
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-10">
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavClasses(active)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {state === "expanded" && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}