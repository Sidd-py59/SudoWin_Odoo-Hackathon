import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Play, Plus, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { FilterDropdown } from "@/components/transitops/filter-dropdown";
import { Modal } from "@/components/transitops/modal";
import { PageHeader } from "@/components/transitops/page-header";
import { SearchInput } from "@/components/transitops/search-input";
import { StatusBadge } from "@/components/transitops/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type ApiDriver, type ApiTrip, type ApiVehicle } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatNumber } from "@/lib/transitops-data";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "Trip Management | TransitOps" }] }),
  component: TripsPage,
});

type TripForm = {
  trip_code: string;
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight_kg: string;
  planned_distance_km: string;
};

type CompleteForm = {
  actual_distance_km: string;
  final_odometer: string;
  fuel_liters: string;
  fuel_cost: string;
  toll_cost: string;
  other_cost: string;
};

const emptyTripForm = (): TripForm => ({
  trip_code: `TRP-${Math.floor(Math.random() * 9000) + 1000}`,
  source: "",
  destination: "",
  vehicle_id: "",
  driver_id: "",
  cargo_weight_kg: "",
  planned_distance_km: "",
});

function tripBadgeStatus(status: ApiTrip["status"]) {
  if (status === "dispatched") return "on_trip";
  if (status === "completed") return "available";
  if (status === "cancelled") return "suspended";
  return "maintenance";
}

