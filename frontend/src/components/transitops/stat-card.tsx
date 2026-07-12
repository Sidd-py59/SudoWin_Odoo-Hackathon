import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
};

export function StatCard({ title, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card className="rounded-lg border-border/70 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold text-foreground">{value}</p>
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
