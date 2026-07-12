import { DollarSign, TrendingDown, Fuel, Wrench, BarChart3 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  formatCurrency,
  expenseLogs,
  monthlyFuelCosts,
  maintenanceLogs,
} from "@/lib/transitops-data";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function FinancialAnalystDashboard() {
  const totalExpenses = expenseLogs.reduce((sum, log) => sum + log.amount, 0);
  const currentMonthFuel = monthlyFuelCosts[monthlyFuelCosts.length - 1].amount;
  const pendingMaintenanceCost = maintenanceLogs
    .filter((log) => log.status !== "closed")
    .reduce((sum, log) => sum + log.cost, 0);

  return (
    <div className="relative space-y-4 overflow-hidden sm:space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_92%_at_14%_4%,color-mix(in_oklab,var(--color-accent)_38%,transparent)_0%,transparent_56%),radial-gradient(108%_90%_at_86%_12%,color-mix(in_oklab,var(--color-primary)_20%,transparent)_0%,transparent_60%),linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_92%,var(--color-card)_8%)_48%,var(--color-background)_100%)]" />

      <section className="relative overflow-hidden rounded-lg border border-border/55 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-card)_84%,var(--color-primary)_16%)_55%,var(--color-card)_100%)] px-4 py-4 shadow-[0_28px_68px_-52px_color-mix(in_oklab,var(--color-primary)_30%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] backdrop-blur-xl">
        <div className="grid gap-3 border-b border-border/60 pb-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Finance & Analytics
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Expense Intelligence
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-status-available" />
              Costs optimal
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border border-border/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Logged Expenses
            </p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {formatCurrency(totalExpenses)}
          </p>
        </article>
        <article className="rounded-lg border border-border/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Monthly Fuel
            </p>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {formatCurrency(currentMonthFuel)}
          </p>
        </article>
        <article className="rounded-lg border border-border/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Est. Maintenance Run
            </p>
            <Wrench className="h-4 w-4 text-status-maintenance" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-status-maintenance">
            {formatCurrency(pendingMaintenanceCost)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-border/55 bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-card)_80%,var(--color-accent)_20%)_0%,color-mix(in_oklab,var(--color-card)_90%,var(--color-primary)_10%)_100%)] p-4 shadow-[0_26px_64px_-50px_color-mix(in_oklab,var(--color-primary)_24%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)] backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Fuel Cost Trend</h2>
              <p className="text-sm text-muted-foreground">Monthly aggregate fuel expenses</p>
            </div>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <ChartContainer
            className="h-[250px] w-full"
            config={{ amount: { label: "Cost", color: "var(--color-primary)" } }}
          >
            <AreaChart data={monthlyFuelCosts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="month"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFuel)"
              />
            </AreaChart>
          </ChartContainer>
        </article>

        <article className="rounded-lg border border-border/55 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-border/55 pb-3">
            <h2 className="text-base font-semibold">Recent Expenses Breakdown</h2>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {expenseLogs.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded bg-muted/40 p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{exp.type}</span>
                  <span className="text-xs text-muted-foreground">{exp.notes}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold">{formatCurrency(exp.amount)}</span>
                  <span className="text-xs text-muted-foreground">{exp.vehicleId}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
