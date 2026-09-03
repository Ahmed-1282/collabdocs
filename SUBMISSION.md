# Submission — CollabDocs

**Candidate:** Ahmed Baig · ahmedbaig137@gmail.com
**Assignment:** AI-Native Full Stack Developer — Ajaia LLC

## Links

| Item | Link |
| --- | --- |
| Live product | <https://collabdocs-orcin.vercel.app> |
| Walkthrough video | <https://www.loom.com/share/ec5bfa861e244dfeb981019951864e1c> |
| Source code | This repository |

## Test accounts

No passwords — authentication is mocked by design (see
[ARCHITECTURE.md](ARCHITECTURE.md)). Click a name on the sign-in screen.

| Email | Role in the demo data |
| --- | --- |
| `alice@example.com` | Owns 2 documents; shares one with Bob (editor), one with Carol (viewer) |
| `bob@example.com` | Owns 1 private document; **editor** on Alice's "Q3 Product Roadmap" |
| `carol@example.com` | **Viewer** on Alice's "Engineering Handbook" |

To see sharing from both sides at once, use one normal window and one incognito.

## Contents

| File | What it is |
| --- | --- |
| `README.md` | Setup, run instructions, feature list, known limitations |
| `ARCHITECTURE.md` | What I prioritized, what I cut, and why |
| `AI_WORKFLOW.md` | AI tools used, what I rejected, how I verified |
| `SUBMISSION.md` | This file |
| `walkthrough-video.txt` | Walkthrough video URL |
| `prisma/schema.prisma` | Data model (User, Document, Share, Role) |
| `prisma/seed.ts` | Seeds the three demo accounts and documents |
| `src/lib/access.ts` | Authorization rules — the core of the sharing model |
| `src/lib/__tests__/` | 20 Vitest tests |
| `src/app/api/` | Session, documents, sharing, and upload endpoints |
| `src/components/` | Editor, toolbar, share dialog, dashboard |

## What works end to end

- ✅ Create, rename, edit, save, and reopen documents
- ✅ Rich text: bold, italic, underline, H1–H3, bulleted and numbered lists,
  blockquote, code, undo/redo
- ✅ Autosave with a live status indicator; formatting persists across refresh
- ✅ Upload `.txt` / `.md` / `.docx` (max 1 MB) → becomes a new editable
  document with formatting preserved
- ✅ Share by email as Viewer or Editor; revoke access; owner-only management
- ✅ **Optional stretch delivered:** role-based sharing permissions beyond basic
  access — Viewer and Editor are distinct roles on each share, enforced
  server-side (a viewer's write is rejected with 403) and covered by tests
- ✅ Dashboard splits **My documents** from **Shared with me**, tagged by access
  level
- ✅ Server-side authorization on every route — viewers get 403 on write,
  strangers get 404 with no existence leak
- ✅ Validation with usable error messages on every input
- ✅ 20 automated tests; clean TypeScript production build

## What is intentionally not built

Each of these is a deliberate cut, reasoned in
[ARCHITECTURE.md](ARCHITECTURE.md):

- ❌ **Real-time collaboration.** Concurrent editors overwrite each other
  (last-write-wins). Listed as optional stretch in the brief; correct
  multiplayer needs CRDTs plus a WebSocket server.
- ❌ **Production auth.** No passwords or registration. The session cookie is a
  signed JWT, so users cannot impersonate each other, but this is a demo
  mechanism.
- ❌ **Invitations to unregistered emails.** Sharing works between seeded users;
  an unknown address returns a clear error.
- ❌ Comments, version history, export, folders, search.
- ❌ Document deletion in the UI (the API endpoint exists and is tested).

## With another 2–4 hours

1. **Export to Markdown and PDF** — `turndown` is already a dependency;
   Markdown export is ~30 minutes.
2. **Optimistic-concurrency guard** — send `updatedAt` with each save and reject
   stale writes with a 409. Turns silent data loss into a visible, recoverable
   conflict. Highest value per hour on this list.
3. **Route-level integration tests** — the access rules are unit tested and the
   routes were verified manually with `curl`; automating that would lock in the
   401/403/404 behavior.
4. **Delete and duplicate buttons** in the dashboard UI.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in Neon URLs + AUTH_SECRET
npx prisma migrate dev
npm run db:seed
npm run dev
```

Full instructions, including how to obtain the two Neon connection strings, are
in [README.md](README.md).
