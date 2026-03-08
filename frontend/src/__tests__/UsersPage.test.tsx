import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { UsersPage } from "../pages/UsersPage";
import { setupLocalStorage, clearLocalStorage } from "../test/mocks";

function renderUsers() {
  return render(
    <BrowserRouter>
      <UsersPage />
    </BrowserRouter>
  );
}

const mockUsers = [
  { id: "u1", email: "admin@example.com", name: "管理者太郎", role: "admin", createdAt: "2025-01-01T00:00:00Z" },
  { id: "u2", email: "member@example.com", name: "一般ユーザー", role: "member", createdAt: "2025-06-01T00:00:00Z" },
];

describe("UsersPage", () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("ユーザー一覧が表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockUsers }),
    })));

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("管理者太郎")).toBeInTheDocument();
      expect(screen.getByText("一般ユーザー")).toBeInTheDocument();
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });
  });

  it("新規ユーザー作成フォームが開閉できる", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockUsers }),
    })));

    renderUsers();

    // フォームは非表示（作成ボタンのみ）
    const forms = document.querySelectorAll("form");
    expect(forms.length).toBe(0);

    // ボタンクリックでフォーム表示
    await user.click(screen.getByRole("button", { name: "新規ユーザー" }));
    const formsAfter = document.querySelectorAll("form");
    expect(formsAfter.length).toBe(1);

    // キャンセルで非表示
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() => {
      expect(document.querySelectorAll("form").length).toBe(0);
    });
  });

  it("ロール変更のセレクトボックスが存在する", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockUsers }),
    })));

    renderUsers();

    await waitFor(() => {
      const table = screen.getByRole("table");
      const selects = within(table).getAllByRole("combobox");
      expect(selects.length).toBe(2); // 各ユーザーに1つ
    });
  });
});
