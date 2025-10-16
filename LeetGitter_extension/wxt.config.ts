import { defineConfig, WxtViteConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: () => ({
    plugins: [
      tailwindcss(),
    ],
  } as WxtViteConfig),
  manifest: () => ({
    name: "LeetGitter",
    description: "Automatically Sync Your LeetCode Solutions to GitHub",
    version: '1.0.0',
    background: {
      service_worker: 'src/background/index.js',
    },
    permissions: ['tabs', 'storage', 'activeTab'],
    host_permissions: [
      "https://leetcode.com/*",
    ],
    web_accessible_resources: [
      {
        "resources": ["injected.js"],
        "matches": ["https://leetcode.com/*"]
      }
    ]
  }),
  modules: ['@wxt-dev/module-react'],
});

