import { useCallback, useEffect, useState } from 'react';

export function useRecordingState(initialState: boolean | (() => boolean) = false) {
	const [isRecording, setRecording] = useState(initialState);

	useEffect(() => {
		chrome.storage.local.get('isRecording', ({ isRecording }: { isRecording: boolean }) => {
			setRecording(isRecording);
		});

		function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }) {
			const { isRecording } = changes;
			if (isRecording) {
				setRecording(isRecording.newValue as boolean);
			}
		}
		chrome.storage.local.onChanged.addListener(handleStorageChange);

		return () => {
			chrome.storage.local.onChanged.removeListener(handleStorageChange);
		};
	}, []);

	const changeRecorgingState = useCallback(
		(
			value: boolean,
			options?: {
				withoutStorageSave?: boolean;
			},
		) => {
			setRecording(value);
			if (!options?.withoutStorageSave) chrome.storage.local.set({ isRecording: value });
		},
		[],
	);

	return [isRecording, changeRecorgingState] as const;
}
