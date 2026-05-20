# ZZZOD Plugin Registry

Astro + Vue static registry site for ZenlessZoneZero OneDragon third-party plugins.

## Commands

```shell
pnpm install
pnpm registry:build
pnpm dev
pnpm build
pnpm preview
```

Local UI testing with mock entries:

```shell
$env:INCLUDE_MOCK_PLUGINS="true"
pnpm registry:build
pnpm build
```

Production build uses real entries only:

```shell
pnpm registry:build
pnpm build
```

## Environment

```text
SITE_URL=https://your-org.github.io
PUBLIC_GITHUB_OWNER=your-org
PUBLIC_GITHUB_REPO=plugin-registry
```

The site is configured for GitHub Pages repository hosting at `/plugin-registry/`.

## Production

1. Create a GitHub repository named `plugin-registry`.
2. Push this project to the repository default branch `main`.
3. In GitHub repository settings, enable Pages with source `GitHub Actions`.
4. Set repository variables if the owner/repo differ:

```text
SITE_URL=https://<owner>.github.io
PUBLIC_GITHUB_OWNER=<owner>
PUBLIC_GITHUB_REPO=plugin-registry
```

5. Push to `main` or run `Deploy` manually from Actions.

The workflow builds `dist/` from source and uploads it to GitHub Pages. `node_modules/`, `.astro/`, and `dist/` stay local.

## Add Plugin

1. Confirm the plugin repository has a valid `plugin.json` and GitHub Release.
2. Add a real entry to `registry/plugins.json`.
3. Fill the current Release fields manually for MVP: `version`, `versionCode`, `tag`, `commit`, `publishedAt`, `downloadUrl`, `sha256`.
4. Keep UI-only test data marked with `"mock": true`.
5. Run:

```shell
pnpm registry:build
pnpm build
```

6. Open a PR or push to `main` after review.

## Static API

```text
/plugin-registry/plugins.json
/plugin-registry/search-index.json
/plugin-registry/plugins/{id}.json
```
