import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Activity, FileText } from "lucide-react";
import { AppShell } from "@/components/transitops/app-shell";
import { PageHeader } from "@/components/transitops/page-header";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { StatCard } from "@/components/transitops/stat-card";
import { formatCurrency, getVehicleName, getDriverName } from "@/lib/transitops-data";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs | TransitOps" },
      {
        name: "description",
        content: "Review system events, dispatch updates, and security logs.",
      },
    ],
  }),
  component: AuditLogsPage,
});

type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
};

const mockLogs: AuditLog[] = [
  {
    id: "log-001",
    timestamp: "2026-07-12 14:32",
    user: "Safety Officer",
    action: "Suspended Driver",
    entityType: "Driver",
    entityId: "drv-3",
    details: "Safety score dropped below threshold",
  },
  {
    id: "log-002",
    timestamp: "2026-07-12 11:15",
    user: "Fleet Manager",
    action: "Status Updated",
    entityType: "Vehicle",
    entityId: "veh-3",
    details: "Changed status to Maintenance",
  },
  {
    id: "log-003",
    timestamp: "2026-07-11 09:45",
    user: "Dispatcher",
    action: "Trip Dispatched",
    entityType: "Trip",
    entityId: "TRP-1091",
    details: "Assigned vehicle veh-1 and driver drv-1",
  },
  {
    id: "log-004",
    timestamp: "2026-07-10 16:20",
    user: "Financial Analyst",
    action: "Expense Logged",
    entityType: "Fuel",
    entityId: "fuel-1",
    details: "Logged 280L of fuel for veh-1",
  },
  {
    id: "log-005",
    timestamp: "2026-07-10 08:30",
    user: "System",
    action: "Auto-Cancellation",
    entityType: "Trip",
    entityId: "TRP-1094",
    details: "Driver availability expired",
  },
];

const columns: DataTableColumn<AuditLog>[] = [
  { key: "timestamp", label: "Time", sortable: true },
  { key: "user", label: "User/System", sortable: true },
  { key: "action", label: "Action", sortable: true },
  { key: "entityType", label: "Entity Type", sortable: true },
  { key: "details", label: "Details" },
];

function AuditLogsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="System Audit Logs"
          description="A secure, read-only ledger of critical operational events and state changes."
          crumbs={[{ label: "Security & Auditing", to: "/audit-logs" }, { label: "Audit Logs" }]}
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Events Today" value={14} icon={Activity} />
          <StatCard title="Security Flags" value={2} icon={ShieldAlert} />
          <StatCard title="Stored Logs" value={1492} icon={FileText} />
        </section>

        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Event Ledger</h2>
          <DataTable columns={columns} rows={mockLogs} getRowId={(row) => row.id} pageSize={10} />
        </section>
      </div>
    </AppShell>
  );
}
