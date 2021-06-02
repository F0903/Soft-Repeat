export function OnAttributeChanged<T, E extends HTMLElement>(
	target: E,
	attName: string,
	attGetter: (target: E) => T,
	onChanged: (value: T) => void
): void {
	const obs = new MutationObserver((records) => {
		records.forEach((mut) => {
			if (mut.attributeName != attName) {
				return;
			}
			const elem = mut.target as E;
			const val = attGetter(elem);
			onChanged(val);
		});
	});
	obs.observe(target, {
		attributes: true,
	});
}
