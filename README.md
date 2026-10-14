# Full Stack JavaScript

This repository contains a structured course in modern full stack JavaScript
development. The default school path focuses on React, Node.js, Express, and SQLite.
The original MongoDB path remains available through the course-track selector.
Advanced topics and independent specializations are kept available without
interrupting the core learning path.

The published course is available at
[prof-davidaffo.github.io/fullstackopen-ita](https://prof-davidaffo.github.io/fullstackopen-ita/).

## Course structure

- **Core course (parts 0–5):** web fundamentals, React, REST APIs, Node.js,
  Express, SQLite (or MongoDB in the original track), testing, authentication,
  and client-side routing. SQLite deployment is a final chapter after part 5e.
- **Advanced topics (parts 6–7):** state management, hooks, build tooling,
  application organization, and security.
- **Specializations (parts 8–14):** GraphQL, TypeScript, React Native, CI/CD,
  containers, relational databases, and Next.js.

The curriculum shown on the site is defined centrally in
`src/courseConfig.js`. Source material that is not part of the published
learning path is retained in the repository for attribution and future reuse.
Legacy university logistics and promotional pages are likewise retained as
source files but are not published by the site.

## Course tracks

- Default URLs, such as `/it/part3`, select SQLite.
- `/mongodb/it/part3` selects the original MongoDB material.
- The track selector remembers the choice in local storage. Landing pages restore
  that preference; a chapter URL always selects its own track, even when shared.
- Language selection is independent of the track. SQLite-specific lessons are
  available in Italian and English; other languages show an explicit English
  fallback for these lessons. Unchanged lessons retain their original language.
- SQLite overrides live in `src/content/sqlite` with `course: sqlite`
  frontmatter. Shared chapters reuse the original node. All published material
  omits upstream exercise submission rules and portals.
- Existing chapter slugs are retained for link compatibility, even when a SQLite
  chapter has a new displayed title. The final deployment chapter is part 5f.
- Search results, sidebar links, previous/next links and internal content links
  follow the selected track. Assets and the local example app are shared.

Run the track and SQLite example checks without installing extra packages:

```bash
node tests/course-content.test.cjs
node tests/course-tracks.test.cjs
node tests/sqlite-api-smoke.cjs
```

These tests require a Node runtime with `node:sqlite`. They verify page selection,
search, Markdown assets, SQL CRUD, migrations and HTTP operations (the smoke test
opens a temporary localhost port). They do not install the packages
used by student projects (such as bcryptjs, jsonwebtoken or Supertest).

After building with `PATH_PREFIX=/fullstackopen-ita`, check generated HTML with:

```bash
node tests/built-course-smoke.cjs /fullstackopen-ita
```

Parts 6–14 retain the available advanced material; the SQLite adaptation covers
the core course (0–5), not every specialization. English chapters for parts 8–11
are served locally. Parts 12–13 link to the local Spanish chapters; Next.js
material is not yet available in this handbook.

## Development

Use Node.js 22 for local development and production builds.

Install the dependencies and start the site:

```bash
npm i
npm run develop
```

Use `npm run check` to verify formatting and `npm run build` to create a
production build.

## GitHub Pages

In the repository's **Settings → Pages → Build and deployment**, set **Source**
to **GitHub Actions**. The workflow builds and deploys pushes to `source` and can
also be started manually from the Actions tab. It uses the built-in GitHub token;
the old `SEKRED2` secret is no longer needed.

The build uses `npm ci` and automatically sets the Gatsby path prefix from the
repository name. Course-track and generated-HTML checks run before publication.

## Origin and license

This project is derived from the University of Helsinki's Full Stack Open
course. The original material was created by Matti Luukkainen and the many
authors and contributors credited in the source material.

The material remains licensed under the
[Creative Commons BY-NC-SA 3.0 license](https://creativecommons.org/licenses/by-nc-sa/3.0/).
Modified material distributed from this repository must retain attribution and
use the same license. Commercial use requires permission.
