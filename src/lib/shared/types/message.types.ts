import type { Action, EventsPayload, RequestType } from '@/background/model/EventTypes';

export type MessageType = 'action' | 'request';

export interface MessageBase {
	type: MessageType;
	data: Record<string, unknown> | unknown[] | undefined;
	forContentScript?: boolean;
}

export type ActionMessage<ActionType extends Action> = MessageBase & {
	type: 'action';
	data: {
		action: ActionType;
		body: never;
	};
};

export type RequestMessage<T extends RequestType> = MessageBase & {
	type: 'request';
	data: {
		requestType: T;
		payload: EventsPayload[T];
	};
};
