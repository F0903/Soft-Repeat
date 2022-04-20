import Repeater from "./repeater";
import { Volume } from "./volume";

export class CheckLoop{
    static readonly SleepTime = 1500;

    readonly owner: Repeater;
    readonly video: HTMLVideoElement;
    running: boolean = true;

    constructor(owner: Repeater, video: HTMLVideoElement) {
        this.owner = owner;
        this.video = video;
    }

    private ShouldIgnore(): boolean {
        return this.owner.IsInputSelected();
    }

    private Loop = async (): Promise<void> =>  {
        console.log("Running check");

        const nextCheck = () => {
            if (!this.running) {
                console.log("Exiting check.");
                return;
            }
            setTimeout(this.Loop, CheckLoop.SleepTime, this.video);
        }

		if (this.ShouldIgnore()) {
			nextCheck();
			return;
		}

		const videoDuration = this.video.duration;
		if (videoDuration === Infinity) { // Video is livestream.
			return;
		}
		if (isNaN(videoDuration)) throw "video.duration was NaN";

		let [from, to] = await this.owner.GetLoopPeriod();
		if (isNaN(from)) from = 0;
		if (isNaN(to)) to = videoDuration - 2;

		if (await this.owner.ErrorCheck(from, to, videoDuration)) {
			nextCheck();
			return;
		}

		const time = this.video.currentTime;
		if (time < from || time > to) {
			// Is the video way past the start, or has the user skipped past the end?
			this.video.currentTime = from;
		} else if (time >= to - Volume.LerpMillis / 1000) {
			const lastVol = this.video.volume;
			await Volume.Lerp(this.video, 0);
			this.video.currentTime = from;
			await Volume.Lerp(this.video, lastVol);
		}

		nextCheck();
    }

    Stop() {
        this.running = false;
    }

    async Start(): Promise<void> {
        await this.Loop();
    }
}