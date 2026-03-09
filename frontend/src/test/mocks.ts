import { vi } from "vitest";
import { type ReactNode, createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(BrowserRouter, null, children),
  );
}

// Mock fetch globally
export function mockFetch(responses: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string) => {
    const path = url.replace("http://localhost:3000/api", "");
    const basePathAndQuery = path.split("?");
    const basePath = basePathAndQuery[0];

    // Try exact match first, then base path
    const data = responses[path] ?? responses[basePath] ?? { data: [], total: 0 };

    return {
      ok: true,
      json: async () => data,
    } as Response;
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function mockFetchError(status: number, message: string) {
  const fetchMock = vi.fn(async () => ({
    ok: false,
    status,
    json: async () => ({ error: message }),
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Mock localStorage
export function setupLocalStorage(data: Record<string, string> = {}) {
  const defaults = {
    accessToken: "test-token",
    userId: "user-1",
    userRole: "admin",
    user: JSON.stringify({ id: "user-1", email: "admin@example.com", name: "管理者", role: "admin" }),
  };
  const store = { ...defaults, ...data };

  Object.entries(store).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

export function clearLocalStorage() {
  localStorage.clear();
}
