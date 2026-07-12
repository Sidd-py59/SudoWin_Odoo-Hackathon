import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { AppShell } from "@/components/transitops/app-shell";
import { ChartCard } from "@/components/transitops/chart-card";
import { FilterDropdown } from "@/components/transitops/filter-dropdown";
import { PageHeader } from "@/components/transitops/page-header";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { reportSeries, utilizationTrend } from "@/lib/transitops-data";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics | TransitOps" },
      {
        name: "description",
        content:
          "Analyze vehicle ROI, fuel efficiency, maintenance cost, and utilization with export-ready reports in TransitOps.",
      },
      { property: "og:title", content: "Reports & Analytics | TransitOps" },
      {
        property: "og:description",
        content: "Operational analytics workspace for strategic fleet and cost decision-making.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [vehicle, setVehicle] = useState("all");
  const [region, setRegion] = useState("all");

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Insights across profitability, fuel efficiency, utilization, and maintenance economics."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Reports" }]}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          }
        />

        <section className="grid gap-3 rounded-lg border border-border/70 bg-card p-4 shadow-sm lg:grid-cols-3">
          <FilterDropdown
            value={dateRange}
            onValueChange={setDateRange}
            placeholder="Date Range"
            options={[
              { label: "Last 7 days", value: "7" },
              { label: "Last 30 days", value: "30" },
              { label: "Last 90 days", value: "90" },
            ]}
          />
          <FilterDropdown
            value={vehicle}
            onValueChange={setVehicle}
            placeholder="Vehicle"
            options={[
              { label: "All Vehicles", value: "all" },
              { label: "Truck", value: "truck" },
              { label: "Van", value: "van" },
              { label: "Bus", value: "bus" },
            ]}
          />
          <FilterDropdown
            value={region}
            onValueChange={setRegion}
            placeholder="Region"
            options={[
              { label: "All Regions", value: "all" },
              { label: "North", value: "north" },
              { label: "South", value: "south" },
              { label: "West", value: "west" },
            ]}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Vehicle ROI" description="ROI distribution by fleet category">
            <ChartContainer
              className="h-[280px]"
              config={{
                Truck: { label: "Truck", color: "var(--color-status-on-trip)" },
                Van: { label: "Van", color: "var(--color-status-available)" },
                Bus: { label: "Bus", color: "var(--color-status-maintenance)" },
                Mini: { label: "Mini", color: "var(--color-status-retired)" },
              }}
            >
              <PieChart>
                <Pie
                  data={reportSeries.vehicleRoi}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Fuel Efficiency" description="Monthly efficiency score trend">
            <ChartContainer
              className="h-[280px]"
              config={{ score: { label: "Efficiency", color: "var(--color-status-available)" } }}
            >
              <LineChart data={reportSeries.fuelEfficiency}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="score" stroke="var(--color-status-available)" strokeWidth={2.5} />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Maintenance Cost" description="Cost trend over the last six months">
            <ChartContainer
              className="h-[280px]"
              config={{ amount: { label: "Cost", color: "var(--color-status-maintenance)" } }}
            >
              <BarChart data={reportSeries.maintenanceCost}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="amount"
                  fill="var(--color-status-maintenance)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Fleet Utilization" description="Weekly dispatch utilization rate">
            <ChartContainer
              className="h-[280px]"
              config={{ utilization: { label: "Utilization", color: "var(--color-primary)" } }}
            >
              <LineChart data={utilizationTrend}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[50, 90]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="utilization" stroke="var(--color-primary)" strokeWidth={2.5} />
              </LineChart>
            </ChartContainer>
          </ChartCard>
        </section>
      </div>
    </AppShell>
  );
}
