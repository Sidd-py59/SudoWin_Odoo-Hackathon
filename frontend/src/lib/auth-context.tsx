import React, { createContext, useContext, useEffect, useState } from "react";
import { login, type BackendRole, type BackendUser } from "./api";

export type Role = "Fleet Manager" | "Driver" | "Safety Officer" | "Financial Analyst" | null;

type DemoCredential = {
  email: string;
  password: string;
};

export const roleCredentials: Record<NonNullable<Role>, DemoCredential> = {
  "Fleet Manager": { email: "fleet@transitops.dev", password: "fleet123" },
  Driver: { email: "dispatcher@transitops.dev", password: "dispatch123" },
  "Safety Officer": { email: "safety@transitops.dev", password: "safety123" },
  "Financial Analyst": { email: "finance@transitops.dev", password: "finance123" },
};

const backendRoleLabels: Record<BackendRole, Role> = {
  admin: "Fleet Manager",
  fleet_manager: "Fleet Manager",
  dispatcher: "Driver",
  safety_officer: "Safety Officer",
  financial_analyst: "Financial Analyst",
};

interface AuthContextType {
  role: Role;
  token: string | null;
  user: BackendUser | null;
  setRole: (role: Role) => void;
  loginAsRole: (role: NonNullable<Role>) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("transitops_role") as Role;
    const savedToken = localStorage.getItem("transitops_token");
    const savedUser = localStorage.getItem("transitops_user");

    if (savedRole) {
      setRoleState(savedRole);
    }
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as BackendUser);
      } catch {
        localStorage.removeItem("transitops_user");
      }
    }
    setIsLoaded(true);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("transitops_role", newRole);
    } else {
      localStorage.removeItem("transitops_role");
    }
  };

  const applyLogin = (accessToken: string, backendUser: BackendUser) => {
    const displayRole = backendRoleLabels[backendUser.role] ?? null;

    setRole(displayRole);
    setToken(accessToken);
    setUser(backendUser);
    if (displayRole) {
      localStorage.setItem("transitops_role", displayRole);
    }
    localStorage.setItem("transitops_token", accessToken);
    localStorage.setItem("transitops_user", JSON.stringify(backendUser));
  };

  const loginWithCredentials = async (email: string, password: string) => {
    const response = await login(email, password);
    applyLogin(response.access_token, response.user);
  };

  const loginAsRole = async (selectedRole: NonNullable<Role>) => {
    const credentials = roleCredentials[selectedRole];
    await loginWithCredentials(credentials.email, credentials.password);
  };

  const logout = () => {
    setRole(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem("transitops_role");
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_user");
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        token,
        user,
        setRole,
        loginAsRole,
        loginWithCredentials,
        isAuthenticated: !!role && !!token,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
