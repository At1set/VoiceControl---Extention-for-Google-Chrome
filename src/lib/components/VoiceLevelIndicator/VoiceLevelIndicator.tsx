import clsx from 'clsx';
import { type FC, useEffect, useState } from 'react';

import styles from './VoiceLevelIndicator.module.scss';

interface Props {
	className?: string;
	micStatus?: PermissionState;
}

export const VoiceLevelIndicator: FC<Props> = ({ micStatus, className }) => {
	const [level, setLevel] = useState<number>(0);
	const isMicAllowed = micStatus === 'granted';

	useEffect(() => {
		let audioContext: AudioContext;
		let analyser: AnalyserNode;
		let dataArray: Uint8Array<ArrayBuffer>;
		let animationId: number;

		async function init() {
			let stream: MediaStream;

			try {
				stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			} catch {
				return;
			}

			audioContext = new AudioContext();
			const source = audioContext.createMediaStreamSource(stream);

			analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;

			const bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);

			source.connect(analyser);

			const update = () => {
				analyser.getByteFrequencyData(dataArray);

				// считаем громкость
				const sum = dataArray.reduce((acc, x) => acc + x);
				const average = sum / dataArray.length;
				const volume = average / 128;
				setLevel(volume);

				animationId = requestAnimationFrame(update);
			};

			update();
		}

		if (isMicAllowed) init();

		return () => {
			cancelAnimationFrame(animationId);
			audioContext?.close();
		};
	}, [isMicAllowed]);

	return (
		<div className={clsx(styles.root, className)}>
			<div
				className={styles.root__movingBox}
				style={{
					left: isMicAllowed ? `calc(${level * 100}%)` : 0,
				}}
			/>
		</div>
	);
};
