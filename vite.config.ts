import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_PAGES === 'true' && repoBase ? `/${repoBase}/` : '/';

export default defineConfig({
  plugins: [react()],
  base,
});
