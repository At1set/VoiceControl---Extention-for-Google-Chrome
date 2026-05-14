import { bus } from '@/lib/shared/bus';

bus.on('page.close', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]?.id) {
			chrome.tabs.remove(tabs[0].id);
		}
	});
});
