import type { AppCommands } from './Commands';

/**
 * Объект сообщения из chrome.runtime.onMessage
 */
export type Message = CommandMessage | EventMessage | MessageOf;

// export type CommandMessage = {
// 	[K in keyof AppCommands]: {
// 		type: 'command';
// 		command: K;
// 		payload: AppCommands[K];
// 	}
// }[keyof AppCommands];

export type CommandMessage<K extends keyof AppCommands = keyof AppCommands> =
	K extends keyof AppCommands
		? AppCommands[K] extends void
			? {
					type: 'command';
					command: K;
					payload?: never;
				}
			: {
					type: 'command';
					command: K;
					payload: AppCommands[K];
				}
		: never;

export type EventMessage<K extends keyof Events = keyof Events> = K extends keyof Events
	? Events[K] extends void
		? {
				type: 'event';
				event: K;
				payload?: never;
			}
		: {
				type: 'event';
				event: K;
				payload: Events[K];
			}
	: never;

type Messages = {
	checkContentScriptInjected: 'injected';
	GET_ACTIVE_TAB: {
		tabId: number;
	};
	OPEN_SIDEPANEL: void;
	WINDOW_RELOAD: void;
	GO_NEXT_TAB: void;
	GO_PREV_TAB: void;
};

type MessageOf<T extends keyof Messages = keyof Messages> = T extends keyof Messages
	? Messages[T] extends void
		? {
				type: T;
				payload?: never;
			}
		: {
				type: T;
				payload: Messages[T];
			}
	: never;

type Events = {
	recognizedText: string;
	ACTIVE_TAB_CHANGED: {
		isActive: boolean;
	};
};
