# gitseek

Interactive git branch explorer with GitHub PR status.

Browse, search, and manage git branches from a single interactive TUI — sorted by latest, filtered by author, with inline PR badges via GitHub CLI.

## Install

```bash
npm install -g gitseek
```

## Usage

```bash
# Interactive mode
gitseek

# Short alias
gs

# Show only your branches
gitseek --mine

# Include remote branches
gitseek --all

# Pre-filter by search query
gitseek --search "feature"

# Non-interactive output
gitseek --print

# Combine flags
gitseek --mine --search "fix" --print
```

## Interactive Controls

| Key | Action |
|---|---|
| `j` / `k` or arrows | Navigate up/down |
| `enter` | Checkout selected branch |
| `d` | Delete branch (press twice to confirm) |
| `D` | Force delete branch |
| `m` | Toggle "my branches" filter |
| `r` | Toggle remote branches |
| `/` or `s` | Search branches |
| `esc` | Clear search / exit |
| `q` | Quit |

## Features

- **Sorted by latest** — branches ordered by last commit date
- **Author filter** — `--mine` uses your `git config user.email`
- **Fuzzy search** — filter across branch name, commit message, and author
- **PR status** — inline badges (OPEN, MERGED, CLOSED, DRAFT) via `gh` CLI
- **Quick actions** — checkout, delete, force-delete with keyboard shortcuts
- **Scrolling viewport** — handles repos with hundreds of branches
- **Print mode** — non-interactive output for scripting and piping

## Development

```bash
# Clone and install
git clone https://github.com/ahmadbilaldev/gitseek.git
cd gitseek
pnpm install

# Link globally for live testing
pnpm build
pnpm link --global

# Now `gitseek` and `gs` are available globally
# pointing to your local build

# Watch mode — auto-rebuilds on file changes
pnpm dev

# In another terminal, test your changes
gitseek --mine
```

After `pnpm link --global`, every `pnpm dev` rebuild is immediately reflected when you run `gitseek` — no reinstall needed.

To unlink when done:

```bash
pnpm unlink --global
```

## Requirements

- Node.js 18+
- Git
- [GitHub CLI](https://cli.github.com/) (`gh`) — optional, for PR status badges

## License

MIT
