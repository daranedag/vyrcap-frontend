import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

export const insforge = baseUrl && anonKey ? createClient({ baseUrl, anonKey }) : null;

export const isInsforgeConfigured = Boolean(insforge);
