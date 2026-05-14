import './features/scrollPage';
import './features/reloadPage';

import { bus } from '@/lib/shared/bus';
import type { Message } from '@/lib/shared/types/Message';

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
	console.log(message);

	if (message.type === 'checkContentScriptInjected') sendResponse('injected');
	else if (message.type === 'WINDOW_RELOAD') {
		window.location.reload();
		sendResponse();
	} else if (message.type === 'command') {
		const { command, payload } = message;
		bus.emit(command, payload);
		sendResponse();
	}
});

console.log('CONTENT SCRIPT!');
