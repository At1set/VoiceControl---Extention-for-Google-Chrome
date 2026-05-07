export function normalizeSpeech(text: string) {
	return (
		text
			.toLowerCase()
			// удаляем мусор
			.replaceAll(/[^\p{L}\p{N}\s]/gu, '')
			// схлопываем пробелы
			.replace(/\s+/g, ' ')
			.trim()
	);
}
