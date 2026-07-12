import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/transitops/app-shell";
import { PageHeader } from "@/components/transitops/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | TransitOps" },
      {
        name: "description",
        content:
          "Configure company profile, notifications, theme preferences, and role management controls in TransitOps.",
      },
      { property: "og:title", content: "Settings | TransitOps" },
      {
        property: "og:description",
        content: "Admin settings workspace for operations teams and organizational controls.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [theme, setTheme] = useState("system");
  const [saveMessage, setSaveMessage] = useState("");
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "TransitOps Logistics Pvt Ltd",
    supportEmail: "ops@transitops.io",
    phone: "+91 90000 11022",
    region: "Bengaluru",
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    dispatchDelay: true,
    maintenanceDue: true,
    licenseExpiry: true,
    expenseAnomaly: true,
  });

  function showSaved(message: string) {
    setSaveMessage(message);
    window.setTimeout(() => {
      setSaveMessage("");
    }, 2400);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage organization preferences and operational controls."
          crumbs={[{ label: "Operations", to: "/dashboard" }, { label: "Settings" }]}
        />

        {saveMessage ? (
          <div className="rounded-md border border-border/70 bg-card px-4 py-2 text-sm text-foreground">
            {saveMessage}
          </div>
        ) : null}

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="company">Company Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Update organization details shown across TransitOps.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={companyProfile.companyName}
                    onChange={(event) =>
                      setCompanyProfile((current) => ({
                        ...current,
                        companyName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    value={companyProfile.supportEmail}
                    onChange={(event) =>
                      setCompanyProfile((current) => ({
                        ...current,
                        supportEmail: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={companyProfile.phone}
                    onChange={(event) =>
                      setCompanyProfile((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>HQ Region</Label>
                  <Input
                    value={companyProfile.region}
                    onChange={(event) =>
                      setCompanyProfile((current) => ({ ...current, region: event.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button onClick={() => showSaved("Company profile saved.")}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control operational alerts and reminders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "dispatchDelay", label: "Dispatch delay alerts" },
                  { key: "maintenanceDue", label: "Maintenance due reminders" },
                  { key: "licenseExpiry", label: "License expiry warnings" },
                  { key: "expenseAnomaly", label: "Expense anomaly notifications" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-md border border-border/70 p-3"
                  >
                    <p className="text-sm font-medium">{item.label}</p>
                    <Switch
                      checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs((current) => ({
                          ...current,
                          [item.key]: Boolean(checked),
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => showSaved("Notification preferences updated.")}>
                    Save Preferences
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotificationPrefs({
                        dispatchDelay: true,
                        maintenanceDue: true,
                        licenseExpiry: true,
                        expenseAnomaly: true,
                      });
                      showSaved("Notification preferences reset to defaults.");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose your preferred appearance mode.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-xs space-y-2">
                  <Label>Theme Mode</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => showSaved(`Theme set to ${theme}.`)}>Apply Theme</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Role Management UI</CardTitle>
                <CardDescription>Manage permissions for core operations personas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { role: "Fleet Manager", scope: "Vehicles, maintenance, utilization" },
                  { role: "Dispatcher", scope: "Trips, assignment, route execution" },
                  { role: "Safety Officer", scope: "Licenses, safety scores, compliance" },
                  { role: "Financial Analyst", scope: "Fuel, expense, profitability reports" },
                ].map((item) => (
                  <div key={item.role} className="rounded-md border border-border/70 p-3">
                    <p className="text-sm font-semibold text-foreground">{item.role}</p>
                    <p className="text-xs text-muted-foreground">{item.scope}</p>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => showSaved("Role view preferences updated.")}
                >
                  Update Roles
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
