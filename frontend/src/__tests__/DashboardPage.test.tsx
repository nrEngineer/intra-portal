import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { DashboardPage } from "../pages/DashboardPage";
import { setupLocalStorage, clearLocalStorage, TestWrapper } from "../test/mocks";

function renderDashboard() {
  return render(
    <TestWrapper>
      <DashboardPage />
    </TestWrapper>
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("ダッシュボードが表示され、ユーザー名が見える", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("unread-count")) {
        return { ok: true, json: async () => ({ count: 3 }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    }));

    renderDashboard();

    expect(screen.getByText("管理者 さん")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("未読お知らせ")).toBeInTheDocument();
    });
  });

  it("未読件数が表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("unread-count")) {
        return { ok: true, json: async () => ({ count: 5 }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    }));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("最新のお知らせが表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("unread-count")) {
        return { ok: true, json: async () => ({ count: 0 }) };
      }
      return {
        ok: true,
        json: async () => ({
          data: [
            { id: "a1", title: "テストお知らせ", category: "general", createdAt: "2026-03-01T00:00:00Z" },
          ],
        }),
      };
    }));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("テストお知らせ")).toBeInTheDocument();
    });
  });

  it("お知らせがない場合のメッセージ", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("unread-count")) {
        return { ok: true, json: async () => ({ count: 0 }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    }));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("お知らせはありません")).toBeInTheDocument();
    });
  });
});
