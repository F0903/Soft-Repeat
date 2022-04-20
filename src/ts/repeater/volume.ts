import { Sleep } from "../utility/util";

export class Volume {
    static readonly LerpMillis = 3000; // The duration of the lerp.

    static async Lerp(
		video: HTMLVideoElement,
		toValue: number
	): Promise<void> {
		const firstVol = video.volume;
		const iters = 100; // The amount of iterations to do it in. (more = more smooth, but more expensive)
		for (let i = 0; i <= iters; i++) {
			video.volume = firstVol - (firstVol - toValue) * (i / iters);
			await Sleep(Volume.LerpMillis / iters);
		}
	}
}