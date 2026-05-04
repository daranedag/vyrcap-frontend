/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INSFORGE_URL?: string;
  readonly VITE_INSFORGE_ANON_KEY?: string;
  readonly VITE_MOODLE_URL?: string;
  readonly VITE_PAYMENT_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
