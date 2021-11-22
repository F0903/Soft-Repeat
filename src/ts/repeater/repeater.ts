import { Sleep } from "./../utility/util";
import { TryGetElementByTag } from "./../utility/dom";
import { OnAttributeChanged } from "./../utility/observer";
import RepeaterBody from "./repeater-body";

export default class Repeater {
	private static readonly lerpMilliDuration = 3000; // The duration of the lerp.

	private playing: boolean = true;
	private looping: boolean = false;
	private running: boolean = false;

	private repeaterBody?: RepeaterBody;

	private async GetLoopPeriod(): Promise<[number, number]> {
		if (!this.repeaterBody) return [0, 0];
		const elems = [this.repeaterBody.fromInput, this.repeaterBody.toInput];
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
			this.repeaterBody.SetFromInputError();
			error = true;
		} else if (from > to) {
			// From cannot be larger than To.
			this.repeaterBody.SetFromInputError();
			error = true;
		} else {
			this.repeaterBody.ClearFromInputError();
		}

		if (to > videoDuration) {
			this.repeaterBody.SetToInputError();
			error = true;
		} else {
			this.repeaterBody.ClearToInputError();
		}
		return Promise.resolve(error);
	}

	private Loop = async (video: HTMLVideoElement): Promise<void> => {
		if (!this.repeaterBody) return;
		const sleepTime = 1000;

		const inputSelected = [
			this.repeaterBody.fromInput,
			this.repeaterBody.toInput,
		].some((x) => x === document.activeElement);

		const shouldExit = () => !this.looping || !this.playing;
		const shouldSkip = () => inputSelected;
		const nextLoop = () => setTimeout(this.Loop, sleepTime, video);

		if (shouldExit()) {
			this.running = false;
			return;
		}

		if (shouldSkip()) {
			nextLoop();
			return;
		}

		const videoDuration = video.duration;
		if (videoDuration === Infinity) {
			// Video is livestream.
			this.running = false;
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

	async Start(parent: HTMLElement): Promise<void> {
		const video = (await TryGetElementByTag("video")) as HTMLVideoElement;
		this.repeaterBody = await RepeaterBody.AddBody(parent);

		const determineLoop = async () => {
			if (!this.repeaterBody) return;
			if (!this.looping) {
				await this.repeaterBody.Collapse();
				return;
			}

			await this.repeaterBody.Expand();
			if (!this.playing || this.running) return;
			this.running = true;
			await this.Loop(video);
		};
		video.onpause = async () => {
			if (!this.playing) return;
			this.playing = false;
			await determineLoop();
		};
		video.onplay = async () => {
			if (this.playing) return;
			this.playing = true;
			await determineLoop();
		};
		const onloop = async (val: boolean) => {
			this.looping = val;
			await determineLoop();
		};

		OnAttributeChanged<boolean, HTMLVideoElement>(
			video,
			"loop",
			(x) => x.loop,
			onloop
		);
	}
}
