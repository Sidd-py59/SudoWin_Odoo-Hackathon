import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock3, ShieldCheck, Truck, UserRound } from "lucide-react";
import { AppShell } from "@/components/transitops/app-shell";
import { PageHeader } from "@/components/transitops/page-header";
import { StatCard } from "@/components/transitops/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { drivers, trips, vehicles } from "@/lib/transitops-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile Dashboard | TransitOps" },
      {
        name: "description",
        content:
          "Manage account profile, personal preferences, and operations role settings in your TransitOps dashboard.",
      },
      { property: "og:title", content: "Profile Dashboard | TransitOps" },
      {
        property: "og:description",
        content: "Profile and preferences workspace for operations managers in TransitOps.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [saveMessage, setSaveMessage] = useState("");
  const [profile, setProfile] = useState({
    name: "Alex Morgan",
    email: "fleet.manager@transitops.io",
    phone: "+91 90000 11234",
    role: "Fleet Manager",
  });
  const [preferences, setPreferences] = useState({
    compactDashboard: false,
    showOnlyMyRegion: true,
    enableSafetyAlerts: true,
  });

  const profileStats = useMemo(
    () => ({
      managedVehicles: vehicles.filter((item) => item.status !== "retired").length,
      activeTrips: trips.filter((item) => item.status === "dispatched").length,
      availableDrivers: drivers.filter((item) => item.status === "available").length,
    }),
    [],
  );

  function showSaved(message: string) {
    setSaveMessage(message);
    window.setTimeout(() => setSaveMessage(""), 2200);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Profile Dashboard"
          description="Update account details and personalize your operations workspace."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Profile" }]}
        />

        {saveMessage ? (
          <div className="rounded-md border border-border/70 bg-card px-4 py-2 text-sm text-foreground">
            {saveMessage}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-lg border-border/70 shadow-sm sm:col-span-2 xl:col-span-1">
            <CardContent className="flex h-full items-center gap-3 p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{profile.name}</p>
                <p className="truncate text-xs text-muted-foreground">{profile.role}</p>
              </div>
            </CardContent>
          </Card>
          <StatCard title="Managed Vehicles" value={profileStats.managedVehicles} icon={Truck} />
          <StatCard title="Active Trips" value={profileStats.activeTrips} icon={Clock3} />
          <StatCard
            title="Available Drivers"
            value={profileStats.availableDrivers}
            icon={UserRound}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-lg border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Keep your identity and communication details up to date.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={profile.role}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, role: event.target.value }))
                  }
                />
              </div>
              <Button onClick={() => showSaved("Profile details saved.")}>Save Profile</Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Preferences</CardTitle>
              <CardDescription>
                Control how your dashboard and safety notifications behave.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "compactDashboard", label: "Compact dashboard mode" },
                { key: "showOnlyMyRegion", label: "Show only my region by default" },
                { key: "enableSafetyAlerts", label: "Enable high-priority safety alerts" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-md border border-border/70 p-3"
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <Switch
                    checked={preferences[item.key as keyof typeof preferences]}
                    onCheckedChange={(checked) =>
                      setPreferences((current) => ({
                        ...current,
                        [item.key]: Boolean(checked),
                      }))
                    }
                  />
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => showSaved("Preferences updated.")}>
                  Save Preferences
                </Button>
                <Button onClick={() => showSaved("Security profile reviewed.")}>
                  <ShieldCheck className="h-4 w-4" />
                  Run Security Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
