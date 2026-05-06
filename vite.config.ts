import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const normalizeBase = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const base = normalizeBase(process.env.VITE_BASE_PATH ?? './');

export default defineConfig({
  plugins: [react()],
  base,
});
