import { builtInCommands } from '@/domain/builtInCommands';
import { CommandEngine } from '@/domain/CommandEngine';
import { bus } from '@/lib/shared/bus';
import type { CommandMessage, Message } from '@/lib/shared/types/Message';

import { State } from './utils/State';

// При обновлении/установке расширения, браузера
chrome.runtime.onInstalled.addListener((details) => {
	console.log('Welcome to chrome ext voice control. Have a nice day!');
	if (details.reason === 'install') {
		chrome.tabs.query({}, (tabs) => {
			tabs.forEach((tab) => {
				if (tab.id) {
					chrome.tabs.reload(tab.id);
				}
			});
		});
		chrome.tabs.create({ url: 'src/pages/VC/index.html' });
	}
});

initBadge();

chrome.action.onClicked.addListener(() => {
	openVCPage(() => startRecording());
});

async function openVCPage(callback?: (tab: chrome.tabs.Tab) => void) {
	const state = await State.getState();
	if (state.VCPage.id) return;
	
	chrome.tabs.create({ url: 'src/pages/VC/index.html', active: true }, async (tab) => {
		await State.patchVCPage({
			id: tab.id ?? null,
			windowId: tab.windowId ?? null,
			url: tab.pendingUrl || tab.url || null,
		});

		callback?.(tab);
	});
}

// ====================== ВКЛАДКИ ====================== //
// ==== ПРИ СМЕНЕ ВКЛАДКИ ==== //
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
	updateTabs({ tabId, windowId });
	allowMicrophoneOnSite();
});

// ==== ПРИ ОБНОВЛЕНИИ ВКЛАДКИ ==== //
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.url && tab.active) {
		updateTabs({ tabId, windowId: tab.windowId });
		chrome.tabs.sendMessage(tabId, { type: 'checkContentScriptInjected' }, (response) => {
			if (chrome.runtime.lastError) {
				// Content script is not injected, so inject it
				chrome.scripting.executeScript(
					{
						target: { tabId: tabId },
						files: ['src/content-script/main.tsx.js'],
					},
					(res) => {
						console.log(res);
					},
				);
			}
		});
	}
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
	const state = await State.getState();
	console.log(state, tabId);

	if (tabId === state.VCPage.id) {
		await State.patchVCPage({
			id: null,
			windowId: null,
			url: null,
		});

		stopRecording();
	}
});
// ====================== ВКЛАДКИ ====================== //

chrome.runtime.onMessage.addListener(async (msg: Message, sender, sendResponse) => {
	console.log(msg);
	const state = await State.getState();

	if (msg.type === 'GET_ACTIVE_TAB') {
		console.log(`Получен запрос на получение активной вкладки: ${sender.tab?.id}`);

		sendResponse({
			isActive: sender.tab?.id === state.lastActiveTabId,
		});
	} else if (msg.type === 'OPEN_SIDEPANEL') {
		try {
			const isSuccess = await tryOpenSidePanel({
				windowId: state.lastWindowId,
				tabId: state.lastActiveTabId,
			});
			sendResponse(isSuccess);
		} catch {
			sendResponse(false);
		}
	} else if (msg.type === 'event' && msg.event === 'recognizedText') {
		const result = commandEngine.process(msg.payload);
		if (result) {
			const [command, payload] = result;
			/**
			 * emit command
			 */
			bus.emit(command.emit, payload);

			const message: Message = {
				type: 'command',
				command: command.emit,
				payload,
			} as CommandMessage;

			chrome.runtime.sendMessage(message);

			if (state.lastActiveTabId !== null) {
				chrome.tabs.sendMessage(state.lastActiveTabId, message);
			}
		}
		sendResponse();
	}
});

const commandEngine = new CommandEngine([...builtInCommands]);
import './features/closePage';
import './features/tab-navigation';

chrome.storage.local.onChanged.addListener((changes) => {
	console.log('[storage change]', 'changes:', changes, 'stack:', new Error().stack);
});

function initBadge() {
	chrome.storage.local.get('isRecording', ({ isRecording }) => {
		chrome.storage.local.set({ isRecording: false });
		chrome.action.setBadgeText({ text: isRecording ? 'ON' : '' });
		chrome.action.setBadgeBackgroundColor({ color: '#2bd1ff' });
	});
}

/**
 * Обновить активную вкладку
 */
async function updateTabs({ tabId, windowId }: { tabId: number; windowId?: number }) {
	const state = await State.getState();
	// уведомляем старую вкладку
	if (state.lastActiveTabId !== null) {
		chrome.tabs.sendMessage(state.lastActiveTabId, {
			type: 'ACTIVE_TAB_CHANGED',
			data: {
				isActive: false,
			},
		});
	}

	// уведомляем новую вкладку
	chrome.tabs.sendMessage(tabId, {
		type: 'ACTIVE_TAB_CHANGED',
		data: {
			isActive: true,
		},
	});

	await State.setState({
		lastActiveTabId: tabId,
		lastWindowId: windowId ?? state.lastWindowId,
	});
}

// =============== БОКОВАЯ ПАНЕЛЬ =============== //
const SidePanel = {
	isOpen: false,
};

async function tryOpenSidePanel(
	{
		windowId = null,
		tabId = null,
	}: {
		windowId?: number | null;
		tabId?: number | null;
	},
	onerror?: (error: unknown) => void,
): Promise<boolean> {
	if (windowId === null && tabId === null) return false;

	try {
		if (windowId !== null) {
			await chrome.sidePanel.open({ windowId });
		} else {
			await chrome.sidePanel.open({ tabId: tabId! });
		}

		return true;
	} catch (e) {
		console.warn('Не удалось открыть боковую панель:', e);
		onerror?.(e);
		return false;
	}
}

chrome.sidePanel.onOpened.addListener(() => {
	SidePanel.isOpen = true;
	startRecording();
});

chrome.sidePanel.onClosed.addListener(() => {
	SidePanel.isOpen = false;
	stopRecording();
});

async function startRecording() {
	chrome.storage.local.set({ isRecording: true });
	chrome.action.setBadgeText({ text: 'ON' });
	allowMicrophoneOnSite();
}

function stopRecording() {
	chrome.storage.local.set({ isRecording: false });
	chrome.action.setBadgeText({ text: '' });
}
// =============== БОКОВАЯ ПАНЕЛЬ =============== //

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
