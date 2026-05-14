import { bus } from '@/lib/shared/bus';

import { State } from '../utils/State';

async function goPrevTab() {
	console.log(123);

	const state = await State.getState();
	if (state.lastActiveTabId == null || state.lastWindowId == null) return;

	chrome.tabs.query({ windowId: state.lastWindowId }, (tabs) => {
		const index = tabs.findIndex((t) => t.id === state.lastActiveTabId);
		if (index === -1) return;

		const prevTab = tabs[index - 1] ?? tabs[tabs.length - 1]; // зацикливание
		if (!prevTab.id) return;

		chrome.tabs.update(prevTab.id, { active: true });
	});
}

async function goNextTab() {
	console.log(123);

	const state = await State.getState();
	if (state.lastActiveTabId == null || state.lastWindowId == null) return;

	chrome.tabs.query({ windowId: state.lastWindowId }, (tabs) => {
		const index = tabs.findIndex((t) => t.id === state.lastActiveTabId);
		if (index === -1) return;

		const nextTab = tabs[index + 1] ?? tabs[0]; // зацикливание
		if (nextTab.id) {
			chrome.tabs.update(nextTab.id, { active: true });
		}
	});
}

bus.on('navigation.nextTab', goNextTab);
bus.on('navigation.previousTab', goPrevTab);
