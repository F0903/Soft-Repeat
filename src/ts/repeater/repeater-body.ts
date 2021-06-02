export default class RepeaterBody {
	readonly body: HTMLElement;
	readonly fromInput: HTMLInputElement;
	readonly toInput: HTMLInputElement;

	readonly errorColor = "#ca3737dd";

	constructor(
		body: HTMLElement,
		fromInput: HTMLInputElement,
		toInput: HTMLInputElement
	) {
		this.body = body;
		this.fromInput = fromInput;
		this.toInput = toInput;
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
