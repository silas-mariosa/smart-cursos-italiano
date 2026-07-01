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

export interface LiveSessionParticipant {
  id: string;
  name: string;
  avatar: string;
  role: "teacher" | "student";
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeaking?: boolean;
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
  participants: LiveSessionParticipant[];
}
