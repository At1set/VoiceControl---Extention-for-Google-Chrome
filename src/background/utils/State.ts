export type RuntimeState = {
	lastActiveTabId: number | null;
	lastWindowId: number | null;

	VCPage: {
		id: number | null;
		windowId: number | null;
		url: string | null;
	};

	sidePanelOpen: boolean;
};

const DEFAULT_STATE: RuntimeState = {
	lastActiveTabId: null,
	lastWindowId: null,

	VCPage: {
		id: null,
		windowId: null,
		url: null,
	},

	sidePanelOpen: false,
};

export const State = {
	async getState(): Promise<RuntimeState> {
		const state = await chrome.storage.session.get(DEFAULT_STATE);
		console.log(state);

		return {
			...DEFAULT_STATE,
			...state,
		};
	},

	async setState(patch: Partial<RuntimeState>) {
		const current = await this.getState();
		console.log('setState');
		await chrome.storage.session.set({
			...current,
			...patch,
		});
	},

	async patchVCPage(patch: Partial<RuntimeState['VCPage']>) {
		const state = await this.getState();
		console.log('patch', {
			...state.VCPage,
			...patch,
		});

		console.log(
			await chrome.storage.session.set({
				VCPage: {
					...state.VCPage,
					...patch,
				},
			}),
		);
	},
};
