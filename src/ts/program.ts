import { Repeater } from "./repeater";
import { OnElementExists } from "./dom";

const repeater = new Repeater();
OnElementExists("menu-container", async (x) => await repeater.Start(x));