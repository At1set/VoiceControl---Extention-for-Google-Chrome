export type RequestType = 'GET_ACTIVE_TAB' | 'SET_RECORDING';

export const RequestTypes: doubled<RequestType> = {
	GET_ACTIVE_TAB: 'GET_ACTIVE_TAB',
	SET_RECORDING: 'SET_RECORDING',
} as const;

export type EventsPayload = {
	[K in RequestType]: K extends 'SET_RECORDING' ? boolean : never;
};

type doubled<keys extends PropertyKey = string> = {
	[K in keys]: K;
};

export type Action = 'OPEN_SIDE_PANEL' | 'GO_NEXT_TAB' | 'GO_PREV_TAB';
