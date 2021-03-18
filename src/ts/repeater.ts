import { Sleep, TryGetElementByTag, AddInputter } from "./util";

export class Repeater
{
	private static readonly lerpMilliDuration = 3000; // The duration of the lerp.

	private playing: boolean;

	// Adds the control body of the repeater
	async AddBody(parent: HTMLElement): Promise<[HTMLInputElement, HTMLInputElement]>
	{
		const elem = document.createElement("div");
		elem.setAttribute("id", "repeater-body");
		elem.setAttribute("class", "repeater-body-renderer");
		parent.insertBefore(elem, parent.firstChild);
		console.log(`Created repeater element at <${parent.tagName} id="${parent.id}" class="${parent.className}>`);

		const [, fromInput] = await AddInputter(elem, "from");
		const [, toInput] = await AddInputter(elem, "to");
		return [fromInput as HTMLInputElement, toInput as HTMLInputElement];
	}

	async GetLoopPeriod(elems:[from: HTMLInputElement, to: HTMLInputElement]): Promise<[number, number]>
	{
		const nums = elems.map((elem) => {
			const input = elem.value;
			const splits = input.split(":");

			var secs = 0;
			splits.reverse().forEach((x, i) => {
				secs += parseInt(x) * (i == 0 ? 1 : (60 ** i));
			});
			return secs;
		})
		return [nums[0], nums[1]];
	}

	async Run(parent: HTMLElement)
	{
		console.log("Started RunRepeater");

		const video = await TryGetElementByTag("video") as HTMLVideoElement;
		const timeElems = await this.AddBody(parent);

		this.playing = true;

		video.onplay = () =>
		{
			this.playing = true;
			this.Loop(video, timeElems);
		}
		video.onpause = () =>
		{
			this.playing = false;
		}

		this.Loop(video, timeElems);
	}

	Loop = async (video: HTMLVideoElement, timeInput: [HTMLInputElement, HTMLInputElement]) => {
		const sleepTime = 1000;

		console.log(`Entered loop. Video elem: ${video}`);

		const notLooping = !video.loop;
		const inputSelected = timeInput.some((x) => x === document.activeElement);
		const notPlaying = !this.playing;

		const shouldExit = () => notPlaying;
		const shouldSkip = () => notLooping || inputSelected;
		const nextLoop = () => setTimeout(this.Loop, sleepTime, video, timeInput);

		if (shouldExit())
		{
			console.log("Exited loop.");
			return;
		}

		if (shouldSkip())
		{
			nextLoop();
			console.log("Skipped loop.");
			return;
		}

		let [from, to] = await this.GetLoopPeriod(timeInput);
		if (isNaN(from)) from = 0;
		if (isNaN(to)) to = video.duration;

		try
		{
			const duration = video.duration;
			if (duration === Infinity)
				throw new Error("Cannot loop a livestream.");
			else if (!isNaN(duration) && duration && to > duration)
				throw new Error("Selected duration is longer than the video.");
			else if (from < 0 || to < 0)
				throw new Error("Duration cannot be under 0.");
			else if (from > to)
				throw new Error("From cannot be larger than To.");
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
			console.log(`fading out... time was: ${time}`);
			await this.LerpVolume(video, 0);
			video.currentTime = from;
			await this.LerpVolume(video, 1);
		}
		nextLoop();
	}

	async LerpVolume(video: HTMLVideoElement, toValue: number): Promise<void> {
		const firstVol = video.volume;
		const iters = 100; // The amount of fractions to do it in.
		for (let i = 0; i <= iters; i++) {
			video.volume = firstVol - (firstVol - toValue) * (i / iters);
			await Sleep(Repeater.lerpMilliDuration / iters);
		}
		return;
	}
}