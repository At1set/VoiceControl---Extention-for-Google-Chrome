import type { AppCommands } from '../bus/commands';

export type BuiltInCommand<Event extends keyof AppCommands = keyof AppCommands> = {
	id: string;

	/**
	 * Регулярное выражение команды
	 */
	pattern: RegExp;

	/**
	 * Какое событие эмитим в bus
	 */
	emit: Event;

	/**
	 * Трансформация regex match → payload
	 */
	transform?: (match: RegExpMatchArray) => AppCommands[Event];
};

export const builtInCommands: BuiltInCommand[] = [
	/**
	 * Остановить запись голоса
	 */
	{
		id: 'stop',
		pattern: /^стоп$/iu,
		emit: 'stop',
	},

	/**
	 * Закрыть страницу
	 */
	{
		id: 'page.close',

		pattern: /^закрой (страницу|вкладку)|закрыть (страницу|вкладку)$/iu,

		emit: 'page.close',
	},

	/**
	 * Перезагрузка страницы
	 */
	{
		id: 'page.reload',

		pattern: /^(обнови( страницу)?|обновить( страницу)?|перезагрузи( страницу)?|reload)$/iu,

		emit: 'page.reload',
	},

	/**
	 * Скролл
	 */
	{
		id: 'page.scroll',

		pattern: /^(прокрути|листай|скролл(ни)?)( страницу)? (?<direction>вверх|вниз)$/iu,

		emit: 'page.scroll',

		transform(match) {
			const direction = match.groups?.direction;

			return {
				direction: direction === 'вверх' ? 'up' : 'down',
			};
		},
	},

	/**
	 * Следующая вкладка
	 */
	{
		id: 'navigation.nextTab',

		pattern: /^(следующая|переключись на следующую|открой следующую) вкладк(а|у)$/iu,

		emit: 'navigation.nextTab',
	},

	/**
	 * Предыдущая вкладка
	 */
	{
		id: 'navigation.previousTab',

		pattern: /^(предыдущая|вернись на предыдущую|открой предыдущую) вкладк(а|у)$/iu,

		emit: 'navigation.previousTab',
	},

	/**
	 * Клик по номеру
	 * например:
	 * "нажми 5"
	 * "клик 12"
	 * "выбери 7"
	 */
	{
		id: 'navigation.clickNumber',

		pattern: /^(нажми|клик|выбери|открой) (?<number>\d+)$/iu,

		emit: 'navigation.clickNumber',

		transform(match) {
			return {
				number: Number(match.groups?.number),
			};
		},
	},

	/**
	 * Открытие сайта
	 */
	{
		id: 'tab.open',

		pattern: /^(открой|перейди на) (?<site>ютуб|youtube|гугл|google|гитхаб|github)$/iu,

		emit: 'tab.open',

		transform(match) {
			const site = match.groups?.site as string;

			const urlMap: Record<string, string> = {
				ютуб: 'https://youtube.com',
				youtube: 'https://youtube.com',

				гугл: 'https://google.com',
				google: 'https://google.com',

				гитхаб: 'https://github.com',
				github: 'https://github.com',
			};

			return {
				url: urlMap[site],
			};
		},
	},
];
