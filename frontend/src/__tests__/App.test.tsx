import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import App from "../App";
import { clearLocalStorage, setupLocalStorage } from "../test/mocks";

describe("App ルーティング", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [], count: 0, total: 0 }),
    })));
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("未ログインではログインページにリダイレクトされる", () => {
    clearLocalStorage();
    render(<App />);
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });

  it("ログイン済みではダッシュボードが表示される", () => {
    setupLocalStorage();
    render(<App />);
    expect(screen.getByText("管理者 さん")).toBeInTheDocument();
  });

  it("サイドバーにナビゲーションリンクが表示される", () => {
    setupLocalStorage();
    render(<App />);
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(screen.getByText("社員名簿")).toBeInTheDocument();
    expect(screen.getAllByText("リンク集").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ドキュメント").length).toBeGreaterThanOrEqual(1);
  });

  it("管理者にはユーザー管理リンクが表示される", () => {
    setupLocalStorage({ userRole: "admin" });
    render(<App />);
    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();
  });

  it("一般ユーザーにはユーザー管理リンクが表示されない", () => {
    setupLocalStorage({
      userRole: "member",
      user: JSON.stringify({ id: "u2", email: "member@example.com", name: "一般", role: "member" }),
    });
    render(<App />);
    expect(screen.queryByText("ユーザー管理")).not.toBeInTheDocument();
  });
});
