import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { EmployeesPage } from "../pages/EmployeesPage";
import { setupLocalStorage, clearLocalStorage, TestWrapper } from "../test/mocks";

function renderEmployees() {
  return render(
    <TestWrapper>
      <EmployeesPage />
    </TestWrapper>
  );
}

const mockEmployees = [
  { id: "e1", name: "田中太郎", email: "tanaka@example.com", department: "開発部", position: "エンジニア", phone: "03-1234-5678", joinDate: "2020-04-01" },
  { id: "e2", name: "佐藤花子", email: "sato@example.com", department: "人事部", position: "マネージャー", phone: "03-2345-6789", joinDate: "2019-04-01" },
];

describe("EmployeesPage", () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("社員一覧がテーブルに表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockEmployees }),
    })));

    renderEmployees();

    await waitFor(() => {
      expect(screen.getByText("田中太郎")).toBeInTheDocument();
      expect(screen.getByText("佐藤花子")).toBeInTheDocument();
      expect(screen.getByText("エンジニア")).toBeInTheDocument();
      expect(screen.getByText("マネージャー")).toBeInTheDocument();
      // 部署名はテーブルとフィルタ両方に出る
      expect(screen.getAllByText("開発部").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("人事部").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("検索フィールドが機能する", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: mockEmployees }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    renderEmployees();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const callCount = fetchMock.mock.calls.length;
    await user.type(screen.getByPlaceholderText("名前・部署・役職で検索..."), "田中");

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  it("社員が見つからない場合のメッセージ", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [] }),
    })));

    renderEmployees();

    await waitFor(() => {
      expect(screen.getByText("社員が見つかりません")).toBeInTheDocument();
    });
  });
});
