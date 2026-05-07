import path from 'node:path';

import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';

import manifest from './manifest.config.ts';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), crx({ manifest }), zip({ outDir: 'release', outFileName: 'release.zip' })],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@images': path.resolve(__dirname, './src/lib/shared/assets/images'),
			'@icons': path.resolve(__dirname, './src/lib/shared/assets/icons'),
		},
	},
	server: {
		cors: {
			origin: [/chrome-extension:\/\//],
		},
	},
	build: {
		rollupOptions: {
			input: {
				welcome: 'src/pages/Welcome/index.html',
			},
		},
	},
});
