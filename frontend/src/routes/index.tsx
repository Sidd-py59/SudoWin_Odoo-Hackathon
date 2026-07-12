import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bus, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginIllustration from "@/assets/transitops-login-illustration.jpg";
import { roleCredentials, useAuth, type Role } from "../lib/auth-context";

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

function LoginPage() {
  const navigate = useNavigate({ from: "/" });
  const { loginWithCredentials } = useAuth();
  const [selectedRole, setSelectedRole] = useState<NonNullable<Role>>("Fleet Manager");
  const [email, setEmail] = useState(roleCredentials["Fleet Manager"].email);
  const [password, setPassword] = useState(roleCredentials["Fleet Manager"].password);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles: NonNullable<Role>[] = [
    "Fleet Manager",
    "Driver",
    "Safety Officer",
    "Financial Analyst",
  ];

  function selectRole(role: NonNullable<Role>) {
    const credentials = roleCredentials[role];
    setSelectedRole(role);
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError(null);
  }

  async function onLogin() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithCredentials(email.trim(), password);
      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error(error);
      setError("Login failed. Check credentials and make sure FastAPI is running on port 8000.");
    } finally {
      setIsSubmitting(false);
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
              Backend Auth Connected
            </div>
            <CardTitle>Sign in to TransitOps</CardTitle>
            <CardDescription>
              Enter backend credentials, or choose a role below to fill a demo account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Demo Role Quick Fill</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => selectRole(role)}
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="dispatcher@transitops.dev"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button className="w-full h-11" onClick={onLogin} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
