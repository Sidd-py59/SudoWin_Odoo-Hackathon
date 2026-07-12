import { ShieldAlert, AlertTriangle, CheckCircle, Search, FileText } from "lucide-react";
import { drivers } from "@/lib/transitops-data";

export function SafetyOfficerDashboard() {
  const atRiskDrivers = drivers.filter((d) => d.safetyScore < 80);
  const expiringLicenses = drivers.filter((d) => d.expiryDate.startsWith("2024")); // Simplified mock logic

  return (
    <div className="relative space-y-4 overflow-hidden sm:space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_92%_at_14%_4%,color-mix(in_oklab,var(--color-accent)_38%,transparent)_0%,transparent_56%),radial-gradient(108%_90%_at_86%_12%,color-mix(in_oklab,var(--color-primary)_20%,transparent)_0%,transparent_60%),linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_92%,var(--color-card)_8%)_48%,var(--color-background)_100%)]" />

      <section className="relative overflow-hidden rounded-lg border border-border/55 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-card)_84%,var(--color-primary)_16%)_55%,var(--color-card)_100%)] px-4 py-4 shadow-[0_28px_68px_-52px_color-mix(in_oklab,var(--color-primary)_30%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] backdrop-blur-xl">
        <div className="grid gap-3 border-b border-border/60 pb-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Safety & Compliance
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Compliance Overview
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-status-maintenance motion-safe:animate-pulse" />
              Monitoring active
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border border-border/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            At-Risk Drivers
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-destructive">
            {atRiskDrivers.length}
          </p>
        </article>
        <article className="rounded-lg border border-border/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Expiring Licenses
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-status-maintenance">
            {expiringLicenses.length}
          </p>
        </article>
        <article className="rounded-lg border border-border/55 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_74%,var(--color-accent)_26%)_0%,color-mix(in_oklab,var(--color-background)_90%,var(--color-card)_10%)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Average Safety Score
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-status-available">
            {Math.round(drivers.reduce((acc, d) => acc + d.safetyScore, 0) / drivers.length)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-border/55 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-border/55 pb-3">
            <h2 className="text-base font-semibold">Low Safety Scores</h2>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-3">
            {atRiskDrivers.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded bg-muted/40 p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{d.name}</span>
                  <span className="text-xs text-muted-foreground">{d.licenseNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-destructive">{d.safetyScore}</span>
                </div>
              </div>
            ))}
            {atRiskDrivers.length === 0 && (
              <p className="text-sm text-muted-foreground">All drivers are performing safely.</p>
            )}
          </div>
        </article>

        <article className="rounded-lg border border-border/55 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-border/55 pb-3">
            <h2 className="text-base font-semibold">License Expiry Alerts</h2>
            <FileText className="h-4 w-4 text-status-maintenance" />
          </div>
          <div className="space-y-3">
            {expiringLicenses.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded bg-muted/40 p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{d.name}</span>
                  <span className="text-xs text-muted-foreground">{d.licenseNumber}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-status-maintenance">
                    Expires Soon
                  </span>
                  <span className="text-xs text-muted-foreground">{d.expiryDate}</span>
                </div>
              </div>
            ))}
            {expiringLicenses.length === 0 && (
              <p className="text-sm text-muted-foreground">No licenses expiring soon.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
