import type { Message } from '@/lib/shared/types/Message';

import { bus } from '../background/bus/bus';

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
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
