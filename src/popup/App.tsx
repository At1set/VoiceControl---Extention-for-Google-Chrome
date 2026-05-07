import { useState } from 'react';

import { useRecordingState } from '@/lib/shared/hooks/useRecordingState';

import styles from './App.module.scss';

function App() {
	const [isRecording] = useRecordingState();
	const [isPending, setPending] = useState(false);

	function changeRecording() {
		setPending(true);
		const newVal = !isRecording;
		chrome.runtime.sendMessage(
			{ action: newVal ? 'OPEN_SIDEPANEL' : 'CLOSE_SIDEPANEL' },
			(response) => {
				setPending(false);
			},
		);
	}

	return (
		<div className={styles.wrapper}>
			<h1>VOICE _CONTROL_</h1>
			<span className={styles.version}>version 0.0.1 beta</span>
			<button onClick={changeRecording} className={styles.recordButton} disabled={isPending}>
				{!isRecording ? 'Запустить' : 'Остановить'} распознавание речи
			</button>
		</div>
	);
}

export default App;
