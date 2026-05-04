import { createClient } from '@insforge/sdk';

export type RuntimeEnv = {
  INSFORGE_URL: string;
  INSFORGE_SERVICE_KEY: string;
  MERCADO_PAGO_ACCESS_TOKEN: string;
  PUBLIC_SITE_URL: string;
  MERCADO_PAGO_WEBHOOK_URL?: string;
};

export function getEnv(): RuntimeEnv {
  const env = {
    INSFORGE_URL: Deno.env.get('INSFORGE_URL') ?? '',
    INSFORGE_SERVICE_KEY: Deno.env.get('INSFORGE_SERVICE_KEY') ?? '',
    MERCADO_PAGO_ACCESS_TOKEN: Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') ?? '',
    PUBLIC_SITE_URL: Deno.env.get('PUBLIC_SITE_URL') ?? '',
    MERCADO_PAGO_WEBHOOK_URL: Deno.env.get('MERCADO_PAGO_WEBHOOK_URL') ?? undefined,
  };

  const missing = Object.entries(env)
    .filter(([key, value]) => key !== 'MERCADO_PAGO_WEBHOOK_URL' && !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Variables faltantes: ${missing.join(', ')}`);
  }

  return env;
}

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      ...init.headers,
    },
  });
}

export function getInsforgeAdmin(env: RuntimeEnv) {
  return createClient({
    baseUrl: env.INSFORGE_URL,
    anonKey: env.INSFORGE_SERVICE_KEY,
  });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error('Body JSON invalido.');
  }
}
