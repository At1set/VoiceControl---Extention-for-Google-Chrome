declare namespace chrome.sidePanel {
	/**
	 * Fired when the extension's side panel is closed.
	 * @since Chrome 142
	 */
	const onClosed: chrome.events.Event<(info: chrome.sidePanel.PanelClosedInfo) => void>;
}
