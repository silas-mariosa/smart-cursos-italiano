import type { SimulatorScenario } from "./practice-types";

export const simulatorScenarios: SimulatorScenario[] = [
  {
    id: "sim-1",
    lessonId: "lesson-a1-1",
    title: "Apresentação no café",
    description: "Você entrou em um café em Roma e o barista cumprimenta você.",
    setting: "Caffè Centrale, Roma",
    openingLine: "Buongiorno! Cosa desidera?",
    suggestedResponses: ["Buongiorno! Un caffè, per favore.", "Ciao! Vorrei un cappuccino."],
    teacherHint: "Use 'Buongiorno' de manhã e sempre termine com 'per favore'.",
  },
  {
    id: "sim-2",
    lessonId: "lesson-a1-2",
    title: "Encontro com um amigo",
    description: "Seu amigo italiano Marco te cumprimenta na rua.",
    setting: "Piazza Navona, Roma",
    openingLine: "Ciao! Come stai?",
    suggestedResponses: ["Ciao Marco! Bene, grazie. E tu?", "Sto bene, grazie mille!"],
    teacherHint: "'Come stai?' é informal — responda com 'Bene, grazie'.",
  },
  {
    id: "sim-3",
    lessonId: "lesson-a1-3",
    title: "Pedindo no restaurante",
    description: "O garçom se aproxima da sua mesa para anotar o pedido.",
    setting: "Trattoria da Mario, Firenze",
    openingLine: "Buonasera! Siete pronti per ordinare?",
    suggestedResponses: [
      "Sì, vorrei la pasta al pomodoro, per favore.",
      "Vorrei un tavolo... no, vorrei la pizza margherita.",
    ],
    teacherHint: "Comece com 'Vorrei...' para pedir educadamente.",
  },
];

import { getStoredLessonPracticeMap } from "./storage";

export function getSimulatorByLesson(lessonId: string): SimulatorScenario[] {
  const stored = getStoredLessonPracticeMap()[lessonId];
  if (stored) {
    if (!stored.modules?.simulator?.enabled) return [];
    if (stored.scenarios.length > 0) return stored.scenarios;
  }
  return simulatorScenarios.filter((s) => s.lessonId === lessonId);
}
