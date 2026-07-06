import type {
  LiveSession,
  LiveSessionRecurrence,
  LiveSessionRecurrenceUnit,
  LiveSessionType,
} from "./practice-types";

export interface GenerateOccurrencesInput {
  startAt: string;
  durationMinutes: number;
  recurrence?: LiveSessionRecurrence;
  maxOccurrences?: number;
}

export function addRecurrenceInterval(
  date: Date,
  interval: number,
  unit: LiveSessionRecurrenceUnit,
): Date {
  const next = new Date(date);
  if (unit === "day") next.setDate(next.getDate() + interval);
  else if (unit === "week") next.setDate(next.getDate() + interval * 7);
  else next.setMonth(next.getMonth() + interval);
  return next;
}

export function generateOccurrenceDates(input: GenerateOccurrencesInput): string[] {
  const start = new Date(input.startAt);
  const dates: string[] = [start.toISOString()];
  if (!input.recurrence) return dates;

  const count = input.maxOccurrences ?? 4;
  let current = start;
  for (let i = 1; i < count; i++) {
    current = addRecurrenceInterval(current, input.recurrence.interval, input.recurrence.unit);
    dates.push(current.toISOString());
  }
  return dates;
}

export function inferSessionType(participantStudentCount: number): LiveSessionType {
  return participantStudentCount <= 1 ? "individual" : "group";
}

export function sessionsForWeek(sessions: LiveSession[], weekStart: Date): LiveSession[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return sessions.filter((s) => {
    const d = new Date(s.scheduledAt);
    return d >= weekStart && d < weekEnd;
  });
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${fmt(weekStart)} – ${fmt(end)}`;
}

export function hourLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
