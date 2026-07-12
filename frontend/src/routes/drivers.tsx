import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { DeleteDialog } from "@/components/transitops/delete-dialog";
import { Drawer } from "@/components/transitops/drawer";
import { FilterDropdown } from "@/components/transitops/filter-dropdown";
import { PageHeader } from "@/components/transitops/page-header";
import { SearchInput } from "@/components/transitops/search-input";
import { StatusBadge } from "@/components/transitops/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type ApiDriver } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/drivers")({
  head: () => ({ meta: [{ title: "Driver Management | TransitOps" }] }),
  component: DriversPage,
});

type DriverForm = {
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number: string;
  safety_score: string;
  status: ApiDriver["status"];
};

const emptyForm: DriverForm = {
  name: "",
  license_number: "",
  license_category: "Heavy",
  license_expiry: "",
  contact_number: "",
  safety_score: "90",
  status: "available",
};

function driverBadgeStatus(status: ApiDriver["status"]) {
  if (status === "off_duty") return "retired";
  return status;
}

function driverStatusLabel(status: ApiDriver["status"]) {
  if (status === "off_duty") return "Off Duty";
  if (status === "on_trip") return "On Trip";
  return status[0].toUpperCase() + status.slice(1);
}

function DriversPage() {
  const { token } = useAuth();
  const [driverRows, setDriverRows] = useState<ApiDriver[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
  const [deleteDriverId, setDeleteDriverId] = useState<number | null>(null);
  const [form, setForm] = useState<DriverForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof DriverForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDrivers() {
    if (!token) return;
    setLoading(true);
    setApiError(null);
    try {
      setDriverRows(await api.drivers.list(token));
    } catch (error) {
      console.error(error);
      setApiError("Could not load drivers from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDrivers();
  }, [token]);

  const filteredDrivers = useMemo(() => {
    return driverRows.filter((driver) => {
      const q = search.toLowerCase();
      const matchesSearch =
        driver.name.toLowerCase().includes(q) ||
        driver.license_number.toLowerCase().includes(q) ||
        driver.contact_number.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [driverRows, search, statusFilter]);

  const columns: DataTableColumn<ApiDriver>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "license_number", label: "License Number", sortable: true },
    { key: "license_category", label: "Category", sortable: true },
    {
      key: "license_expiry",
      label: "Expiry Date",
      sortable: true,
      render: (row) => (
        <div className="inline-flex items-center gap-2">
          <span>{row.license_expiry}</span>
          {row.license_expired ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-status-maintenance/15 px-2 py-0.5 text-xs font-medium text-status-maintenance">
              <AlertTriangle className="h-3 w-3" />Expired
            </span>
          ) : null}
        </div>
      ),
    },
    { key: "contact_number", label: "Contact" },
    { key: "safety_score", label: "Safety Score", sortable: true },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={driverBadgeStatus(row.status)} label={driverStatusLabel(row.status)} /> },
    {
      key: "actions",
      label: "Actions",
      className: "w-[116px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteDriverId(row.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  function resetForm() {
    setForm(emptyForm);
    setEditingDriverId(null);
    setErrors({});
    setApiError(null);
  }

  function openEdit(row: ApiDriver) {
    setEditingDriverId(row.id);
    setForm({
      name: row.name,
      license_number: row.license_number,
      license_category: row.license_category,
      license_expiry: row.license_expiry,
      contact_number: row.contact_number,
      safety_score: String(row.safety_score),
      status: row.status,
    });
    setErrors({});
    setDrawerOpen(true);
  }

  async function onSaveDriver() {
    if (!token) return;
    const nextErrors: Partial<Record<keyof DriverForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.license_number.trim()) nextErrors.license_number = "License number is required.";
    if (!form.license_expiry) nextErrors.license_expiry = "Expiry date is required.";
    if (!form.contact_number.trim()) nextErrors.contact_number = "Phone is required.";
    const score = Number(form.safety_score);
    if (!score || score < 1 || score > 100) nextErrors.safety_score = "Safety score must be between 1 and 100.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      license_number: form.license_number.trim().toUpperCase(),
      license_category: form.license_category,
      license_expiry: form.license_expiry,
      contact_number: form.contact_number.trim(),
      safety_score: score,
      status: form.status,
    };

    try {
      if (editingDriverId) await api.drivers.update(token, editingDriverId, payload);
      else await api.drivers.create(token, payload);
      await loadDrivers();
      setDrawerOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Driver save failed.");
    }
  }

  async function onDeleteDriver() {
    if (!token || deleteDriverId == null) return;
    try {
      await api.drivers.remove(token, deleteDriverId);
      await loadDrivers();
      setDeleteDriverId(null);
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Driver delete failed.");
      setDeleteDriverId(null);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Driver Management"
          description="Track licenses, safety score, and deployment readiness for your driving workforce."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Drivers" }]}
          action={<Button onClick={() => { resetForm(); setDrawerOpen(true); }}><Plus className="h-4 w-4" />Add Driver</Button>}
        />

        {apiError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{apiError}</div> : null}

        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by driver name, contact, or license number" />
            <FilterDropdown value={statusFilter} onValueChange={setStatusFilter} placeholder="Status" options={[
              { label: "All Statuses", value: "all" },
              { label: "Available", value: "available" },
              { label: "On Trip", value: "on_trip" },
              { label: "Suspended", value: "suspended" },
              { label: "Off Duty", value: "off_duty" },
            ]} />
          </div>
          {loading ? <p className="text-sm text-muted-foreground">Loading drivers...</p> : <DataTable columns={columns} rows={filteredDrivers} getRowId={(row) => String(row.id)} />}
        </section>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title={editingDriverId ? "Edit Driver" : "Add Driver"} description="Maintain driver profile, compliance, and duty status." footer={<div className="flex w-full justify-end gap-2"><Button variant="outline" onClick={() => { setDrawerOpen(false); resetForm(); }}>Cancel</Button><Button onClick={onSaveDriver}>Save Driver</Button></div>}>
        <div className="grid gap-4">
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={errors.name ? "border-destructive" : undefined} />{errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}</div>
          <div className="space-y-2"><Label>License Number</Label><Input value={form.license_number} onChange={(event) => setForm((prev) => ({ ...prev, license_number: event.target.value }))} className={errors.license_number ? "border-destructive" : undefined} />{errors.license_number ? <p className="text-xs text-destructive">{errors.license_number}</p> : null}</div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Category</Label><Select value={form.license_category} onValueChange={(value) => setForm((prev) => ({ ...prev, license_category: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Heavy">Heavy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Light">Light</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.license_expiry} onChange={(event) => setForm((prev) => ({ ...prev, license_expiry: event.target.value }))} className={errors.license_expiry ? "border-destructive" : undefined} />{errors.license_expiry ? <p className="text-xs text-destructive">{errors.license_expiry}</p> : null}</div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Phone</Label><Input value={form.contact_number} onChange={(event) => setForm((prev) => ({ ...prev, contact_number: event.target.value }))} className={errors.contact_number ? "border-destructive" : undefined} />{errors.contact_number ? <p className="text-xs text-destructive">{errors.contact_number}</p> : null}</div><div className="space-y-2"><Label>Safety Score</Label><Input type="number" value={form.safety_score} onChange={(event) => setForm((prev) => ({ ...prev, safety_score: event.target.value }))} className={errors.safety_score ? "border-destructive" : undefined} />{errors.safety_score ? <p className="text-xs text-destructive">{errors.safety_score}</p> : null}</div></div>
          <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as ApiDriver["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="on_trip">On Trip</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="off_duty">Off Duty</SelectItem></SelectContent></Select></div>
        </div>
      </Drawer>

      <DeleteDialog open={Boolean(deleteDriverId)} onOpenChange={(open) => { if (!open) setDeleteDriverId(null); }} entityLabel="driver" onDelete={onDeleteDriver} />
    </AppShell>
  );
}
