import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { DocumentsPage } from "../pages/DocumentsPage";
import { setupLocalStorage, clearLocalStorage, TestWrapper } from "../test/mocks";

function renderDocuments() {
  return render(
    <TestWrapper>
      <DocumentsPage />
    </TestWrapper>
  );
}

describe("DocumentsPage", () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("フォルダとドキュメントが表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("folders")) {
        return { ok: true, json: async () => ({ data: [{ id: "f1", name: "規程集", parentId: null }] }) };
      }
      return {
        ok: true,
        json: async () => ({
          data: [{ id: "d1", title: "就業規則", filename: "rules.pdf", fileUrl: "/files/rules.pdf", folderId: null, currentVersion: 2, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-03-01T00:00:00Z", createdBy: "user-1" }],
        }),
      };
    }));

    renderDocuments();

    await waitFor(() => {
      expect(screen.getByText("規程集")).toBeInTheDocument();
      expect(screen.getByText("就業規則")).toBeInTheDocument();
      expect(screen.getByText(/v2/)).toBeInTheDocument();
    });
  });

  it("パンくずナビゲーションが表示される", () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [] }),
    })));

    renderDocuments();

    expect(screen.getByText("ルート")).toBeInTheDocument();
  });

  it("フォルダをクリックで中に入れる", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("folders")) {
        return { ok: true, json: async () => ({ data: [{ id: "f1", name: "規程集", parentId: null }] }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    });
    vi.stubGlobal("fetch", fetchMock);

    renderDocuments();

    await waitFor(() => {
      expect(screen.getByText("規程集")).toBeInTheDocument();
    });

    await user.click(screen.getByText("規程集"));

    await waitFor(() => {
      // パンくずに「規程集」が追加される（現在のフォルダはspanで表示）
      const breadcrumb = document.querySelector(".breadcrumb");
      expect(breadcrumb).toBeTruthy();
      expect(breadcrumb!.textContent).toContain("規程集");
    });
  });

  it("検索フィールドが存在する", () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [] }),
    })));

    renderDocuments();

    expect(screen.getByPlaceholderText("ファイル名・タイトルで検索...")).toBeInTheDocument();
  });
});
