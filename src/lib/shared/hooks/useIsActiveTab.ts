import { useEffect, useState } from 'react';

import type { Message } from '../types/Message';

export function useIsActiveTab() {
	const [isActiveTab, setActiveTab] = useState(false);

	useEffect(() => {
		chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB' }, ({ isActive }) => {
			setActiveTab(isActive);
		});

		function handleActiveTabChange(message: Message) {
			if (message.type === 'event' && (message.event as string) === 'ACTIVE_TAB_CHANGED') {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const isActive = message.payload as any;
				setActiveTab(isActive);
			}
		}

		chrome.runtime.onMessage.addListener(handleActiveTabChange);

		return () => {
			chrome.runtime.onMessage.removeListener(handleActiveTabChange);
		};
	}, []);

	return isActiveTab;
}
