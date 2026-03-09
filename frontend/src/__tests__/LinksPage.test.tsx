import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { LinksPage } from "../pages/LinksPage";
import { setupLocalStorage, clearLocalStorage, TestWrapper } from "../test/mocks";

function renderLinks() {
  return render(
    <TestWrapper>
      <LinksPage />
    </TestWrapper>
  );
}

describe("LinksPage", () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("リンクがカテゴリ別に表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("categories")) {
        return { ok: true, json: async () => ({ data: ["業務ツール", "社内システム"] }) };
      }
      return {
        ok: true,
        json: async () => ({
          data: [
            { id: "l1", title: "Slack", url: "https://slack.com", description: "チャットツール", category: "業務ツール", sortOrder: 1 },
            { id: "l2", title: "勤怠管理", url: "https://kintai.example.com", description: "勤怠システム", category: "社内システム", sortOrder: 1 },
          ],
        }),
      };
    }));

    renderLinks();

    await waitFor(() => {
      expect(screen.getByText("Slack")).toBeInTheDocument();
      expect(screen.getByText("チャットツール")).toBeInTheDocument();
      expect(screen.getByText("勤怠管理")).toBeInTheDocument();
      // カテゴリ名はボタンと見出しの両方に出るので getAllByText で確認
      expect(screen.getAllByText("業務ツール").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("社内システム").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("リンクがない場合のメッセージ", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("categories")) {
        return { ok: true, json: async () => ({ data: [] }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    }));

    renderLinks();

    await waitFor(() => {
      expect(screen.getByText("リンクはありません")).toBeInTheDocument();
    });
  });

  it("カテゴリフィルタボタンが表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("categories")) {
        return { ok: true, json: async () => ({ data: ["業務ツール"] }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    }));

    renderLinks();

    await waitFor(() => {
      expect(screen.getByText("すべて")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "業務ツール" })).toBeInTheDocument();
    });
  });
});
