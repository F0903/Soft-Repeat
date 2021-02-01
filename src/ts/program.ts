import { Repeater } from "./repeater";
import { OnElementExists } from "./util";

const repeater = new Repeater();
OnElementExists("menu-container", async (x) => await repeater.Run(x));