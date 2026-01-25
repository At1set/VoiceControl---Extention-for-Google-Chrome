import { useEffect, useMemo, useRef, useState } from 'react';

import { SpeechRecognizer } from '@/lib/components/SpeechRecognizer';
import { useRecordingState } from '@/lib/shared/hooks/useRecordingState';
import { createThrottle } from '@/lib/shared/utils/createThrottle';

import styles from './App.module.scss';

function App() {
	const [isActive] = useRecordingState(true);
	const [, setRecording] = useRecordingState();
	const [recognizedText, setRecognizedText] = useState<string[]>([]);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'auto' });
	}, [recognizedText]);

	const handleSpeech = useMemo(
		() =>
			createThrottle(function (transcript: string) {
				const words = transcript
					.toLowerCase()
					.replaceAll(/[^\p{L}\p{N}\s]/gu, '')
					.split(/\s+/);

				const commands = [
					{
						words: ['предыдущая', 'вкладка'],
						action: () => chrome.runtime.sendMessage({ action: 'GO_PREV_TAB' }),
					},
					{
						words: ['следующая', 'вкладка'],
						action: () => chrome.runtime.sendMessage({ action: 'GO_NEXT_TAB' }),
					},
					{
						words: ['обновить'],
						action: () =>
							chrome.runtime.sendMessage({ action: 'WINDOW_RELOAD', forContentScript: true }),
					},
					{
						words: ['стоп'],
						action: () => setRecording(false),
					},
				];

				for (const cmd of commands) {
					if (cmd.words.every((w) => words.includes(w))) {
						return cmd.action();
					}
				}
			}, 800),
		[setRecording],
	);

	useEffect(() => {
		if (!isActive) window.close();
	}, [isActive]);

	return (
		<div className={styles.root}>
			<h1>Голосовой ввод</h1>
			{recognizedText.map((command, i) => {
				return (
					<div className={styles.commandLine}>
						<span>{i + 1}</span>
						<span>{command}</span>
					</div>
				);
			})}

			{/* Якорь прокрутки */}
			<div ref={bottomRef} />

			<SpeechRecognizer
				onResult={(e) => {
					let transcript = '';
					for (let i = e.resultIndex; i < e.results.length; i++) {
						transcript += e.results[i][0].transcript;
					}
					transcript = transcript.trim();
					if (!transcript) return;

					setRecognizedText((v) => [...v, transcript]);
					handleSpeech(transcript);
				}}
			/>
		</div>
	);
}

export default App;
