import { defineConfig, WxtViteConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: () => ({
    plugins: [
      tailwindcss(),
    ],
  } as WxtViteConfig),
  manifest: () => ({
    name: "Leetcode sync",
    description: "Sync solved leetcode problems to github",
    version: '1.0.0',
    background: {
      service_worker: 'src/background/index.js',
    },
    permissions: ['tabs', 'storage', 'activeTab', 'scripting', "webRequest"],
    host_permissions: [
      "https://leetcode.com/*",
      "https://github.com/*",
      "https://api.github.com/*",
    ],
  }),
  modules: ['@wxt-dev/module-react'],
});

