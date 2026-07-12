import { type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card className="rounded-lg border-border/70 bg-card shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
