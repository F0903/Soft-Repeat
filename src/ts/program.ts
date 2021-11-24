import "@fortawesome/fontawesome-free/js/all.js";

import Repeater from "./repeater/repeater";
import { OnElementExists } from "./utility/dom";

let repeater: Repeater; // To be sure it wont be GC'd

window.addEventListener("keyup", (ev) => {
	ev.stopImmediatePropagation();
	ev.preventDefault();
	console.log("ADASDWASD");
});

window.addEventListener("keydown", (ev) => {
	ev.stopImmediatePropagation();
	ev.preventDefault();
	console.log("ADASDWASD");
});

function OnMenuExists(elem: HTMLElement) {
	const newParent = elem.nextSibling as HTMLElement;
	elem.remove();

	repeater = new Repeater();
	repeater.Start(newParent, "beforebegin");
}

OnElementExists("body > div.ytp-popup.ytp-contextmenu", (x) => {
	const height = "400px";
	x.style.height = height;
	(x.firstElementChild as HTMLElement).style.height = height;
});

OnElementExists(
	"body > div.ytp-popup.ytp-contextmenu > div.ytp-panel > div.ytp-panel-menu > div",
	OnMenuExists
);
