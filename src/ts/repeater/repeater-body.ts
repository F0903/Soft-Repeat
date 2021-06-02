import { AddInputter } from "../utility/dom";

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
		const body = document.createElement("div");
		body.setAttribute("id", "repeater-body");
		body.setAttribute("class", "repeater-body-renderer");
		parent.insertBefore(body, parent.firstChild);

		const [, fromInput] = await AddInputter(body, "from");
		const [, toInput] = await AddInputter(body, "to");
		fromInput.setAttribute("placeholder", "00:00");
		toInput.setAttribute("placeholder", "00:00");

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
