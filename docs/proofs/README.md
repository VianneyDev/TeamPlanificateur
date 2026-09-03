# Portfolio proofs

Captures for the four design-system proofs. Open these files, or the live URLs, without running the repo.

## Storybook

The catalog lives in `packages/ui`. Stories are colocated with components.

- [Button docs](storybook/button-docs.png)
- [Button default story](storybook/button-default.png)

Local catalog: `pnpm --filter @vianneytraina/ui storybook`.

## npm version history

Published versions of [`@vianneytraina/ui`](https://www.npmjs.com/package/@vianneytraina/ui): `1.0.0` (first public), `1.1.0` (additive `intent` / `emphasis`, `variant` still works), `2.0.0` (`variant` removed).

- [Versions tab](npm/version-history.png)
- Generated history: [`packages/ui/CHANGELOG.md`](../../packages/ui/CHANGELOG.md)

## Visual gate: red, then green after acceptance

An intentional Badge padding change failed the Storybook visual job, then passed after snapshots were accepted with `workflow_dispatch` (`update_snapshots`).

- Red run: [actions/runs/33171129497](https://github.com/VianneyDev/TeamPlanificateur/actions/runs/33171129497) ([capture](ci/visual-diff-red.png)). Quality and API jobs stayed green; **Storybook visual and accessibility** failed.
- Green after acceptance: [actions/runs/33173560696](https://github.com/VianneyDev/TeamPlanificateur/actions/runs/33173560696) ([capture](ci/snapshots-accepted-green.png)). That is the `workflow_dispatch` with `update_snapshots`: compare is skipped on purpose; the job regenerates baselines and commits them.

Pixel-level diff from the same Badge padding demo (PR 72):

| Expected | Actual | Diff |
| --- | --- | --- |
| [expected](visual-regression/badge-accent-dark-expected.png) | [actual](visual-regression/badge-accent-dark-actual.png) | [diff](visual-regression/badge-accent-dark-diff.png) |

## Honest scope

The only consumer of the published package is Team Planning Engine in this repository. The v2 migration is that app workspace. This is not a multi-team production rollout.
