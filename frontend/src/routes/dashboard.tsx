import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/transitops/app-shell";
import { EmptyState } from "@/components/transitops/empty-state";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

import { FleetManagerDashboard } from "@/components/transitops/dashboards/fleet-manager-dashboard";
import { DriverDashboard } from "@/components/transitops/dashboards/driver-dashboard";
import { SafetyOfficerDashboard } from "@/components/transitops/dashboards/safety-officer-dashboard";
import { FinancialAnalystDashboard } from "@/components/transitops/dashboards/financial-analyst-dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "TransitOps Dashboard | Fleet Operations" },
      {
        name: "description",
        content:
          "Monitor fleet utilization, active trips, vehicle availability, maintenance, and monthly fuel trends in TransitOps.",
      },
      { property: "og:title", content: "TransitOps Dashboard | Fleet Operations" },
      {
        property: "og:description",
        content:
          "Operational command center for transport dispatch, drivers, fleet health, and cost monitoring.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { role } = useAuth();

  let DashboardContent = (
    <EmptyState
      icon={LayoutDashboard}
      title="No Role Assigned"
      description="Please log in with a valid role to access your dashboard."
    />
  );

  switch (role) {
    case "Fleet Manager":
      DashboardContent = <FleetManagerDashboard />;
      break;
    case "Driver":
      DashboardContent = <DriverDashboard />;
      break;
    case "Safety Officer":
      DashboardContent = <SafetyOfficerDashboard />;
      break;
    case "Financial Analyst":
      DashboardContent = <FinancialAnalystDashboard />;
      break;
  }

  return <AppShell>{DashboardContent}</AppShell>;
}
