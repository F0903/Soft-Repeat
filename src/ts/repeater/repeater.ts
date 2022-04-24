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
		return this.repeaterBody!.GetInputs().some(
			(x) => x === document.activeElement
		);
	}

	SetInputToVideoTimes(video: HTMLVideoElement) {
		if (!this.repeaterBody) return;
		const fromInput = this.repeaterBody.FromInput;
		const toInput = this.repeaterBody.ToInput;

		fromInput.value = "";
		toInput.value = "";

		let actualSecs = video.duration;
		let actualMins = 0;
		let actualHours = 0;

		if (actualSecs > 60) {
			const mins = actualSecs / 60;
			const roundedMins = Math.floor(mins);
			actualMins = roundedMins;
			actualSecs -= roundedMins * 60;
		}

		if (actualMins > 60) {
			const hours = actualMins / 60;
			const roundedHours = Math.floor(hours);
			actualHours = roundedHours;
			actualMins -= roundedHours * 60;
		}

		if (actualHours > 1) {
			toInput.value = actualHours.toString() + ":";
			if (actualMins < 10) toInput.value += "0";
		}
		toInput.value += actualMins.toString() + ":";
		if (actualSecs < 10) toInput.value += "0";
		toInput.value += Math.floor(actualSecs).toString();

		fromInput.value = "0:00";
	}

	async Init(sibling: HTMLElement, positon: InsertPosition): Promise<void> {
		const video = (await TryGetElementByTag("video")) as HTMLVideoElement;
		const repeater = (this.repeaterBody = await RepeaterBody.AddBody(
			sibling,
			positon
		));
		const body = repeater.GetBody();
		const icon = body.querySelector("div.repeater-icon") as HTMLElement;

		this.SetInputToVideoTimes(video);

		const stopCheckLoop = async () => {
			console.log("Stopping Loop");
			if (!this.currentLoop) return;
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
			console.log("DBG: ONCLICK");
			const state = (this.enabled = !this.enabled);
			if (state) startCheckLoop();
			else stopCheckLoop();
			console.log(`icon toggle ${state}`);
			icon.classList.toggle("repeater-icon-glow", state);
		});

		video.oncanplay = () => {
			this.SetInputToVideoTimes(video);
		};

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
