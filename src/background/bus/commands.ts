export type AppCommands = {
	'page.close': void;
	'page.reload': void;
	stop: void;

	'page.scroll': {
		direction: 'up' | 'down';
	};

	'navigation.nextTab': void;

	'navigation.previousTab': void;

	'navigation.clickNumber': {
		number: number;
	};

	'tab.open': {
		url: string;
	};
};
