import {Box, Text} from 'ink';
import React from 'react';
import {PALETTE} from './colors.js';

interface DividerProps {
	title?: string;
	titleColor?: string;
	dividerColor?: string;
	padding?: number;
}

const Divider: React.FC<DividerProps> = ({
	title,
	titleColor = PALETTE.GRAY,
	dividerColor = PALETTE.GRAY,
	padding = 0,
}) => {
	const totalWidth = Math.max(0, (process.stdout.columns ?? 80) - padding * 2 - 2);
	const titleText = title ? `${title} ` : '';
	const lineText = '─'.repeat(Math.max(0, totalWidth - titleText.length));

	return (
		<Box paddingLeft={padding} paddingRight={padding}>
			{title && <Text color={titleColor}>{titleText}</Text>}
			<Text color={dividerColor}>{lineText}</Text>
		</Box>
	);
};

export default Divider;
