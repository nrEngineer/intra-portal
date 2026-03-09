import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { SchedulePage } from "../pages/SchedulePage";
import { setupLocalStorage, clearLocalStorage, TestWrapper } from "../test/mocks";

function renderSchedule() {
  return render(
    <TestWrapper>
      <SchedulePage />
    </TestWrapper>
  );
}

describe("SchedulePage", () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
    vi.restoreAllMocks();
  });

  it("カレンダーが表示される", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("teams")) {
        return { ok: true, json: async () => ({ data: [{ id: "t1", name: "開発チーム" }] }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    }));

    renderSchedule();

    expect(screen.getByText("スケジュール")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("日")).toBeInTheDocument();
      expect(screen.getByText("月")).toBeInTheDocument();
      expect(screen.getByText("火")).toBeInTheDocument();
      expect(screen.getByText("水")).toBeInTheDocument();
      expect(screen.getByText("木")).toBeInTheDocument();
      expect(screen.getByText("金")).toBeInTheDocument();
      expect(screen.getByText("土")).toBeInTheDocument();
    });
  });

  it("月の切り替えができる", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("teams")) {
        return { ok: true, json: async () => ({ data: [] }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    });
    vi.stubGlobal("fetch", fetchMock);

    renderSchedule();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    expect(screen.getByText(`${currentYear}年${currentMonth}月`)).toBeInTheDocument();

    // 次月へ
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((b) => b.textContent === "→");
    if (nextButton) await user.click(nextButton);

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    await waitFor(() => {
      expect(screen.getByText(`${nextYear}年${nextMonth}月`)).toBeInTheDocument();
    });
  });

  it("イベントがカレンダーに表示される", async () => {
    const now = new Date();
    const eventDate = new Date(now.getFullYear(), now.getMonth(), 15);

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("teams")) {
        return { ok: true, json: async () => ({ data: [] }) };
      }
      return {
        ok: true,
        json: async () => ({
          data: [{
            id: "ev1",
            title: "定例ミーティング",
            startDate: eventDate.toISOString(),
            endDate: eventDate.toISOString(),
            teamId: "t1",
            isAllDay: false,
            createdBy: "user-1",
          }],
        }),
      };
    }));

    renderSchedule();

    await waitFor(() => {
      expect(screen.getByText("定例ミーティング")).toBeInTheDocument();
    });
  });
});
