import { Repeater } from "./repeater";
import { OnElementExistsWithClass } from "./dom";

//TODO: Make a larger refactor
//"menu-container"
const repeater = new Repeater();
OnElementExistsWithClass(
	"title style-scope ytd-video-primary-info-renderer",
	async (x) => await repeater.Start(x)
);
