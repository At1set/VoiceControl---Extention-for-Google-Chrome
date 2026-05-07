import { type FC, type ReactNode, useEffect } from 'react';

import { useRecordingState } from '@/lib/shared/hooks/useRecordingState';

import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface Props {
	micStatus: PermissionState;
	onStart?: () => void;
	onEnd?: () => void;
	onError?: (e: SpeechRecognitionErrorEvent) => void;
	onResult?: (e: SpeechRecognitionEvent) => void;
	fallback?: ReactNode;
}

export const SpeechRecognizer: FC<Props> = ({
	micStatus,
	onStart,
	onEnd,
	onError,
	onResult,
	fallback,
}) => {
	const [isRecording] = useRecordingState();
	const isMicAllowed = micStatus === 'granted';

	const speechRecognition = useSpeechRecognition({
		onStart() {
			console.log('Распознавание голоса включено');
			onStart?.();
		},
		onEnd() {
			console.log('OnEnd');

			if (isRecording && isMicAllowed) {
				try {
					console.log('Перезапуск распознавания голоса...');
					this.start();
				} catch (e) {
					console.warn('Ошибка перезапуска [SpeechRecognition]: ', e);
				}
			} else onEnd?.();
		},
		onError(e) {
			console.warn('SpeechRecognition error:', e);
			onError?.(e);
		},
		onResult,
	});

	useEffect(() => {
		if (!speechRecognition || !speechRecognition.current) return;
		
		if (isRecording && isMicAllowed) {
			try {
				speechRecognition.current.start();
			} catch (e) {
				console.warn(e);
			}
		} else {
			speechRecognition.current.stop();
		}
	}, [isRecording, speechRecognition, isMicAllowed]);

	return speechRecognition === undefined ? (
		fallback || <div>Ошибка, Web Speech Api не поддерживается вашим браузером!</div>
	) : (
		<></>
	);
};
