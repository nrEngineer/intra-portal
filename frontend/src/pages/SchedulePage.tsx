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
      {/* ---- Page header ---- */}
      <div className="page-header animate-in">
        <h1 className="page-title">スケジュール</h1>
      </div>

      {/* ---- Toolbar: month nav + team filter + new event button ---- */}
      <div className="toolbar">
        <button className="btn btn-ghost" onClick={prevMonth}>&larr;</button>
        <h2 className="font-display" style={{ fontSize: "var(--fs-md)", margin: 0 }}>{year}年{month}月</h2>
        <button className="btn btn-ghost" onClick={nextMonth}>&rarr;</button>
        <div style={{ flex: 1 }} />
        <select
          className="select"
          style={{ width: "auto" }}
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="">全チーム</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          onClick={() => { resetEventForm(); setShowEventForm((v) => !v); }}
        >
          新規イベント
        </button>
      </div>

      {/* ---- Event create/edit form panel ---- */}
      {showEventForm && (
        <div className="form-panel animate-in">
          <h3>{editingEventId ? "イベント編集" : "新規イベント作成"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <div>
              <label className="label" htmlFor="event-form-title">タイトル *</label>
              <input
                id="event-form-title"
                className="input"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="イベントタイトル"
              />
            </div>
            <div>
              <label className="label" htmlFor="event-form-description">説明</label>
              <textarea
                id="event-form-description"
                className="input"
                value={eventForm.description}
                onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="説明（任意）"
              />
            </div>
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="event-form-start">開始日時 *</label>
                <input
                  id="event-form-start"
                  className="input"
                  type="datetime-local"
                  value={eventForm.startAt}
                  onChange={(e) => setEventForm((f) => ({ ...f, startAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="label" htmlFor="event-form-end">終了日時 *</label>
                <input
                  id="event-form-end"
                  className="input"
                  type="datetime-local"
                  value={eventForm.endAt}
                  onChange={(e) => setEventForm((f) => ({ ...f, endAt: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="event-form-team">チーム</label>
              <select
                id="event-form-team"
                className="select"
                value={eventForm.teamId}
                onChange={(e) => setEventForm((f) => ({ ...f, teamId: e.target.value }))}
              >
                <option value="">チームなし</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={eventForm.allDay}
                onChange={(e) => setEventForm((f) => ({ ...f, allDay: e.target.checked }))}
              />
              終日イベント
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSubmitEvent}>
                {editingEventId ? "更新" : "作成"}
              </button>
              <button className="btn btn-ghost" onClick={resetEventForm}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Calendar grid ---- */}
      <div className="calendar-grid animate-in stagger-1">
        {dayNames.map((d) => (
          <div key={d} className="calendar-header-cell">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-cell" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          const isToday =
            new Date().getFullYear() === year &&
            new Date().getMonth() + 1 === month &&
            new Date().getDate() === day;
          return (
            <div key={day} className="calendar-cell">
              <div className={`calendar-day-num${isToday ? " today" : ""}`}>
                {day}
              </div>
              {dayEvents.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  className="calendar-event"
                  onClick={() => setSelectedEvent(e)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setSelectedEvent(e);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  title={e.title}
                >
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted" style={{ padding: "1px 6px" }}>
                  +{dayEvents.length - 3}件
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Event detail overlay ---- */}
      {selectedEvent && (
        <div
          className="overlay"
          onClick={() => setSelectedEvent(null)}
          onKeyDown={(e) => { if (e.key === "Escape") setSelectedEvent(null); }}
        >
          <div
            className="modal animate-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-detail-title"
          >
            <h3 id="event-detail-title" style={{ margin: "0 0 var(--sp-2)", fontSize: "var(--fs-lg)" }}>{selectedEvent.title}</h3>
            {selectedEvent.description && (
              <p className="text-sm text-muted" style={{ marginBottom: "var(--sp-3)" }}>{selectedEvent.description}</p>
            )}
            <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-1)" }}>
              開始: {new Date(selectedEvent.startDate).toLocaleString("ja-JP")}
            </p>
            <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-1)" }}>
              終了: {new Date(selectedEvent.endDate).toLocaleString("ja-JP")}
            </p>
            {selectedEvent.isAllDay && (
              <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-1)" }}>終日イベント</p>
            )}
            {selectedEvent.teamId && (
              <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-4)" }}>
                チーム: {teams.find((t) => t.id === selectedEvent.teamId)?.name ?? selectedEvent.teamId}
              </p>
            )}
            <div className="flex gap-2" style={{ marginTop: "var(--sp-5)" }}>
              <button className="btn btn-sm btn-warn" onClick={() => handleEditEvent(selectedEvent)}>編集</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEvent(selectedEvent.id)}>削除</button>
              <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={() => setSelectedEvent(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Team management (admin only) ---- */}
      {isAdmin && (
        <div className="mt-6 animate-in stagger-2" style={{ marginTop: "var(--sp-10)" }}>
          <p className="section-title">チーム管理</p>
          <div className="card card-body">
            <div className="table-wrap" style={{ marginBottom: "var(--sp-4)" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>チーム名</th>
                    <th style={{ textAlign: "right" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                          <button className="btn btn-sm btn-warn" onClick={() => handleEditTeam(t)}>編集</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTeam(t.id)}>削除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {teams.length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-muted" style={{ textAlign: "center", padding: "var(--sp-6)" }}>
                        チームがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!showTeamForm ? (
              <button className="btn btn-primary" onClick={() => setShowTeamForm(true)}>新規チーム</button>
            ) : (
              <div className="flex gap-3 items-center" style={{ flexWrap: "wrap" }}>
                <input
                  className="input"
                  style={{ width: "auto", minWidth: 200 }}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="チーム名"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmitTeam(); }}
                />
                <button className="btn btn-primary" onClick={handleSubmitTeam}>
                  {editingTeamId ? "更新" : "作成"}
                </button>
                <button className="btn btn-ghost" onClick={resetTeamForm}>
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
