import Repeater from "./repeater/repeater";
import KeyBlocker from "./utility/keyblocker";
import { OnAttributeChanged } from "./utility/observer";
import { OnElementExists } from "./utility/dom";

let repeater: Repeater; // To be sure it wont be GC'd

function InitKeyBlocker(menu: HTMLElement) {
	KeyBlocker.Init();
	KeyBlocker.SetBlock(true);

	OnAttributeChanged(
		menu,
		"style",
		(x) => x.style.display,
		(x) => {
			KeyBlocker.SetBlock(x != "none");
		}
	);
}


function OnMenuExists(elem: HTMLElement) {
	const height = "308px";
	elem.style.height = height;
	(elem.firstElementChild as HTMLElement).style.height = height;
	InitKeyBlocker(elem);
}

OnElementExists("body > div.ytp-popup.ytp-contextmenu", OnMenuExists);


function OnMenuPanelExists(elem: HTMLElement) {
	const newParent = elem.nextSibling as HTMLElement;
	elem.remove();

	repeater = new Repeater();
	repeater.Init(newParent, "beforebegin");
}

OnElementExists(
	"body > div.ytp-popup.ytp-contextmenu > div.ytp-panel > div.ytp-panel-menu > div",
	OnMenuPanelExists
);
