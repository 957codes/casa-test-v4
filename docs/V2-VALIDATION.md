# Capx Casa v2 validation

The 40-company eval (2026-06-28, pre-v2) failed for one root cause: the action ranking was a
generic stage/dependency template that never consumed the diagnosed binding constraint, so
different companies produced near-identical, constraint-blind output (0/40 founders would keep it
open). v2 makes the constraint a first-class router input and the department a pure lens over it.

## Objective re-eval (15 diverse companies, the real engine)

Driving `deriveStage -> deriveInitialPulse -> nextActions -> computeWave` across 15 companies
spanning every type, stage, and constraint archetype:

| Metric | v2 | Pre-v2 (40-company eval) |
|---|---|---|
| Constraint surface play is the #1 move | 14/15 | constraint ignored by the ranking |
| Distinct top-5 sequences | 14/15 | idea-stage byte-identical across types |
| #1 move sits in a constraint lead lane | 14/15 | n/a (no lead concept) |
| Avg wave frontier (parallelizable drafts) | 2.9 | n/a |

The #1 move now follows the constraint, not a template: `no_revenue -> revenue-model-selection`,
`no_users -> first-users-traction`, `regulatory_legal -> kyc-aml-program`, `runway_burn ->
unit-economics`, `tech_scale -> observability-setup`. The single non-constraint #1 is an
idea-stage `no_users` company led by `opportunity-scan`, which is correct: you validate the
opportunity before chasing users for a thing that is not yet validated.

## Instance-specificity (the re-bucketing guard)

Two companies identical on (type, stage, archetype) but differing on the structured win gap:

- A: B2B SaaS, building, no_revenue, gap 1.0 (0 of 10k MRR) -> `revenue-model-selection` score 24.609
- B: B2B SaaS, building, no_revenue, gap 0.2 (8k of 10k MRR) -> `revenue-model-selection` score 18.047

Same plays (correct: both need revenue work), different scores and intensity (the company far from
target gets the work pushed harder), and the board surfaces the difference as a "% to target" badge.
This is the win-gap urgency working: distance-to-target enters the sort, not just the advisor prose.

## What this does and does not prove

Proven: the engine root cause is fixed. The constraint is the sort key, the department is a lens
that never re-ranks, and instance values differentiate the score before the LLM speaks.

Not measured here: 2-week founder retention. The original eval itself noted that a STATIC list shown
once caps at about 3/10, and real retention comes from the LOOP (do work -> see progress -> return)
plus gamification. v2 now BUILDS that loop (the department board, the wave fan-out, the mandatory
grade gate, honest momentum), but a static-list persona score cannot see a loop being exercised. A
full persona retention re-eval should drive `/casa-board` through several waves on a live brain.

Reproduce: `node docs/../scratchpad/eval-v2.mjs` (the harness lives in the session scratchpad).
