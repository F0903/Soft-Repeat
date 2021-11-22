import "../js/fontawesome.js";
import Repeater from "./repeater/repeater";
import { OnElementExists } from "./utility/dom";

OnElementExists("div.ytp-left-controls", async (x) => new Repeater().Start(x));
