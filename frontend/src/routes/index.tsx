import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bus, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginIllustration from "@/assets/transitops-login-illustration.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TransitOps Login | Transport Operations" },
      {
        name: "description",
        content:
          "Securely access TransitOps to manage vehicles, drivers, trips, maintenance, and transport operations insights.",
      },
      { property: "og:title", content: "TransitOps Login | Transport Operations" },
      {
        property: "og:description",
        content:
          "Sign in to TransitOps and monitor dispatch, fleet utilization, maintenance, fuel, and expenses from one dashboard.",
      },
    ],
  }),
  component: LoginPage,
});

import { useAuth, type Role } from "../lib/auth-context";

function LoginPage() {
  const navigate = useNavigate({ from: "/" });
  const { setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>("Fleet Manager");

  const roles: Role[] = ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"];

  function onLogin() {
    if (selectedRole) {
      setRole(selectedRole);
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <section className="hidden border-r border-border/70 bg-muted/30 lg:flex lg:flex-col lg:justify-between">
        <div className="p-10">
          <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2">
            <Bus className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">TransitOps</span>
          </div>
          <h1 className="mt-8 text-3xl font-semibold text-foreground">
            Smart Transport Operations Platform
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Manage vehicles, drivers, trips, maintenance, and operational expenses in one premium
            control center.
          </p>
        </div>
        <div className="p-10 pt-0">
          <img
            src={loginIllustration}
            alt="Transport operations control room with fleet analytics"
            width={1600}
            height={1200}
            className="w-full rounded-lg border border-border/70 object-cover shadow-sm"
          />
        </div>
      </section>

      <section className="grid place-content-center p-4 sm:p-6">
        <Card className="w-full max-w-md rounded-lg border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Role-Based Access
            </div>
            <CardTitle>Sign in to TransitOps</CardTitle>
            <CardDescription>
              Select your operational role to access the relevant workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Select Role</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors ${
                      selectedRole === role
                        ? "border-primary bg-primary/5 font-medium text-primary"
                        : "border-border/70 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full h-11" onClick={onLogin}>
              Enter Workspace
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
