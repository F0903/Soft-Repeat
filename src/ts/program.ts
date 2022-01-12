import "@fortawesome/fontawesome-free/js/all.js";

import Repeater from "./repeater/repeater";
import { OnElementExists } from "./utility/dom";
import EventBlocker from "./utility/eventblocker";

let repeater: Repeater; // To be sure it wont be GC'd

EventBlocker.Block("keyup", "keydown");
EventBlocker.SetBlock(false);

function OnMenuExists(elem: HTMLElement) {
	const newParent = elem.nextSibling as HTMLElement;
	elem.remove();

	repeater = new Repeater();
	repeater.Init(newParent, "beforebegin");
}

OnElementExists("body > div.ytp-popup.ytp-contextmenu", (x) => {
	const height = "343px";
	x.style.height = height;
	(x.firstElementChild as HTMLElement).style.height = height;
});

OnElementExists(
	"body > div.ytp-popup.ytp-contextmenu > div.ytp-panel > div.ytp-panel-menu > div",
	OnMenuExists
);
