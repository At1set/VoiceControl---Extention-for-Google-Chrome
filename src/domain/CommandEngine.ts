import type { VoiceCommand } from '@/lib/shared/types/Commands';

import { Matcher } from './Matcher';
import { normalizeSpeech } from './normalizeSpeech';

export class CommandEngine {
	private matcher = new Matcher();
	private commands: VoiceCommand[];

	constructor(commands: VoiceCommand[]) {
		this.commands = commands;
	}

	updateCommands(commands: VoiceCommand[]) {
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
		return [command, payload] as const;
	}
}
