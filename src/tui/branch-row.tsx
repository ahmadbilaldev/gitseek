import {Box, Text} from 'ink';
import React from 'react';
import {ACCENT, MUTED, PALETTE, PR_COLORS} from './colors.js';
import type {Branch} from '../types/branch.js';

interface BranchRowProps {
	branch: Branch;
	isSelected: boolean;
	maxNameWidth: number;
}

function getPrBadge(state: string): {label: string; color: string} {
	switch (state) {
		case 'OPEN':
			return {label: 'PR', color: PR_COLORS.OPEN};
		case 'MERGED':
			return {label: 'MG', color: PR_COLORS.MERGED};
		case 'CLOSED':
			return {label: 'CL', color: PR_COLORS.CLOSED};
		case 'DRAFT':
			return {label: 'DR', color: PR_COLORS.DRAFT};
		default:
			return {label: '', color: ''};
	}
}

const BranchRow: React.FC<BranchRowProps> = ({branch, isSelected, maxNameWidth}) => {
	const pointer = isSelected ? '>' : ' ';
	const current = branch.isCurrent ? '*' : ' ';
	const nameColor = branch.isCurrent ? PALETTE.GREEN : isSelected ? ACCENT : PALETTE.WHITE;
	const paddedName = branch.name.padEnd(maxNameWidth);

	return (
		<Box>
			<Text color={isSelected ? ACCENT : MUTED}>{pointer}</Text>
			<Text color={branch.isCurrent ? PALETTE.GREEN : MUTED}>{current} </Text>
			<Text color={nameColor} bold={isSelected}>
				{paddedName}
			</Text>
			<Text color={MUTED}> {branch.relativeDate.padEnd(16)}</Text>
			<Text color={PALETTE.CYAN}> {branch.authorName.padEnd(20)}</Text>
			<Text dimColor> {branch.commitMessage.slice(0, 40)}</Text>
			{branch.pr && (
				<Text color={getPrBadge(branch.pr.state).color}>
					{' '}
					[{getPrBadge(branch.pr.state).label} #{branch.pr.number}]
				</Text>
			)}
		</Box>
	);
};

export default React.memo(BranchRow);
