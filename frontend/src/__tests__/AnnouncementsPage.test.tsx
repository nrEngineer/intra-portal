import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { AnnouncementsPage } from "../pages/AnnouncementsPage";
import { setupLocalStorage, clearLocalStorage } from "../test/mocks";

function renderAnnouncements() {
  return render(
    <BrowserRouter>
      <AnnouncementsPage />
    </BrowserRouter>
  );
}

const mockAnnouncements = [
  { id: "a1", title: "重要なお知らせ", category: "general", createdAt: "2026-03-01T00:00:00Z", isPinned: true },
  { id: "a2", title: "ITシステム更新", category: "it", createdAt: "2026-02-28T00:00:00Z", isPinned: false },
  { id: "a3", title: "歓迎会のお知らせ", category: "event", createdAt: "2026-02-27T00:00:00Z", isPinned: false },
];

describe("AnnouncementsPage", () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("お知らせ一覧が表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockAnnouncements, total: 3 }),
    })));

    renderAnnouncements();

    await waitFor(() => {
      expect(screen.getByText("重要なお知らせ")).toBeInTheDocument();
      expect(screen.getByText("ITシステム更新")).toBeInTheDocument();
      expect(screen.getByText("歓迎会のお知らせ")).toBeInTheDocument();
    });
  });

  it("検索フィールドとカテゴリフィルタが存在する", () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    })));

    renderAnnouncements();

    expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "検索" })).toBeInTheDocument();
  });

  it("カテゴリフィルタでAPIが再呼び出しされる", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockAnnouncements, total: 3 }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    renderAnnouncements();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const callCountBefore = fetchMock.mock.calls.length;

    await user.selectOptions(screen.getByRole("combobox"), "it");

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });

  it("お知らせがない場合のメッセージ表示", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    })));

    renderAnnouncements();

    await waitFor(() => {
      expect(screen.getByText("お知らせはありません")).toBeInTheDocument();
    });
  });

  it("ページネーションが表示される（11件以上）", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockAnnouncements, total: 25 }),
    })));

    renderAnnouncements();

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});
