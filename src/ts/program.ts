import { Repeater } from "./repeater";

async function Start() {
	const repeater = new Repeater();
	await repeater.Run();
}

Start();