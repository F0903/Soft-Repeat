interface BlockOptions {
	blockNumRow: boolean;
	blockLetters: boolean;
	blockAll: boolean;
}

export default class KeyBlocker {
	private static initialized: boolean;
	private static blocking: boolean;

	private static options: BlockOptions = {
		blockLetters: true,
		blockNumRow: true,
		blockAll: true,
	};

	private static CheckIfKeyIsNumRow(key: string): boolean {
		if (key.length > 1) return false;
		const match = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(parseInt(key));
		return match;
	}

	private static CheckIfKeyIsLetter(key: string): boolean {
		if (key.length > 1) return false;
		const code = key.charCodeAt(0);
		const isUpper = code >= 65 && code <= 90;
		const isLower = code >= 97 && code <= 122;
		const match = isUpper || isLower;
		return match;
	}

	private static HandleKeyEvent(ev: Event) {
		if (!KeyBlocker.blocking) return;
		const key = (ev as KeyboardEvent).key;

		if (!KeyBlocker.options.blockAll) {
			const isNum =
				KeyBlocker.options.blockNumRow && KeyBlocker.CheckIfKeyIsNumRow(key);
			const isLetter =
				KeyBlocker.options.blockLetters && KeyBlocker.CheckIfKeyIsLetter(key);

			if (!isLetter && !isNum) {
				return;
			}
		}

		console.log(`Blocked key: ${key}`);
		ev.stopPropagation();
	}

	static Init() {
		if (KeyBlocker.initialized) return;

		["keydown", "keyup"].forEach((x) =>
			document.addEventListener(x, KeyBlocker.HandleKeyEvent, {
				capture: true,
			})
		);

		KeyBlocker.initialized = true;
	}

	static SetBlockOptions(options: BlockOptions) {
		KeyBlocker.options = options;
	}

	static SetBlock(value: boolean) {
		KeyBlocker.blocking = value;
	}
}
