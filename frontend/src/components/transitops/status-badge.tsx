import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "available" | "on_trip" | "maintenance" | "suspended" | "retired";

const statusLabelMap: Record<StatusTone, string> = {
  available: "Available",
  on_trip: "On Trip",
  maintenance: "Maintenance",
  suspended: "Suspended",
  retired: "Retired",
};

const statusClassMap: Record<StatusTone, string> = {
  available: "border-status-available/30 bg-status-available/15 text-status-available",
  on_trip: "border-status-on-trip/30 bg-status-on-trip/15 text-status-on-trip",
  maintenance: "border-status-maintenance/30 bg-status-maintenance/15 text-status-maintenance",
  suspended: "border-status-suspended/30 bg-status-suspended/15 text-status-suspended",
  retired: "border-status-retired/30 bg-status-retired/15 text-status-retired",
};

export function StatusBadge({ status, label }: { status: StatusTone; label?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md text-[11px] font-medium", statusClassMap[status])}
    >
      {label ?? statusLabelMap[status]}
    </Badge>
  );
}
