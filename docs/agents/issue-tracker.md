# Issue tracker: beads (source of truth) + GitHub (mirror)

This repo uses two complementary systems. Understand the split before touching either.

- **beads (`bd`) is the source of truth for task status.** It decides what is ready, claimed, blocked, and done. All work pilots through beads: `bd ready`, `bd show`, `bd update --claim`. See the beads section of AGENTS.md and run `bd prime`.
- **GitHub Issues is a public mirror** that also hosts PRDs. Issues are created here so the work is visible, and they are kept in sync with beads status (an issue closes on GitHub when its PR merges via `Closes #<n>`).
- **GitHub Pull Requests handle code review and merge.** This is GitHub's job, not beads'.

Never treat GitHub Issues as the place that decides task lifecycle. beads decides; GitHub reflects.

## Creating and reading issues (mirror operations)

Use the `gh` CLI. Infer the repo from `git remote -v` (gh does this automatically inside a clone).

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels`.
- **Comment**: `gh issue comment <number> --body "..."`
- **Labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`

Do NOT run `gh issue close` as part of implementing a task. Closing an issue is tied to its PR merging (`Closes #<n>` in the PR body) or is a human action. Task completion is recorded in beads by a human via `bd close` after merge.

## Pull requests

- **Create a PR**: `gh pr create` with `Closes #<n>` in the body to link it to the mirrored issue.
- **Read a PR**: `gh pr view <number> --comments`, and `gh pr diff <number>` for the diff.
- **Comment / label**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either. Resolve with `gh pr view 42`, fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue (mirror), and ensure the corresponding beads issue exists and is the one you track for status.

## When a skill says "fetch the relevant ticket"

Read status and details from beads first (`bd show <id>`). Use `gh issue view <number> --comments` for the public discussion or PRD context.
