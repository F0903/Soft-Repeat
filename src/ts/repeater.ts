import { GetElementByTag, AddInputter, GetElementByIdAndTag } from "./util";

export class Repeater
{
	constructor()
	{
		this.AddBody();
	}

	// Adds the control body of the repeater
	private async AddBody(): Promise<[HTMLInputElement, HTMLInputElement]>
	{
		const parent = await GetElementByIdAndTag("menu-container", "div");

		const repeaterRoot = document.createElement("div");

		repeaterRoot.setAttribute("id", "repeater-body");
		repeaterRoot.setAttribute("class", "repeater-body-renderer");
		parent.insertBefore(repeaterRoot, parent.firstChild);
		console.log(`Created repeater element at <${parent.tagName} id="${parent.id}" class="${parent.className}>`);

		const [, fromInput] = await AddInputter(repeaterRoot, "from");
		const [, toInput] = await AddInputter(repeaterRoot, "to");
		return [fromInput as HTMLInputElement, toInput as HTMLInputElement];
	}

	private async GetLoopPeriod(elems:[from: HTMLInputElement, to: HTMLInputElement]): Promise<[number, number]>
	{
		let nums = elems.map((elem) => {
			const input = elem.value;
			const splits = input.split(":");

			var secs = 0;
			splits.reverse().forEach((x, i) => {
				secs += parseInt(x) * 60 ** (i + 1);
			});
			return secs;
		})
		return [nums[0], nums[1]];
	}

	//TODO: Check if it's possible to hook into relevant events, instead of polling
	async Run()
	{
		console.log("Started RunRepeater");

		const video = await GetElementByTag("video") as HTMLVideoElement;
		const timeElems = await this.AddBody();

		const sleepTime = 1000;
		const nextLoop = () => setTimeout(runLoop, sleepTime);
		const runLoop = async () =>
		{
			// Where we check for the current duration and when we should fade.
			const loop: boolean = video.loop;
			if (!loop) // If the video loop value is false, just return, but make sure to still keep the loop running.
			{
				nextLoop();
				return;
			}

			const [from, to] = await this.GetLoopPeriod(timeElems);
			console.log(`From Time: ${from}\nTo Time: ${to}`);

			nextLoop();
		};
		runLoop();
	}
}