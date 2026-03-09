import chalk from 'chalk';
import type {Branch} from '../types/branch.js';
import {shortDate} from './format.js';

function truncate(str: string, max: number): string {
	if (str.length <= max) return str;
	return str.slice(0, max - 1) + '\u2026';
}

const DATE_WIDTH = 6;

const prStateColor: Record<string, (s: string) => string> = {
	OPEN: chalk.hex('#F5B731'),
	MERGED: chalk.hex('#A78BFA'),
	CLOSED: chalk.hex('#E84057'),
	DRAFT: chalk.hex('#636D83'),
};

export function printBranches(branches: Branch[]) {
	if (branches.length === 0) {
		console.log(chalk.hex('#636D83')('No branches found.'));
		return;
	}

	const maxName = Math.min(30, Math.max(...branches.map(b => b.name.length)));
	const maxAuthor = Math.min(16, Math.max(...branches.map(b => b.authorName.length)));
	const hasPRs = branches.some(b => b.pr);
	const prColWidth = hasPRs
		? Math.max(...branches.map(b => (b.pr ? `#${b.pr.number}`.length : 0)), 2)
		: 0;

	const cols = process.stdout.columns ?? 80;

	console.log(
		chalk.hex('#E4CCFF').bold('gitseek') + chalk.hex('#636D83')(' \u2014 branch explorer\n'),
	);

	// Header
	let header =
		'  ' +
		'BRANCH'.padEnd(maxName) +
		'  ' +
		'AGO'.padEnd(DATE_WIDTH) +
		'  ' +
		'AUTHOR'.padEnd(maxAuthor);
	if (prColWidth > 0) header += '  ' + 'PR'.padEnd(prColWidth);
	header += '  ' + 'LAST COMMIT';
	console.log(chalk.hex('#636D83').bold(header));

	for (const b of branches) {
		const current = b.isCurrent ? chalk.hex('#2EBD8E')('* ') : '  ';
		const nameStr = truncate(b.name, maxName).padEnd(maxName);
		const name = b.isCurrent
			? chalk.hex('#2EBD8E')(nameStr)
			: chalk.hex('#E5E5E5')(nameStr);
		const date = chalk.hex('#636D83')(shortDate(b.relativeDate).padEnd(DATE_WIDTH));
		const author = chalk.hex('#7AD4D6')(truncate(b.authorName, maxAuthor).padEnd(maxAuthor));

		let prCell = '';
		if (prColWidth > 0) {
			const prText = b.pr ? `#${b.pr.number}` : '';
			const colorFn = b.pr ? (prStateColor[b.pr.state] ?? chalk.dim) : chalk.dim;
			prCell = '  ' + colorFn(prText.padEnd(prColWidth));
		}

		const fixedWidth = 2 + maxName + 2 + DATE_WIDTH + 2 + maxAuthor + (prColWidth > 0 ? 2 + prColWidth : 0) + 2;
		const msgWidth = Math.max(10, cols - fixedWidth);
		const msg = chalk.dim(truncate(b.commitMessage, msgWidth));

		console.log(`${current}${name}  ${date}  ${author}${prCell}  ${msg}`);
	}

	console.log(chalk.hex('#636D83')(`\n${branches.length} branches`));
}
