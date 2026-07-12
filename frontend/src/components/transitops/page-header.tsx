import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type PageHeaderProps = {
  title: string;
  description?: string;
  crumbs?: Array<{
    label: string;
    to?:
      | "/dashboard"
      | "/vehicles"
      | "/drivers"
      | "/trips"
      | "/maintenance"
      | "/fuel-expenses"
      | "/reports"
      | "/settings"
      | "/profile";
  }>;
  action?: ReactNode;
};

export function PageHeader({ title, description, crumbs = [], action }: PageHeaderProps) {
  return (
    <div className="grid gap-4 rounded-lg border border-border/70 bg-card px-4 py-4 shadow-sm sm:px-6">
      {crumbs.length > 0 ? (
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <BreadcrumbItem key={`${crumb.label}-${index}`}>
                {crumb.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
                {index < crumbs.length - 1 ? <BreadcrumbSeparator /> : null}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="w-full sm:w-auto sm:shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
