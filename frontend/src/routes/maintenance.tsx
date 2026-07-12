import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { Modal } from "@/components/transitops/modal";
import { PageHeader } from "@/components/transitops/page-header";
import { StatusBadge } from "@/components/transitops/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatNumber,
  getVehicleName,
  maintenanceLogs as seededMaintenanceLogs,
  type MaintenanceLog,
  vehicles,
} from "@/lib/transitops-data";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance Logs | TransitOps" },
      {
        name: "description",
        content:
          "Plan, monitor, and close vehicle maintenance workflows with timeline context and issue status tracking in TransitOps.",
      },
      { property: "og:title", content: "Maintenance Logs | TransitOps" },
      {
        property: "og:description",
        content:
          "Track workshop jobs, issue severity, maintenance cost, and service lifecycle for every fleet vehicle.",
      },
    ],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const [rows, setRows] = useState<MaintenanceLog[]>(seededMaintenanceLogs);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: vehicles[0]?.id ?? "",
    issue: "",
    cost: "",
    workshop: "",
    date: "",
    status: "open" as MaintenanceLog["status"],
  });

  const columns: DataTableColumn<MaintenanceLog>[] = [
    {
      key: "vehicle",
      label: "Vehicle",
      render: (row) => getVehicleName(row.vehicleId),
      sortable: true,
    },
    { key: "issue", label: "Issue", sortable: true },
    { key: "cost", label: "Cost", render: (row) => `₹${formatNumber(row.cost)}`, sortable: true },
    { key: "workshop", label: "Workshop", sortable: true },
    { key: "date", label: "Date", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          status={
            row.status === "closed"
              ? "available"
              : row.status === "open"
                ? "suspended"
                : "maintenance"
          }
          label={
            row.status === "in_progress"
              ? "In Progress"
              : row.status[0].toUpperCase() + row.status.slice(1)
          }
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          disabled={row.status === "closed"}
          onClick={() => {
            setRows((previous) =>
              previous.map((item) => (item.id === row.id ? { ...item, status: "closed" } : item)),
            );
          }}
        >
          Close Maintenance
        </Button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Maintenance"
          description="Track workshop workflows and keep fleet availability predictable."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Maintenance" }]}
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Maintenance
            </Button>
          }
        />

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
            <DataTable columns={columns} rows={rows} getRowId={(row) => row.id} />
          </div>

          <aside className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
            <h2 className="text-base font-semibold">Maintenance Timeline</h2>
            <div className="mt-4 space-y-4">
              {rows.map((item) => (
                <div key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.issue}</p>
                    <p className="text-xs text-muted-foreground">
                      {getVehicleName(item.vehicleId)} · {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Create Maintenance"
        description="Log a new issue and assign workshop details."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!form.issue || !form.workshop || !form.date) return;
                setRows((previous) => [
                  {
                    id: `mnt-${Date.now()}`,
                    vehicleId: form.vehicleId,
                    issue: form.issue,
                    cost: Number(form.cost || 0),
                    workshop: form.workshop,
                    date: form.date,
                    status: form.status,
                  },
                  ...previous,
                ]);
                setModalOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select
              value={form.vehicleId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, vehicleId: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Issue</Label>
            <Input
              value={form.issue}
              onChange={(event) => setForm((prev) => ({ ...prev, issue: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cost</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Workshop</Label>
            <Input
              value={form.workshop}
              onChange={(event) => setForm((prev) => ({ ...prev, workshop: event.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
