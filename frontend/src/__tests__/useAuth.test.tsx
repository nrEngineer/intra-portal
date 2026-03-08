import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth } from "../hooks/useAuth";
import { clearLocalStorage } from "../test/mocks";

describe("useAuth", () => {
  beforeEach(() => {
    clearLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("初期状態ではログアウト状態", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("localStorageにユーザー情報があればログイン状態", () => {
    localStorage.setItem("user", JSON.stringify({ id: "u1", email: "test@example.com", name: "テスト", role: "admin" }));

    const { result } = renderHook(() => useAuth());
    expect(result.current.user?.name).toBe("テスト");
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it("login成功でユーザー情報が保存される", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        accessToken: "token-123",
        refreshToken: "refresh-123",
        user: { id: "u1", email: "test@example.com", name: "テスト", role: "member" },
      }),
    })));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    expect(result.current.user?.name).toBe("テスト");
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(localStorage.getItem("accessToken")).toBe("token-123");
  });

  it("logoutでユーザー情報がクリアされる", async () => {
    localStorage.setItem("user", JSON.stringify({ id: "u1", email: "test@example.com", name: "テスト", role: "admin" }));
    localStorage.setItem("accessToken", "token-123");
    localStorage.setItem("refreshToken", "refresh-123");

    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({}),
    })));

    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoggedIn).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
