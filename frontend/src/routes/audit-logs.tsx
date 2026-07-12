import { createFileRoute } from "@tanstack/react-router";
import { Activity, FileText, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { PageHeader } from "@/components/transitops/page-header";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { StatCard } from "@/components/transitops/stat-card";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs | TransitOps" }] }),
  component: AuditLogsPage,
});

type AuditLog = {
  id: number;
  timestamp: string;
  actor_user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  old_value: string | null;
  new_value: string | null;
};

const columns: DataTableColumn<AuditLog>[] = [
  { key: "timestamp", label: "Time", sortable: true, render: (row) => new Date(row.timestamp).toLocaleString() },
  { key: "actor_user_id", label: "Actor", render: (row) => row.actor_user_id ? `User #${row.actor_user_id}` : "System", sortable: true },
  { key: "action", label: "Action", sortable: true },
  { key: "entity_type", label: "Entity Type", sortable: true },
  { key: "entity_id", label: "Entity ID", sortable: true },
  { key: "details", label: "Details", render: (row) => `${row.old_value ?? "-"} → ${row.new_value ?? "-"}` },
];

function AuditLogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setError(null);
      try {
        setLogs((await api.audit.list(token)) as AuditLog[]);
      } catch (error) {
        console.error(error);
        setError("Could not load audit logs. Login as Fleet Manager or Safety Officer.");
      }
    }
    void load();
  }, [token]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="System Audit Logs" description="A secure, read-only ledger of critical operational events and state changes." crumbs={[{ label: "Security & Auditing", to: "/audit-logs" }, { label: "Audit Logs" }]} />
        {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        <section className="grid gap-4 sm:grid-cols-3"><StatCard title="Stored Logs" value={logs.length} icon={FileText} /><StatCard title="Status Changes" value={logs.filter((log) => log.action === "status_change").length} icon={Activity} /><StatCard title="Security Flags" value={logs.filter((log) => log.entity_type === "driver").length} icon={ShieldAlert} /></section>
        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm"><h2 className="mb-4 text-base font-semibold">Event Ledger</h2><DataTable columns={columns} rows={logs} getRowId={(row) => String(row.id)} pageSize={10} /></section>
      </div>
    </AppShell>
  );
}
