import Repeater from "./repeater/repeater";
import { OnElementExistsWithClass } from "./utility/dom";

//TODO: Make a larger refactor
//"menu-container"

OnElementExistsWithClass(
	"title style-scope ytd-video-primary-info-renderer",
	async (x) => new Repeater().Start(x)
);
