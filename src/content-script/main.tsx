import './script';

import { type CSSProperties, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const existing = document.getElementById('extension-root');
const container = existing ?? document.createElement('div');
if (!existing) {
	container.id = 'extension-root';
	Object.assign(container.style, {
		position: 'fixed',
		zIndex: '9999',
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
	} as CSSProperties);
	document.body.prepend(container);
}

createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
