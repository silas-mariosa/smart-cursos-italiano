export interface Flashcard {
  id: string;
  lessonId: string;
  front: string;
  back: string;
  hint?: string;
}

export interface SimulatorScenario {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  setting: string;
  openingLine: string;
  suggestedResponses: string[];
  teacherHint: string;
}

export type LiveSessionStatus = "scheduled" | "waiting" | "live" | "ended";

export type LiveSessionRecurrenceUnit = "day" | "week" | "month";

export interface LiveSessionRecurrence {
  interval: number;
  unit: LiveSessionRecurrenceUnit;
  seriesId?: string;
}

export interface LiveSessionParticipant {
  id: string;
  name: string;
  avatar: string;
  role: "teacher" | "student";
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeaking?: boolean;
}

export type LiveSessionType = "group" | "individual";

export interface LiveSessionSeries {
  id: string;
  tenantId: string;
  title: string;
  sessionType: LiveSessionType;
  recurrence: LiveSessionRecurrence;
  courseId?: string;
  groupId?: string;
  studentId?: string;
}

export interface LiveSession {
  id: string;
  tenantId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  instructorName: string;
  instructorAvatar: string;
  scheduledAt: string;
  durationMinutes: number;
  status: LiveSessionStatus;
  meetCode: string;
  topic: string;
  lessonId?: string;
  sessionType: LiveSessionType;
  seriesId?: string;
  isException?: boolean;
  recordingUrl?: string;
  recordingPublished: boolean;
  recurrence?: LiveSessionRecurrence;
  participants: LiveSessionParticipant[];
}

export interface LiveRecording {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  videoUrl: string;
  durationMinutes: number;
  published: boolean;
  source: "session_replay" | "library";
  liveSessionId?: string;
  createdAt: string;
}
