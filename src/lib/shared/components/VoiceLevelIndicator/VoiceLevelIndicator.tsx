import clsx from 'clsx';
import { type FC, useEffect, useRef } from 'react';

import { calculateRMS } from './utils/calculateRms';
import styles from './VoiceLevelIndicator.module.scss';

interface Props {
	className?: string;
	micStatus?: PermissionState;
}

export const VoiceLevelIndicator: FC<Props> = ({ micStatus, className }) => {
	const isMicAllowed = micStatus === 'granted';
	const indicatorRef = useRef<HTMLDivElement>(null);

	const SMOOTHING_FACTOR = 15;
	const VISUAL_GAIN = 2;
	const INDICATOR_WIDTH = 150;

	useEffect(() => {
		if (!isMicAllowed) return;

		let audioContext: AudioContext;
		let analyser: AnalyserNode;
		let animationId: number;
		let stream: MediaStream;

		// smoothed volume
		let smoothVolume = 0;

		async function init() {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
			} catch {
				return;
			}

			audioContext = new AudioContext();

			const source = audioContext.createMediaStreamSource(stream);

			analyser = audioContext.createAnalyser();

			// размер audio window
			analyser.fftSize = 256;

			source.connect(analyser);

			// time-domain samples
			const dataArray = new Uint8Array(analyser.fftSize);

			let lastTime = performance.now();
			const update = (time: number) => {
				const deltaTime = (time - lastTime) / 1000;
				lastTime = time;

				// получаем waveform
				analyser.getByteTimeDomainData(dataArray);

				const rms = calculateRMS(dataArray);

				const t = Math.min(SMOOTHING_FACTOR * deltaTime, 1);

				/**
				 * При помощи линейной интерполяции сглаживаем движения шкалы
				 */
				smoothVolume = smoothVolume + (rms - smoothVolume) * t;

				/**
				 * Не показываем шкалу при слишком тихом фоне (0.005),
				 * при помощи коэффициента VISUAL_GAIN, увеличиваем чувствительность шкалы
				 */
				const normalizedVolume = Math.min(Math.max(smoothVolume - 0.005, 0) * VISUAL_GAIN, 1);

				/**
				 * Конвертируем полученный коэфф. громкости в пиксели
				 */
				const translateX = normalizedVolume * INDICATOR_WIDTH;

				if (indicatorRef.current) {
					indicatorRef.current.style.transform = `translateX(${translateX}px)`;
				}

				animationId = requestAnimationFrame(update);
			};

			requestAnimationFrame(update);
		}

		init();

		return () => {
			cancelAnimationFrame(animationId);

			audioContext?.close();

			stream?.getTracks().forEach((track) => {
				track.stop();
			});
		};
	}, [isMicAllowed]);

	return (
		<div className={clsx(styles.root, className)}>
			<div className={styles.root__movingBox} ref={indicatorRef} />
		</div>
	);
};
