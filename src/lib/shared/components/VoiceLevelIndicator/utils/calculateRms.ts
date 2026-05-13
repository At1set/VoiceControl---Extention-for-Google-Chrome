/**
 * RMS (Root Mean Square) — среднеквадратичное значение амплитуды аудиосигнала.
 *
 * Используется для оценки “громкости” сигнала во временной области.
 * Чем выше RMS, тем сильнее сигнал (громче звук).
 *
 * @param waveForm - временная область сигнала (PCM waveform, Uint8Array)
 * @returns нормализованное RMS значение (примерно 0..1)
 */
export function calculateRMS(waveForm: Uint8Array<ArrayBuffer>) {
	let sumSquares = 0;

	for (let i = 0; i < waveForm.length; i++) {
		// нормализуем значения от -1...1
		const normalizedSample = (waveForm[i] - 128) / 128;
		// суммируем квадраты значений
		sumSquares += normalizedSample * normalizedSample;
	}

	/**
	 * RMS:
	 * sqrt(average(sample^2))
	 */
	return Math.sqrt(sumSquares / waveForm.length);
}
