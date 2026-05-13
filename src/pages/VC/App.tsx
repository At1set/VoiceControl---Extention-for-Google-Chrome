import { MicroIcon, NoMicroIcon } from '@icons';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { version } from '@/../package.json';
import { SpeechRecognizer } from '@/lib/shared/components/SpeechRecognizer';
import { VoiceLevelIndicator } from '@/lib/shared/components/VoiceLevelIndicator';
import type { Message } from '@/lib/shared/types/Message';

import styles from './App.module.scss';

function App() {
	const [micStatus, setMicStatus] = useState<PermissionState>('prompt');
	const [finalText, setFinalText] = useState<string[]>([]);
	const [interimText, setInterimText] = useState('');
	const isMicAllowed = micStatus === 'granted';

	const requestMicrophone = async () => {
		try {
			// Запрашиваем микрофон
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			if (stream.active) {
				setMicStatus('granted');
				stream.getAudioTracks().forEach((track) => track.stop());
			} else throw new Error('Микрофон не разрешен');
		} catch (error) {
			console.warn('Микрофон не разрешён', error);
			setMicStatus('denied');
		}
	};

	const statusRef = useRef<PermissionStatus>(null);
	useEffect(() => {
		const handler = () => {
			if (!statusRef.current) return;
			const micStatus = statusRef.current?.state;
			console.log('Значение микрофона было изменено на:', micStatus);
			setMicStatus(micStatus);
		};

		navigator.permissions.query({ name: 'microphone' }).then((status) => {
			if (statusRef.current) return;
			statusRef.current = status;
			setMicStatus(status.state);
			status.addEventListener('change', handler);
		});

		return () => {
			statusRef.current?.removeEventListener('change', handler);
		};
	}, []);

	const bottomRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [interimText]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.logo}>
				<h1>
					VOICE <br />
					_CONTROL_
				</h1>
				<span className={styles.version}>version {version} beta</span>
			</div>

			<SpeechRecognizer
				micStatus={micStatus}
				onResult={(e) => {
					let interim = '';

					for (let i = e.resultIndex; i < e.results.length; i++) {
						const result = e.results[i];
						const transcript = result[0].transcript;

						if (result.isFinal) {
							setFinalText((prev) => [...prev, transcript]);
							chrome.runtime.sendMessage({
								type: 'event',
								event: 'recognizedText',
								payload: transcript,
							} satisfies Message);
						} else {
							interim += transcript;
						}
					}

					setInterimText(interim);
				}}
				fallback={
					<div className={styles.noSpeechApiErr}>
						Ошибка, Web Speech Api не поддерживается вашим браузером!
						<br />
						<a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility">
							https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility
						</a>
					</div>
				}
			/>

			<div className={styles.textField}>
				<div className={clsx(styles.textField__voiceBlock, styles.voiceBlock)}>
					<VoiceLevelIndicator className={styles.voiceBlock__micIndicator} micStatus={micStatus} />
					<img src={isMicAllowed ? MicroIcon : NoMicroIcon} alt="microphone icon" />
				</div>
				<div id="voiceText" className={styles.voiceText}>
					<span className={clsx(styles.voiceText__text, styles.voiceText__text_final)}>
						{finalText.join(' ')}
					</span>
					{interimText && (
						<span className={clsx(styles.voiceText__text, styles.voiceText__text_interim)}>
							{' ' + interimText}
						</span>
					)}
					{/* Якорь прокрутки */}
					<div ref={bottomRef} />
				</div>
			</div>

			<div className={styles.premissions}>
				<div className={styles.premissions__buttonBox}>
					<button onClick={requestMicrophone} className={styles.micBtn}>
						Запросить разрешение на использование микрофона
					</button>

					<p
						className={clsx(styles.premissions__status, {
							[styles.premissions__status_notAllowed]: !isMicAllowed,
						})}
					>
						Статус:{' '}
						{isMicAllowed
							? 'Расширению доступ к микрофону разрешен'
							: 'Расширение не имеет доступ к микрофону, пожалуйста предоставьте к нему доступ.'}
					</p>
				</div>
			</div>
		</div>
	);
}

export default App;
