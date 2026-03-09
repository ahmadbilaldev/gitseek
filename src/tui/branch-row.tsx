import {Box, Text} from 'ink';
import React from 'react';
import {ACCENT, MUTED, PALETTE, PR_COLORS} from './colors.js';
import {shortDate} from '../utils/format.js';
import type {Branch} from '../types/branch.js';

interface BranchRowProps {
	branch: Branch;
	isSelected: boolean;
	maxNameWidth: number;
	maxAuthorWidth: number;
	prColWidth: number;
}

function truncate(str: string, max: number): string {
	if (str.length <= max) return str;
	return str.slice(0, max - 1) + '\u2026';
}

function getPrColor(state: string): string {
	switch (state) {
		case 'OPEN':
			return PR_COLORS.OPEN;
		case 'MERGED':
			return PR_COLORS.MERGED;
		case 'CLOSED':
			return PR_COLORS.CLOSED;
		case 'DRAFT':
			return PR_COLORS.DRAFT;
		default:
			return MUTED;
	}
}

const DATE_WIDTH = 6;

export const BranchHeader: React.FC<{maxNameWidth: number; maxAuthorWidth: number; prColWidth: number}> = ({
	maxNameWidth,
	maxAuthorWidth,
	prColWidth,
}) => {
	return (
		<Box>
			<Text color={MUTED}>{'   '}</Text>
			<Text color={MUTED} bold>{'BRANCH'.padEnd(maxNameWidth)}</Text>
			<Text color={MUTED} bold>{' '}{'AGO'.padEnd(DATE_WIDTH)}</Text>
			<Text color={MUTED} bold>{' '}{'AUTHOR'.padEnd(maxAuthorWidth)}</Text>
			{prColWidth > 0 && <Text color={MUTED} bold>{' '}{'PR'.padEnd(prColWidth)}</Text>}
			<Text color={MUTED} bold>{' '}{'LAST COMMIT'}</Text>
		</Box>
	);
};

const BranchRow: React.FC<BranchRowProps> = ({branch, isSelected, maxNameWidth, maxAuthorWidth, prColWidth}) => {
	const pointer = isSelected ? '>' : ' ';
	const current = branch.isCurrent ? '*' : ' ';
	const nameColor = branch.isCurrent ? PALETTE.GREEN : isSelected ? ACCENT : PALETTE.WHITE;
	const name = truncate(branch.name, maxNameWidth).padEnd(maxNameWidth);
	const author = truncate(branch.authorName, maxAuthorWidth).padEnd(maxAuthorWidth);
	const date = shortDate(branch.relativeDate).padEnd(DATE_WIDTH);

	// PR column
	const prText = branch.pr ? `#${branch.pr.number}` : '';
	const prColor = branch.pr ? getPrColor(branch.pr.state) : MUTED;

	// Calculate remaining space for commit message
	const cols = process.stdout.columns ?? 80;
	const fixedWidth = 4 + maxNameWidth + 1 + DATE_WIDTH + 1 + maxAuthorWidth + (prColWidth > 0 ? 1 + prColWidth : 0) + 1;
	const msgWidth = Math.max(10, cols - fixedWidth - 2);

	return (
		<Box>
			<Text color={isSelected ? ACCENT : MUTED}>{pointer}</Text>
			<Text color={branch.isCurrent ? PALETTE.GREEN : MUTED}>{current} </Text>
			<Text color={nameColor} bold={isSelected}>
				{name}
			</Text>
			<Text color={MUTED}> {date}</Text>
			<Text color={PALETTE.CYAN}> {author}</Text>
			{prColWidth > 0 && <Text color={prColor}> {prText.padEnd(prColWidth)}</Text>}
			<Text dimColor> {truncate(branch.commitMessage, msgWidth)}</Text>
		</Box>
	);
};

export default React.memo(BranchRow);
