import { Sleep } from "./util";
import { TryGetElementByTag, AddInputter } from "./dom";
import { OnAttributeChanged } from "./observer";
export class Repeater
{
	private static readonly lerpMilliDuration = 3000; // The duration of the lerp.

	private playing: boolean;

	private looping: boolean;

	private repeaterBody: HTMLElement;

	async Expand(): Promise<void>
	{
		const body = this.repeaterBody;
		body.style.opacity = "1";
	}

	async Collapse(): Promise<void>
	{
		const body = this.repeaterBody;
		const style = body.style;
		style.opacity = "0";
	}

	// Adds the control body of the repeater
	async AddBody(parent: HTMLElement): Promise<[HTMLInputElement, HTMLInputElement]>
	{
		const body = this.repeaterBody = document.createElement("div");
		body.setAttribute("id", "repeater-body");
		body.setAttribute("class", "repeater-body-renderer");
		await this.Collapse();
		parent.insertBefore(body, parent.firstChild);
		console.log("Added repeater.");

		const [, fromInput] = await AddInputter(body, "from");
		const [, toInput] = await AddInputter(body, "to");
		return [fromInput as HTMLInputElement, toInput as HTMLInputElement];
	}

	async GetLoopPeriod(elems:[from: HTMLInputElement, to: HTMLInputElement]): Promise<[number, number]>
	{
		const nums = elems.map((elem) =>
		{
			const input = elem.value;
			const splits = input.split(":");

			let secs = 0;
			splits.reverse().forEach((x, i) =>
			{
				secs += parseInt(x) * (i == 0 ? 1 : (60 ** i));
			});
			return secs;
		});
		return [nums[0], nums[1]];
	}

	async Start(parent: HTMLElement): Promise<void>
	{
		const video = await TryGetElementByTag("video") as HTMLVideoElement;
		const timeElems = await this.AddBody(parent);

		this.playing = true;
		this.looping = false;

		const determine = () =>
		{
			if (!this.looping)
			{
				this.Collapse();
				return;
			}
			this.Expand();
			if (!this.playing)
				return;
			this.Loop(video, timeElems);
		};
		video.onplay = () =>
		{
			this.playing = true;
			determine();
		};
		video.onpause = () =>
		{
			this.playing = false;
			determine();
		};
		const onloop = (val: boolean) =>
		{
			this.looping = val;
			determine();
		};

		OnAttributeChanged<boolean, HTMLVideoElement>(video, "loop", (x) => x.loop, onloop);
	}

	Loop = async (video: HTMLVideoElement, timeInput: [HTMLInputElement, HTMLInputElement]): Promise<void> =>
	{
		const sleepTime = 1000;

		const inputSelected = timeInput.some((x) => x === document.activeElement);

		const shouldExit = () => !this.looping || !this.playing;
		const shouldSkip = () => inputSelected;
		const nextLoop = () => setTimeout(this.Loop, sleepTime, video, timeInput);

		if (shouldExit())
		{
			return;
		}

		if (shouldSkip())
		{
			nextLoop();
			return;
		}

		let [from, to] = await this.GetLoopPeriod(timeInput);
		if (isNaN(from)) from = 0;
		if (isNaN(to)) to = video.duration;

		try
		{
			const duration = video.duration;
			if (duration === Infinity)
				throw "Cannot loop a livestream.";
			else if (!isNaN(duration) && duration && to > duration)
				throw "Selected duration is longer than the video.";
			else if (from < 0 || to < 0)
				throw "Duration cannot be under 0.";
			else if (from > to)
				throw "From cannot be larger than To.";
		}
		catch
		{
			//TODO: Add error catching, and visually show what the user is doing wrong.

		}

		const time = video.currentTime;
		if (time <= from)
		{
			video.currentTime = from;
		}
		else if (time >= to - Repeater.lerpMilliDuration / 1000)
		{
			await this.LerpVolume(video, 0);
			video.currentTime = from;
			await this.LerpVolume(video, 1);
		}
		nextLoop();
	}

	async LerpVolume(video: HTMLVideoElement, toValue: number): Promise<void>
	{
		const firstVol = video.volume;
		const iters = 100; // The amount of iterations to do it in. (more = more smooth, but more expensive)
		for (let i = 0; i <= iters; i++)
		{
			video.volume = firstVol - (firstVol - toValue) * (i / iters);
			await Sleep(Repeater.lerpMilliDuration / iters);
		}
		return;
	}
}