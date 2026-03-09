// "3 minutes ago" -> "3m"
// "2 hours ago" -> "2h"
// "5 days ago" -> "5d"
// "3 weeks ago" -> "3w"
// "4 months ago" -> "4mo"
// "2 years ago" -> "2y"
export function shortDate(relative: string): string {
	const match = relative.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/);
	if (!match) return relative;

	const [, num, unit] = match;
	const map: Record<string, string> = {
		second: 's',
		minute: 'm',
		hour: 'h',
		day: 'd',
		week: 'w',
		month: 'mo',
		year: 'y',
	};

	return `${num}${map[unit] ?? unit}`;
}
