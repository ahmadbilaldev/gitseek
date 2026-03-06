import chalk from 'chalk';
import type {Branch} from '../types/branch.js';

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

	const maxName = Math.min(40, Math.max(...branches.map(b => b.name.length)));
	const maxDate = Math.max(...branches.map(b => b.relativeDate.length));
	const maxAuthor = Math.min(20, Math.max(...branches.map(b => b.authorName.length)));

	console.log(
		chalk.hex('#E4CCFF').bold('gitseek') + chalk.hex('#636D83')(' — branch explorer\n'),
	);

	for (const b of branches) {
		const current = b.isCurrent ? chalk.hex('#2EBD8E')('* ') : '  ';
		const name = b.isCurrent
			? chalk.hex('#2EBD8E')(b.name.padEnd(maxName))
			: chalk.hex('#E5E5E5')(b.name.padEnd(maxName));
		const date = chalk.hex('#636D83')(b.relativeDate.padEnd(maxDate));
		const author = chalk.hex('#7AD4D6')(b.authorName.padEnd(maxAuthor));
		const msg = chalk.dim(b.commitMessage.slice(0, 40));

		let pr = '';
		if (b.pr) {
			const colorFn = prStateColor[b.pr.state] ?? chalk.dim;
			pr = colorFn(` [${b.pr.state} #${b.pr.number}]`);
		}

		console.log(`${current}${name}  ${date}  ${author}  ${msg}${pr}`);
	}

	console.log(chalk.hex('#636D83')(`\n${branches.length} branches`));
}
