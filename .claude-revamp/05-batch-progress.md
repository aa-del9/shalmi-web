# Phase 5 — Batch Progress Ledger

> Append-only. One line per shipped or stopped screen.
> Format: `<UTC ISO timestamp> | <slug> | SHIPPED | <commit-sha>`
> or `<UTC ISO timestamp> | <slug> | STOPPED | <one-line reason>`.

2026-05-02T13:33Z | buyer-orders | SHIPPED | 3fa1e35
2026-05-02T13:48Z | vendor-orders | SHIPPED | f58df32
2026-05-02T14:35Z | buyer-home | SHIPPED | b555cf7
2026-05-02T18:46Z | admin-categories | SHIPPED | 04fa11f

---

## Batch 1 retrospective (per BATCH_RUNNER first-batch rule)

**Worked.**
- Workflow gate-then-commit-then-next-screen held up. Each screen
  shipped in one self-contained commit.
- Two shared modules (`format-price`, `order-status-display`) landed
  in Batch 1 commit 1 and were consumed unchanged by commits 2 (vendor
  status pill) and 3 (prod1-card prices). Cross-screen reuse worked
  exactly as the plan predicted.

**Wrinkles to flag for batch 2.**
- **`prefetch={false}` on chrome links** had to be added in two
  places (vendor-sidebar `/vendor/ledger`, util-strip `/profile/orders`)
  because Next.js was prefetching routes the smoke gate would 4xx/5xx
  on. Worth doing a one-pass sweep of cross-screen links in batch 2 so
  this doesn't recur.
- **Postgres pooler ECONNRESET** killed the smoke twice during this
  batch (once on cold-build product queries, once on a stale
  better-auth cookie). Neither was code I introduced. The pool config
  in `packages/database/src/client.ts` (`max: 3`, no idle timeout
  override) is borderline for parallel SC fan-out plus
  `useSession()` from the storefront header. If this pattern recurs
  in batch 2 (admin chrome adds more parallel queries), bump pool max
  or add an idle-recycle setting. Out of scope for batch 1.
- **Schema-migration tension between batch plan and gap-analysis.**
  Plan said buyer-home lands `categories.iconKey + isActive`, but
  binding gap-analysis Q9 said STUBBED with first-letter fallback —
  no migration. Per BATCH_RUNNER step E I deferred the migration to
  batch 2 (admin-categories). If batch 2's gap-analysis also defers
  it, escalate to user before batch 3 starts.
- **Shared chrome touches** (vendor-sidebar, footer rewrite, layout
  prepend) are technically cross-screen mutations. They were
  unavoidable to satisfy the binding answers. Documented as
  "Deviations from plan" in each implementation log so the audit
  trail is clear.

**No BATCH_RUNNER.md edits required.** The runner's mechanics held;
the wrinkles above are project-specific and don't change the
workflow.
