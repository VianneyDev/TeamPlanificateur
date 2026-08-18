# Changesets: publish the design system, never version the app

Only `packages/ui` is an npm package. The Astro app must not be versioned or published.

## Decision

- App `package.json`: `"private": true`.
- Do **not** put the app in Changesets `ignore`.
- After `changeset init`, **read** `.changeset/config.json` and confirm `"privatePackages": { "version": false, "tag": false }` (current Changesets default). If init or an older template wrote `"version": true`, set `"version": false` before the first release.
- `@vianneytraina/ui` has **`"private": false` explicitly** (not an omitted field). Technically the same as omitting `private` (npm default is publishable). The difference is the failure mode: a missing key looks like forgotten scaffolding; a present `false` must be edited to break A7. In a monorepo whose app is `"private": true`, both packages showing the field documents the asymmetry instead of relying on knowing npm’s default. Not a structural fork; both work. This ADR records `false` as the chosen form.
- Set Changesets `"access": "public"` (init default is `restricted`). That must agree with `"publishConfig": { "access": "public" }` on `@vianneytraina/ui` (ADR-0009). `publishConfig` is the source of truth: a scoped package is private on npm unless access is public, and a CLI `--access public` is easy to forget (A7).

`ignore` stays empty unless a *temporary* skip of a *publishable* package is needed. That is not this app.

## Rationale

`"private": true` is the documented way to never publish ([Changesets config, `access`](https://changesets.dev/guide/config)). With current `privatePackages.version: false`, Changesets also skips versioning and tagging private packages ([Beyond npm](https://changesets.dev/guide/beyond-npm)).

`ignore` is documented as **temporary**. Mixing an ignored package and a non-ignored package in one changeset can fail publish. The app does not need that mechanism.

Older docs and some generated configs used `privatePackages.version: true`. Checking after init is part of the decision, not optional cleanup.

## Alternatives not taken

- `ignore: ["<app name>"]` (with or without `private`). Extra failure modes, no extra guarantee once `private` + `version: false` hold.
- `privatePackages.version: true` to version the app as an application. Rejected: the app must not be versioned.
- Changesets `"access": "restricted"` (init default) or CLI-only `--access public`. Rejected for `@vianneytraina/ui`: scoped packages default to private on npm (A7 / ADR-0009).
- Omit `private` on `@vianneytraina/ui` (npm default = publishable). Same runtime as `"private": false`; rejected only for scaffolding/failure-mode clarity, not for npm semantics.
