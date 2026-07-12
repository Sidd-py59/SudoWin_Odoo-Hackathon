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
