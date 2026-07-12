import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { DeleteDialog } from "@/components/transitops/delete-dialog";
import { FilterDropdown } from "@/components/transitops/filter-dropdown";
import { Modal } from "@/components/transitops/modal";
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
  drivers,
  formatNumber,
  getDriverName,
  getVehicleName,
  trips as seededTrips,
  type Trip,
  validateTrip,
  vehicles,
} from "@/lib/transitops-data";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "Trip Management | TransitOps" },
      {
        name: "description",
        content:
          "Create, validate, dispatch, and monitor transport trips with smart vehicle and driver rule checks in TransitOps.",
      },
      { property: "og:title", content: "Trip Management | TransitOps" },
      {
        property: "og:description",
        content:
          "Control dispatch workflows with status tracking and validation for vehicle availability, driver eligibility, and cargo limits.",
      },
    ],
  }),
  component: TripsPage,
});

type TripForm = {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: string;
  distanceKm: string;
};

function TripsPage() {
  const [tripRows, setTripRows] = useState<Trip[]>(seededTrips);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [deleteTripId, setDeleteTripId] = useState<string | null>(null);

  const [form, setForm] = useState<TripForm>({
    source: "",
    destination: "",
    vehicleId: vehicles[0]?.id ?? "",
    driverId: drivers[0]?.id ?? "",
    cargoWeightKg: "",
    distanceKm: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TripForm, string>>>({});
  const [ruleWarnings, setRuleWarnings] = useState<string[]>([]);

  const filteredTrips = useMemo(() => {
    return tripRows.filter((trip) => {
      const matchesSearch =
        trip.id.toLowerCase().includes(search.toLowerCase()) ||
        getVehicleName(trip.vehicleId).toLowerCase().includes(search.toLowerCase()) ||
        getDriverName(trip.driverId).toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, tripRows]);

  const columns: DataTableColumn<Trip>[] = [
    { key: "id", label: "Trip ID", sortable: true },
    {
      key: "vehicle",
      label: "Vehicle",
      render: (row) => getVehicleName(row.vehicleId),
      sortable: true,
    },
    {
      key: "driver",
      label: "Driver",
      render: (row) => getDriverName(row.driverId),
      sortable: true,
    },
    { key: "source", label: "Source", sortable: true },
    { key: "destination", label: "Destination", sortable: true },
    {
      key: "cargoWeightKg",
      label: "Cargo Weight",
      render: (row) => `${formatNumber(row.cargoWeightKg)} kg`,
      sortable: true,
    },
    {
      key: "distanceKm",
      label: "Distance",
      render: (row) => `${row.distanceKm} km`,
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          status={
            row.status === "dispatched"
              ? "on_trip"
              : row.status === "completed"
                ? "available"
                : row.status === "cancelled"
                  ? "suspended"
                  : "maintenance"
          }
          label={row.status[0].toUpperCase() + row.status.slice(1)}
        />
      ),
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
              setEditingTripId(row.id);
              setForm({
                source: row.source,
                destination: row.destination,
                vehicleId: row.vehicleId,
                driverId: row.driverId,
                cargoWeightKg: String(row.cargoWeightKg),
                distanceKm: String(row.distanceKm),
              });
              setErrors({});
              setRuleWarnings([]);
              setModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteTripId(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  function resetForm() {
    setForm({
      source: "",
      destination: "",
      vehicleId: vehicles[0]?.id ?? "",
      driverId: drivers[0]?.id ?? "",
      cargoWeightKg: "",
      distanceKm: "",
    });
    setEditingTripId(null);
    setErrors({});
    setRuleWarnings([]);
  }

  function validateBaseForm() {
    const nextErrors: Partial<Record<keyof TripForm, string>> = {};
    if (!form.source.trim()) nextErrors.source = "Source is required.";
    if (!form.destination.trim()) nextErrors.destination = "Destination is required.";
    if (!form.vehicleId) nextErrors.vehicleId = "Vehicle is required.";
    if (!form.driverId) nextErrors.driverId = "Driver is required.";
    if (!Number(form.cargoWeightKg) || Number(form.cargoWeightKg) <= 0)
      nextErrors.cargoWeightKg = "Enter a valid cargo weight.";
    if (!Number(form.distanceKm) || Number(form.distanceKm) <= 0)
      nextErrors.distanceKm = "Enter a valid distance.";
    setErrors(nextErrors);
    return nextErrors;
  }

  function onSave(status: Trip["status"]) {
    const baseErrors = validateBaseForm();
    if (Object.keys(baseErrors).length > 0) return;

    const warnings = validateTrip({
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      cargoWeightKg: Number(form.cargoWeightKg),
    });

    setRuleWarnings(warnings);
    if (status === "dispatched" && warnings.length > 0) return;

    const payload: Trip = {
      id: editingTripId ?? `TRP-${Math.floor(Math.random() * 9000) + 1000}`,
      source: form.source,
      destination: form.destination,
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      cargoWeightKg: Number(form.cargoWeightKg),
      distanceKm: Number(form.distanceKm),
      status,
    };

    setTripRows((previous) => {
      if (!editingTripId) return [payload, ...previous];
      return previous.map((trip) => (trip.id === editingTripId ? payload : trip));
    });

    setModalOpen(false);
    resetForm();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Trip Management"
          description="Plan dispatches, assign resources, and enforce transport business rules."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Trips" }]}
          action={
            <Button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create Trip
            </Button>
          }
        />

        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by trip ID, vehicle, or driver"
            />
            <FilterDropdown
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Status"
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Draft", value: "draft" },
                { label: "Dispatched", value: "dispatched" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </div>
          <DataTable columns={columns} rows={filteredTrips} getRowId={(row) => row.id} />
        </section>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingTripId ? "Edit Trip" : "Create Trip"}
        description="Assign vehicle and driver, then save as draft or dispatch."
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onSave("draft")}>
              Save Draft
            </Button>
            <Button onClick={() => onSave("dispatched")}>Dispatch</Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Source</Label>
              <Input
                value={form.source}
                onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                className={errors.source ? "border-destructive" : undefined}
              />
              {errors.source ? <p className="text-xs text-destructive">{errors.source}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={form.destination}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, destination: event.target.value }))
                }
                className={errors.destination ? "border-destructive" : undefined}
              />
              {errors.destination ? (
                <p className="text-xs text-destructive">{errors.destination}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select
                value={form.vehicleId}
                onValueChange={(value) => setForm((prev) => ({ ...prev, vehicleId: value }))}
              >
                <SelectTrigger className={errors.vehicleId ? "border-destructive" : undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} · {vehicle.registrationNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select
                value={form.driverId}
                onValueChange={(value) => setForm((prev) => ({ ...prev, driverId: value }))}
              >
                <SelectTrigger className={errors.driverId ? "border-destructive" : undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} · {driver.licenseNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cargo Weight (kg)</Label>
              <Input
                type="number"
                value={form.cargoWeightKg}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, cargoWeightKg: event.target.value }))
                }
                className={errors.cargoWeightKg ? "border-destructive" : undefined}
              />
              {errors.cargoWeightKg ? (
                <p className="text-xs text-destructive">{errors.cargoWeightKg}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                value={form.distanceKm}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, distanceKm: event.target.value }))
                }
                className={errors.distanceKm ? "border-destructive" : undefined}
              />
              {errors.distanceKm ? (
                <p className="text-xs text-destructive">{errors.distanceKm}</p>
              ) : null}
            </div>
          </div>

          {ruleWarnings.length > 0 ? (
            <div className="rounded-lg border border-status-maintenance/40 bg-status-maintenance/10 p-3">
              <p className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-status-maintenance">
                <AlertTriangle className="h-4 w-4" />
                Validation placeholders
              </p>
              <ul className="space-y-1 text-sm text-status-maintenance">
                {ruleWarnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Modal>

      <DeleteDialog
        open={Boolean(deleteTripId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTripId(null);
        }}
        entityLabel="trip"
        onDelete={() => {
          setTripRows((previous) => previous.filter((trip) => trip.id !== deleteTripId));
          setDeleteTripId(null);
        }}
      />
    </AppShell>
  );
}
