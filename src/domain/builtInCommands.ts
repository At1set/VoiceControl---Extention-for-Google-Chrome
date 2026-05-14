import type { AppCommands, VoiceCommand } from '@/lib/shared/types/Commands';

export const builtInCommands: VoiceCommand[] = [
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

		pattern: (() => {
			const DIRECTION =
				'вверх|вниз|влево|вправо|в самый верх|в самый низ|в самое лево|в самое право|полностью вверх|полностью вниз|полностью вправо|полностью влево';

			const COMMAND =
				'(?:' + 'прокрути(?:ть)?|' + 'лист(?:ай|ни)?|' + 'скрол(?:л|ь)(?:ни|нуть)?' + ')';

			const PIXELS = (i: 1 | 2) => `(?<pixels${i}>\\d+)\\s*(?:px|пикс(?:елей|еля|ель)?)?`;

			const reg = new RegExp(
				'^' +
					COMMAND +
					'(?:\\s+страницу)?' +
					'(?:\\s+ещ(?:е|ё))?' +
					'\\s+' +
					'(?:' +
					// вверх [на] 600 пикселей
					`(?<direction1>${DIRECTION})` +
					`(?:\\s+(?:на\\s+)?${PIXELS(1)})?` +
					'|' +
					// [на] 600 пикселей вверх
					`(?:на\\s+)?${PIXELS(2)}` +
					`\\s+(?<direction2>${DIRECTION})` +
					')' +
					'$',
				'iu',
			);

			return reg;
		})(),

		emit: 'page.scroll',

		transform(match) {
			console.dir(match.groups);

			const directionMatch = match.groups?.direction1 || match.groups?.direction2;

			const pixelsRaw = match.groups?.pixels1 || match.groups?.pixels2;
			console.log(directionMatch);

			const map: Record<string, AppCommands['page.scroll']['direction']> = {
				вверх: 'up',
				'в самый верх': 'top',
				'полностью вверх': 'top',

				вниз: 'down',
				'в самый низ': 'bottom',
				'полностью вниз': 'bottom',

				вправо: 'right',
				'в самое право': 'far-right',
				'полностью вправо': 'far-right',

				влево: 'left',
				'в самое лево': 'far-left',
				'полностью влево': 'far-left',
			};

			const direction = map[directionMatch ?? ''] ?? 'down';

			const defaultPixels = direction === 'left' || direction === 'right' ? 150 : 500;

			const pixels = Number(pixelsRaw ?? defaultPixels);

			return {
				direction,
				pixels,
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
