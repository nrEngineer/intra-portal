import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

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

const btnPrimary: React.CSSProperties = { padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const btnSubmit: React.CSSProperties = { padding: "8px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const btnDelete: React.CSSProperties = { padding: "4px 8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 };
const btnEdit: React.CSSProperties = { padding: "4px 8px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 };

export function SchedulePage() {
  const { isAdmin } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Event CRUD state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", description: "", startAt: "", endAt: "", teamId: "", allDay: false });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Team management state
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const loadTeams = () => {
    api<{ data: Team[] }>("/schedule/teams").then((res) => setTeams(res.data));
  };

  const loadEvents = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const params = new URLSearchParams();
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    if (selectedTeam) params.set("teamId", selectedTeam);

    api<{ data: ScheduleEvent[] }>(`/schedule/events?${params.toString()}`).then((res) => setEvents(res.data));
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    loadEvents();
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

  // ----- Event CRUD handlers -----

  const resetEventForm = () => {
    setEventForm({ title: "", description: "", startAt: "", endAt: "", teamId: "", allDay: false });
    setEditingEventId(null);
    setShowEventForm(false);
  };

  const handleSubmitEvent = async () => {
    if (!eventForm.title || !eventForm.startAt || !eventForm.endAt) return;
    const body = {
      title: eventForm.title,
      description: eventForm.description,
      startDate: new Date(eventForm.startAt).toISOString(),
      endDate: new Date(eventForm.endAt).toISOString(),
      teamId: eventForm.teamId || undefined,
      isAllDay: eventForm.allDay,
    };
    if (editingEventId) {
      await api(`/schedule/events/${editingEventId}`, { method: "PUT", body });
    } else {
      await api("/schedule/events", { method: "POST", body });
    }
    resetEventForm();
    loadEvents();
  };

  const handleEditEvent = (e: ScheduleEvent) => {
    const toLocal = (iso: string) => {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setEventForm({
      title: e.title,
      description: e.description ?? "",
      startAt: toLocal(e.startDate),
      endAt: toLocal(e.endDate),
      teamId: e.teamId ?? "",
      allDay: e.isAllDay,
    });
    setEditingEventId(e.id);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("このイベントを削除しますか？")) return;
    await api(`/schedule/events/${id}`, { method: "DELETE" });
    setSelectedEvent(null);
    loadEvents();
  };

  // ----- Team management handlers -----

  const resetTeamForm = () => {
    setTeamName("");
    setEditingTeamId(null);
    setShowTeamForm(false);
  };

  const handleSubmitTeam = async () => {
    if (!teamName.trim()) return;
    if (editingTeamId) {
      await api(`/schedule/teams/${editingTeamId}`, { method: "PUT", body: { name: teamName } });
    } else {
      await api("/schedule/teams", { method: "POST", body: { name: teamName, memberIds: [] } });
    }
    resetTeamForm();
    loadTeams();
  };

  const handleEditTeam = (t: Team) => {
    setTeamName(t.name);
    setEditingTeamId(t.id);
    setShowTeamForm(true);
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("このチームを削除しますか？")) return;
    await api(`/schedule/teams/${id}`, { method: "DELETE" });
    loadTeams();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>スケジュール</h1>

      {/* ---- Header row: nav + team filter + new event button ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={{ padding: "4px 12px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", background: "#fff" }}>&larr;</button>
          <h2 style={{ fontSize: 18, margin: 0 }}>{year}年{month}月</h2>
          <button onClick={nextMonth} style={{ padding: "4px 12px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", background: "#fff" }}>&rarr;</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          <button
            style={btnPrimary}
            onClick={() => { resetEventForm(); setShowEventForm((v) => !v); }}
          >
            新規イベント
          </button>
        </div>
      </div>

      {/* ---- Event create/edit form ---- */}
      {showEventForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px" }}>{editingEventId ? "イベント編集" : "新規イベント作成"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label>
              タイトル *
              <input
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                style={{ display: "block", width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, marginTop: 4 }}
                placeholder="イベントタイトル"
              />
            </label>
            <label>
              説明
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                style={{ display: "block", width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, marginTop: 4, minHeight: 60 }}
                placeholder="説明（任意）"
              />
            </label>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <label>
                開始日時 *
                <input
                  type="datetime-local"
                  value={eventForm.startAt}
                  onChange={(e) => setEventForm((f) => ({ ...f, startAt: e.target.value }))}
                  style={{ display: "block", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, marginTop: 4 }}
                />
              </label>
              <label>
                終了日時 *
                <input
                  type="datetime-local"
                  value={eventForm.endAt}
                  onChange={(e) => setEventForm((f) => ({ ...f, endAt: e.target.value }))}
                  style={{ display: "block", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, marginTop: 4 }}
                />
              </label>
            </div>
            <label>
              チーム
              <select
                value={eventForm.teamId}
                onChange={(e) => setEventForm((f) => ({ ...f, teamId: e.target.value }))}
                style={{ display: "block", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, marginTop: 4 }}
              >
                <option value="">チームなし</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={eventForm.allDay}
                onChange={(e) => setEventForm((f) => ({ ...f, allDay: e.target.checked }))}
              />
              終日イベント
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnSubmit} onClick={handleSubmitEvent}>
                {editingEventId ? "更新" : "作成"}
              </button>
              <button onClick={resetEventForm} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", background: "#fff" }}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Calendar grid ---- */}
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
                  <div
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    style={{ fontSize: 10, padding: "1px 4px", marginBottom: 1, background: "#dbeafe", borderRadius: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div style={{ fontSize: 10, color: "#94a3b8" }}>+{dayEvents.length - 3}件</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Event detail overlay ---- */}
      {selectedEvent && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 8, padding: 24, maxWidth: 400, width: "90%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{selectedEvent.title}</h3>
            {selectedEvent.description && (
              <p style={{ margin: "0 0 8px", color: "#475569", fontSize: 14 }}>{selectedEvent.description}</p>
            )}
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>
              開始: {new Date(selectedEvent.startDate).toLocaleString("ja-JP")}
            </p>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>
              終了: {new Date(selectedEvent.endDate).toLocaleString("ja-JP")}
            </p>
            {selectedEvent.isAllDay && (
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>終日イベント</p>
            )}
            {selectedEvent.teamId && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
                チーム: {teams.find((t) => t.id === selectedEvent.teamId)?.name ?? selectedEvent.teamId}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={btnEdit} onClick={() => handleEditEvent(selectedEvent)}>編集</button>
              <button style={btnDelete} onClick={() => handleDeleteEvent(selectedEvent.id)}>削除</button>
              <button onClick={() => setSelectedEvent(null)} style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", background: "#fff", fontSize: 12, marginLeft: "auto" }}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Team management (admin only) ---- */}
      {isAdmin && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>チーム管理</h2>
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 14 }}>チーム名</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 14 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 12px", fontSize: 14 }}>{t.name}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button style={btnEdit} onClick={() => handleEditTeam(t)}>編集</button>
                        <button style={btnDelete} onClick={() => handleDeleteTeam(t.id)}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>チームがありません</td>
                  </tr>
                )}
              </tbody>
            </table>

            {!showTeamForm ? (
              <button style={btnPrimary} onClick={() => setShowTeamForm(true)}>新規チーム</button>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="チーム名"
                  style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4, minWidth: 200 }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmitTeam(); }}
                />
                <button style={btnSubmit} onClick={handleSubmitTeam}>
                  {editingTeamId ? "更新" : "作成"}
                </button>
                <button onClick={resetTeamForm} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", background: "#fff" }}>
                  キャンセル
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
