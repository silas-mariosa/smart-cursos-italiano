import type { Tenant } from "./types";

export const defaultTenant: Tenant = {
  id: "tenant-studio-italiano",
  slug: "studio-italiano",
  name: "Studio Italiano",
  logoUrl: "/studio-italiano-logo.svg",
  primaryColor: "#2D5A3D",
  secondaryColor: "#F5F0E8",
  heroTitle: "Fale italiano com confiança — do café ao aeroporto",
  heroSubtitle:
    "Aprenda italiano com methodologia conversacional, professores nativos e exercícios práticos para o dia a dia.",
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
    {
      name: "Roberto Silva",
      quote: "A plataforma é intuitiva e os exercícios fixam muito bem o vocabulário.",
      avatar: "RS",
    },
  ],
};
