export async function Sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function GetElementByTag(elemTag: string)
{
	for (let attempt = 0; attempt < 3; attempt++) {
		const elem = document.getElementsByTagName(elemTag)[0];
		if (elem != null)
			return elem;
		await Sleep(1000);
	}
}

export async function GetElementByIdAndTag(elemId: string, elemTag: string = null)
{
	//TODO: Use MutationObserver instead
	let elem;
	while (elem == null) {
		console.log("Parent was null. Checking again...");

		if (elemTag != null) {
			const elemsWithTag = document.getElementsByTagName(elemTag);
			for (const key in elemsWithTag) {
				const element = elemsWithTag[key];
				if (element.id == elemId)
					elem = element;
			}
		}
		else {
			elem = document.getElementById(elemId);
		}

		await Sleep(1000);
	}
	return elem;
}

export async function AddLabelElement(parent: Element, className: string, forId: string, text: string)
{
	const elem = document.createElement("label");
	if (className != null)
		elem.setAttribute("class", className);
	elem.setAttribute("for", forId);
	elem.innerHTML = text;
	parent.appendChild(elem);
	return elem;
}

export async function AddInputElement(parent: Element, className: string, id: string)
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