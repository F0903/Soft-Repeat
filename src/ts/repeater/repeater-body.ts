export default class RepeaterBody {
	readonly body: HTMLElement;
	readonly fromInput: HTMLInputElement;
	readonly toInput: HTMLInputElement;

	readonly errorColor = "#ca3737dd";

	private constructor(
		body: HTMLElement,
		fromInput: HTMLInputElement,
		toInput: HTMLInputElement
	) {
		this.body = body;
		this.fromInput = fromInput;
		this.toInput = toInput;
	}

	static async AddBody(parent: HTMLElement): Promise<RepeaterBody> {
		const url = chrome.runtime.getURL("html/repeater.html");
		const response = await fetch(url);
		const html = await response.text();
		parent.insertAdjacentHTML("afterbegin", html);

		const body = parent.querySelector("div.repeater") as HTMLDivElement;
		const fromInput = parent.querySelector(
			"input#from-input"
		) as HTMLInputElement;
		const toInput = parent.querySelector("input#to-input") as HTMLInputElement;
		const rep = new RepeaterBody(body, fromInput, toInput);
		await rep.Collapse();
		return rep;
	}

	async Expand(): Promise<void> {
		const body = this.body;
		body.style.opacity = "1";
	}

	async Collapse(): Promise<void> {
		const body = this.body;
		const style = body.style;
		style.opacity = "0";
	}

	async SetFromInputError() {
		this.fromInput.setAttribute(
			"style",
			`background-color: ${this.errorColor}`
		);
	}

	async SetToInputError() {
		this.toInput.setAttribute("style", `background-color: ${this.errorColor}`);
	}

	async ClearFromInputError() {
		this.fromInput.setAttribute("style", "");
	}

	async ClearToInputError() {
		this.toInput.setAttribute("style", "");
	}
}
