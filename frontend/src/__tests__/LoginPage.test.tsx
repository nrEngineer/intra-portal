import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { LoginPage } from "../pages/LoginPage";
import { clearLocalStorage } from "../test/mocks";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    clearLocalStorage();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ログインフォームが表示される", () => {
    renderLogin();
    expect(screen.getByText("社内ポータル")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });

  it("ログイン成功でダッシュボードに遷移する", async () => {
    const user = userEvent.setup();

    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        accessToken: "token-123",
        refreshToken: "refresh-123",
        user: { id: "u1", email: "test@example.com", name: "テスト", role: "member" },
      }),
    })));

    renderLogin();

    await user.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    expect(localStorage.getItem("accessToken")).toBe("token-123");
  });

  it("ログイン失敗でエラーメッセージが表示される", async () => {
    const user = userEvent.setup();

    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: "メールアドレスまたはパスワードが正しくありません" }),
    })));

    renderLogin();

    await user.type(screen.getByLabelText("メールアドレス"), "wrong@example.com");
    await user.type(screen.getByLabelText("パスワード"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByText("メールアドレスまたはパスワードが正しくありません")).toBeInTheDocument();
    });
  });
});
