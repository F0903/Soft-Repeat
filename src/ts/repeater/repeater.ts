import { TryGetElementByTag } from "./../utility/dom";
import { OnAttributeChanged } from "./../utility/observer";
import RepeaterBody from "./repeater-body";
import { CheckLoop } from "./check-loop";

export default class Repeater {
	private repeaterBody?: RepeaterBody;
	private currentLoop?: CheckLoop;

	private enabled: boolean = false;

	async GetLoopPeriod(): Promise<[number, number]> {
		if (!this.repeaterBody) return [0, 0];
		const elems = this.repeaterBody.GetInputs();
		const nums = elems.map((elem) => {
			const input = elem.value;
			const splits = input.split(":");

			let secs = 0;
			splits.reverse().forEach((x, i) => {
				secs += parseInt(x) * (i == 0 ? 1 : 60 ** i);
			});
			return secs;
		});
		return [nums[0], nums[1]];
	}

	//TODO: Seperate to input class and pass that to check-loop instead.
	ErrorCheck(
		from: number,
		to: number,
		videoDuration: number
	): Promise<boolean> {
		if (!this.repeaterBody) return Promise.resolve(false);

		let error = false;
		if (from > videoDuration) {
			this.repeaterBody.SetInputError(this.repeaterBody.FromInput);
			error = true;
		} else if (from > to) {
			// From cannot be larger than To.
			this.repeaterBody.SetInputError(this.repeaterBody.FromInput);
			error = true;
		} else {
			this.repeaterBody.SetInputError(this.repeaterBody.FromInput, false);
		}

		if (to > videoDuration) {
			this.repeaterBody.SetInputError(this.repeaterBody.ToInput);
			error = true;
		} else {
			this.repeaterBody.SetInputError(this.repeaterBody.FromInput, false);
		}
		return Promise.resolve(error);
	}

	IsInputSelected(): boolean {
		return this.repeaterBody!.GetInputs().some((x) => x === document.activeElement);
	}

	async Init(sibling: HTMLElement, positon: InsertPosition): Promise<void> {
		const repeater = (this.repeaterBody = await RepeaterBody.AddBody(
			sibling,
			positon
		));
		const body = repeater.GetBody();
		const icon = body.querySelector("div.repeater-icon") as HTMLElement;

		const video = (await TryGetElementByTag("video")) as HTMLVideoElement;

		const stopCheckLoop = async () => {
			console.log("Stopping Loop");
			if (!this.currentLoop)
				return;
			this.currentLoop.Stop();
			this.currentLoop = undefined;
		};

		const startCheckLoop = async () => {
			console.log("Starting Loop");
			if (this.currentLoop) await stopCheckLoop();
			this.currentLoop = new CheckLoop(this, video);
			this.currentLoop.Start();
		};

		icon.addEventListener("click", async () => {
			const state = (this.enabled = !this.enabled);
			if (!state) stopCheckLoop();
			console.log(`icon toggle ${state}`);
			icon.classList.toggle("repeater-icon-glow", state);
		});

		video.onpause = async () => {
			console.log("DBG: ONPAUSE");
			if (!this.enabled && !this.currentLoop) return;
			await stopCheckLoop();
		};
		video.onplay = async () => {
			console.log("DBG: ONPLAY");
			if (!this.enabled) return;
			await startCheckLoop();
		};
	}
}
