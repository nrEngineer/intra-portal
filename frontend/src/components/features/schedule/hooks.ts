import { useState } from "react";
import type { ScheduleEvent } from "../../../types/schedule";

// ---- Calendar month logic ----

export interface CalendarDay {
  day: number;
  isToday: boolean;
}

export interface UseCalendarMonthReturn {
  year: number;
  month: number;
  days: CalendarDay[];
  firstDayOfWeek: number;
  daysInMonth: number;
  prevMonth: () => void;
  nextMonth: () => void;
  startDate: string;
  endDate: string;
  getEventsForDay: (day: number, events: ScheduleEvent[]) => ScheduleEvent[];
}

export function useCalendarMonth(
  initialYear: number,
  initialMonth: number
): UseCalendarMonthReturn {
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(initialYear, initialMonth - 1, 1)
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const today = new Date();
  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day;
    return { day, isToday };
  });

  const padded = (n: number) => String(n).padStart(2, "0");
  const startDate = `${year}-${padded(month)}-01`;
  const endDate = `${year}-${padded(month)}-${padded(daysInMonth)}`;

  const prevMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const getEventsForDay = (day: number, events: ScheduleEvent[]) => {
    const dayStart = new Date(year, month - 1, day);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59);
    return events.filter((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      return start <= dayEnd && end >= dayStart;
    });
  };

  return {
    year,
    month,
    days,
    firstDayOfWeek,
    daysInMonth,
    prevMonth,
    nextMonth,
    startDate,
    endDate,
    getEventsForDay,
  };
}

// ---- Event form logic ----

export interface EventFormState {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  teamId: string;
  allDay: boolean;
}

const EMPTY_EVENT_FORM: EventFormState = {
  title: "",
  description: "",
  startAt: "",
  endAt: "",
  teamId: "",
  allDay: false,
};

function isoToLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface UseEventFormReturn {
  form: EventFormState;
  editingId: number | null;
  isOpen: boolean;
  setField: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
  openNew: () => void;
  openEdit: (event: ScheduleEvent) => void;
  close: () => void;
  buildPayload: () =>
    | {
        title: string;
        description: string;
        startDate: string;
        endDate: string;
        teamId: number | undefined;
      }
    | null;
}

export function useEventForm(): UseEventFormReturn {
  const [form, setForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const setField = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const openNew = () => {
    setForm(EMPTY_EVENT_FORM);
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (event: ScheduleEvent) => {
    setForm({
      title: event.title,
      description: event.description ?? "",
      startAt: isoToLocal(event.startDate),
      endAt: isoToLocal(event.endDate),
      teamId: event.teamId != null ? String(event.teamId) : "",
      allDay: false,
    });
    setEditingId(event.id);
    setIsOpen(true);
  };

  const close = () => {
    setForm(EMPTY_EVENT_FORM);
    setEditingId(null);
    setIsOpen(false);
  };

  const buildPayload = () => {
    if (!form.title || !form.startAt || !form.endAt) return null;
    return {
      title: form.title,
      description: form.description,
      startDate: new Date(form.startAt).toISOString(),
      endDate: new Date(form.endAt).toISOString(),
      teamId: form.teamId ? Number(form.teamId) : undefined,
    };
  };

  return { form, editingId, isOpen, setField, openNew, openEdit, close, buildPayload };
}

// ---- Team form logic ----

export interface UseTeamFormReturn {
  teamName: string;
  editingId: number | null;
  isOpen: boolean;
  setTeamName: (name: string) => void;
  openNew: () => void;
  openEdit: (team: { id: number; name: string }) => void;
  close: () => void;
}

export function useTeamForm(): UseTeamFormReturn {
  const [teamName, setTeamName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openNew = () => {
    setTeamName("");
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (team: { id: number; name: string }) => {
    setTeamName(team.name);
    setEditingId(team.id);
    setIsOpen(true);
  };

  const close = () => {
    setTeamName("");
    setEditingId(null);
    setIsOpen(false);
  };

  return { teamName, editingId, isOpen, setTeamName, openNew, openEdit, close };
}
