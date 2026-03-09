import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  useTeams,
  useEvents,
  useEventCreate,
  useEventUpdate,
  useEventDelete,
  useTeamCreate,
  useTeamUpdate,
  useTeamDelete,
} from "../../../hooks/useSchedule";
import type { ScheduleEvent } from "../../../types/schedule";
import { useCalendarMonth, useEventForm, useTeamForm } from "./hooks";
import { CalendarGrid } from "./components/CalendarGrid";
import { EventForm } from "./components/EventForm";
import { EventDetail } from "./components/EventDetail";
import { TeamPanel } from "./components/TeamPanel";

export function ScheduleContainer() {
  const { isAdmin } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const now = new Date();
  const calendar = useCalendarMonth(now.getFullYear(), now.getMonth() + 1);
  const eventForm = useEventForm();
  const teamForm = useTeamForm();

  // Data fetching
  const { data: teams = [] } = useTeams();
  const { data: events = [] } = useEvents({
    startDate: calendar.startDate,
    endDate: calendar.endDate,
    teamId: selectedTeam ? Number(selectedTeam) : undefined,
  });

  // Mutations
  const createEvent = useEventCreate();
  const updateEvent = useEventUpdate();
  const deleteEvent = useEventDelete();
  const createTeam = useTeamCreate();
  const updateTeam = useTeamUpdate();
  const deleteTeam = useTeamDelete();

  // ----- Event handlers -----

  const handleSubmitEvent = () => {
    const payload = eventForm.buildPayload();
    if (!payload) return;
    if (eventForm.editingId) {
      updateEvent.mutate({ id: eventForm.editingId, ...payload });
    } else {
      createEvent.mutate(payload);
    }
    eventForm.close();
  };

  const handleEditEvent = (e: ScheduleEvent) => {
    setSelectedEvent(null);
    eventForm.openEdit(e);
  };

  const handleDeleteEvent = (id: number) => {
    deleteEvent.mutate(id);
    setSelectedEvent(null);
  };

  const handleSubmitTeam = () => {
    if (!teamForm.teamName.trim()) return;
    if (teamForm.editingId) {
      updateTeam.mutate({ id: teamForm.editingId, name: teamForm.teamName });
    } else {
      createTeam.mutate({ name: teamForm.teamName });
    }
    teamForm.close();
  };

  const handleDeleteTeam = (id: number) => {
    deleteTeam.mutate(id);
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header animate-in">
        <h1 className="page-title">スケジュール</h1>
      </div>

      {/* Toolbar: month nav + team filter + new event button */}
      <div className="toolbar">
        <button className="btn btn-ghost" onClick={calendar.prevMonth}>&larr;</button>
        <h2
          className="font-display"
          style={{ fontSize: "var(--fs-md)", margin: 0 }}
        >
          {calendar.year}年{calendar.month}月
        </h2>
        <button className="btn btn-ghost" onClick={calendar.nextMonth}>&rarr;</button>
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
          onClick={() => {
            eventForm.close();
            eventForm.openNew();
          }}
        >
          新規イベント
        </button>
      </div>

      {/* Event create/edit form */}
      {eventForm.isOpen && (
        <EventForm
          form={eventForm.form}
          editingId={eventForm.editingId}
          teams={teams}
          onFieldChange={eventForm.setField}
          onSubmit={handleSubmitEvent}
          onCancel={eventForm.close}
        />
      )}

      {/* Calendar grid */}
      <CalendarGrid
        days={calendar.days}
        firstDayOfWeek={calendar.firstDayOfWeek}
        events={events}
        getEventsForDay={calendar.getEventsForDay}
        onEventClick={setSelectedEvent}
      />

      {/* Event detail overlay */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          teams={teams}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Team management (admin only) */}
      {isAdmin && (
        <TeamPanel
          teams={teams}
          teamName={teamForm.teamName}
          editingId={teamForm.editingId}
          isFormOpen={teamForm.isOpen}
          onTeamNameChange={teamForm.setTeamName}
          onOpenNew={teamForm.openNew}
          onEdit={teamForm.openEdit}
          onDelete={handleDeleteTeam}
          onSubmit={handleSubmitTeam}
          onCancel={teamForm.close}
        />
      )}
    </div>
  );
}
