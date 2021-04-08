
export function OnAttributeChanged<T, E extends HTMLElement>(target: E, attName: string, attGetter: (target: E) => T, onChanged: (value: T) => void): void
{
	//Note: Do not specify filter, since some attributes are not shown on the html element.
	const obsSettings = {
		attributes: true
	};
	const obs = new MutationObserver((records, ) =>
	{
		records.forEach((mut) =>
		{
			if (mut.attributeName != attName)
			{
				return;
			}
			const elem = mut.target as E;
			const val = attGetter(elem);
			onChanged(val);
		});
	});
	obs.observe(target, obsSettings);
}