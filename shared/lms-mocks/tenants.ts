import type { Tenant, TenantSubscription } from "./types";

function subscription(
  tier: TenantSubscription["tier"],
  overrides?: Partial<TenantSubscription>,
): TenantSubscription {
  const now = new Date();
  const next = new Date(now);
  next.setMonth(next.getMonth() + 1);
  return {
    tier,
    status: "active",
    startedAt: "2026-01-15",
    nextBillingDate: next.toISOString().slice(0, 10),
    ...overrides,
  };
}

const sharedLanding = {
  landingFeatures: [
    {
      icon: "users",
      title: "Professores nativos",
      description: "Aulas gravadas e ao vivo com falantes nativos de italiano.",
    },
    {
      icon: "video",
      title: "Aulas em vídeo",
      description: "Conteúdo organizado em módulos progressivos do A1 ao C2.",
    },
    {
      icon: "clipboard",
      title: "Exercícios práticos",
      description: "Quizzes, lacunas e redações com feedback didático.",
    },
  ],
  testimonials: [
    {
      name: "Carla Mendes",
      quote: "Em 3 meses já consigo pedir comida e conversar no hotel em Roma!",
      avatar: "CM",
    },
  ],
};

export const demoTenants: Tenant[] = [
  {
    id: "tenant-studio-italiano",
    slug: "studio-italiano",
    name: "Studio Italiano",
    logoUrl: "/studio-italiano-logo.svg",
    primaryColor: "#2D5A3D",
    secondaryColor: "#F5F0E8",
    heroTitle: "Fale italiano com confiança — do café ao aeroporto",
    heroSubtitle:
      "Aprenda italiano com methodologia conversacional, professores nativos e exercícios práticos para o dia a dia.",
    subscription: subscription("pro"),
    ...sharedLanding,
  },
  {
    id: "tenant-roma-basica",
    slug: "escola-roma-basica",
    name: "Escola Roma Básica",
    logoUrl: "/studio-italiano-logo.svg",
    primaryColor: "#1E4D6B",
    secondaryColor: "#E8F4FC",
    heroTitle: "Italiano do zero — plano essencial",
    heroSubtitle: "Ideal para professores autônomos com turmas pequenas.",
    subscription: subscription("basic"),
    ...sharedLanding,
  },
  {
    id: "tenant-accademia-plus",
    slug: "accademia-italiana-plus",
    name: "Accademia Italiana+",
    logoUrl: "/studio-italiano-logo.svg",
    primaryColor: "#5B3A8C",
    secondaryColor: "#F3EEF9",
    heroTitle: "Prática e correções para sua escola",
    heroSubtitle: "Plano intermediário com exercícios e feedback de redações.",
    subscription: subscription("basic_plus"),
    ...sharedLanding,
  },
  {
    id: "tenant-grupo-linguas",
    slug: "grupo-linguas-enterprise",
    name: "Grupo Línguas Enterprise",
    logoUrl: "/studio-italiano-logo.svg",
    primaryColor: "#1A1A2E",
    secondaryColor: "#F0F0F5",
    heroTitle: "Rede de escolas de idiomas",
    heroSubtitle: "Operação em escala com branding e recursos ilimitados.",
    subscription: subscription("enterprise"),
    ...sharedLanding,
  },
  {
    id: "tenant-custom-academy",
    slug: "custom-academy",
    name: "Custom Academy",
    logoUrl: "/studio-italiano-logo.svg",
    primaryColor: "#B45309",
    secondaryColor: "#FFF7ED",
    heroTitle: "Solução sob medida",
    heroSubtitle: "Plano negociado com limites e módulos personalizados.",
    subscription: subscription("custom", {
      customLabel: "Personalizado — 80 alunos",
      maxStudents: 80,
      maxCourses: 12,
      modules: [
        "overview",
        "courses",
        "students",
        "practice",
        "corrections",
        "live",
        "exerciseBank",
      ],
    }),
    ...sharedLanding,
  },
];

export const defaultTenant = demoTenants[0];

export function getDemoTenant(tenantId: string): Tenant | undefined {
  return demoTenants.find((t) => t.id === tenantId);
}
