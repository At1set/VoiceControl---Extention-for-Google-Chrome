// speech-recognition.d.ts
// Full Web IDL → TypeScript declaration
// Augments lib.dom.d.ts

export {};

declare global {
	/* =========================
	 * Helpers (Web IDL mappings)
	 * ========================= */

	type DOMString = string;

	type ObservableArray<T> = readonly T[];

	/* =========================
	 * Enums
	 * ========================= */

	type SpeechRecognitionErrorCode =
		| 'no-speech'
		| 'aborted'
		| 'audio-capture'
		| 'network'
		| 'not-allowed'
		| 'service-not-allowed'
		| 'language-not-supported'
		| 'phrases-not-supported';

	type AvailabilityStatus = 'unavailable' | 'downloadable' | 'downloading' | 'available';

	/* =========================
	 * Dictionaries
	 * ========================= */

	interface SpeechRecognitionOptions {
		langs: DOMString[];
		processLocally?: boolean;
	}

	interface SpeechRecognitionErrorEventInit extends EventInit {
		error: SpeechRecognitionErrorCode;
		message?: DOMString;
	}

	interface SpeechRecognitionEventInit extends EventInit {
		resultIndex?: number;
		results: SpeechRecognitionResultList;
	}

	/* =========================
	 * Main interface
	 * ========================= */

	interface SpeechRecognition extends EventTarget {
		/* recognition parameters */
		grammars: SpeechGrammarList;
		lang: DOMString;
		continuous: boolean;
		interimResults: boolean;
		maxAlternatives: number;
		processLocally: boolean;
		phrases: ObservableArray<SpeechRecognitionPhrase>;

		/* methods */
		start(): void;
		start(audioTrack: MediaStreamTrack): void;
		stop(): void;
		abort(): void;

		/* events */
		onaudiostart: EventHandler | null;
		onsoundstart: EventHandler | null;
		onspeechstart: EventHandler | null;
		onspeechend: EventHandler | null;
		onsoundend: EventHandler | null;
		onaudioend: EventHandler | null;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
		onnomatch: EventHandler | null;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
		onstart: EventHandler | null;
		onend: EventHandler | null;
	}

	interface SpeechRecognitionConstructor {
		new (): SpeechRecognition;

		available(options: SpeechRecognitionOptions): Promise<AvailabilityStatus>;

		install(options: SpeechRecognitionOptions): Promise<boolean>;
	}

	declare var SpeechRecognition: SpeechRecognitionConstructor;
	declare var webkitSpeechRecognition: SpeechRecognitionConstructor;

	/* =========================
	 * Error event
	 * ========================= */

	interface SpeechRecognitionErrorEvent extends Event {
		readonly error: SpeechRecognitionErrorCode;
		readonly message: DOMString;
	}

	/* =========================
	 * Results
	 * ========================= */

	interface SpeechRecognitionAlternative {
		readonly transcript: DOMString;
		readonly confidence: number;
	}

	interface SpeechRecognitionResult {
		readonly length: number;
		readonly isFinal: boolean;

		item(index: number): SpeechRecognitionAlternative;
		[index: number]: SpeechRecognitionAlternative;
	}

	interface SpeechRecognitionResultList {
		readonly length: number;

		item(index: number): SpeechRecognitionResult;
		[index: number]: SpeechRecognitionResult;
	}

	/* =========================
	 * Recognition event
	 * ========================= */

	interface SpeechRecognitionEvent extends Event {
		readonly resultIndex: number;
		readonly results: SpeechRecognitionResultList;
	}

	/* =========================
	 * Grammar (deprecated)
	 * ========================= */

	interface SpeechGrammar {
		src: DOMString;
		weight: number;
	}

	interface SpeechGrammarList {
		readonly length: number;

		item(index: number): SpeechGrammar;

		addFromURI(src: DOMString, weight?: number): void;
		addFromString(string: DOMString, weight?: number): void;
	}

	/* =========================
	 * Phrase
	 * ========================= */

	interface SpeechRecognitionPhrase {
		readonly phrase: DOMString;
		readonly boost: number;
	}

	var SpeechRecognitionPhrase: {
		new (phrase: DOMString, boost?: number): SpeechRecognitionPhrase;
	};
}
