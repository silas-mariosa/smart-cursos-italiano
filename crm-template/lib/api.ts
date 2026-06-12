import type { AdminStats, AuthUser, UsersListResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiClient {
  constructor(private baseURL: string) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      const message =
        body && typeof body === "object" && "error" in body
          ? String((body as { error: unknown }).error)
          : `Erro HTTP ${response.status}`;
      if (response.status === 401) this.removeToken();
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  }

  setToken(token: string) {
    if (typeof window !== "undefined") localStorage.setItem("authToken", token);
  }

  removeToken() {
    if (typeof window !== "undefined") localStorage.removeItem("authToken");
  }

  async signIn(email: string, password: string) {
    const data = await this.request<{ token: string; user: AuthUser }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request<{ user: AuthUser }>("/auth/me");
  }

  async getAdminStats() {
    return this.request<AdminStats>("/admin/stats");
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
    });
    return this.request<UsersListResponse>(`/admin/users?${params}`);
  }

  async updateUserRole(userId: string, role: "user" | "admin") {
    return this.request<{ user: AuthUser }>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async updateProfile(name: string) {
    return this.request<{ user: AuthUser }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
