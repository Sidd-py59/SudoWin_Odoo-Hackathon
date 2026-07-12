import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { PageHeader } from "@/components/transitops/page-header";
import { StatCard } from "@/components/transitops/stat-card";
import { DollarSign, Fuel, ReceiptText, Wrench } from "lucide-react";
import { api, type ApiExpense, type ApiFuelLog, type ApiVehicle } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatNumber } from "@/lib/transitops-data";

export const Route = createFileRoute("/fuel-expenses")({
  head: () => ({ meta: [{ title: "Fuel & Expenses | TransitOps" }] }),
  component: FuelExpensesPage,
});

function FuelExpensesPage() {
  const { token } = useAuth();
  const [fuelLogs, setFuelLogs] = useState<ApiFuelLog[]>([]);
  const [expenseLogs, setExpenseLogs] = useState<ApiExpense[]>([]);
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  async function loadData() {
    if (!token) return;
    setApiError(null);
    try {
      const [fuel, expenses, vehicleRows] = await Promise.all([
        api.fuel.list(token),
        api.expenses.list(token),
        api.vehicles.list(token),
      ]);
      setFuelLogs(fuel);
      setExpenseLogs(expenses);
      setVehicles(vehicleRows);
    } catch (error) {
      console.error(error);
      setApiError("Could not load expenses from backend. Login as Financial Analyst or Fleet Manager.");
    }
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  const vehicleName = (id: number | null) => vehicles.find((vehicle) => vehicle.id === id)?.name_model ?? (id ? `Vehicle #${id}` : "Unassigned");
  const totalFuelCost = useMemo(() => fuelLogs.reduce((sum, row) => sum + row.cost, 0), [fuelLogs]);
  const repairCost = useMemo(() => expenseLogs.reduce((sum, row) => sum + row.repair_cost, 0), [expenseLogs]);
  const otherExpenses = useMemo(() => expenseLogs.reduce((sum, row) => sum + row.toll_cost + row.other_cost, 0), [expenseLogs]);
  const operationalCost = totalFuelCost + repairCost + otherExpenses;

  const fuelColumns: DataTableColumn<ApiFuelLog>[] = [
    { key: "vehicle_id", label: "Vehicle", render: (row) => vehicleName(row.vehicle_id), sortable: true },
    { key: "liters", label: "Liters", render: (row) => formatNumber(row.liters), sortable: true },
    { key: "cost", label: "Cost", render: (row) => formatCurrency(row.cost), sortable: true },
    { key: "log_date", label: "Date", sortable: true },
  ];

  const expenseColumns: DataTableColumn<ApiExpense>[] = [
    { key: "vehicle_id", label: "Vehicle", render: (row) => vehicleName(row.vehicle_id), sortable: true },
    { key: "toll_cost", label: "Toll", render: (row) => formatCurrency(row.toll_cost), sortable: true },
    { key: "repair_cost", label: "Repair", render: (row) => formatCurrency(row.repair_cost), sortable: true },
    { key: "other_cost", label: "Other", render: (row) => formatCurrency(row.other_cost), sortable: true },
    { key: "total_cost", label: "Total", render: (row) => formatCurrency(row.total_cost), sortable: true },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Fuel & Expenses" description="Centralized visibility into operating costs across fuel and non-fuel categories." crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Fuel & Expenses" }]} />
        {apiError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{apiError}</div> : null}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Total Fuel Cost" value={formatCurrency(totalFuelCost)} icon={Fuel} /><StatCard title="Repair Cost" value={formatCurrency(repairCost)} icon={Wrench} /><StatCard title="Other Expenses" value={formatCurrency(otherExpenses)} icon={ReceiptText} /><StatCard title="Operational Cost" value={formatCurrency(operationalCost)} icon={DollarSign} /></section>
        <section className="grid gap-4 xl:grid-cols-2"><div className="rounded-lg border border-border/70 bg-card p-4 shadow-sm"><h2 className="mb-4 text-base font-semibold">Fuel Logs</h2><DataTable columns={fuelColumns} rows={fuelLogs} getRowId={(row) => String(row.id)} pageSize={5} /></div><div className="rounded-lg border border-border/70 bg-card p-4 shadow-sm"><h2 className="mb-4 text-base font-semibold">Expense Logs</h2><DataTable columns={expenseColumns} rows={expenseLogs} getRowId={(row) => String(row.id)} pageSize={5} /></div></section>
      </div>
    </AppShell>
  );
}
