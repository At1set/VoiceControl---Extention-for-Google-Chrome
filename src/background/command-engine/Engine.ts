import { bus } from '../bus/bus';
import type { BuiltInCommand } from './built-in-commands';
import { Matcher } from './Matcher';
import { normalizeSpeech } from './normalizeSpeech';

export class CommandEngine {
	private matcher = new Matcher();
	private commands: BuiltInCommand[];

	constructor(commands: BuiltInCommand[]) {
		this.commands = commands;
	}

	process(rawText: string) {
		/**
		 * нормализуем текст
		 */
		const normalizedText = normalizeSpeech(rawText);

		console.log('[CommandEngine] normalized:', normalizedText);

		/**
		 * ищем команду
		 */
		const result = this.matcher.match(normalizedText, this.commands);

		if (!result) {
			console.log('[CommandEngine] no command matched');

			return false;
		}

		const { command, match } = result;

		/**
		 * payload
		 */
		const payload = command.transform ? command.transform(match) : undefined;

		console.log('[CommandEngine] matched:', command, payload);

		/**
		 * emit command
		 */
		bus.emit(command.emit, payload);

		return [command, payload] as const;
	}
}
