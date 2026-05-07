import { bus } from '@/background/bus/bus';
import { builtInCommands } from '@/background/command-engine/built-in-commands';
import { CommandEngine } from '@/background/command-engine/Engine';
import type { Message } from '@/lib/shared/types/Message';

// ==== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==== //
let lastActiveTabId: number | null = null;
let lastWindowId: number | null = null;
const VCPage: {
	id?: null | number;
	windowId?: null | number;
	url?: null | string;
} = {};

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
		chrome.tabs.create({ url: chrome.runtime.getURL('src/pages/Welcome/index.html') });
	}
});

initBadge();

chrome.action.onClicked.addListener(() => {
	openVCPage(() => startRecording());
});

function openVCPage(callback?: (tab: chrome.tabs.Tab) => void) {
	if (VCPage.id) return;
	chrome.tabs.create({ url: 'src/pages/Welcome/index.html', active: true }, (tab) => {
		VCPage.id = tab.id;
		VCPage.url = tab.pendingUrl || tab.url;
		VCPage.windowId = tab.windowId;
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
		chrome.tabs.sendMessage(tabId, { action: 'checkContentScriptInjected' }, (response) => {
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

chrome.tabs.onRemoved.addListener((tabId) => {
	if (tabId === VCPage.id) {
		VCPage.id = null;
		VCPage.windowId = null;
		VCPage.url = null;
		stopRecording();
	}
});
// ====================== ВКЛАДКИ ====================== //

chrome.runtime.onMessage.addListener(async (msg: Message, sender, sendResponse) => {
	console.log(msg);

	if (msg.type === 'GET_ACTIVE_TAB') {
		console.log(`Получен запрос на получение активной вкладки: ${sender.tab?.id}`);

		sendResponse({
			isActive: sender.tab?.id === lastActiveTabId,
		});
	} else if (msg.type === 'OPEN_SIDEPANEL') {
		try {
			const isSuccess = await tryOpenSidePanel({ windowId: lastWindowId, tabId: lastActiveTabId });
			sendResponse(isSuccess);
		} catch {
			sendResponse(false);
		}
	} else if (msg.type === 'event' && msg.event === 'recognizedText') {
		const result = commandEngine.process(msg.payload);
		if (result) {
			const [command, payload] = result;
			const message: Message = {
				type: 'command',
				command: command.emit,
				payload,
			};
			chrome.runtime.sendMessage(message);

			if (lastActiveTabId !== null) {
				chrome.tabs.sendMessage(lastActiveTabId, message);
			}
		}
		sendResponse();
	}
});

const commandEngine = new CommandEngine([...builtInCommands]);

bus.on('page.reload', () => {
	if (lastActiveTabId) chrome.tabs.sendMessage(lastActiveTabId, { action: 'WINDOW_RELOAD' });
});
bus.on('navigation.nextTab', goNextTab);
bus.on('navigation.previousTab', goPrevTab);

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
function updateTabs({ tabId, windowId }: { tabId: number; windowId?: number }) {
	// уведомляем старую вкладку
	if (lastActiveTabId !== null) {
		chrome.tabs.sendMessage(lastActiveTabId, {
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

	lastActiveTabId = tabId;
	if (typeof windowId !== 'undefined') lastWindowId = windowId;
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
