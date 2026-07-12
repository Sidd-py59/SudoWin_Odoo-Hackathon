import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Edit, Plus, Trash2 } from "lucide-react";
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
import { type Driver, drivers as seededDrivers, isLicenseExpired } from "@/lib/transitops-data";

export const Route = createFileRoute("/drivers")({
  head: () => ({
    meta: [
      { title: "Driver Management | TransitOps" },
      {
        name: "description",
        content:
          "Manage driver compliance, licensing status, safety scores, and duty assignments with smart filters in TransitOps.",
      },
      { property: "og:title", content: "Driver Management | TransitOps" },
      {
        property: "og:description",
        content:
          "Monitor license validity, driver categories, and operational status from a centralized control panel.",
      },
    ],
  }),
  component: DriversPage,
});

type DriverForm = {
  name: string;
  licenseNumber: string;
  category: Driver["category"];
  expiryDate: string;
  phone: string;
  safetyScore: string;
  status: Driver["status"];
};

function DriversPage() {
  const [driverRows, setDriverRows] = useState<Driver[]>(seededDrivers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [deleteDriverId, setDeleteDriverId] = useState<string | null>(null);

  const [form, setForm] = useState<DriverForm>({
    name: "",
    licenseNumber: "",
    category: "Heavy",
    expiryDate: "",
    phone: "",
    safetyScore: "",
    status: "available",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DriverForm, string>>>({});

  const filteredDrivers = useMemo(() => {
    return driverRows.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(search.toLowerCase()) ||
        driver.licenseNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [driverRows, search, statusFilter]);

  const columns: DataTableColumn<Driver>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "licenseNumber", label: "License Number", sortable: true },
    { key: "category", label: "Category", sortable: true },
    {
      key: "expiryDate",
      label: "Expiry Date",
      sortable: true,
      render: (row) => {
        const expired = isLicenseExpired(row.expiryDate);
        return (
          <div className="inline-flex items-center gap-2">
            <span>{row.expiryDate}</span>
            {expired ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-status-maintenance/15 px-2 py-0.5 text-xs font-medium text-status-maintenance">
                <AlertTriangle className="h-3 w-3" />
                Expired
              </span>
            ) : null}
          </div>
        );
      },
    },
    { key: "phone", label: "Contact" },
    { key: "safetyScore", label: "Safety Score", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          status={
            row.status === "available"
              ? "available"
              : row.status === "on_trip"
                ? "on_trip"
                : row.status === "off_duty"
                  ? "retired"
                  : "suspended"
          }
          label={
            row.status === "off_duty"
              ? "Off Duty"
              : row.status === "on_trip"
                ? "On Trip"
                : row.status[0].toUpperCase() + row.status.slice(1)
          }
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
              setEditingDriverId(row.id);
              setForm({
                name: row.name,
                licenseNumber: row.licenseNumber,
                category: row.category,
                expiryDate: row.expiryDate,
                phone: row.phone,
                safetyScore: String(row.safetyScore),
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
            onClick={() => setDeleteDriverId(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  function resetForm() {
    setForm({
      name: "",
      licenseNumber: "",
      category: "Heavy",
      expiryDate: "",
      phone: "",
      safetyScore: "",
      status: "available",
    });
    setEditingDriverId(null);
    setErrors({});
  }

  function onSaveDriver() {
    const nextErrors: Partial<Record<keyof DriverForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.licenseNumber.trim()) nextErrors.licenseNumber = "License number is required.";
    if (!form.expiryDate) nextErrors.expiryDate = "Expiry date is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    if (
      !Number(form.safetyScore) ||
      Number(form.safetyScore) < 1 ||
      Number(form.safetyScore) > 100
    ) {
      nextErrors.safetyScore = "Safety score must be between 1 and 100.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: Driver = {
      id: editingDriverId ?? `drv-${Date.now()}`,
      name: form.name.trim(),
      licenseNumber: form.licenseNumber.trim().toUpperCase(),
      category: form.category,
      expiryDate: form.expiryDate,
      phone: form.phone,
      safetyScore: Number(form.safetyScore),
      status: form.status,
    };

    setDriverRows((previous) => {
      if (!editingDriverId) return [payload, ...previous];
      return previous.map((driver) => (driver.id === editingDriverId ? payload : driver));
    });

    setDrawerOpen(false);
    resetForm();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Driver Management"
          description="Track licenses, safety score, and deployment readiness for your driving workforce."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Drivers" }]}
          action={
            <Button
              onClick={() => {
                resetForm();
                setDrawerOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Driver
            </Button>
          }
        />

        <section className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by driver name or license number"
            />
            <FilterDropdown
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Status"
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Available", value: "available" },
                { label: "On Trip", value: "on_trip" },
                { label: "Suspended", value: "suspended" },
                { label: "Off Duty", value: "off_duty" },
              ]}
            />
          </div>

          <DataTable columns={columns} rows={filteredDrivers} getRowId={(row) => row.id} />
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editingDriverId ? "Edit Driver" : "Add Driver"}
        description="Maintain driver profile, compliance, and duty status."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={onSaveDriver}>Save Driver</Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className={errors.name ? "border-destructive" : undefined}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>License Number</Label>
            <Input
              value={form.licenseNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, licenseNumber: event.target.value }))
              }
              className={errors.licenseNumber ? "border-destructive" : undefined}
            />
            {errors.licenseNumber ? (
              <p className="text-xs text-destructive">{errors.licenseNumber}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value as Driver["category"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Heavy">Heavy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                }
                className={errors.expiryDate ? "border-destructive" : undefined}
              />
              {errors.expiryDate ? (
                <p className="text-xs text-destructive">{errors.expiryDate}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className={errors.phone ? "border-destructive" : undefined}
              />
              {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Safety Score</Label>
              <Input
                type="number"
                value={form.safetyScore}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, safetyScore: event.target.value }))
                }
                className={errors.safetyScore ? "border-destructive" : undefined}
              />
              {errors.safetyScore ? (
                <p className="text-xs text-destructive">{errors.safetyScore}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, status: value as Driver["status"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on_trip">On Trip</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="off_duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Drawer>

      <DeleteDialog
        open={Boolean(deleteDriverId)}
        onOpenChange={(open) => {
          if (!open) setDeleteDriverId(null);
        }}
        entityLabel="driver"
        onDelete={() => {
          setDriverRows((previous) => previous.filter((driver) => driver.id !== deleteDriverId));
          setDeleteDriverId(null);
        }}
      />
    </AppShell>
  );
}
