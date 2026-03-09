import {Command} from 'commander';
import {render} from 'ink';
import React from 'react';
import App from './tui/app.js';
import {isGitRepo, isGhInstalled, isGhAuthenticated, getBranches, getCurrentUserEmail, getGitHubUsername, getPRsForBranches} from './utils/git.js';
import {printBranches} from './utils/print.js';

const program = new Command('gitseek')
	.description('Interactive git branch explorer with GitHub PR status')
	.version('0.1.0')
	.option('-m, --mine', 'Show only my branches')
	.option('-a, --all', 'Include remote branches')
	.option('-s, --search <query>', 'Pre-filter branches by search query')
	.option('-p, --print', 'Non-interactive print mode')
	.action((options: {mine?: boolean; all?: boolean; search?: string; print?: boolean}) => {
		if (!isGitRepo()) {
			console.error('Not a git repository.');
			process.exit(1);
		}

		if (!isGhInstalled()) {
			console.warn('GitHub CLI (gh) not found. PR status, assignee matching, and open PR will be unavailable.');
			console.warn('Install it: https://cli.github.com\n');
		} else if (!isGhAuthenticated()) {
			console.warn('GitHub CLI not authenticated. Run `gh auth login` to enable PR features.\n');
		}

		if (options.print || !process.stdin.isTTY) {
			const email = getCurrentUserEmail();
			const ghUser = getGitHubUsername();
			let branches = getBranches(options.all ?? false);
			const prMap = getPRsForBranches();
			for (const b of branches) {
				const pr = prMap.get(b.name);
				if (pr) b.pr = pr;
			}
			if (options.mine) {
				branches = branches.filter(
					b =>
						b.authorEmail === email ||
						(ghUser && b.pr?.assignees.includes(ghUser)),
				);
			}
			if (options.search) {
				const q = options.search.toLowerCase();
				branches = branches.filter(
					b =>
						b.name.toLowerCase().includes(q) ||
						b.commitMessage.toLowerCase().includes(q),
				);
			}
			printBranches(branches);
			return;
		}

		render(
			React.createElement(App, {
				initialMine: options.mine,
				initialRemote: options.all,
				initialSearch: options.search,
			}),
		);
	});

program.parse();
