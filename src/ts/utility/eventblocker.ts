export default class EventBlocker {
	private static initialized: boolean;
	private static blocking: boolean;

	private static HandleEvent(ev: Event) {
		if (!EventBlocker.blocking) return;
		ev.stopPropagation();
	}

	static Block<T extends keyof DocumentEventMap>(...events: T[]) {
		if (EventBlocker.initialized) return;

		events.forEach((x) => {
			document.addEventListener(x, EventBlocker.HandleEvent, { capture: true });
		});

		EventBlocker.initialized = true;
		EventBlocker.blocking = true;
	}

	static SetBlock(value: boolean) {
		EventBlocker.blocking = value;
	}
}
