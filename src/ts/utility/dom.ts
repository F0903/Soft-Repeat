import { Sleep } from "./util";

export async function TryGetElementByTag(
	elemTag: string
): Promise<Element | null> {
	for (let attempt = 0; attempt < 3; attempt++) {
		const elem = document.getElementsByTagName(elemTag)[0];
		if (elem != null) return elem;
		await Sleep(1000);
	}
	return null;
}

export async function OnElementExists(
	selector: string,
	onFound: (elem: HTMLElement) => void
): Promise<void> {
	const isNullOrUndef = (x: unknown) => x === null || x === undefined;

	let elem;
	while (
		isNullOrUndef((elem = document.querySelector(selector) as HTMLElement))
	) {
		await Sleep(20);
	}
	onFound(elem);
}
