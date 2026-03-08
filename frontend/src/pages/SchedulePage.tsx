import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Team {
  id: string;
  name: string;
}

interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  teamId: string;
  isAllDay: boolean;
  createdBy: string;
}

export function SchedulePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    api<{ data: Team[] }>("/schedule/teams").then((res) => setTeams(res.data));
  }, []);

  useEffect(() => {
    const [year, month] = currentMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const params = new URLSearchParams();
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    if (selectedTeam) params.set("teamId", selectedTeam);

    api<{ data: ScheduleEvent[] }>(`/schedule/events?${params.toString()}`).then((res) => setEvents(res.data));
  }, [currentMonth, selectedTeam]);

  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const getEventsForDay = (day: number) => {
    const dayStart = new Date(year, month - 1, day);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59);
    return events.filter((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      return start <= dayEnd && end >= dayStart;
    });
  };

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>スケジュール</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={{ padding: "4px 12px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", background: "#fff" }}>&larr;</button>
          <h2 style={{ fontSize: 18, margin: 0 }}>{year}年{month}月</h2>
          <button onClick={nextMonth} style={{ padding: "4px 12px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", background: "#fff" }}>&rarr;</button>
        </div>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
        >
          <option value="">全チーム</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {dayNames.map((d) => (
            <div key={d} style={{ padding: 8, textAlign: "center", fontWeight: "bold", fontSize: 14, background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} style={{ padding: 8, minHeight: 80, borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = new Date().getFullYear() === year && new Date().getMonth() + 1 === month && new Date().getDate() === day;
            return (
              <div key={day} style={{ padding: 4, minHeight: 80, borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: isToday ? "bold" : "normal",
                  color: isToday ? "#3b82f6" : "#1e293b",
                  background: isToday ? "#dbeafe" : "transparent",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                }}>
                  {day}
                </div>
                {dayEvents.slice(0, 3).map((e) => (
                  <div key={e.id} style={{ fontSize: 10, padding: "1px 4px", marginBottom: 1, background: "#dbeafe", borderRadius: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.title}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div style={{ fontSize: 10, color: "#94a3b8" }}>+{dayEvents.length - 3}件</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
