import '@/lib/styles/index.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

import { bus } from '@/background/bus/bus.ts';
import type { Message } from '@/lib/shared/types/Message';

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
	if (message.type === 'command') {
		const { command, payload } = message;
		bus.emit(command, payload);
		sendResponse();
	}
});

bus.on('stop', window.close);
