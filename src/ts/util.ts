export async function Sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function TryGetElementByTag(elemTag: string)
{
	for (let attempt = 0; attempt < 3; attempt++) {
		const elem = document.getElementsByTagName(elemTag)[0];
		if (elem != null)
			return elem;
		await Sleep(1000);
	}
}

export async function OnElementExists(elemId: string, onFound: (elem: HTMLElement) => any): Promise<void>
{
	let elem = null;
	while ((elem = document.getElementById(elemId)) === null) { await Sleep(20);}
	onFound(elem);
}

export async function AddInputter(parent: Element, name: string)
{
	const div = document.createElement("div");
	div.setAttribute("class", ".repeater-input-parent");
	div.setAttribute("id", `${name}-input-parent`);

	const id = `${name}-input`;
	const label = await AddLabelElement(parent, "repeater-label", id, name.toUpperCase());
	const input = await AddInputElement(label, "repeater-input", id);
	return [label, input];
}

async function AddLabelElement(parent: Element, className: string, forId: string, text: string)
{
	const elem = document.createElement("label");
	if (className != null)
		elem.setAttribute("class", className);
	elem.setAttribute("for", forId);
	elem.innerHTML = text;
	parent.appendChild(elem);
	return elem;
}

async function AddInputElement(parent: Element, className: string, id: string)
{
	const elem = document.createElement("input");
	if (className != null)
		elem.setAttribute("class", className);
	if (id != null)
		elem.setAttribute("id", id);
	elem.setAttribute("type", "text");
	elem.setAttribute("maxlength", "8");
	elem.onkeyup = () => elem.value = elem.value.replace(/((?!\d|:).)+/, "");
	parent.appendChild(elem);
	return elem;
}