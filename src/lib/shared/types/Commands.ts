/**
 * Все голосовые комманды расширения, расписанные как ключ - область
 * применения, значение - аргументы для функции её исполнения
 */
export type AppCommands = {
	/**
	 * Закрытие вкладки
	 */
	'page.close': void;

	/**
	 * Обновление вкладки
	 */
	'page.reload': void;

	stop: void;

	'page.scroll': {
		direction: 'up' | 'down' | 'top' | 'bottom' | 'left' | 'far-left' | 'right' | 'far-right';
		pixels: number;
	};

	'navigation.nextTab': void;

	'navigation.previousTab': void;

	'navigation.clickNumber': {
		number: number;
	};

	'tab.open': {
		url: string;
	};
};

/**
 * Объект голосовой команды
 */
export type VoiceCommand<Event extends keyof AppCommands = keyof AppCommands> =
	Event extends keyof AppCommands
		? AppCommands[Event] extends void
			? {
					id: string;
					/**
					 * Регулярное выражение команды
					 */
					pattern: RegExp;

					/**
					 * Какое событие эмитим в bus
					 */
					emit: Event;

					transform?: never;
				}
			: {
					id: string;
					pattern: RegExp;
					emit: Event;

					/**
					 *  Трансформация regex match → payload
					 */
					transform: (match: RegExpMatchArray) => AppCommands[Event];
				}
		: never;
