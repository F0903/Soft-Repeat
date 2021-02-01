import { Sleep, TryGetElementByTag, AddInputter } from "./util";

export class Repeater
{
	// Adds the control body of the repeater
	private async AddBody(parent: HTMLElement): Promise<[HTMLInputElement, HTMLInputElement]>
	{
		//const parent = await GetElementByIdAndTag("menu-container", "div");

		const elem = document.createElement("div");
		elem.setAttribute("id", "repeater-body");
		elem.setAttribute("class", "repeater-body-renderer");
		parent.insertBefore(elem, parent.firstChild);
		console.log(`Created repeater element at <${parent.tagName} id="${parent.id}" class="${parent.className}>`);

		const [, fromInput] = await AddInputter(elem, "from");
		const [, toInput] = await AddInputter(elem, "to");
		return [fromInput as HTMLInputElement, toInput as HTMLInputElement];
	}

	private async GetLoopPeriod(elems:[from: HTMLInputElement, to: HTMLInputElement]): Promise<[number, number]>
	{
		let nums = elems.map((elem) => {
			const input = elem.value;
			const splits = input.split(":");
			console.log(`Starting split for elem ${elem}`);

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

		//TODO: Run this through events, not polling.
		const sleepTime = 1000;
		const nextLoop = () => setTimeout(runLoop, sleepTime);
		const runLoop = async () =>
		{
			// Where we check for the current duration and when we should fade.
			const loop: boolean = video.loop;
			// Check if loop is on, or if any of the input boxes have focus.
			if (!loop || timeElems.some((x) => x === document.activeElement))
			{
				nextLoop();
				return;
			}

			let [from, to] = await this.GetLoopPeriod(timeElems);
			from = from != NaN ? from : 0; // If no input was given, just use 0.
			to = to != NaN ? to : video.duration; // If no input was given, use the duration.

			console.log(`From Time: ${from}\nTo Time: ${to}`);

			try
			{
				const duration = video.duration;
				if (duration == Infinity)
					throw new Error("Cannot loop a livestream.");
				else if (duration != NaN && duration && to > duration)
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

			//TODO: Lerp smoothly to value.
			const time = video.currentTime;
			if (time < from)
			{
				video.currentTime = from;
			}
			else if (time > to)
			{
				await this.LerpVolume(video, 0);
				video.currentTime = from;
				await this.LerpVolume(video, 1);
			}

			nextLoop();
		};
		runLoop();
	}

	async LerpVolume(video: HTMLVideoElement, toValue: number): Promise<void> {
		const firstVol = video.volume;
		const milliDuration = 3000; // The duration of the lerp.
		const iters = 100; // The amount of fractions to do it in.
		for (let i = 0; i <= iters; i++) {
			video.volume = firstVol - (firstVol - toValue) * (i / iters);
			await Sleep(milliDuration / iters);
		}
		return;
	}
}