import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { FilterDropdown } from "@/components/transitops/filter-dropdown";
import { api, type DashboardKpis } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { syncBackendData } from "@/lib/transitops-data";
import { FleetManagerDashboard } from "@/components/transitops/dashboards/fleet-manager-dashboard";
import { DriverDashboard } from "@/components/transitops/dashboards/driver-dashboard";
import { SafetyOfficerDashboard } from "@/components/transitops/dashboards/safety-officer-dashboard";
import { FinancialAnalystDashboard } from "@/components/transitops/dashboards/financial-analyst-dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "TransitOps Dashboard | Fleet Operations" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { token, role, user } = useAuth();
  const [, setKpis] = useState<DashboardKpis | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [vehicles, drivers, trips, maintenance, fuel, expenses] = await Promise.all([
          api.vehicles.list(token),
          api.drivers.list(token),
          api.trips.list(token),
          api.maintenance.list(token),
          api.fuel.list(token),
          api.expenses.list(token),
        ]);
        
        syncBackendData({
          apiVehicles: vehicles,
          apiDrivers: drivers,
          apiTrips: trips,
          apiMaintenance: maintenance,
          apiFuel: fuel,
          apiExpenses: expenses,
        });
      } catch (err) {
        console.error("Failed to sync backend collections:", err);
      }
    }
    void loadData();
  }, [token, statusFilter, typeFilter, regionFilter]);

  useEffect(() => {
    async function loadKpis() {
      if (!token) return;
      setError(null);
      try {
        const data = await api.dashboard.kpis(token, {
          status: statusFilter,
          type: typeFilter,
          region: regionFilter,
        });
        setKpis(data);
      } catch (err) {
        console.error(err);
        setError("Could not load backend KPIs.");
      }
    }
    void loadKpis();
  }, [token, statusFilter, typeFilter, regionFilter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{role} Workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome, {user?.full_name ?? "TransitOps User"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Live operational KPIs computed from the SQLite backend.</p>
          </div>
        </div>

        {/* Global KPI Filters */}
        <section className="grid gap-3 rounded-lg border border-border/70 bg-card p-4 shadow-sm sm:grid-cols-3">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Vehicle Type</span>
            <FilterDropdown
              value={typeFilter}
              onValueChange={setTypeFilter}
              placeholder="Vehicle Type"
              options={[
                { label: "All Types", value: "all" },
                { label: "Truck", value: "truck" },
                { label: "Van", value: "van" },
                { label: "Bus", value: "bus" },
                { label: "Mini Truck", value: "mini" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Vehicle Status</span>
            <FilterDropdown
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Vehicle Status"
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Available", value: "available" },
                { label: "On Trip", value: "on_trip" },
                { label: "In Shop", value: "in_shop" },
                { label: "Retired", value: "retired" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Region</span>
            <FilterDropdown
              value={regionFilter}
              onValueChange={setRegionFilter}
              placeholder="Region"
              options={[
                { label: "All Regions", value: "all" },
                { label: "Chennai", value: "Chennai" },
                { label: "Mumbai", value: "Mumbai" },
                { label: "Delhi", value: "Delhi" },
                { label: "Hyderabad", value: "Hyderabad" },
                { label: "Pune", value: "Pune" },
              ]}
            />
          </div>
        </section>

        {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

        {/* Render role-specific dashboard */}
        {role === "Fleet Manager" && <FleetManagerDashboard />}
        {role === "Driver" && <DriverDashboard />}
        {role === "Safety Officer" && <SafetyOfficerDashboard />}
        {role === "Financial Analyst" && <FinancialAnalystDashboard />}
        {!role && <p className="text-sm text-muted-foreground">Please sign in with a valid role.</p>}
      </div>
    </AppShell>
  );
}
