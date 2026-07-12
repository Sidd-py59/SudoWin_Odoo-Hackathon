import { Link, useRouterState } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  Bus,
  CarFront,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle2,
  Users,
  Wrench,
  Fuel,
  BarChart3,
} from "lucide-react";
import { ShieldAlert } from "lucide-react";
import { type ReactNode } from "react";
import { useAuth, type Role } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const appNavigation = [
  { title: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { title: "Vehicles", to: "/vehicles" as const, icon: CarFront },
  { title: "Drivers", to: "/drivers" as const, icon: Users },
  { title: "Trips", to: "/trips" as const, icon: Bus },
  { title: "Maintenance", to: "/maintenance" as const, icon: Wrench },
  { title: "Fuel & Expenses", to: "/fuel-expenses" as const, icon: Fuel },
  { title: "Reports", to: "/reports" as const, icon: BarChart3 },
  { title: "Audit Logs", to: "/audit-logs" as const, icon: ShieldAlert },
  { title: "Profile", to: "/profile" as const, icon: UserCircle2 },
  { title: "Settings", to: "/settings" as const, icon: Settings },
];

const roleAccess: Record<NonNullable<Role>, string[]> = {
  "Fleet Manager": ["Dashboard", "Vehicles", "Maintenance", "Reports", "Settings"],
  Driver: ["Dashboard", "Trips", "Drivers", "Profile"],
  "Safety Officer": ["Dashboard", "Drivers", "Audit Logs", "Settings"],
  "Financial Analyst": ["Dashboard", "Fuel & Expenses", "Reports", "Settings"],
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { role, logout } = useAuth();

  const allowedNavItems = appNavigation.filter(
    (item) => role && roleAccess[role]?.includes(item.title),
  );

  return (
    <div className="flex min-h-svh w-full bg-background p-2 sm:p-4 lg:p-6 xl:p-8 transition-all">
      <SidebarProvider defaultOpen className="flex w-full flex-1 overflow-hidden rounded-[2rem] bg-card shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-border/40">
        <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
          <SidebarHeader className="pt-6 pb-2 px-4">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="rounded-md bg-primary p-2">
                <Bus className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">TransitOps</p>
                <p className="truncate text-xs text-muted-foreground">Operations Platform</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {allowedNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.to}
                        tooltip={item.title}
                      >
                        <Link to={item.to} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border/80">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout" onClick={logout}>
                  <Link to="/" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <div className="order-3 col-span-2 w-full min-w-0 sm:order-none sm:col-auto sm:flex-1">
                <div className="relative max-w-lg">
                  <Input placeholder="Search trips, vehicles, drivers..." className="h-9 bg-card" />
                </div>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-md border-border/70 bg-card"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Badge
                  variant="secondary"
                  className="hidden rounded-md border border-border/70 bg-card md:inline-flex"
                >
                  {role || "No Role"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 rounded-md border-border/70 bg-card px-2"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      <span className="hidden lg:inline">Alex Morgan</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <BadgeCheck className="h-4 w-4" />
                        Profile Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <ClipboardList className="h-4 w-4" />
                        Preferences
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild onClick={logout}>
                      <Link to="/">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100svh-65px)] bg-muted/25 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
