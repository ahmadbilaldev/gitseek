import {Box, Text} from 'ink';
import React from 'react';
import {ACCENT, MUTED, PALETTE} from './colors.js';

interface StatusBarProps {
	total: number;
	filtered: number;
	mine: boolean;
	remote: boolean;
	message?: {text: string; color: string};
}

const StatusBar: React.FC<StatusBarProps> = ({total, filtered, mine, remote, message}) => {
	return (
		<Box flexDirection="column" marginTop={1}>
			<Box>
				<Text color={MUTED}>
					{filtered}/{total} branches
				</Text>
				{mine && (
					<Text color={PALETTE.YELLOW}> [mine]</Text>
				)}
				{remote && (
					<Text color={PALETTE.CYAN}> [+remote]</Text>
				)}
				{message && (
					<Box marginLeft={1}>
						<Text color={message.color}>{message.text}</Text>
					</Box>
				)}
			</Box>
			<Box>
				<Text dimColor>
					enter:checkout d:delete D:force-delete m:mine r:remote /:search q:quit
				</Text>
			</Box>
		</Box>
	);
};

export default StatusBar;
