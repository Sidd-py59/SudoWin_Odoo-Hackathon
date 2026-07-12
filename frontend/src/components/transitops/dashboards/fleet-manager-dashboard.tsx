import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bus,
  Car,
  ClipboardPlus,
  Clock3,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { EmptyState } from "@/components/transitops/empty-state";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getDashboardKpis, vehicles, maintenanceLogs, trips } from "@/lib/transitops-data";

const pieData = [
  {
    name: "available",
    value: vehicles.filter((vehicle) => vehicle.status === "available").length,
    fill: "var(--color-status-available)",
  },
  {
    name: "onTrip",
    value: vehicles.filter((vehicle) => vehicle.status === "on_trip").length,
    fill: "var(--color-status-on-trip)",
  },
  {
    name: "maintenance",
    value: vehicles.filter((vehicle) => vehicle.status === "maintenance").length,
    fill: "var(--color-status-maintenance)",
  },
  {
    name: "retired",
    value: vehicles.filter((vehicle) => vehicle.status === "retired").length,
    fill: "var(--color-status-retired)",
  },
];

export function FleetManagerDashboard() {
  const kpis = getDashboardKpis();
  const navigate = useNavigate({ from: "/dashboard" });
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const hasFleetStatusData = pieData.some((item) => item.value > 0);
  const urgentMaintenance = maintenanceLogs.filter((log) => log.status !== "closed").length;
  const delayedTrips = trips.filter(
    (trip) => trip.status === "draft" || trip.status === "cancelled",
  ).length;
  const availableShare = `${Math.round((kpis.availableVehicles / Math.max(1, kpis.activeVehicles)) * 100)}%`;
  const systemLoad = Math.max(12, 70 - kpis.fleetUtilization);

  const metricTiles = [
    {
      label: "Dispatch Readiness",
      value: availableShare,
      note: `${kpis.availableVehicles} vehicles ready now`,
    },
    {
      label: "Urgent Maintenance",
      value: urgentMaintenance,
      note: "Open issues requiring immediate service",
    },
    {
      label: "At-Risk Trips",
      value: delayedTrips,
      note: "Draft/cancelled dispatches to resolve",
    },
  ];

  return (
    <div className="relative space-y-4 overflow-hidden sm:space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_92%_at_14%_4%,color-mix(in_oklab,var(--color-accent)_38%,transparent)_0%,transparent_56%),radial-gradient(108%_90%_at_86%_12%,color-mix(in_oklab,var(--color-primary)_20%,transparent)_0%,transparent_60%),linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_92%,var(--color-card)_8%)_48%,var(--color-background)_100%)]" />
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-accent/24 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />

      <section className="relative overflow-hidden rounded-lg border border-border/55 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-card)_84%,var(--color-primary)_16%)_55%,var(--color-card)_100%)] px-4 py-4 shadow-[0_28px_68px_-52px_color-mix(in_oklab,var(--color-primary)_30%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        <div className="grid gap-3 border-b border-border/60 pb-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Fleet Manager
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Fleet Lifecycle & Readiness
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-status-available motion-safe:animate-pulse" />
              System live
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article className="relative overflow-hidden rounded-lg border border-border/55 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--color-card)_78%,var(--color-accent)_22%)_0%,color-mix(in_oklab,var(--color-card)_86%,var(--color-primary)_14%)_100%)] p-4 shadow-[0_28px_66px_-52px_color-mix(in_oklab,var(--color-primary)_24%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)] backdrop-blur-xl xl:col-span-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
          <div className="mb-4 grid gap-4 border-b border-border/60 pb-4 sm:grid-cols-3">
            <div className="sm:col-span-2 rounded-lg border border-border/55 bg-[linear-gradient(165deg,color-mix(in_oklab,var(--color-background)_68%,var(--color-accent)_32%)_0%,color-mix(in_oklab,var(--color-background)_88%,var(--color-card)_12%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Operational Efficiency
              </p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {kpis.fleetUtilization}%
                </p>
                <p className="pb-1 text-xs font-medium text-status-available">
                  +{Math.max(1, kpis.activeTrips)} from last shift
                </p>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, kpis.fleetUtilization)}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/55 bg-[linear-gradient(165deg,color-mix(in_oklab,var(--color-background)_72%,var(--color-primary)_28%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Active Units
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                {kpis.activeVehicles}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.max(0, trips.length - kpis.activeTrips)} queued or closed
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-status-on-trip"
                  style={{ width: `${Math.min(100, kpis.fleetUtilization + 12)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metricTiles.map((tile) => (
              <article
                key={tile.label}
                className="rounded-lg border border-border/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-3 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]"
              >
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {tile.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {tile.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{tile.note}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="relative overflow-hidden rounded-lg border border-border/55 bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-card)_78%,var(--color-accent)_22%)_0%,color-mix(in_oklab,var(--color-card)_88%,var(--color-primary)_12%)_100%)] p-4 shadow-[0_26px_66px_-52px_color-mix(in_oklab,var(--color-primary)_26%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_7%,transparent)] backdrop-blur-xl xl:col-span-4">
          <div className="pointer-events-none absolute -left-14 -top-16 h-36 w-36 rounded-full bg-accent/18 blur-3xl" />
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Control Signals</h2>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/55 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--color-background)_76%,var(--color-accent)_24%)_0%,var(--color-background)_100%)] p-3">
              <span className="text-sm text-foreground">Network node sync</span>
              <div className="flex gap-1">
                <span className="h-3 w-1 rounded-full bg-primary" />
                <span className="h-3 w-1 rounded-full bg-primary" />
                <span className="h-3 w-1 rounded-full bg-primary" />
                <span className="h-3 w-1 rounded-full bg-muted" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/55 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--color-background)_76%,var(--color-accent)_24%)_0%,var(--color-background)_100%)] p-3">
              <span className="text-sm text-foreground">Signal latency</span>
              <span className="font-mono text-xs text-muted-foreground">{systemLoad}ms</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/55 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--color-background)_76%,var(--color-accent)_24%)_0%,var(--color-background)_100%)] p-3">
              <span className="text-sm text-foreground">Encryption</span>
              <span className="rounded border border-status-available/30 bg-status-available/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-status-available">
                Secure
              </span>
            </div>
            <div className="rounded-lg border border-border/55 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--color-background)_78%,var(--color-accent)_22%)_0%,var(--color-background)_100%)] p-3">
              <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5 h-3 w-3 rounded-full bg-status-suspended/25">
                  <div className="absolute inset-0 rounded-full bg-status-suspended/60 motion-safe:animate-ping" />
                </div>
                <p className="text-xs italic text-muted-foreground">
                  {urgentMaintenance} high-priority maintenance alerts pending.
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-lg border border-border/55 bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-card)_80%,var(--color-accent)_20%)_0%,color-mix(in_oklab,var(--color-card)_90%,var(--color-primary)_10%)_100%)] p-4 shadow-[0_26px_64px_-50px_color-mix(in_oklab,var(--color-primary)_24%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)] backdrop-blur-xl xl:col-span-8">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-accent/16 blur-2xl" />
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Fleet Status Overview</h2>
              <p className="text-sm text-muted-foreground">Live distribution of vehicle states</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/vehicles" })}>
              View map <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {chartsReady && hasFleetStatusData ? (
            <ChartContainer
              className="h-[280px] w-full sm:h-[300px]"
              config={{
                available: { label: "Available", color: "var(--color-status-available)" },
                onTrip: { label: "On Trip", color: "var(--color-status-on-trip)" },
                maintenance: { label: "Maintenance", color: "var(--color-status-maintenance)" },
                retired: { label: "Retired", color: "var(--color-status-retired)" },
              }}
            >
              <PieChart>
                <Pie
                  id="fleet-status-pie"
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={102}
                  isAnimationActive={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyState
              icon={Bus}
              title="No fleet status data"
              description="Vehicle status distribution will appear here once fleet telemetry is available."
            />
          )}
        </article>

        <section className="relative overflow-hidden rounded-lg border border-border/55 bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-card)_80%,var(--color-accent)_20%)_0%,color-mix(in_oklab,var(--color-card)_90%,var(--color-primary)_10%)_100%)] p-4 shadow-[0_26px_66px_-52px_color-mix(in_oklab,var(--color-primary)_26%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_7%,transparent)] backdrop-blur-xl xl:col-span-4">
          <div className="pointer-events-none absolute -bottom-14 -right-12 h-40 w-40 rounded-full bg-accent/16 blur-3xl" />
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Quick Actions</h2>
            <Clock3 className="h-4 w-4 text-primary" />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-10 rounded-lg text-xs uppercase tracking-wide"
              onClick={() => navigate({ to: "/reports" })}
            >
              System audit
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-lg text-xs uppercase tracking-wide"
              onClick={() => navigate({ to: "/maintenance" })}
            >
              Export log
            </Button>
          </div>
          <Button
            variant="ghost"
            className="h-10 w-full rounded-lg border border-dashed border-border text-xs uppercase tracking-wide text-muted-foreground"
            onClick={() => navigate({ to: "/maintenance" })}
          >
            <Activity className="h-4 w-4" />
            Emergency override
          </Button>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Button
              variant="outline"
              className="h-10 justify-start rounded-lg"
              onClick={() => navigate({ to: "/vehicles" })}
            >
              <Car className="h-4 w-4" />
              Add vehicle
            </Button>
            <Button
              variant="outline"
              className="h-10 justify-start rounded-lg"
              onClick={() => navigate({ to: "/maintenance" })}
            >
              <ClipboardPlus className="h-4 w-4" />
              Schedule Maintenance
            </Button>
          </div>
        </section>
      </section>
    </div>
  );
}
