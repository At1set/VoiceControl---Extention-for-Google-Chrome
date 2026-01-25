import type { ActionMessage, RequestMessage } from '@/lib/shared/types/message.types';

import {
	type Action,
	type EventsPayload,
	type RequestType,
	RequestTypes,
} from './model/EventTypes';

// ==== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==== //
let lastActiveTabId: number | null = null;
let lastWindowId: number | null = null;
// ==== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==== //

// При обновлении/установке расширения, браузера
chrome.runtime.onInstalled.addListener((details) => {
	console.log('Welcome to chrome ext voice control. Have a nice day!');
	if (details.reason === 'install') {
		chrome.tabs.create({ url: chrome.runtime.getURL('src/pages/Welcome/index.html') });
	}
});

initBadge();

// ====================== ВКЛАДКИ ====================== //
// ==== ПРИ СМЕНЕ ВКЛАДКИ ==== //
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
	updateTabs({ tabId, windowId });
	allowMicrophoneOnSite();
});

// ==== ПРИ ОБНОВЛЕНИИ ВКЛАДКИ ==== //
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.active) {
		updateTabs({ tabId, windowId: tab.windowId });
		chrome.storage.local.get('isRecording', ({ isRecording }) => {
			if (isRecording) {
				tryOpenSidePanel({ tabId: lastActiveTabId, windowId: lastWindowId });
				allowMicrophoneOnSite();
			}
		});
	}
});
// ====================== ВКЛАДКИ ====================== //

chrome.runtime.onMessage.addListener(
	<ActionType extends Action, T extends RequestType>(
		message: ActionMessage<ActionType> | RequestMessage<T>,
		sender: chrome.runtime.MessageSender,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		sendResponse: (response?: any) => void,
	) => {
		// если сообщение для скрипта контента
		if (message.forContentScript && lastActiveTabId)
			return chrome.tabs.sendMessage(lastActiveTabId, message);

		const { data, type } = message;
		switch (type) {
			case 'action':
				return handleActionMessage(data, sender, sendResponse);
			case 'request':
				return hanleRequestMessage(data, sender, sendResponse);
		}
	},
);

function handleActionMessage<T extends Action>(
	message: {
		action: T;
		body: never;
	},
	_sender: chrome.runtime.MessageSender,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_sendResponse: (response?: any) => void,
) {
	switch (message.action) {
		case 'OPEN_SIDE_PANEL':
			return tryOpenSidePanel({ tabId: lastActiveTabId, windowId: lastWindowId });

		case 'GO_PREV_TAB':
			return goPrevTab();

		case 'GO_NEXT_TAB':
			return goNextTab();

		default:
			break;
	}
}

function hanleRequestMessage<T extends RequestType>(
	message: {
		requestType: T;
		payload: EventsPayload[T];
	},
	sender: chrome.runtime.MessageSender,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sendResponse: (response?: any) => void,
) {
	switch (message.requestType) {
		case 'GET_ACTIVE_TAB':
			console.log(`Получен запрос на получение активной вкладки: ${sender.tab?.id}`);

			sendResponse({
				isActive: sender.tab?.id === lastActiveTabId,
			});
			break;

		case 'SET_RECORDING': {
			const isRecording = message.payload;
			
			break;
		}

		default:
			break;
	}
}

chrome.storage.local.onChanged.addListener((changes) => {
	console.log('[storage change]', 'changes:', changes, 'stack:', new Error().stack);
	if (changes.isRecording) {
		const isRecording = changes.isRecording.newValue as boolean;
		chrome.action.setBadgeText({ text: isRecording ? 'ON' : '' });
		allowMicrophoneOnSite();
	}
});

function initBadge() {
	chrome.storage.local.get('isRecording', ({ isRecording }) => {
		// если значение уже есть, не трогаем
		if (typeof isRecording === 'undefined') {
			chrome.storage.local.set({ isRecording: false });
		}

		chrome.action.setBadgeText({ text: isRecording ? 'ON' : '' });
		chrome.action.setBadgeBackgroundColor({ color: '#2bd1ff' });
	});
}

/**
 * Обновить активную вкладку
 */
function updateTabs({ tabId, windowId }: { tabId: number; windowId?: number }) {
	// уведомляем старую вкладку
	if (lastActiveTabId !== null) {
		console.log('Отправлен запрос на СТАРУЮ вкладку');

		chrome.tabs.sendMessage(lastActiveTabId, {
			type: 'ACTIVE_TAB_CHANGED',
			data: {
				isActive: false,
			},
		});
	}

	console.log('Отправлен запрос на НОВУЮ вкладку');
	// уведомляем новую вкладку
	chrome.tabs.sendMessage(tabId, {
		type: 'ACTIVE_TAB_CHANGED',
		data: {
			isActive: true,
		},
	});

	lastActiveTabId = tabId;
	if (typeof windowId !== 'undefined') lastWindowId = windowId;
}

async function tryOpenSidePanel(
	{
		windowId,
		tabId,
	}: {
		windowId: number | null;
		tabId: number | null;
	},
	onerror?: (error: unknown) => void,
) {
	if (windowId === null || tabId === null) return;
	try {
		await chrome.sidePanel.open({ windowId });
	} catch (e) {
		console.warn('Не удалось открыть боковую панель: ', e);
		onerror?.(e);
	}
}

function allowMicrophoneOnSite() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const tab = tabs[0];
		if (!tab || !tab.url) return;
		if (tab.url.startsWith('chrome://')) return;

		const url = tab.url;
		const incognito = tab.incognito;

		// Формируем pattern
		const pattern = tab.url.startsWith('file:') ? tab.url : new URL(tab.url).origin + '/*';

		chrome.contentSettings.microphone.get(
			{
				primaryUrl: url,
				incognito: incognito,
			},
			(details) => {
				console.log(`[microphone allow] for url ${url}, pattern ${pattern}`);
				if (details.setting !== 'allow') {
					chrome.contentSettings.microphone.set({
						primaryPattern: pattern,
						setting: 'allow',
						scope: incognito ? 'incognito_session_only' : 'regular',
					});
				}
			},
		);
	});
}

function goPrevTab() {
	if (lastActiveTabId == null || lastWindowId == null) return;

	chrome.tabs.query({ windowId: lastWindowId }, (tabs) => {
		const index = tabs.findIndex((t) => t.id === lastActiveTabId);
		if (index === -1) return;

		const prevTab = tabs[index - 1] ?? tabs[tabs.length - 1]; // зацикливание
		if (!prevTab.id) return;

		chrome.tabs.update(prevTab.id, { active: true });
	});
}

function goNextTab() {
	if (lastActiveTabId == null || lastWindowId == null) return;

	chrome.tabs.query({ windowId: lastWindowId }, (tabs) => {
		const index = tabs.findIndex((t) => t.id === lastActiveTabId);
		if (index === -1) return;

		const nextTab = tabs[index + 1] ?? tabs[0]; // зацикливание
		if (nextTab.id) {
			chrome.tabs.update(nextTab.id, { active: true });
		}
	});
}
