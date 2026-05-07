import type { AppCommands } from '../bus/commands';
import type { BuiltInCommand } from './built-in-commands';

export type MatchResult<Event extends keyof AppCommands = keyof AppCommands> = {
	command: BuiltInCommand<Event>;

	match: RegExpMatchArray;
};

export class Matcher {
	match(text: string, commands: BuiltInCommand[]): MatchResult | null {
		for (const command of commands) {
			const match = text.match(command.pattern);
			if (!match) continue;

			return {
				command,
				match,
			};
		}

		return null;
	}
}
