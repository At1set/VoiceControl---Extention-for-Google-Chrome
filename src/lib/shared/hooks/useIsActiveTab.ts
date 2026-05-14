import { useEffect, useState } from 'react';

import type { Message } from '../types/Message';

export function useIsActiveTab() {
	const [isActiveTab, setActiveTab] = useState(false);

	useEffect(() => {
		chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB' }, ({ isActive }) => {
			setActiveTab(isActive);
		});

		function handleActiveTabChange(
			message: Message,
			_: chrome.runtime.MessageSender,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			sendResponse: (response?: any) => void,
		) {
			if (message.type === 'event' && message.event === 'ACTIVE_TAB_CHANGED') {
				const { isActive } = message.payload;
				setActiveTab(isActive);
				sendResponse();
			}
		}

		chrome.runtime.onMessage.addListener(handleActiveTabChange);

		return () => {
			chrome.runtime.onMessage.removeListener(handleActiveTabChange);
		};
	}, []);

	return isActiveTab;
}
