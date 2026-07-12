import { createFileRoute } from "@tanstack/react-router";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatNumber,
  type Vehicle,
  vehicles as seededVehicles,
} from "@/lib/transitops-data";

export const Route = createFileRoute("/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicle Management | TransitOps" },
      {
        name: "description",
        content:
          "Manage transport assets with searchable fleet tables, status filters, and vehicle profile forms in TransitOps.",
      },
      { property: "og:title", content: "Vehicle Management | TransitOps" },
      {
        property: "og:description",
        content:
          "Track registration, odometer, capacity, acquisition cost, and operational status across your fleet.",
      },
    ],
  }),
  component: VehiclesPage,
});

type VehicleForm = {
  registrationNumber: string;
  name: string;
  type: Vehicle["type"];
  capacityKg: string;
  odometerKm: string;
  acquisitionCost: string;
  status: Vehicle["status"];
};

function VehiclesPage() {
  const [vehicleRows, setVehicleRows] = useState<Vehicle[]>(seededVehicles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleForm>({
    registrationNumber: "",
    name: "",
    type: "Truck",
    capacityKg: "",
    odometerKm: "",
    acquisitionCost: "",
    status: "available",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleForm, string>>>({});

  const filteredVehicles = useMemo(() => {
    return vehicleRows.filter((vehicle) => {
      const matchesSearch =
        vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.registrationNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
      const matchesType = typeFilter === "all" || vehicle.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter, vehicleRows]);

  const columns: DataTableColumn<Vehicle>[] = [
    { key: "registrationNumber", label: "Registration Number", sortable: true },
    { key: "name", label: "Vehicle Name", sortable: true },
    { key: "type", label: "Type", sortable: true },
    {
      key: "capacityKg",
      label: "Capacity",
      render: (row) => `${formatNumber(row.capacityKg)} kg`,
      sortable: true,
    },
    {
      key: "odometerKm",
      label: "Odometer",
      render: (row) => `${formatNumber(row.odometerKm)} km`,
      sortable: true,
    },
    {
      key: "acquisitionCost",
      label: "Acquisition Cost",
      render: (row) => formatCurrency(row.acquisitionCost),
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-[116px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingVehicleId(row.id);
              setForm({
                registrationNumber: row.registrationNumber,
                name: row.name,
                type: row.type,
                capacityKg: String(row.capacityKg),
                odometerKm: String(row.odometerKm),
                acquisitionCost: String(row.acquisitionCost),
                status: row.status,
              });
              setErrors({});
              setDrawerOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteVehicleId(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  function resetForm() {
    setForm({
      registrationNumber: "",
      name: "",
      type: "Truck",
      capacityKg: "",
      odometerKm: "",
      acquisitionCost: "",
      status: "available",
    });
    setEditingVehicleId(null);
    setErrors({});
  }

  function onSaveVehicle() {
    const nextErrors: Partial<Record<keyof VehicleForm, string>> = {};

    if (!form.registrationNumber.trim())
      nextErrors.registrationNumber = "Registration number is required.";
    if (!form.name.trim()) nextErrors.name = "Vehicle name is required.";
    if (!Number(form.capacityKg) || Number(form.capacityKg) <= 0)
      nextErrors.capacityKg = "Enter a valid capacity.";
    if (!Number(form.odometerKm) || Number(form.odometerKm) < 0)
      nextErrors.odometerKm = "Enter a valid odometer value.";
    if (!Number(form.acquisitionCost) || Number(form.acquisitionCost) <= 0)
      nextErrors.acquisitionCost = "Enter a valid acquisition cost.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: Vehicle = {
      id: editingVehicleId ?? `veh-${Date.now()}`,
      registrationNumber: form.registrationNumber.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      capacityKg: Number(form.capacityKg),
      odometerKm: Number(form.odometerKm),
      acquisitionCost: Number(form.acquisitionCost),
      status: form.status,
    };

    setVehicleRows((previous) => {
      if (!editingVehicleId) return [payload, ...previous];
      return previous.map((vehicle) => (vehicle.id === editingVehicleId ? payload : vehicle));
    });

    setDrawerOpen(false);
    resetForm();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Vehicle Management"
          description="Maintain fleet assets, operating status, and financial profile in one place."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Vehicles" }]}
          action={
            <Button
              onClick={() => {
                resetForm();
                setDrawerOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          }
        />

        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by registration number or vehicle name"
            />
            <FilterDropdown
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Status"
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Available", value: "available" },
                { label: "On Trip", value: "on_trip" },
                { label: "Maintenance", value: "maintenance" },
                { label: "Retired", value: "retired" },
              ]}
            />
            <FilterDropdown
              value={typeFilter}
              onValueChange={setTypeFilter}
              placeholder="Vehicle Type"
              options={[
                { label: "All Types", value: "all" },
                { label: "Truck", value: "Truck" },
                { label: "Van", value: "Van" },
                { label: "Bus", value: "Bus" },
                { label: "Mini Truck", value: "Mini Truck" },
              ]}
            />
          </div>

          <DataTable columns={columns} rows={filteredVehicles} getRowId={(row) => row.id} />
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editingVehicleId ? "Edit Vehicle" : "Add Vehicle"}
        description="Enter vehicle profile and operating details."
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={onSaveVehicle}>Save Vehicle</Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle-reg">Registration Number</Label>
            <Input
              id="vehicle-reg"
              value={form.registrationNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, registrationNumber: event.target.value }))
              }
              className={errors.registrationNumber ? "border-destructive" : undefined}
            />
            {errors.registrationNumber ? (
              <p className="text-xs text-destructive">{errors.registrationNumber}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle-name">Vehicle Name</Label>
            <Input
              id="vehicle-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className={errors.name ? "border-destructive" : undefined}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value as Vehicle["type"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Mini Truck">Mini Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maximum Capacity (kg)</Label>
              <Input
                value={form.capacityKg}
                type="number"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, capacityKg: event.target.value }))
                }
                className={errors.capacityKg ? "border-destructive" : undefined}
              />
              {errors.capacityKg ? (
                <p className="text-xs text-destructive">{errors.capacityKg}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Odometer (km)</Label>
              <Input
                value={form.odometerKm}
                type="number"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, odometerKm: event.target.value }))
                }
                className={errors.odometerKm ? "border-destructive" : undefined}
              />
              {errors.odometerKm ? (
                <p className="text-xs text-destructive">{errors.odometerKm}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Acquisition Cost</Label>
              <Input
                value={form.acquisitionCost}
                type="number"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, acquisitionCost: event.target.value }))
                }
                className={errors.acquisitionCost ? "border-destructive" : undefined}
              />
              {errors.acquisitionCost ? (
                <p className="text-xs text-destructive">{errors.acquisitionCost}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, status: value as Vehicle["status"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on_trip">On Trip</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Drawer>

      <DeleteDialog
        open={Boolean(deleteVehicleId)}
        onOpenChange={(open) => {
          if (!open) setDeleteVehicleId(null);
        }}
        entityLabel="vehicle"
        onDelete={() => {
          setVehicleRows((previous) =>
            previous.filter((vehicle) => vehicle.id !== deleteVehicleId),
          );
          setDeleteVehicleId(null);
        }}
      />
    </AppShell>
  );
}
