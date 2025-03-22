import { defineManifest } from '@crxjs/vite-plugin';


export default defineManifest({
  manifest_version: 3,
  name: 'Reach paglu',
  version: '1.0.0',
  description: 'Reach paglu is a chrome extension using which you can reply to anyone tweet using AI',
  action: {
    default_popup: 'index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module'
  },
  host_permissions: [
    "*://*.twitter.com/*",
    "*://*.x.com/*"
  ],
  content_scripts: [
    {
      matches: [
        "http://*/*",
        "https://*/*"
      ],
      js: ['src/content.ts'],
    }
  ],
  permissions: [
    'activeTab',
    'scripting'
  ]
})
