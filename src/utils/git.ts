import {execSync} from 'node:child_process';
import type {Branch, PullRequest} from '../types/branch.js';

function exec(cmd: string): string {
	try {
		return execSync(cmd, {encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']}).trim();
	} catch {
		return '';
	}
}

export function isGitRepo(): boolean {
	return exec('git rev-parse --is-inside-work-tree') === 'true';
}

export function getCurrentUserEmail(): string {
	return exec('git config user.email');
}

export function getCurrentUserName(): string {
	return exec('git config user.name');
}

export function getBranches(includeRemote: boolean): Branch[] {
	const sep = '||';
	const format = [
		'%(refname:short)',
		'%(HEAD)',
		'%(committerdate:iso)',
		'%(committerdate:relative)',
		'%(authorname)',
		'%(authoremail)',
		'%(subject)',
		'%(objectname:short)',
		'%(upstream:short)',
	].join(sep);

	const refs = includeRemote ? 'refs/heads refs/remotes' : 'refs/heads';
	const raw = exec(
		`git for-each-ref --sort=-committerdate --format='${format}' ${refs}`,
	);

	if (!raw) return [];

	const seen = new Set<string>();

	return raw
		.split('\n')
		.filter(Boolean)
		.map((line): Branch | null => {
			const parts = line.split(sep);
			if (parts.length < 9) return null;

			const [name, head, date, relDate, author, email, message, hash, upstream] = parts;

			// Skip HEAD pointer refs
			if (name === 'origin/HEAD') return null;

			const isRemote = name.startsWith('origin/');
			const cleanName = isRemote ? name.replace('origin/', '') : name;

			// Deduplicate: local branch wins over remote
			if (isRemote && seen.has(cleanName)) return null;
			seen.add(cleanName);

			return {
				name: cleanName,
				isCurrent: head === '*',
				isRemote: isRemote && !seen.has(cleanName),
				lastCommitDate: new Date(date),
				relativeDate: relDate,
				authorName: author,
				authorEmail: email.replace(/[<>]/g, ''),
				commitMessage: message,
				commitHash: hash,
				upstream: upstream || undefined,
			};
		})
		.filter((b): b is Branch => b !== null);
}

export function getPRsForBranches(): Map<string, PullRequest> {
	const prMap = new Map<string, PullRequest>();

	try {
		const raw = exec(
			`gh pr list --state all --limit 100 --json headRefName,number,title,state,url`,
		);
		if (!raw) return prMap;

		const prs = JSON.parse(raw) as Array<{
			headRefName: string;
			number: number;
			title: string;
			state: string;
			url: string;
		}>;

		for (const pr of prs) {
			prMap.set(pr.headRefName, {
				number: pr.number,
				title: pr.title,
				state: pr.state as PullRequest['state'],
				url: pr.url,
			});
		}
	} catch {
		// gh CLI not available or not in a GitHub repo
	}

	return prMap;
}

export function checkoutBranch(name: string): {ok: boolean; error?: string} {
	try {
		execSync(`git checkout ${name}`, {encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']});
		return {ok: true};
	} catch (e: any) {
		return {ok: false, error: e.stderr || e.message};
	}
}

export function deleteBranch(name: string, force: boolean): {ok: boolean; error?: string} {
	try {
		const flag = force ? '-D' : '-d';
		execSync(`git branch ${flag} ${name}`, {encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']});
		return {ok: true};
	} catch (e: any) {
		return {ok: false, error: e.stderr || e.message};
	}
}
