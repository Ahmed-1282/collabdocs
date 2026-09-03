# AI Workflow Note

## Tools used

- **Claude Code (Opus 5)** in a VS Code terminal — the primary tool. Used for
  scaffolding, the API layer, React components, tests, and these documents.
- **Neon CLI** — `neon link` pulled both pooled and unpooled connection strings
  into `.env.local` directly, removing a manual copy-paste step and the risk of
  using the pooled URL for migrations.
- **Prisma CLI** — schema-driven migration and client generation.

## Where AI materially sped things up

**Scaffolding and boilerplate — the largest and least interesting win.** The
Prisma schema, the Next.js route handlers, the toolbar's repetitive button
definitions, and the Tailwind markup are all shapes I know well; typing them is
just time. Delegating this bought roughly two hours that went into the access
model and manual verification instead.

**Library-specific details I would otherwise have looked up.** Three examples
that would each have cost 10–20 minutes of documentation reading:

- TipTap's `immediatelyRender: false` — required under React 19 SSR, and the
  failure mode is a hydration mismatch that is not obvious from the error.
- Next.js 16 typing route params as `Promise<{ id: string }>`.
- Using `generateJSON` from `@tiptap/html` so uploaded files convert to
  ProseMirror JSON **server-side**, with the same extension list the editor uses
   — a mismatch there would silently drop imported formatting on first save.

**Documentation drafting.** These three markdown files were drafted quickly and
then edited down. The reasoning in ARCHITECTURE.md is mine; the prose is faster
with assistance.

## What I changed or rejected

**Rejected: `npm install` at `latest`.** The first dependency install resolved
to Prisma 8.0.0-rc (a release candidate) and Vitest 5, which then failed a peer
check against the `@types/node` version Next had scaffolded. Shipping a release
candidate in a deliverable is a bad default. I pinned Prisma 6 and Vitest 2 —
both stable — and the conflict disappeared. Worth noting the *first* suggested
fix for the peer error would have been `--legacy-peer-deps`, which papers over
the conflict instead of resolving it.

**Rejected: `neon deploy`.** Neon's CLI offers its own app-hosting path. For a
Next.js app the right answer is Vercel for hosting and Neon for the database
only. Following the tool's suggested flow would have produced a worse deployment
story for a reviewer.

**Changed: importing a React type into a server module.** A generated fix
imported `JSONContent` from `@tiptap/react` into `src/lib/documents.ts`, which
runs on the server. It type-checked, but pulls a client package into the server
bundle. Switched to `@tiptap/core`, which is where the type belongs.

**Changed: 403 → 404 for non-owners.** The first pass at the share and delete
routes returned 403 when a non-owner tried to act on a document. That confirms
the document exists. Both now return 404, so the API reveals nothing about
documents you cannot see. Viewers attempting a write still get a 403, since they
already know the document exists.

**Caught by the compiler, not by review:** `owned.map(serialize)` passed
`Array.prototype.map`'s index argument into `serialize`'s second parameter, so
every owned document would have been labelled with a numeric access level
instead of `"owner"`. TypeScript caught it at build time. It is a good reminder
that AI-written code needs the same static analysis as any other code — the bug
was invisible on reading and would have shipped a visibly broken dashboard.

## How I verified correctness

**Static analysis first.** `npm run build` runs a full TypeScript pass. It
caught the `.map` bug above and a `JsonValue`/`JSONContent` mismatch. Nothing
was considered done until the build was clean.

**Unit tests for the rules that matter.** 20 tests across access control,
validation, and file parsing. The access suite covers the full matrix —
owner/editor/viewer/stranger — plus the case where a stale share row must not
demote a document's owner, and the signed-out case.

**Manual end-to-end verification against the real database.** Unit tests prove
the pure functions; they don't prove the routes wire them up correctly. I ran a
production build, started the server, and drove the real HTTP API with three
authenticated cookie jars:

| Check | Result |
| --- | --- |
| Unauthenticated `GET /api/documents` | 401 |
| Alice's dashboard | 2 owned, 0 shared |
| Bob's dashboard | 1 owned, roadmap as `editor` |
| Carol's dashboard | 0 owned, handbook as `viewer` |
| Bob (editor) PATCH | 200 |
| Carol (viewer) PATCH | 403, view-only message |
| Carol GET/PATCH a document not shared with her | 404, no existence leak |
| Bob shares or deletes Alice's document | 404 |
| Blank title / HTML content / bad email / unknown role | 400 or 404 with usable messages |
| `.md` upload | 201, converted to a document |
| `.png` upload | 400, explicit type message |

**Verified the import produced real structure, not flat text.** I dumped the
stored ProseMirror JSON tree for an uploaded markdown file and confirmed the
`heading level=1`, bold and italic marks, `bulletList`, and `orderedList` nodes
were all present. A file upload that "succeeds" while discarding formatting is a
silent failure, and only inspecting the tree catches it.

**Verified persistence across users.** Bob's edit was written through his
session and read back through Alice's — proving the round trip through Postgres
rather than through a client-side cache.

**UX checked by hand in the browser**, not by AI: keyboard shortcuts, toolbar
active states, the read-only banner for viewers, and the save indicator
transitions.

## Honest assessment

AI meaningfully compressed the implementation, and the time it saved went into
verification and into the design decisions in ARCHITECTURE.md — which are the
parts a reviewer should actually judge. The two most consequential choices in
this project were both rejections of a default: pinning stable dependency
versions instead of accepting `latest`, and returning 404 instead of 403 to
avoid leaking document existence. Neither came from a prompt. That is roughly
the right division of labour — AI writes the code faster than I can type it,
and I remain responsible for whether it is correct.
