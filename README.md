# CollabDocs

A lightweight collaborative document editor — create, edit, import, and share
rich-text documents. Built as a focused product slice rather than a Google Docs
clone.

**Live demo:** _(add your Vercel URL here after deploying)_

## Reviewer quick start

Sign in with any seeded account — **there are no passwords**. Authentication is
mocked so you can switch users quickly and exercise the sharing model.

| Account | Starts with |
| --- | --- |
| `alice@example.com` | Owns 2 documents, shares one with Bob (editor) and one with Carol (viewer) |
| `bob@example.com` | Owns 1 private document, **can edit** Alice's "Q3 Product Roadmap" |
| `carol@example.com` | Owns nothing, **view-only** on Alice's "Engineering Handbook" |

### Two-minute tour of the sharing model

1. Sign in as **Alice** → both documents appear under **My documents**.
2. Open "Q3 Product Roadmap" → click **Share** → see Bob listed as an editor.
3. Click **Switch user** → sign in as **Bob** → the roadmap appears under
   **Shared with me**, tagged *Can edit*. Type in it; edits save automatically.
4. Switch to **Carol** → "Engineering Handbook" appears under **Shared with me**,
   tagged *View only*. The toolbar is disabled and a banner explains why.
5. Back as **Alice**, reopen the document — Bob's changes are there.

Open two browsers (or one normal + one incognito) to hold two sessions at once.

## Features

- **Rich-text editing** — bold, italic, underline, three heading levels,
  bulleted and numbered lists, blockquotes, code, undo/redo.
- **Autosave** — debounced 800 ms after you stop typing, with a live
  *Saving… / All changes saved / Save failed* indicator.
- **Inline rename** — edit the title in the header; it saves on a debounce.
- **File import** — upload a `.txt`, `.md`, or `.docx` file (max 1 MB) and it
  becomes a new editable document with its formatting preserved.
- **Sharing** — share by email as **Viewer** or **Editor**; revoke at any time.
  Only the owner can manage sharing.
- **Owned vs shared** — the dashboard splits *My documents* from
  *Shared with me*, each row tagged with your access level.

### Supported upload types

`.txt`, `.md`, `.docx` — maximum 1 MB. Anything else is rejected with a clear
message. Files are parsed **in memory and discarded**; only the resulting
document is stored, so no blob storage is required.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Editor | TipTap 3 (ProseMirror) |
| Database | Neon Postgres (serverless) |
| ORM | Prisma 6 |
| Styling | Tailwind CSS 4 |
| Auth | Signed JWT session cookie (`jose`), no passwords |
| Tests | Vitest |
| Hosting | Vercel |

## Local setup

**Prerequisites:** Node.js 20.19+ (or 22 LTS) and a free
[Neon](https://neon.com) Postgres database.

```bash
git clone <your-repo-url>
cd collabdocs
npm install
```

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Fill in three values:

- `DATABASE_URL` — Neon **pooled** connection string (hostname contains `-pooler`)
- `DATABASE_URL_UNPOOLED` — Neon **direct** connection string (no `-pooler`)
- `AUTH_SECRET` — generate with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

> Prisma's CLI reads `.env` while Next.js reads `.env.local`. The simplest
> approach is to keep the same contents in both; both are gitignored.

Create the schema and seed the demo accounts:

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs TypeScript) |
| `npm start` | Serve the production build |
| `npm test` | Run the Vitest suite |
| `npm run db:seed` | Reset the three demo accounts and documents |
| `npm run db:migrate` | Create and apply a migration |

## Tests

```bash
npm test
```

20 tests across three suites. The meaningful one is
[`src/lib/__tests__/access.test.ts`](src/lib/__tests__/access.test.ts), which
covers the authorization matrix — owner, editor, viewer, and stranger — including
the case where a stale share row must not demote a document's own owner. The
others cover input validation and file-import parsing (including HTML escaping
of uploaded text).

## Deployment

1. Push to GitHub.
2. Import the repo on [Vercel](https://vercel.com).
3. Add `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `AUTH_SECRET` as environment
   variables.
4. Deploy. `postinstall` runs `prisma generate` automatically.
5. Seed production once, with the production `DATABASE_URL` in your shell:
   `npx prisma db seed`

## Known limitations

These are deliberate scope cuts, not oversights — see
[ARCHITECTURE.md](ARCHITECTURE.md) for the reasoning.

- **No real-time collaboration.** Two people editing the same document
  simultaneously will overwrite each other — last write wins.
- **Mocked auth.** No passwords; any seeded email signs you in. The session
  cookie is signed, so users cannot impersonate one another by editing it, but
  this is a demo mechanism, not production auth.
- **Sharing is limited to seeded users.** Sharing with an unregistered email
  returns a clear error rather than sending an invitation.
- **No version history, comments, or export.**
- `npm audit` reports advisories in Vitest's transitive `esbuild`/`vite` chain.
  These are dev-only dependencies and are not part of the deployed application.
