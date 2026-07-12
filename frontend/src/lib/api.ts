const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export type BackendRole =
  | "admin"
  | "fleet_manager"
  | "dispatcher"
  | "safety_officer"
  | "financial_analyst";

export type BackendUser = {
  id: number;
  email: string;
  full_name: string;
  role: BackendRole;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  role: BackendRole;
  user: BackendUser;
};

export type ApiVehicle = {
  id: number;
  registration_number: string;
  name_model: string;
  type: "van" | "truck" | "mini" | "bus";
  max_load_kg: number;
  odometer: number;
  acquisition_cost: number;
  status: "available" | "on_trip" | "in_shop" | "retired";
  region: string;
  created_at?: string;
};

export type ApiDriver = {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number: string;
  safety_score: number;
  status: "available" | "on_trip" | "off_duty" | "suspended";
  license_expired?: boolean;
  created_at?: string;
};

export type ApiTrip = {
  id: number;
  trip_code: string;
  source: string;
  destination: string;
  vehicle_id: number | null;
  driver_id: number | null;
  cargo_weight_kg: number;
  planned_distance_km: number;
  actual_distance_km: number | null;
  status: "draft" | "dispatched" | "completed" | "cancelled";
  dispatched_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  vehicle?: { id: number; registration_number: string; name_model: string; status: string; odometer?: number } | null;
  driver?: { id: number; name: string; license_number: string; status: string } | null;
};

export type ApiMaintenance = {
  id: number;
  vehicle_id: number;
  service_type: string;
  cost: number;
  service_date: string;
  status: "active" | "completed";
  vehicle?: { id: number; name_model: string; registration_number: string; status: string } | null;
};

export type ApiFuelLog = {
  id: number;
  vehicle_id: number;
  trip_id: number | null;
  liters: number;
  cost: number;
  log_date: string;
};

export type ApiExpense = {
  id: number;
  trip_id: number | null;
  vehicle_id: number | null;
  toll_cost: number;
  repair_cost: number;
  other_cost: number;
  total_cost: number;
  created_at?: string;
};

export type DashboardKpis = {
  total_vehicles: number;
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  active_trips: number;
  pending_trips: number;
  completed_trips: number;
  drivers_on_duty: number;
  fleet_utilization_percent: number;
};

type ApiClientOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  const requestHeaders: Record<string, string> = { ...headers };
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail: unknown = null;
    try {
      detail = await response.json();
    } catch {
      detail = await response.text();
    }
    throw new Error(
      `API ${response.status} ${response.statusText}${detail ? `: ${JSON.stringify(detail)}` : ""}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export const api = {
  vehicles: {
    list: (token: string) => apiFetch<ApiVehicle[]>("/vehicles", { token }),
    available: (token: string) => apiFetch<ApiVehicle[]>("/vehicles/available", { token }),
    create: (token: string, body: Omit<ApiVehicle, "id" | "created_at">) =>
      apiFetch<ApiVehicle>("/vehicles", { method: "POST", token, body }),
    update: (token: string, id: number, body: Partial<Omit<ApiVehicle, "id" | "created_at">>) =>
      apiFetch<ApiVehicle>(`/vehicles/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: number) =>
      apiFetch<{ id: number; deleted_at: string }>(`/vehicles/${id}`, { method: "DELETE", token }),
  },
  drivers: {
    list: (token: string) => apiFetch<ApiDriver[]>("/drivers", { token }),
    available: (token: string) => apiFetch<ApiDriver[]>("/drivers/available", { token }),
    create: (token: string, body: Omit<ApiDriver, "id" | "created_at" | "license_expired">) =>
      apiFetch<ApiDriver>("/drivers", { method: "POST", token, body }),
    update: (token: string, id: number, body: Partial<Omit<ApiDriver, "id" | "created_at" | "license_expired">>) =>
      apiFetch<ApiDriver>(`/drivers/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: number) =>
      apiFetch<{ id: number; deleted_at: string }>(`/drivers/${id}`, { method: "DELETE", token }),
  },
  trips: {
    list: (token: string) => apiFetch<ApiTrip[]>("/trips", { token }),
    create: (token: string, body: {
      trip_code: string;
      source: string;
      destination: string;
      vehicle_id?: number | null;
      driver_id?: number | null;
      cargo_weight_kg: number;
      planned_distance_km: number;
    }) => apiFetch<ApiTrip>("/trips", { method: "POST", token, body }),
    dispatch: (token: string, id: number, body: { vehicle_id: number; driver_id: number }) =>
      apiFetch<ApiTrip>(`/trips/${id}/dispatch`, { method: "POST", token, body }),
    complete: (token: string, id: number, body: {
      actual_distance_km: number;
      final_odometer: number;
      fuel_liters?: number;
      fuel_cost?: number;
      toll_cost?: number;
      other_cost?: number;
    }) => apiFetch<ApiTrip>(`/trips/${id}/complete`, { method: "POST", token, body }),
    cancel: (token: string, id: number) =>
      apiFetch<ApiTrip>(`/trips/${id}/cancel`, { method: "POST", token }),
  },
  maintenance: {
    list: (token: string) => apiFetch<ApiMaintenance[]>("/maintenance", { token }),
    create: (token: string, body: { vehicle_id: number; service_type: string; cost: number; service_date: string }) =>
      apiFetch<ApiMaintenance>("/maintenance", { method: "POST", token, body }),
    close: (token: string, id: number) =>
      apiFetch<ApiMaintenance>(`/maintenance/${id}/close`, { method: "POST", token }),
  },
  fuel: {
    list: (token: string) => apiFetch<ApiFuelLog[]>("/fuel-logs", { token }),
    create: (token: string, body: { vehicle_id: number; trip_id?: number | null; liters: number; cost: number; log_date: string }) =>
      apiFetch<ApiFuelLog>("/fuel-logs", { method: "POST", token, body }),
  },
  expenses: {
    list: (token: string) => apiFetch<ApiExpense[]>("/expenses", { token }),
    create: (token: string, body: { trip_id?: number | null; vehicle_id?: number | null; toll_cost?: number; repair_cost?: number; other_cost?: number }) =>
      apiFetch<ApiExpense>("/expenses", { method: "POST", token, body }),
  },
  dashboard: {
    kpis: (token: string, params?: { status?: string; type?: string; region?: string }) => {
      let path = "/dashboard/kpis";
      const q: string[] = [];
      if (params?.status && params.status !== "all") q.push(`status=${encodeURIComponent(params.status)}`);
      if (params?.type && params.type !== "all") q.push(`type=${encodeURIComponent(params.type)}`);
      if (params?.region && params.region !== "all") q.push(`region=${encodeURIComponent(params.region)}`);
      if (q.length) path += `?${q.join("&")}`;
      return apiFetch<DashboardKpis>(path, { token });
    },
  },
  analytics: {
    fuelEfficiency: (token: string) => apiFetch<Array<{ vehicle_id: number; vehicle: string; efficiency_km_per_liter: number; distance_km: number; fuel_liters: number }>>("/analytics/fuel-efficiency", { token }),
    costPerTrip: (token: string) => apiFetch<Array<{ trip_id: number; trip_code: string; total_cost: number; cost_per_km: number; distance_km: number }>>("/analytics/cost-per-trip", { token }),
    topCostlyVehicles: (token: string) => apiFetch<Array<{ vehicle_id: number; vehicle: string; total_cost: number }>>("/analytics/top-costly-vehicles", { token }),
    vehicleRoi: (token: string) => apiFetch<Array<{ vehicle_id: number; vehicle: string; revenue: number; operational_cost: number; roi: number }>>("/analytics/vehicle-roi", { token }),
  },
  audit: {
    list: (token: string) => apiFetch<unknown[]>("/audit-logs", { token }),
  },
};


