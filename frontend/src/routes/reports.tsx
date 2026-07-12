import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/transitops/app-shell";
import { ChartCard } from "@/components/transitops/chart-card";
import { FilterDropdown } from "@/components/transitops/filter-dropdown";
import { PageHeader } from "@/components/transitops/page-header";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics | TransitOps" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { token } = useAuth();
  const [dateRange, setDateRange] = useState("30");
  const [vehicle, setVehicle] = useState("all");
  const [region, setRegion] = useState("all");
  const [roi, setRoi] = useState<Array<{ vehicle: string; roi: number }>>([]);
  const [fuel, setFuel] = useState<Array<{ vehicle: string; efficiency_km_per_liter: number }>>([]);
  const [costTrips, setCostTrips] = useState<Array<{ trip_code: string; cost_per_km: number }>>([]);
  const [costlyVehicles, setCostlyVehicles] = useState<Array<{ vehicle: string; total_cost: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setError(null);
      try {
        const [roiRows, fuelRows, tripRows, costlyRows] = await Promise.all([
          api.analytics.vehicleRoi(token),
          api.analytics.fuelEfficiency(token),
          api.analytics.costPerTrip(token),
          api.analytics.topCostlyVehicles(token),
        ]);
        setRoi(roiRows);
        setFuel(fuelRows);
        setCostTrips(tripRows);
        setCostlyVehicles(costlyRows);
      } catch (error) {
        console.error(error);
        setError("Could not load analytics. Login as Fleet Manager or Financial Analyst.");
      }
    }
    void load();
  }, [token]);

  function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "VEHICLE ROI\nVehicle,ROI\n";
    roi.forEach((r) => {
      csvContent += `"${r.vehicle}",${r.roi}\n`;
    });
    csvContent += "\n";

    csvContent += "FUEL EFFICIENCY\nVehicle,Efficiency (Km/L)\n";
    fuel.forEach((f) => {
      csvContent += `"${f.vehicle}",${f.efficiency_km_per_liter}\n`;
    });
    csvContent += "\n";

    csvContent += "COST PER TRIP\nTrip Code,Cost per Km\n";
    costTrips.forEach((c) => {
      csvContent += `"${c.trip_code}",${c.cost_per_km}\n`;
    });
    csvContent += "\n";

    csvContent += "TOP COSTLY VEHICLES\nVehicle,Total Cost\n";
    costlyVehicles.forEach((v) => {
      csvContent += `"${v.vehicle}",${v.total_cost}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transitops_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToPDF() {
    window.print();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Insights across profitability, fuel efficiency, utilization, and operating cost."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Reports" }]}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={exportToPDF}>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          }
        />
        {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        <section className="grid gap-3 rounded-lg border border-border/70 bg-card p-4 shadow-sm lg:grid-cols-3"><FilterDropdown value={dateRange} onValueChange={setDateRange} placeholder="Date Range" options={[{ label: "Last 7 days", value: "7" }, { label: "Last 30 days", value: "30" }, { label: "Last 90 days", value: "90" }]} /><FilterDropdown value={vehicle} onValueChange={setVehicle} placeholder="Vehicle" options={[{ label: "All Vehicles", value: "all" }, { label: "Truck", value: "truck" }, { label: "Van", value: "van" }, { label: "Bus", value: "bus" }]} /><FilterDropdown value={region} onValueChange={setRegion} placeholder="Region" options={[{ label: "All Regions", value: "all" }, { label: "North", value: "north" }, { label: "South", value: "south" }, { label: "West", value: "west" }]} /></section>
        <section className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Vehicle ROI" description="ROI computed from estimated revenue, fuel, and maintenance costs"><ChartContainer className="h-[280px]" config={{ roi: { label: "ROI", color: "var(--color-status-available)" } }}><BarChart data={roi}><CartesianGrid vertical={false} /><XAxis dataKey="vehicle" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="roi" fill="var(--color-status-available)" radius={[4, 4, 0, 0]} /></BarChart></ChartContainer></ChartCard>
          <ChartCard title="Fuel Efficiency" description="Distance per liter by vehicle"><ChartContainer className="h-[280px]" config={{ efficiency_km_per_liter: { label: "Km/L", color: "var(--color-status-on-trip)" } }}><LineChart data={fuel}><CartesianGrid vertical={false} /><XAxis dataKey="vehicle" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="efficiency_km_per_liter" stroke="var(--color-status-on-trip)" strokeWidth={2.5} /></LineChart></ChartContainer></ChartCard>
          <ChartCard title="Cost Per Trip" description="Total logged cost divided by trip distance"><ChartContainer className="h-[280px]" config={{ cost_per_km: { label: "Cost/Km", color: "var(--color-status-maintenance)" } }}><BarChart data={costTrips}><CartesianGrid vertical={false} /><XAxis dataKey="trip_code" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="cost_per_km" fill="var(--color-status-maintenance)" radius={[4, 4, 0, 0]} /></BarChart></ChartContainer></ChartCard>
          <ChartCard title="Top Costly Vehicles" description="Fuel, maintenance, toll, repair, and other expenses"><ChartContainer className="h-[280px]" config={{ total_cost: { label: "Total Cost", color: "var(--color-primary)" } }}><BarChart data={costlyVehicles}><CartesianGrid vertical={false} /><XAxis dataKey="vehicle" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="total_cost" fill="var(--color-primary)" radius={[4, 4, 0, 0]} /></BarChart></ChartContainer></ChartCard>
        </section>
      </div>
    </AppShell>
  );
}
