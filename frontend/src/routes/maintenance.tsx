import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { Modal } from "@/components/transitops/modal";
import { PageHeader } from "@/components/transitops/page-header";
import { StatusBadge } from "@/components/transitops/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type ApiMaintenance, type ApiVehicle } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatNumber } from "@/lib/transitops-data";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance Logs | TransitOps" }] }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<ApiMaintenance[]>([]);
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState({ vehicle_id: "", service_type: "", cost: "", service_date: new Date().toISOString().slice(0, 10) });

  async function loadData() {
    if (!token) return;
    setApiError(null);
    try {
      const [maintenanceRows, vehicleRows] = await Promise.all([
        api.maintenance.list(token),
        api.vehicles.list(token),
      ]);
      setRows(maintenanceRows);
      setVehicles(vehicleRows);
      setForm((prev) => ({ ...prev, vehicle_id: prev.vehicle_id || (vehicleRows[0] ? String(vehicleRows[0].id) : "") }));
    } catch (error) {
      console.error(error);
      setApiError("Could not load maintenance data from backend.");
    }
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  const columns: DataTableColumn<ApiMaintenance>[] = [
    { key: "vehicle", label: "Vehicle", render: (row) => row.vehicle?.name_model ?? `Vehicle #${row.vehicle_id}`, sortable: true },
    { key: "service_type", label: "Service", sortable: true },
    { key: "cost", label: "Cost", render: (row) => `₹${formatNumber(row.cost)}`, sortable: true },
    { key: "service_date", label: "Date", sortable: true },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status === "completed" ? "available" : "maintenance"} label={row.status === "completed" ? "Completed" : "Active"} /> },
    { key: "actions", label: "Actions", render: (row) => <Button variant="outline" size="sm" disabled={row.status === "completed"} onClick={() => void closeMaintenance(row.id)}>Close Maintenance</Button> },
  ];

  async function saveMaintenance() {
    if (!token || !form.vehicle_id || !form.service_type.trim()) return;
    try {
      await api.maintenance.create(token, {
        vehicle_id: Number(form.vehicle_id),
        service_type: form.service_type.trim(),
        cost: Number(form.cost || 0),
        service_date: form.service_date,
      });
      setModalOpen(false);
      setForm({ vehicle_id: "", service_type: "", cost: "", service_date: new Date().toISOString().slice(0, 10) });
      await loadData();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Could not create maintenance record.");
    }
  }

  async function closeMaintenance(id: number) {
    if (!token) return;
    try {
      await api.maintenance.close(token, id);
      await loadData();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Could not close maintenance.");
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Maintenance" description="Track workshop workflows and keep fleet availability predictable." crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Maintenance" }]} action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" />Create Maintenance</Button>} />
        {apiError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{apiError}</div> : null}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-border/70 bg-card p-4 shadow-sm"><DataTable columns={columns} rows={rows} getRowId={(row) => String(row.id)} /></div>
          <aside className="rounded-lg border border-border/70 bg-card p-4 shadow-sm"><h2 className="text-base font-semibold">Maintenance Timeline</h2><div className="mt-4 space-y-4">{rows.map((item) => <div key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"><div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted"><Wrench className="h-4 w-4 text-muted-foreground" /></div><div><p className="text-sm font-medium text-foreground">{item.service_type}</p><p className="text-xs text-muted-foreground">{item.vehicle?.name_model ?? `Vehicle #${item.vehicle_id}`} · {item.service_date}</p></div></div>)}</div></aside>
        </section>
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Create Maintenance" description="Opening maintenance automatically marks the vehicle In Shop." footer={<div className="flex w-full justify-end gap-2"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={() => void saveMaintenance()}>Save</Button></div>}>
        <div className="grid gap-4">
          <div className="space-y-2"><Label>Vehicle</Label><Select value={form.vehicle_id} onValueChange={(value) => setForm((prev) => ({ ...prev, vehicle_id: value }))}><SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger><SelectContent>{vehicles.map((vehicle) => <SelectItem key={vehicle.id} value={String(vehicle.id)}>{vehicle.name_model} · {vehicle.status}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Service Type</Label><Input value={form.service_type} onChange={(event) => setForm((prev) => ({ ...prev, service_type: event.target.value }))} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Cost</Label><Input type="number" value={form.cost} onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))} /></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={form.service_date} onChange={(event) => setForm((prev) => ({ ...prev, service_date: event.target.value }))} /></div></div>
        </div>
      </Modal>
    </AppShell>
  );
}
