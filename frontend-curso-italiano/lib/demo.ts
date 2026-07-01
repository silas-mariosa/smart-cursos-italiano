export const isDemoMode = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export const DEFAULT_TENANT_SLUG = "studio-italiano";
