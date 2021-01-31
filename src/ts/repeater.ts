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
			const splits = input.split("|");
			if (splits.length < 1 || splits.length > 4)
			throw new Error("Incorrect format.");

			// Look for better ways to do this (if there is).
			var inSecs = 0;
			splits.forEach((x, i) => {
				if (splits.length == 1 && i == 0) {
					inSecs += parseInt(x);
				}
				else if (splits.length == 2 && i == 1) {
					inSecs += parseInt(x) * 60;
				}
				else if (splits.length == 3 && i == 2) {
					inSecs += parseInt(x) * 60 * 60;
				}
				else if (splits.length == 4 && i == 3) {
					inSecs += parseInt(x) * 60 * 60 * 60;
				}
			});
			return inSecs;
		})
		return [nums[0], nums[1]];
	}

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