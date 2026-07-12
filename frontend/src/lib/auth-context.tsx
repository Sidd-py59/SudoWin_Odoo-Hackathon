import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "Fleet Manager" | "Driver" | "Safety Officer" | "Financial Analyst" | null;

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("transitops_role") as Role;
    if (savedRole) {
      setRoleState(savedRole);
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

  const logout = () => {
    setRole(null);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ role, setRole, isAuthenticated: !!role, logout }}>
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