function TripsPage() {
  const { token } = useAuth();
  const [tripRows, setTripRows] = useState<ApiTrip[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<ApiVehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<ApiDriver[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [completeTrip, setCompleteTrip] = useState<ApiTrip | null>(null);
  const [form, setForm] = useState<TripForm>(emptyTripForm());
  const [completeForm, setCompleteForm] = useState<CompleteForm>({ actual_distance_km: "", final_odometer: "", fuel_liters: "", fuel_cost: "", toll_cost: "", other_cost: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof TripForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadTrips() {
    if (!token) return;
    setLoading(true);
    setApiError(null);
    try {
      const [trips, vehicles, drivers] = await Promise.all([
        api.trips.list(token),
        api.vehicles.available(token),
        api.drivers.available(token),
      ]);
      setTripRows(trips);
      setAvailableVehicles(vehicles);
      setAvailableDrivers(drivers);
      setForm((prev) => ({
        ...prev,
        vehicle_id: prev.vehicle_id || (vehicles[0] ? String(vehicles[0].id) : ""),
        driver_id: prev.driver_id || (drivers[0] ? String(drivers[0].id) : ""),
      }));
    } catch (error) {
      console.error(error);
      setApiError("Could not load trips from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTrips();
  }, [token]);

  const filteredTrips = useMemo(() => {
    return tripRows.filter((trip) => {
      const q = search.toLowerCase();
      const matchesSearch =
        trip.trip_code.toLowerCase().includes(q) ||
        trip.source.toLowerCase().includes(q) ||
        trip.destination.toLowerCase().includes(q) ||
        (trip.vehicle?.name_model ?? "").toLowerCase().includes(q) ||
        (trip.driver?.name ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, tripRows]);

  const columns: DataTableColumn<ApiTrip>[] = [
    { key: "trip_code", label: "Trip ID", sortable: true },
    { key: "vehicle", label: "Vehicle", render: (row) => row.vehicle?.name_model ?? "Unassigned", sortable: true },
    { key: "driver", label: "Driver", render: (row) => row.driver?.name ?? "Unassigned", sortable: true },
    { key: "source", label: "Source", sortable: true },
    { key: "destination", label: "Destination", sortable: true },
    { key: "cargo_weight_kg", label: "Cargo Weight", render: (row) => `${formatNumber(row.cargo_weight_kg)} kg`, sortable: true },
    { key: "planned_distance_km", label: "Distance", render: (row) => `${row.actual_distance_km ?? row.planned_distance_km} km`, sortable: true },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={tripBadgeStatus(row.status)} label={row.status[0].toUpperCase() + row.status.slice(1)} /> },
    {
      key: "actions",
      label: "Actions",
      className: "min-w-[220px]",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          {row.status === "draft" ? <Button size="sm" variant="outline" onClick={() => void dispatchExisting(row)}><Play className="h-3.5 w-3.5" />Dispatch</Button> : null}
          {row.status === "dispatched" ? <Button size="sm" variant="outline" onClick={() => openComplete(row)}><CheckCircle2 className="h-3.5 w-3.5" />Complete</Button> : null}
          {(row.status === "draft" || row.status === "dispatched") ? <Button size="sm" variant="outline" onClick={() => void cancel(row)}><XCircle className="h-3.5 w-3.5" />Cancel</Button> : null}
        </div>
      ),
    },
  ];

  function resetForm() {
    setForm({
      ...emptyTripForm(),
      vehicle_id: availableVehicles[0] ? String(availableVehicles[0].id) : "",
      driver_id: availableDrivers[0] ? String(availableDrivers[0].id) : "",
    });
    setErrors({});
    setApiError(null);
  }

  function validateBaseForm() {
    const nextErrors: Partial<Record<keyof TripForm, string>> = {};
    if (!form.trip_code.trim()) nextErrors.trip_code = "Trip code is required.";
    if (!form.source.trim()) nextErrors.source = "Source is required.";
    if (!form.destination.trim()) nextErrors.destination = "Destination is required.";
    if (!Number(form.cargo_weight_kg) || Number(form.cargo_weight_kg) <= 0) nextErrors.cargo_weight_kg = "Enter a valid cargo weight.";
    if (!Number(form.planned_distance_km) || Number(form.planned_distance_km) <= 0) nextErrors.planned_distance_km = "Enter a valid distance.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveTrip(dispatch: boolean) {
    if (!token || !validateBaseForm()) return;
    if (dispatch && (!form.vehicle_id || !form.driver_id)) {
      setApiError("Select an available vehicle and driver before dispatching.");
      return;
    }
    try {
      const trip = await api.trips.create(token, {
        trip_code: form.trip_code.trim().toUpperCase(),
        source: form.source.trim(),
        destination: form.destination.trim(),
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        cargo_weight_kg: Number(form.cargo_weight_kg),
        planned_distance_km: Number(form.planned_distance_km),
      });
      if (dispatch) {
        await api.trips.dispatch(token, trip.id, { vehicle_id: Number(form.vehicle_id), driver_id: Number(form.driver_id) });
      }
      await loadTrips();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Trip save failed.");
    }
  }

  async function dispatchExisting(row: ApiTrip) {
    if (!token) return;
    if (!availableVehicles[0] || !availableDrivers[0]) {
      setApiError("No available vehicle/driver pair is currently eligible for dispatch.");
      return;
    }
    try {
      const vehicle = availableVehicles.find((item) => item.max_load_kg >= row.cargo_weight_kg) ?? availableVehicles[0];
      await api.trips.dispatch(token, row.id, { vehicle_id: vehicle.id, driver_id: availableDrivers[0].id });
      await loadTrips();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Dispatch failed.");
    }
  }

  function openComplete(row: ApiTrip) {
    setCompleteTrip(row);
    setCompleteForm({
      actual_distance_km: String(row.planned_distance_km),
      final_odometer: String((row.vehicle?.odometer ?? 0) + row.planned_distance_km),
      fuel_liters: "30",
      fuel_cost: "3000",
      toll_cost: "500",
      other_cost: "0",
    });
  }

  async function complete() {
    if (!token || !completeTrip) return;
    try {
      await api.trips.complete(token, completeTrip.id, {
        actual_distance_km: Number(completeForm.actual_distance_km),
        final_odometer: Number(completeForm.final_odometer),
        fuel_liters: Number(completeForm.fuel_liters || 0) || undefined,
        fuel_cost: Number(completeForm.fuel_cost || 0),
        toll_cost: Number(completeForm.toll_cost || 0),
        other_cost: Number(completeForm.other_cost || 0),
      });
      setCompleteTrip(null);
      await loadTrips();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Completion failed.");
    }
  }

  async function cancel(row: ApiTrip) {
    if (!token) return;
    try {
      await api.trips.cancel(token, row.id);
      await loadTrips();
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Cancel failed.");
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Trip Management" description="Plan dispatches, assign resources, and enforce transport business rules." crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Trips" }]} action={<Button onClick={() => { resetForm(); setModalOpen(true); }}><Plus className="h-4 w-4" />Create Trip</Button>} />
        {apiError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{apiError}</div> : null}
        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"><SearchInput value={search} onChange={setSearch} placeholder="Search by trip ID, vehicle, driver, or route" /><FilterDropdown value={statusFilter} onValueChange={setStatusFilter} placeholder="Status" options={[{ label: "All Statuses", value: "all" }, { label: "Draft", value: "draft" }, { label: "Dispatched", value: "dispatched" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }]} /></div>
          {loading ? <p className="text-sm text-muted-foreground">Loading trips...</p> : <DataTable columns={columns} rows={filteredTrips} getRowId={(row) => String(row.id)} />}
        </section>
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Create Trip" description="Save as draft or dispatch immediately with backend validation." footer={<div className="flex w-full flex-wrap items-center justify-end gap-2"><Button variant="outline" onClick={() => void saveTrip(false)}>Save Draft</Button><Button onClick={() => void saveTrip(true)}>Dispatch</Button></div>}>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Trip Code</Label><Input value={form.trip_code} onChange={(event) => setForm((prev) => ({ ...prev, trip_code: event.target.value }))} className={errors.trip_code ? "border-destructive" : undefined} />{errors.trip_code ? <p className="text-xs text-destructive">{errors.trip_code}</p> : null}</div><div className="space-y-2"><Label>Source</Label><Input value={form.source} onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))} className={errors.source ? "border-destructive" : undefined} />{errors.source ? <p className="text-xs text-destructive">{errors.source}</p> : null}</div></div>
          <div className="space-y-2"><Label>Destination</Label><Input value={form.destination} onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))} className={errors.destination ? "border-destructive" : undefined} />{errors.destination ? <p className="text-xs text-destructive">{errors.destination}</p> : null}</div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Available Vehicle</Label><Select value={form.vehicle_id} onValueChange={(value) => setForm((prev) => ({ ...prev, vehicle_id: value }))}><SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger><SelectContent>{availableVehicles.map((vehicle) => <SelectItem key={vehicle.id} value={String(vehicle.id)}>{vehicle.name_model} · {vehicle.registration_number}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Available Driver</Label><Select value={form.driver_id} onValueChange={(value) => setForm((prev) => ({ ...prev, driver_id: value }))}><SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger><SelectContent>{availableDrivers.map((driver) => <SelectItem key={driver.id} value={String(driver.id)}>{driver.name} · {driver.license_number}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Cargo Weight (kg)</Label><Input type="number" value={form.cargo_weight_kg} onChange={(event) => setForm((prev) => ({ ...prev, cargo_weight_kg: event.target.value }))} className={errors.cargo_weight_kg ? "border-destructive" : undefined} />{errors.cargo_weight_kg ? <p className="text-xs text-destructive">{errors.cargo_weight_kg}</p> : null}</div><div className="space-y-2"><Label>Planned Distance (km)</Label><Input type="number" value={form.planned_distance_km} onChange={(event) => setForm((prev) => ({ ...prev, planned_distance_km: event.target.value }))} className={errors.planned_distance_km ? "border-destructive" : undefined} />{errors.planned_distance_km ? <p className="text-xs text-destructive">{errors.planned_distance_km}</p> : null}</div></div>
          <div className="rounded-lg border border-status-maintenance/40 bg-status-maintenance/10 p-3 text-sm text-status-maintenance"><p className="inline-flex items-center gap-1 font-medium"><AlertTriangle className="h-4 w-4" />Backend dispatch rules active</p><p className="mt-1">In-shop, retired, on-trip, expired-license, suspended, and overweight assignments are blocked server-side.</p></div>
        </div>
      </Modal>

      <Modal open={Boolean(completeTrip)} onOpenChange={(open) => { if (!open) setCompleteTrip(null); }} title="Complete Trip" description="Enter final distance, odometer, and trip costs." footer={<div className="flex w-full justify-end gap-2"><Button variant="outline" onClick={() => setCompleteTrip(null)}>Cancel</Button><Button onClick={() => void complete()}>Complete Trip</Button></div>}>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Actual Distance</Label><Input type="number" value={completeForm.actual_distance_km} onChange={(event) => setCompleteForm((prev) => ({ ...prev, actual_distance_km: event.target.value }))} /></div><div className="space-y-2"><Label>Final Odometer</Label><Input type="number" value={completeForm.final_odometer} onChange={(event) => setCompleteForm((prev) => ({ ...prev, final_odometer: event.target.value }))} /></div><div className="space-y-2"><Label>Fuel Liters</Label><Input type="number" value={completeForm.fuel_liters} onChange={(event) => setCompleteForm((prev) => ({ ...prev, fuel_liters: event.target.value }))} /></div><div className="space-y-2"><Label>Fuel Cost</Label><Input type="number" value={completeForm.fuel_cost} onChange={(event) => setCompleteForm((prev) => ({ ...prev, fuel_cost: event.target.value }))} /></div><div className="space-y-2"><Label>Toll Cost</Label><Input type="number" value={completeForm.toll_cost} onChange={(event) => setCompleteForm((prev) => ({ ...prev, toll_cost: event.target.value }))} /></div><div className="space-y-2"><Label>Other Cost</Label><Input type="number" value={completeForm.other_cost} onChange={(event) => setCompleteForm((prev) => ({ ...prev, other_cost: event.target.value }))} /></div></div>
      </Modal>
    </AppShell>
  );
}


