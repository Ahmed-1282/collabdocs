# Architecture Note

## The bet

The brief asks for a Google Docs–inspired editor across five surfaces in 4–6
hours. Covering all five shallowly produces a demo that breaks the moment a
reviewer clicks something unexpected. I chose instead to make **one thing
genuinely correct — the access-control model — and keep everything else honest
and small.**

Sharing is where a document product either works or quietly leaks data, and it
is the surface a reviewer can most easily probe. So it got the real data model,
the layered enforcement, and the test coverage. Real-time collaboration, the
most expensive feature by far, was cut entirely.

## Stack and why

**One Next.js app, not a separate frontend and backend.** Route Handlers in
`src/app/api/` are a real backend: same layering, one deploy, no CORS, one env
surface. A separate Express service would have cost an hour of infrastructure
for no architectural gain at this size. Under a timebox that's the right call,
and the layering (`route → service → access-control`) means the API could be
lifted out later without touching the rules.

**TipTap over a hand-rolled `contenteditable`.** Rich text is where naive
implementations die — nested lists, selection restoration, undo across
formatting boundaries. TipTap is ProseMirror underneath, so it has a real
document model instead of scraped DOM state.

**Content stored as ProseMirror JSON, not HTML.** JSON round-trips losslessly,
can't carry injected markup, and stays queryable in Postgres. Storing HTML would
mean sanitizing on every read.

**Neon Postgres + Prisma.** Real relational integrity for the `Share` join
table, `@@unique([documentId, userId])` to make "one role per person per
document" a database guarantee rather than an application convention, and
cascade deletes so removing a document cannot orphan share rows. Neon's pooled
connection string matters specifically because Vercel's serverless functions
would otherwise exhaust Postgres's connection limit.

## The access-control model

`src/lib/access.ts` is a pure module with no imports. Everything else asks it
for decisions:

| | View | Edit | Share / delete |
| --- | --- | --- | --- |
| Owner | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ❌ |
| Viewer | ✅ | ❌ | ❌ |
| Stranger | ❌ | ❌ | ❌ |

Three decisions worth calling out:

**Owner beats any share row.** If a document is somehow shared back to its own
owner as a viewer, they remain the owner. Without this, a stale row could lock
someone out of their own document. There's a test for exactly this.

**Strangers get 404, not 403.** A 403 confirms that a document id exists. Both
"doesn't exist" and "not yours" return the same 404, so the API leaks nothing
about documents you can't see. Viewers attempting a write are the one exception
— they get a 403, because they already know the document exists.

**Enforcement lives on the server only.** The UI disables the toolbar for
viewers, but that's a courtesy. Every route independently re-derives access from
the session cookie; a hand-crafted `curl` gets the same answer as the UI.

## The one stretch goal I took

**Role-based sharing permissions.** The brief's minimum was "a way to grant
another user access"; `Role` (VIEWER / EDITOR) sits on the `Share` row instead.
It cost almost nothing at schema-design time and it is the stretch goal most
connected to the core sharing model — the same access module that answers "can
this person see it?" already had to answer "can they change it?".

## Deliberate cuts

**Real-time collaboration — cut.** Correct multiplayer means CRDTs (Yjs), a
WebSocket server, and presence state — that alone exceeds the entire timebox,
and Vercel's serverless functions don't hold WebSockets, so it would need a
second piece of infrastructure. It's listed as *optional stretch* in the brief.
Current behavior is last-write-wins, stated plainly in the README rather than
hidden.

**Real auth — cut, and it improves the demo.** Password hashing, email
verification, and reset flows are well-understood, unsurprising work. The brief
explicitly permits mocked auth. A one-click user switcher lets a reviewer test
the sharing model in seconds instead of managing three passwords. The cookie is
still a signed JWT, so the *authorization* demo stays trustworthy — you cannot
become another user by editing a cookie.

**Blob storage — cut, by choosing the upload behavior carefully.** The brief
offered several upload behaviors. "Turn a file into a document" is the only one
that needs no persistent file storage at all: parse in memory, store the
resulting JSON, discard the file. That removed an entire infrastructure
dependency and is also the most product-relevant of the options.

**Comments, version history, export, folders, search — cut.** Each is a feature
in its own right and none is load-bearing for the flows being evaluated.

## Where the risk actually is

- **Autosave is debounced at 800 ms and last-write-wins.** Fine single-user;
  concurrent editors will clobber each other. The honest fix is CRDTs, not
  locking.
- **No rate limiting.** Anyone signed in can create documents in a loop. Out of
  scope for a demo behind seeded accounts.
- **The upload cap is 1 MB** to stay under serverless request limits. A larger
  cap would need direct-to-storage uploads.
- **Sharing requires an existing account.** Invitation emails would need a mail
  provider, which the brief forbids paying for.

## With another 2–4 hours

In priority order:

1. **Export to Markdown and PDF.** The `turndown` dependency is already
   installed for exactly this; roughly 30 minutes for Markdown.
2. **Optimistic-concurrency guard.** Send the document's `updatedAt` with each
   PATCH and reject stale writes with a 409. Not real collaboration, but it
   turns silent data loss into a visible, recoverable conflict — the highest
   value-per-hour item on this list.
3. **Route-level integration tests.** The access rules are unit tested; the
   routes were verified manually with `curl`. Automating that against a test
   database would lock in the 401/403/404 behavior.
4. **Document deletion in the UI.** The API supports it; there's no button yet.
