import { library, dom } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowRotateRight,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

export default class RepeaterBody {
	private readonly body: HTMLElement;
	public readonly FromInput: HTMLInputElement;
	public readonly ToInput: HTMLInputElement;

	private constructor(
		body: HTMLElement,
		fromInput: HTMLInputElement,
		toInput: HTMLInputElement
	) {
		this.body = body;
		this.FromInput = fromInput;
		this.ToInput = toInput;
	}

	static AddIcons() {
		library.add(faArrowRotateRight);
		library.add(faArrowRight);
		dom.i2svg();
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

		this.AddIcons();

		const rep = new RepeaterBody(body, fromInput, toInput);
		return rep;
	}

	GetInputs(): [HTMLInputElement, HTMLInputElement] {
		return [this.FromInput, this.ToInput];
	}

	GetBody(): HTMLElement {
		return this.body;
	}

	SetInputError(element: HTMLInputElement, value: boolean = true) {
		element.classList.toggle("error", value);
	}
}
