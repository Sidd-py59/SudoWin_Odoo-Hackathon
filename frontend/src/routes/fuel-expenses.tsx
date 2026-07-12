import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/transitops/app-shell";
import { DataTable, type DataTableColumn } from "@/components/transitops/data-table";
import { PageHeader } from "@/components/transitops/page-header";
import { StatCard } from "@/components/transitops/stat-card";
import { DollarSign, Fuel, ReceiptText, Wrench } from "lucide-react";
import {
  expenseLogs,
  formatCurrency,
  formatNumber,
  fuelLogs,
  getVehicleName,
  maintenanceLogs,
  type ExpenseLog,
  type FuelLog,
} from "@/lib/transitops-data";

export const Route = createFileRoute("/fuel-expenses")({
  head: () => ({
    meta: [
      { title: "Fuel & Expenses | TransitOps" },
      {
        name: "description",
        content:
          "Track fuel consumption and operational spending with categorized logs and cost summaries in TransitOps.",
      },
      { property: "og:title", content: "Fuel & Expenses | TransitOps" },
      {
        property: "og:description",
        content:
          "Monitor fuel, maintenance, and overhead expense trends across your fleet operations.",
      },
    ],
  }),
  component: FuelExpensesPage,
});

const fuelColumns: DataTableColumn<FuelLog>[] = [
  {
    key: "vehicle",
    label: "Vehicle",
    render: (row) => getVehicleName(row.vehicleId),
    sortable: true,
  },
  { key: "liters", label: "Liters", render: (row) => formatNumber(row.liters), sortable: true },
  { key: "cost", label: "Cost", render: (row) => formatCurrency(row.cost), sortable: true },
  { key: "date", label: "Date", sortable: true },
];

const expenseColumns: DataTableColumn<ExpenseLog>[] = [
  {
    key: "vehicle",
    label: "Vehicle",
    render: (row) => getVehicleName(row.vehicleId),
    sortable: true,
  },
  { key: "type", label: "Expense Type", sortable: true },
  { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount), sortable: true },
  { key: "notes", label: "Notes" },
];

function FuelExpensesPage() {
  const totalFuelCost = fuelLogs.reduce((sum, row) => sum + row.cost, 0);
  const maintenanceCost = maintenanceLogs.reduce((sum, row) => sum + row.cost, 0);
  const otherExpenses = expenseLogs
    .filter((item) => item.type !== "Maintenance")
    .reduce((sum, row) => sum + row.amount, 0);
  const operationalCost = totalFuelCost + maintenanceCost + otherExpenses;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Fuel & Expenses"
          description="Centralized visibility into operating costs across fuel and non-fuel categories."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Fuel & Expenses" }]}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Fuel Cost" value={formatCurrency(totalFuelCost)} icon={Fuel} />
          <StatCard
            title="Maintenance Cost"
            value={formatCurrency(maintenanceCost)}
            icon={Wrench}
          />
          <StatCard
            title="Other Expenses"
            value={formatCurrency(otherExpenses)}
            icon={ReceiptText}
          />
          <StatCard
            title="Operational Cost"
            value={formatCurrency(operationalCost)}
            icon={DollarSign}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Fuel Logs</h2>
            <DataTable
              columns={fuelColumns}
              rows={fuelLogs}
              getRowId={(row) => row.id}
              pageSize={5}
            />
          </div>

          <div className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Expense Logs</h2>
            <DataTable
              columns={expenseColumns}
              rows={expenseLogs}
              getRowId={(row) => row.id}
              pageSize={5}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
