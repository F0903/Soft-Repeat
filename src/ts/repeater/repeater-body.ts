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
		this.SetupHandlers();
	}

	static async AddBody(
		sibling: HTMLElement,
		position: InsertPosition
	): Promise<RepeaterBody> {
		const parent = sibling.parentElement as HTMLElement;

		const url = chrome.runtime.getURL("html/repeater.html");
		const response = await fetch(url);
		const html = await response.text();
		sibling.insertAdjacentHTML(position, html);

		const body = parent.querySelector("div.repeater") as HTMLDivElement;

		const fromInput = body.querySelector(
			"input#from-input"
		) as HTMLInputElement;
		const toInput = body.querySelector("input#to-input") as HTMLInputElement;

		const rep = new RepeaterBody(body, fromInput, toInput);
		return rep;
	}

	private SetupHandlers() {}

	private OnCollapserClick() {
		console.log("Hello!");
	}

	async Expand(): Promise<void> {
		const body = this.body;
		body.classList.remove("hide");
	}

	async Collapse(): Promise<void> {
		const body = this.body;
		body.classList.add("hide");
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
