import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
};

export function KpiCard({ title, value, icon: Icon, delta }: KpiCardProps) {
  return (
    <Card className="rounded-lg border-border/70 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
            {delta ? <p className="text-xs text-muted-foreground">{delta}</p> : null}
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
