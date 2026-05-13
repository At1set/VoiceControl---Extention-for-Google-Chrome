import { useEffect, useMemo, useRef, useState } from 'react';

import { SpeechRecognizer } from '@/lib/shared/components/SpeechRecognizer';
import { createThrottle } from '@/lib/shared/utils/createThrottle';

import styles from './App.module.scss';

function App() {
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
						action: () => chrome.runtime.sendMessage({ action: 'WINDOW_RELOAD' }),
					},
					{
						words: ['стоп'],
						action: () => window.close(),
					},
				];

				for (const cmd of commands) {
					if (cmd.words.every((w) => words.includes(w))) {
						return cmd.action();
					}
				}
			}, 800),
		[],
	);

	useEffect(() => {
		// eslint-disable-next-line
		function handleCloseMessage(msg: any, _: any, sendResponse: (response?: any) => void) {
			if (msg.action === 'CLOSE_SIDEPANEL') {
				sendResponse(true);
				window.close();
			}
		}

		chrome.runtime.onMessage.addListener(handleCloseMessage);

		return () => {
			chrome.runtime.onMessage.removeListener(handleCloseMessage);
		};
	}, []);

	// const lastResultIndexRef = useRef(0);

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
