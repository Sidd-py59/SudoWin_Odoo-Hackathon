import { createFileRoute } from "@tanstack/react-router";
import { Edit, FileText, Plus, Trash2, File, Upload, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { DeleteDialog } from "@/components/transitops/delete-dialog";
import { Drawer } from "@/components/transitops/drawer";
import { FilterDropdown } from "@/components/transitops/filter-dropdown";
import { Modal } from "@/components/transitops/modal";
import { PageHeader } from "@/components/transitops/page-header";
import { SearchInput } from "@/components/transitops/search-input";
import { StatusBadge } from "@/components/transitops/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type ApiVehicle } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatNumber } from "@/lib/transitops-data";

export const Route = createFileRoute("/vehicles")({
  head: () => ({ meta: [{ title: "Vehicle Management | TransitOps" }] }),
  component: VehiclesPage,
});

type VehicleForm = {
  registration_number: string;
  name_model: string;
  type: ApiVehicle["type"];
  max_load_kg: string;
  odometer: string;
  acquisition_cost: string;
  status: ApiVehicle["status"];
  region: string;
};

const emptyForm: VehicleForm = {
  registration_number: "",
  name_model: "",
  type: "truck",
  max_load_kg: "",
  odometer: "",
  acquisition_cost: "",
  status: "available",
  region: "Mumbai",
};

const vehicleTypeLabel: Record<ApiVehicle["type"], string> = {
  truck: "Truck",
  van: "Van",
  bus: "Bus",
  mini: "Mini Truck",
};

function vehicleBadgeStatus(status: ApiVehicle["status"]) {
  return status === "in_shop" ? "maintenance" : status;
}

function VehiclesPage() {
  const { token } = useAuth();
  const [vehicleRows, setVehicleRows] = useState<ApiVehicle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Document Management States
  const [docVehicle, setDocVehicle] = useState<ApiVehicle | null>(null);
  const [vehicleDocs, setVehicleDocs] = useState<Record<number, Array<{ id: string; name: string; type: string; date: string }>>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("Registration Certificate");

  async function loadVehicles() {
    if (!token) return;
    setLoading(true);
    setApiError(null);
    try {
      setVehicleRows(await api.vehicles.list(token));
    } catch (error) {
      console.error(error);
      setApiError("Could not load vehicles from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, [token]);

  const filteredVehicles = useMemo(() => {
    return vehicleRows.filter((vehicle) => {
      const q = search.toLowerCase();
      const matchesSearch =
        vehicle.name_model.toLowerCase().includes(q) ||
        vehicle.registration_number.toLowerCase().includes(q) ||
        vehicle.region.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
      const matchesType = typeFilter === "all" || vehicle.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter, vehicleRows]);

  function openDocuments(row: ApiVehicle) {
    setDocVehicle(row);
    if (!vehicleDocs[row.id]) {
      setVehicleDocs((prev) => ({
        ...prev,
        [row.id]: [
          { id: "doc-1", name: `RC_${row.registration_number.replace(/-/g, "_")}.pdf`, type: "Registration Certificate", date: "2026-07-01" },
          { id: "doc-2", name: `Insurance_${row.registration_number.replace(/-/g, "_")}.pdf`, type: "Insurance Policy", date: "2026-06-15" },
        ],
      }));
    }
  }

  function handleUpload() {
    if (!docVehicle || !uploadName.trim()) return;
    setIsUploading(true);
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: uploadName.endsWith(".pdf") ? uploadName.trim() : `${uploadName.trim()}.pdf`,
        type: uploadType,
        date: new Date().toISOString().split("T")[0],
      };
      setVehicleDocs((prev) => ({
        ...prev,
        [docVehicle.id]: [...(prev[docVehicle.id] || []), newDoc],
      }));
      setUploadName("");
      setIsUploading(false);
    }, 1000);
  }

  function handleDeleteDoc(docId: string) {
    if (!docVehicle) return;
    setVehicleDocs((prev) => ({
      ...prev,
      [docVehicle.id]: (prev[docVehicle.id] || []).filter((d) => d.id !== docId),
    }));
  }

  const columns: DataTableColumn<ApiVehicle>[] = [
    { key: "registration_number", label: "Registration Number", sortable: true },
    { key: "name_model", label: "Vehicle Name", sortable: true },
    { key: "type", label: "Type", render: (row) => vehicleTypeLabel[row.type], sortable: true },
    { key: "max_load_kg", label: "Capacity", render: (row) => `${formatNumber(row.max_load_kg)} kg`, sortable: true },
    { key: "odometer", label: "Odometer", render: (row) => `${formatNumber(row.odometer)} km`, sortable: true },
    { key: "acquisition_cost", label: "Acquisition Cost", render: (row) => formatCurrency(row.acquisition_cost), sortable: true },
    { key: "region", label: "Region", sortable: true },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={vehicleBadgeStatus(row.status)} label={row.status === "in_shop" ? "In Shop" : undefined} /> },
    {
      key: "actions",
      label: "Actions",
      className: "w-[150px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openDocuments(row)}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteVehicleId(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  function resetForm() {
    setForm(emptyForm);
    setEditingVehicleId(null);
    setErrors({});
    setApiError(null);
  }

  function openEdit(row: ApiVehicle) {
    setEditingVehicleId(row.id);
    setForm({
      registration_number: row.registration_number,
      name_model: row.name_model,
      type: row.type,
      max_load_kg: String(row.max_load_kg),
      odometer: String(row.odometer),
      acquisition_cost: String(row.acquisition_cost),
      status: row.status,
      region: row.region,
    });
    setErrors({});
    setDrawerOpen(true);
  }

  async function onSaveVehicle() {
    if (!token) return;
    const nextErrors: Partial<Record<keyof VehicleForm, string>> = {};
    if (!form.registration_number.trim()) nextErrors.registration_number = "Registration number is required.";
    if (!form.name_model.trim()) nextErrors.name_model = "Vehicle name is required.";
    if (!Number(form.max_load_kg) || Number(form.max_load_kg) <= 0) nextErrors.max_load_kg = "Enter a valid capacity.";
    if (Number(form.odometer) < 0) nextErrors.odometer = "Enter a valid odometer value.";
    if (!Number(form.acquisition_cost) || Number(form.acquisition_cost) <= 0) nextErrors.acquisition_cost = "Enter a valid acquisition cost.";
    if (!form.region.trim()) nextErrors.region = "Region is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const payload = {
        registration_number: form.registration_number.trim().toUpperCase(),
        name_model: form.name_model.trim(),
        type: form.type,
        max_load_kg: Number(form.max_load_kg),
        odometer: Number(form.odometer),
        acquisition_cost: Number(form.acquisition_cost),
        status: form.status,
        region: form.region.trim(),
      };
      if (editingVehicleId) {
        await api.vehicles.update(token, editingVehicleId, payload);
      } else {
        await api.vehicles.create(token, payload);
      }
      await loadVehicles();
      setDrawerOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Saving vehicle failed.");
    }
  }

  async function onDeleteVehicle() {
    if (!token || !deleteVehicleId) return;
    try {
      await api.vehicles.remove(token, deleteVehicleId);
      await loadVehicles();
      setDeleteVehicleId(null);
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Deleting vehicle failed.");
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Vehicle Registry"
          description="Maintain fleet assets, operating status, and financial profile in one place."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Vehicles" }]}
          action={<Button onClick={() => { resetForm(); setDrawerOpen(true); }}><Plus className="h-4 w-4" />Add Vehicle</Button>}
        />

        {apiError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{apiError}</div> : null}

        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by registration, name, or region" />
            <FilterDropdown value={statusFilter} onValueChange={setStatusFilter} placeholder="Status" options={[
              { label: "All Statuses", value: "all" },
              { label: "Available", value: "available" },
              { label: "On Trip", value: "on_trip" },
              { label: "In Shop", value: "in_shop" },
              { label: "Retired", value: "retired" },
            ]} />
            <FilterDropdown value={typeFilter} onValueChange={setTypeFilter} placeholder="Vehicle Type" options={[
              { label: "All Types", value: "all" },
              { label: "Truck", value: "truck" },
              { label: "Van", value: "van" },
              { label: "Bus", value: "bus" },
              { label: "Mini", value: "mini" },
            ]} />
          </div>
          {loading ? <p className="text-sm text-muted-foreground">Loading vehicles...</p> : <DataTable columns={columns} rows={filteredVehicles} getRowId={(row) => String(row.id)} />}
        </section>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title={editingVehicleId ? "Edit Vehicle" : "Add Vehicle"} description="Enter vehicle profile and operating details." footer={<div className="flex w-full items-center justify-end gap-2"><Button variant="outline" onClick={() => { setDrawerOpen(false); resetForm(); }}>Cancel</Button><Button onClick={onSaveVehicle}>Save Vehicle</Button></div>}>
        <div className="grid gap-4">
          <div className="space-y-2"><Label>Registration Number</Label><Input value={form.registration_number} onChange={(event) => setForm((prev) => ({ ...prev, registration_number: event.target.value }))} className={errors.registration_number ? "border-destructive" : undefined} />{errors.registration_number ? <p className="text-xs text-destructive">{errors.registration_number}</p> : null}</div>
          <div className="space-y-2"><Label>Vehicle Name</Label><Input value={form.name_model} onChange={(event) => setForm((prev) => ({ ...prev, name_model: event.target.value }))} className={errors.name_model ? "border-destructive" : undefined} />{errors.name_model ? <p className="text-xs text-destructive">{errors.name_model}</p> : null}</div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Vehicle Type</Label><Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as ApiVehicle["type"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="truck">Truck</SelectItem><SelectItem value="van">Van</SelectItem><SelectItem value="bus">Bus</SelectItem><SelectItem value="mini">Mini</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Maximum Capacity (kg)</Label><Input value={form.max_load_kg} type="number" onChange={(event) => setForm((prev) => ({ ...prev, max_load_kg: event.target.value }))} className={errors.max_load_kg ? "border-destructive" : undefined} />{errors.max_load_kg ? <p className="text-xs text-destructive">{errors.max_load_kg}</p> : null}</div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Odometer (km)</Label><Input value={form.odometer} type="number" onChange={(event) => setForm((prev) => ({ ...prev, odometer: event.target.value }))} className={errors.odometer ? "border-destructive" : undefined} />{errors.odometer ? <p className="text-xs text-destructive">{errors.odometer}</p> : null}</div><div className="space-y-2"><Label>Acquisition Cost</Label><Input value={form.acquisition_cost} type="number" onChange={(event) => setForm((prev) => ({ ...prev, acquisition_cost: event.target.value }))} className={errors.acquisition_cost ? "border-destructive" : undefined} />{errors.acquisition_cost ? <p className="text-xs text-destructive">{errors.acquisition_cost}</p> : null}</div></div>
          <div className="space-y-2"><Label>Region</Label><Input value={form.region} onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))} className={errors.region ? "border-destructive" : undefined} />{errors.region ? <p className="text-xs text-destructive">{errors.region}</p> : null}</div>
          <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as ApiVehicle["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="on_trip">On Trip</SelectItem><SelectItem value="in_shop">In Shop</SelectItem><SelectItem value="retired">Retired</SelectItem></SelectContent></Select></div>
        </div>
      </Drawer>

      <DeleteDialog open={Boolean(deleteVehicleId)} onOpenChange={(open) => { if (!open) setDeleteVehicleId(null); }} entityLabel="vehicle" onDelete={onDeleteVehicle} />

      {/* Document Manager Modal */}
      <Modal open={Boolean(docVehicle)} onOpenChange={(open) => { if (!open) setDocVehicle(null); }} title={`Document Manager - ${docVehicle?.name_model}`} description={`Manage official certificates and insurance compliance for vehicle: ${docVehicle?.registration_number}`}>
        <div className="space-y-6">
          <div className="rounded-lg border border-border/70 p-4 bg-muted/20">
            <h3 className="text-sm font-semibold mb-3">Upload New Document</h3>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] items-end">
              <div className="space-y-1.5">
                <Label className="text-xs">Document Name</Label>
                <Input placeholder="e.g. Emission_Test_2026" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Document Type</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Registration Certificate">Registration</SelectItem>
                    <SelectItem value="Insurance Policy">Insurance</SelectItem>
                    <SelectItem value="Pollution Certificate">Pollution Certificate</SelectItem>
                    <SelectItem value="Permit">Permit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpload} disabled={isUploading || !uploadName.trim()}>
                <Upload className="h-4 w-4 mr-1.5" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Active Certificates</h3>
            <div className="space-y-2">
              {docVehicle && (vehicleDocs[docVehicle.id] || []).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3 bg-card hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <File className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{doc.type} &bull; Uploaded on {doc.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDoc(doc.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {docVehicle && (!vehicleDocs[docVehicle.id] || vehicleDocs[docVehicle.id].length === 0) && (
                <p className="text-xs text-muted-foreground italic text-center py-4">No documents uploaded for this vehicle.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
