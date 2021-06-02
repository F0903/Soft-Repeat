import Repeater from "./repeater/repeater";
import { OnElementExistsWithClass } from "./utility/dom";

OnElementExistsWithClass(
	"title style-scope ytd-video-primary-info-renderer",
	async (x) => new Repeater().Start(x)
);
