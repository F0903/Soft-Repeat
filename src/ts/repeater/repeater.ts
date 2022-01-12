import { Sleep } from "./../utility/util";
import { TryGetElementByTag } from "./../utility/dom";
import { OnAttributeChanged } from "./../utility/observer";
import RepeaterBody from "./repeater-body";

export default class Repeater {
	private static readonly lerpMilliDuration = 3000; // The duration of the lerp.

	private playing: boolean = true;
	private looping: boolean = false;
	private loopInProgress: boolean = false;

	private repeaterBody?: RepeaterBody;

	private async GetLoopPeriod(): Promise<[number, number]> {
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

	private ErrorCheck(
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

	private Loop = async (video: HTMLVideoElement): Promise<void> => {
		if (!this.repeaterBody) return;
		const sleepTime = 1000;

		const inputSelected = this.repeaterBody
			.GetInputs()
			.some((x) => x === document.activeElement);

		const shouldExit = () => !this.looping || !this.playing;
		const shouldSkip = () => inputSelected;
		const nextLoop = () => setTimeout(this.Loop, sleepTime, video);

		this.loopInProgress = true;

		if (shouldExit()) {
			this.loopInProgress = false;
			return;
		}

		if (shouldSkip()) {
			nextLoop();
			return;
		}

		const videoDuration = video.duration;
		if (videoDuration === Infinity) {
			// Video is livestream.
			this.loopInProgress = false;
			return;
		}
		if (isNaN(videoDuration)) throw "video.duration was NaN";

		let [from, to] = await this.GetLoopPeriod();
		if (isNaN(from)) from = 0;
		if (isNaN(to)) to = videoDuration - 2;

		if (await this.ErrorCheck(from, to, videoDuration)) {
			nextLoop();
			return;
		}

		const time = video.currentTime;
		if (time < from) {
			video.currentTime = from;
		} else if (time >= to - Repeater.lerpMilliDuration / 1000) {
			const lastVol = video.volume;
			await this.LerpVolume(video, 0);
			video.currentTime = from;
			await this.LerpVolume(video, lastVol);
		}

		nextLoop();
	};

	private async LerpVolume(
		video: HTMLVideoElement,
		toValue: number
	): Promise<void> {
		const firstVol = video.volume;
		const iters = 100; // The amount of iterations to do it in. (more = more smooth, but more expensive)
		for (let i = 0; i <= iters; i++) {
			video.volume = firstVol - (firstVol - toValue) * (i / iters);
			await Sleep(Repeater.lerpMilliDuration / iters);
		}
	}

	async Init(sibling: HTMLElement, positon: InsertPosition): Promise<void> {
		const repeater = (this.repeaterBody = await RepeaterBody.AddBody(
			sibling,
			positon
		));
		const body = repeater.GetBody();
		const icon = body.querySelector("div.repeater-icon") as HTMLElement;

		const video = (await TryGetElementByTag("video")) as HTMLVideoElement;

		const stopLoop = async () => {
			console.log("Stopping Loop");
			if (!this.loopInProgress) return;
			icon.classList.toggle("fancyfy", false);
		};

		const startLoop = async () => {
			if (!repeater) return;

			console.log("Starting Loop");
			if (this.loopInProgress) return;
			icon.classList.toggle("fancyfy", true);
			await this.Loop(video);
		};

		icon.addEventListener("click", () => startLoop());

		video.onpause = async () => {
			console.log("Pause");
			if (!this.playing) return;
			this.playing = false;
			await stopLoop();
		};
		video.onplay = async () => {
			console.log("Play");
			if (this.playing) return;
			this.playing = true;
			await startLoop();
		};
	}
}
