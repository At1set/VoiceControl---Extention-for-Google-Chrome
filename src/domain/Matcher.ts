import type { AppCommands, VoiceCommand } from '@/lib/shared/types/Commands';

export type MatchResult<Event extends keyof AppCommands = keyof AppCommands> = {
	command: VoiceCommand<Event>;

	match: RegExpMatchArray;
};

export class Matcher {
	match(text: string, commands: VoiceCommand[]): MatchResult | null {
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
