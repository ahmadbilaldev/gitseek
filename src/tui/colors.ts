// Centralized color constants — purple theme with teal/amber accents.
// Mirrors the command-code palette for visual consistency.

export const PALETTE = {
	CYAN: '#7AD4D6',
	GREEN: '#2EBD8E',
	GRAY: '#636D83',
	WHITE: '#E5E5E5',
	YELLOW: '#F5B731',
	RED: '#E84057',
	BLUE: '#5945B1',
	MAGENTA: '#F2608A',
	DIM: '#636D83',
} as const;

export const ACCENT = '#E4CCFF';

export const STATUS_COLORS = {
	SUCCESS: '#35AD68',
	ERROR: '#E84057',
	WARNING: '#F5B731',
	IN_PROGRESS: '#E4CCFF',
} as const;

export const PR_COLORS = {
	OPEN: '#F5B731',
	MERGED: '#A78BFA',
	CLOSED: '#E84057',
	DRAFT: '#636D83',
} as const;

export const MUTED = '#636D83';
