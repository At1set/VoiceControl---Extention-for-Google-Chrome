import type { AppCommands } from '@/background/bus/commands';

export type Message<T extends keyof Messages = keyof Messages> =
	| CommandMessage
	| EventMessage
	| (Messages[T] extends void
			? {
					type: T;
				}
			: {
					type: T;
					payload: Messages[T];
				});

type CommandMessage<T extends keyof AppCommands = keyof AppCommands> = {
	type: 'command';
	command: T;
	payload: AppCommands[T];
};

type EventMessage<T extends keyof Events = keyof Events> = {
	type: 'event';
	event: T;
	payload: Events[T];
};

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

type Events = {
	recognizedText: string;
};
