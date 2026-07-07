import type {
  LiveSession,
  LiveSessionStatus,
  LiveSessionType,
} from "@lms-mocks/practice-types";

export type LiveSessionPeriodFilter = "all" | "upcoming" | "past" | "today";
export type LiveSessionSortField = "date" | "title" | "course";

export interface LiveSessionsFilters {
  search: string;
  statusFilter: LiveSessionStatus | "all";
  typeFilter: LiveSessionType | "all";
  courseFilter: string;
  periodFilter: LiveSessionPeriodFilter;
  sortField: LiveSessionSortField;
  sortAsc: boolean;
}

function matchesSearch(session: LiveSession, query: string): boolean {
  if (!query) return true;
  const haystack = [
    session.title,
    session.courseTitle,
    session.topic,
    session.description,
    session.instructorName,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function isToday(date: Date, now: Date): boolean {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function matchesPeriod(session: LiveSession, period: LiveSessionPeriodFilter): boolean {
  if (period === "all") return true;
  const now = new Date();
  const scheduled = new Date(session.scheduledAt);
  const end = new Date(scheduled.getTime() + session.durationMinutes * 60_000);

  if (period === "today") return isToday(scheduled, now);
  if (period === "upcoming") return end >= now && session.status !== "ended";
  if (period === "past") return end < now || session.status === "ended";
  return true;
}

export function filterLiveSessions(
  sessions: LiveSession[],
  filters: LiveSessionsFilters,
): LiveSession[] {
  const query = filters.search.trim().toLowerCase();

  const filtered = sessions.filter((session) => {
    if (filters.statusFilter !== "all" && session.status !== filters.statusFilter) return false;
    if (filters.typeFilter !== "all" && session.sessionType !== filters.typeFilter) return false;
    if (filters.courseFilter !== "all" && session.courseId !== filters.courseFilter) return false;
    if (!matchesPeriod(session, filters.periodFilter)) return false;
    if (!matchesSearch(session, query)) return false;
    return true;
  });

  return sortLiveSessions(filtered, filters.sortField, filters.sortAsc);
}

export function sortLiveSessions(
  sessions: LiveSession[],
  field: LiveSessionSortField,
  asc: boolean,
): LiveSession[] {
  const direction = asc ? 1 : -1;

  return [...sessions].sort((a, b) => {
    switch (field) {
      case "date":
        return (
          direction *
          (new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        );
      case "title":
        return direction * a.title.localeCompare(b.title, "pt-BR");
      case "course":
        return direction * a.courseTitle.localeCompare(b.courseTitle, "pt-BR");
      default:
        return 0;
    }
  });
}

export { paginate } from "@/lib/practice-hub-utils";
