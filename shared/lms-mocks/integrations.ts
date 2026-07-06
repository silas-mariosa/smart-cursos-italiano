import type { IntegrationProvider, TenantIntegration, WebhookEvent } from "./types";

export function buildWebhookUrl(tenantSlug: string, provider: IntegrationProvider): string {
  return `https://api.demo.lms/webhooks/${tenantSlug}/${provider}`;
}

export function createDefaultIntegration(
  tenantSlug: string,
  provider: IntegrationProvider,
): TenantIntegration {
  return {
    provider,
    enabled: false,
    webhookUrl: buildWebhookUrl(tenantSlug, provider),
    webhookSecret: `whsec_${Math.random().toString(36).slice(2, 14)}`,
    productMappings: [],
  };
}

export function generateProvisionalPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 8; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export const seedWebhookEvents: WebhookEvent[] = [];
