import { defineManifest } from '@crxjs/vite-plugin';

import pkg from './package.json';

export default defineManifest({
	manifest_version: 3,
	name: pkg.name,
	version: pkg.version,
	action: {
		// default_popup: 'src/popup/index.html',
		default_title: 'Описание расширения...',
	},
	side_panel: {
		default_path: 'src/side-panel/index.html',
	},
	background: {
		service_worker: 'src/background/background.ts',
		type: 'module',
	},
	permissions: ['activeTab', 'storage', 'scripting', 'sidePanel', 'contentSettings'],
	content_scripts: [
		{
			matches: ['<all_urls>'],
			js: ['src/content-script/main.tsx'],
		},
	],
});
