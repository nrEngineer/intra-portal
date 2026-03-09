import type { ScheduleEvent } from "../../../../types/schedule";
import type { CalendarDay } from "../hooks";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

interface CalendarGridProps {
  days: CalendarDay[];
  firstDayOfWeek: number;
  events: ScheduleEvent[];
  getEventsForDay: (day: number, events: ScheduleEvent[]) => ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
}

export function CalendarGrid({
  days,
  firstDayOfWeek,
  events,
  getEventsForDay,
  onEventClick,
}: CalendarGridProps) {
  return (
    <div className="calendar-grid animate-in stagger-1">
      {DAY_NAMES.map((d) => (
        <div key={d} className="calendar-header-cell">{d}</div>
      ))}

      {Array.from({ length: firstDayOfWeek }, (_, i) => (
        <div key={`empty-${i}`} className="calendar-cell" />
      ))}

      {days.map(({ day, isToday }) => {
        const dayEvents = getEventsForDay(day, events);
        return (
          <div key={day} className="calendar-cell">
            <div className={`calendar-day-num${isToday ? " today" : ""}`}>
              {day}
            </div>
            {dayEvents.slice(0, 3).map((e) => (
              <div
                key={e.id}
                className="calendar-event"
                onClick={() => onEventClick(e)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onEventClick(e);
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
  );
}
