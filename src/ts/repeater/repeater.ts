import { Sleep } from "./../utility/util";
import { TryGetElementByTag } from "./../utility/dom";
import { OnAttributeChanged } from "./../utility/observer";
import RepeaterBody from "./repeater-body";

export default class Repeater {
	private static readonly lerpMilliDuration = 3000; // The duration of the lerp.

	private stopping: boolean = false;
	private enabled: boolean = false;
	private checkInProgress: boolean = false;

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

	private IsInputSelected = () =>
		this.repeaterBody!.GetInputs().some((x) => x === document.activeElement);

	private ShouldExitCheck = () => !this.enabled || this.stopping;

	private ShouldSkipCheck = () => this.IsInputSelected();

	private CanCheck(): boolean {
		return this.enabled;
	}

	private CheckLoop = async (video: HTMLVideoElement): Promise<void> => {
		if (!this.repeaterBody) return;
		const sleepTime = 1000;

		console.log("Running check");

		const nextCheck = () => setTimeout(this.CheckLoop, sleepTime, video);

		this.checkInProgress = true;

		if (this.ShouldExitCheck()) {
			console.log("Exiting check.");
			this.checkInProgress = false;
			this.stopping = false;
			return;
		}

		if (this.ShouldSkipCheck()) {
			nextCheck();
			return;
		}

		const videoDuration = video.duration;
		if (videoDuration === Infinity) {
			// Video is livestream.
			this.checkInProgress = false;
			return;
		}
		if (isNaN(videoDuration)) throw "video.duration was NaN";

		let [from, to] = await this.GetLoopPeriod();
		if (isNaN(from)) from = 0;
		if (isNaN(to)) to = videoDuration - 2;

		if (await this.ErrorCheck(from, to, videoDuration)) {
			nextCheck();
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

		nextCheck();
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

		const stopCheck = async () => {
			console.log("Stopping Loop");
			if (!this.checkInProgress) return;
			this.stopping = true;
		};

		const startCheck = async () => {
			console.log("Starting Loop");
			if (this.checkInProgress) return;
			await this.CheckLoop(video);
			console.log("STARTLOOP EXIT");
		};

		icon.addEventListener("click", () => {
			const state = (this.enabled = !this.enabled);
			console.log(`icon toggle ${state}`);
			icon.classList.toggle("repeater-icon-glow", state);
		});

		video.onpause = async () => {
			await stopCheck();
		};
		video.onplay = async () => {
			console.log(`stopping: ${this.stopping}`);
			console.log(`enabled: ${this.enabled}`);
			console.log(`can check: ${this.CanCheck()}`);

			if (!this.CanCheck()) return;
			await startCheck();
		};
	}
}
