"use client";

import { useEffect, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type { EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { LiveSession, LiveSessionStatus } from "@lms-mocks/practice-types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const statusEventStyle: Record<
  LiveSessionStatus,
  Pick<EventInput, "backgroundColor" | "borderColor" | "textColor">
> = {
  scheduled: {
    backgroundColor: "#64748b",
    borderColor: "#475569",
    textColor: "#ffffff",
  },
  waiting: {
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
    textColor: "#1c1917",
  },
  live: {
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
    textColor: "#ffffff",
  },
  ended: {
    backgroundColor: "#059669",
    borderColor: "#047857",
    textColor: "#ffffff",
  },
};

function sessionToEvent(session: LiveSession): EventInput {
  const start = new Date(session.scheduledAt);
  const end = new Date(start.getTime() + session.durationMinutes * 60_000);

  return {
    id: session.id,
    title: session.title,
    start: start.toISOString(),
    end: end.toISOString(),
    ...statusEventStyle[session.status],
    extendedProps: { session },
  };
}

function renderEventContent(eventInfo: EventContentArg) {
  const session = eventInfo.event.extendedProps.session as LiveSession | undefined;
  const typeLabel = session?.sessionType === "individual" ? "1:1" : "Grupo";
  const recordingBadge =
    session?.status === "ended" ? (session.recordingPublished ? " 📹" : " 🔒") : "";

  return (
    <div className="fc-event-main-frame overflow-hidden px-0.5 py-px leading-tight">
      {eventInfo.timeText ? (
        <div className="fc-event-time text-[10px] font-medium opacity-90">{eventInfo.timeText}</div>
      ) : null}
      <div className="fc-event-title fc-sticky truncate text-xs font-semibold">
        {eventInfo.event.title}
        {recordingBadge}
      </div>
      {session ? (
        <div className="text-[10px] opacity-80 truncate">{typeLabel}</div>
      ) : null}
    </div>
  );
}

export interface LiveSessionsCalendarProps {
  sessions: LiveSession[];
  onCreateSession: (date: Date) => void;
  onSessionClick: (session: LiveSession) => void;
  className?: string;
}

export function LiveSessionsCalendar({
  sessions,
  onCreateSession,
  onSessionClick,
  className,
}: LiveSessionsCalendarProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const events = useMemo(() => sessions.map(sessionToEvent), [sessions]);

  const initialView = isMobile ? "listWeek" : "timeGridWeek";

  const headerToolbar = useMemo(
    () =>
      isMobile
        ? {
            left: "prev,next",
            center: "title",
            right: "today",
          }
        : {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          },
    [isMobile],
  );

  const footerToolbar = useMemo(
    () =>
      isMobile
        ? {
            center: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }
        : undefined,
    [isMobile],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const syncSize = () => {
      calendarRef.current?.getApi()?.updateSize();
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(node);
    window.addEventListener("resize", syncSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncSize);
    };
  }, []);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    const viewType = api.view.type;
    if (isMobile && (viewType === "timeGridWeek" || viewType === "dayGridMonth")) {
      api.changeView("listWeek");
    }

    api.updateSize();
  }, [isMobile]);

  function handleDateClick(info: DateClickArg) {
    onCreateSession(info.date);
  }

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault();
    const session = info.event.extendedProps.session as LiveSession | undefined;
    if (session) onSessionClick(session);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "live-sessions-calendar flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card p-2 sm:p-4",
        className,
      )}
    >
      <div className="min-h-0 min-w-0 flex-1">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          locale={ptBrLocale}
          initialView={initialView}
          headerToolbar={headerToolbar}
          {...(isMobile ? { footerToolbar } : { footerToolbar: false as const })}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            list: "Lista",
          }}
          views={{
            listWeek: { buttonText: "Lista" },
            timeGridWeek: {
              dayMinWidth: isMobile ? 96 : 120,
            },
            timeGridDay: {
              dayMinWidth: 80,
            },
            dayGridMonth: {
              dayMaxEvents: isMobile ? 2 : true,
            },
          }}
          firstDay={1}
          slotMinTime="08:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          nowIndicator
          height="100%"
          expandRows
          stickyHeaderDates
          handleWindowResize
          windowResizeDelay={100}
          dayMaxEvents
          events={events}
          eventContent={renderEventContent}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          selectable={false}
          navLinks
          weekNumbers={false}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>
    </div>
  );
}
