import { useEffect, useRef } from 'react';

import { useLatest } from '@/lib/shared/hooks/useLatest';
import { SpeechRecognition } from '@/lib/shared/utils/SpeechRecognition';

export function useSpeechRecognition({
	onStart,
	onEnd,
	onError,
	onResult,
}: {
	onStart?: (this: SpeechRecognition) => void;
	onEnd?: (this: SpeechRecognition) => void;
	onError?: (this: SpeechRecognition, e: SpeechRecognitionErrorEvent) => void;
	onResult?: (this: SpeechRecognition, e: SpeechRecognitionEvent) => void;
} = {}) {
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	const onStartRef = useLatest(onStart);
	const onEndRef = useLatest(onEnd);
	const onErrorRef = useLatest(onError);
	const onResultRef = useLatest(onResult);

	useEffect(() => {
		if (!SpeechRecognition) return;
		const recognition = new SpeechRecognition();
		recognition.lang = 'ru-RU';
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = () => onStartRef.current?.call(recognition);
		recognition.onend = () => onEndRef.current?.call(recognition);
		recognition.onerror = (e) => onErrorRef.current?.call(recognition, e);
		recognition.onresult = (e) => onResultRef.current?.call(recognition, e);

		recognitionRef.current = recognition;

		return () => {
			recognition.onend = null;
			recognition.stop();
			recognitionRef.current = null;
		};
	}, [onEndRef, onErrorRef, onResultRef, onStartRef]);

	if (!SpeechRecognition) return undefined;
	return recognitionRef;
}
