import {Box, Text, useApp, useInput} from 'ink';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Spinner from 'ink-spinner';
import {ACCENT, MUTED, PALETTE, STATUS_COLORS} from './colors.js';
import Divider from './divider.js';
import BranchRow, {BranchHeader} from './branch-row.js';
import StatusBar from './status-bar.js';
import type {Branch, BranchFilters} from '../types/branch.js';
import {
	checkoutBranch,
	deleteBranch,
	getBranches,
	getCurrentUserEmail,
	getGitHubUsername,
	getPRsForBranches,
	openUrl,
} from '../utils/git.js';

interface AppProps {
	initialMine?: boolean;
	initialRemote?: boolean;
	initialSearch?: string;
}

type StatusMessage = {text: string; color: string} | undefined;

const App: React.FC<AppProps> = ({initialMine = false, initialRemote = false, initialSearch = ''}) => {
	const {exit} = useApp();
	const [branches, setBranches] = useState<Branch[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<BranchFilters>({
		mine: initialMine,
		remote: initialRemote,
		search: initialSearch,
	});
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchMode, setSearchMode] = useState(initialSearch.length > 0);
	const [statusMessage, setStatusMessage] = useState<StatusMessage>();
	const [confirmDelete, setConfirmDelete] = useState<{name: string; force: boolean} | null>(null);
	const [userEmail, setUserEmail] = useState('');
	const [ghUsername, setGhUsername] = useState('');

	// Load branches
	useEffect(() => {
		const email = getCurrentUserEmail();
		setUserEmail(email);
		setGhUsername(getGitHubUsername());

		const allBranches = getBranches(filters.remote);
		const prMap = getPRsForBranches();

		for (const branch of allBranches) {
			const pr = prMap.get(branch.name);
			if (pr) branch.pr = pr;
		}

		setBranches(allBranches);
		setLoading(false);
	}, [filters.remote]);

	// Filter branches
	const filtered = useMemo(() => {
		let result = branches;

		if (filters.mine) {
			result = result.filter(
				b =>
					b.authorEmail === userEmail ||
					(ghUsername && b.pr?.assignees.includes(ghUsername)),
			);
		}

		if (filters.search) {
			const q = filters.search.toLowerCase();
			result = result.filter(
				b =>
					b.name.toLowerCase().includes(q) ||
					b.commitMessage.toLowerCase().includes(q) ||
					b.authorName.toLowerCase().includes(q),
			);
		}

		return result;
	}, [branches, filters, userEmail]);

	// Clamp selected index
	useEffect(() => {
		if (selectedIndex >= filtered.length) {
			setSelectedIndex(Math.max(0, filtered.length - 1));
		}
	}, [filtered.length, selectedIndex]);

	// Clear status messages after delay
	useEffect(() => {
		if (!statusMessage) return;
		const timer = setTimeout(() => setStatusMessage(undefined), 3000);
		return () => clearTimeout(timer);
	}, [statusMessage]);

	const showStatus = useCallback((text: string, color: string) => {
		setStatusMessage({text, color});
	}, []);

	const handleCheckout = useCallback(() => {
		const branch = filtered[selectedIndex];
		if (!branch || branch.isCurrent) return;

		const result = checkoutBranch(branch.name);
		if (result.ok) {
			showStatus(`Switched to ${branch.name}`, STATUS_COLORS.SUCCESS);
			// Refresh branches
			const refreshed = getBranches(filters.remote);
			const prMap = getPRsForBranches();
			for (const b of refreshed) {
				const pr = prMap.get(b.name);
				if (pr) b.pr = pr;
			}
			setBranches(refreshed);
		} else {
			showStatus(result.error || 'Checkout failed', STATUS_COLORS.ERROR);
		}
	}, [filtered, selectedIndex, filters.remote, showStatus]);

	const handleDelete = useCallback(
		(force: boolean) => {
			const branch = filtered[selectedIndex];
			if (!branch || branch.isCurrent) {
				showStatus('Cannot delete current branch', STATUS_COLORS.WARNING);
				return;
			}

			if (!confirmDelete || confirmDelete.name !== branch.name || confirmDelete.force !== force) {
				setConfirmDelete({name: branch.name, force});
				showStatus(
					`Press ${force ? 'D' : 'd'} again to confirm delete ${branch.name}`,
					STATUS_COLORS.WARNING,
				);
				return;
			}

			const result = deleteBranch(branch.name, force);
			setConfirmDelete(null);
			if (result.ok) {
				showStatus(`Deleted ${branch.name}`, STATUS_COLORS.SUCCESS);
				setBranches(prev => prev.filter(b => b.name !== branch.name));
			} else {
				showStatus(result.error || 'Delete failed', STATUS_COLORS.ERROR);
			}
		},
		[filtered, selectedIndex, confirmDelete, showStatus],
	);

	// Visible window for scrolling
	const maxVisible = Math.max(1, (process.stdout.rows ?? 24) - 8);
	const scrollOffset = useMemo(() => {
		if (selectedIndex < Math.floor(maxVisible / 2)) return 0;
		if (selectedIndex > filtered.length - Math.ceil(maxVisible / 2)) {
			return Math.max(0, filtered.length - maxVisible);
		}
		return selectedIndex - Math.floor(maxVisible / 2);
	}, [selectedIndex, filtered.length, maxVisible]);

	const visibleBranches = filtered.slice(scrollOffset, scrollOffset + maxVisible);
	const maxNameWidth = Math.min(
		30,
		Math.max(...filtered.map(b => b.name.length), 10),
	);
	const maxAuthorWidth = Math.min(
		16,
		Math.max(...filtered.map(b => b.authorName.length), 8),
	);
	const hasPRs = filtered.some(b => b.pr);
	const prColWidth = hasPRs
		? Math.max(...filtered.map(b => (b.pr ? `#${b.pr.number}`.length : 0)), 2)
		: 0;

	useInput((input, key) => {
		// Search mode input handling
		if (searchMode) {
			if (key.escape || (key.return && filters.search === '')) {
				setSearchMode(false);
				setFilters(f => ({...f, search: ''}));
				return;
			}
			if (key.return) {
				setSearchMode(false);
				return;
			}
			if (key.backspace || key.delete) {
				setFilters(f => ({...f, search: f.search.slice(0, -1)}));
				return;
			}
			if (input && !key.ctrl && !key.meta) {
				setFilters(f => ({...f, search: f.search + input}));
			}
			return;
		}

		// Confirm delete mode — any key other than the confirm cancels
		if (confirmDelete && input !== 'd' && input !== 'D') {
			setConfirmDelete(null);
			setStatusMessage(undefined);
		}

		// Navigation
		if (key.upArrow || input === 'k') {
			setSelectedIndex(i => Math.max(0, i - 1));
		} else if (key.downArrow || input === 'j') {
			setSelectedIndex(i => Math.min(filtered.length - 1, i + 1));
		}

		// Actions
		if (key.return) handleCheckout();
		if (input === 'o') {
			const branch = filtered[selectedIndex];
			if (branch?.pr?.url) {
				openUrl(branch.pr.url);
				showStatus(`Opened PR #${branch.pr.number}`, STATUS_COLORS.SUCCESS);
			} else {
				showStatus('No PR for this branch', STATUS_COLORS.WARNING);
			}
		}
		if (input === 'd') handleDelete(false);
		if (input === 'D') handleDelete(true);
		if (input === 'm') {
			setFilters(f => ({...f, mine: !f.mine}));
			setSelectedIndex(0);
		}
		if (input === 'r') {
			setFilters(f => ({...f, remote: !f.remote}));
			setLoading(true);
			setSelectedIndex(0);
		}
		if (input === '/' || input === 's') {
			setSearchMode(true);
		}
		if (input === 'q' || key.escape) {
			exit();
		}
	});

	if (loading) {
		return (
			<Box padding={1}>
				<Text color={ACCENT}>
					<Spinner type="dots" />
				</Text>
				<Text color={MUTED}> Loading branches...</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingX={1}>
			<Box marginBottom={1}>
				<Text color={ACCENT} bold>
					gitseek
				</Text>
				<Text color={MUTED}> — branch explorer</Text>
			</Box>

			{searchMode && (
				<Box marginBottom={1}>
					<Text color={PALETTE.YELLOW}>search: </Text>
					<Text color={PALETTE.WHITE}>{filters.search}</Text>
					<Text color={MUTED}>|</Text>
				</Box>
			)}

			{!searchMode && filters.search && (
				<Box marginBottom={1}>
					<Text color={PALETTE.YELLOW}>filtered: </Text>
					<Text color={PALETTE.WHITE}>{filters.search}</Text>
					<Text dimColor> (press / to edit, esc to clear)</Text>
				</Box>
			)}

			<Divider />

			{filtered.length > 0 && (
				<BranchHeader maxNameWidth={maxNameWidth} maxAuthorWidth={maxAuthorWidth} prColWidth={prColWidth} />
			)}

			{filtered.length === 0 ? (
				<Box paddingY={1}>
					<Text color={MUTED}>No branches found.</Text>
				</Box>
			) : (
				visibleBranches.map((branch, i) => (
					<BranchRow
						key={`${branch.name}-${branch.isRemote ? 'r' : 'l'}`}
						branch={branch}
						isSelected={scrollOffset + i === selectedIndex}
						maxNameWidth={maxNameWidth}
						maxAuthorWidth={maxAuthorWidth}
						prColWidth={prColWidth}
					/>
				))
			)}

			{filtered.length > maxVisible && (
				<Box marginTop={0}>
					<Text dimColor>
						{' '}
						{scrollOffset > 0 ? '...' : '   '} {scrollOffset + visibleBranches.length}/{filtered.length}{' '}
						{scrollOffset + maxVisible < filtered.length ? '...' : '   '}
					</Text>
				</Box>
			)}

			<StatusBar
				total={branches.length}
				filtered={filtered.length}
				mine={filters.mine}
				remote={filters.remote}
				message={statusMessage}
			/>
		</Box>
	);
};

export default App;
