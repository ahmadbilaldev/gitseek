export interface Branch {
	name: string;
	isCurrent: boolean;
	isRemote: boolean;
	lastCommitDate: Date;
	relativeDate: string;
	authorName: string;
	authorEmail: string;
	commitMessage: string;
	commitHash: string;
	upstream?: string;
	pr?: PullRequest;
}

export interface PullRequest {
	number: number;
	title: string;
	state: 'OPEN' | 'MERGED' | 'CLOSED' | 'DRAFT';
	url: string;
	assignees: string[];
}

export interface BranchFilters {
	mine: boolean;
	remote: boolean;
	search: string;
}
