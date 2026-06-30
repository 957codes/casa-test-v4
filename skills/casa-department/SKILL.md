---
name: casa-department
description: Drive ONE department vertical. The founder names a department (Engineering, Growth, Finance, Brand, Success, Sales, Legal, Data, Product, Operations, Strategy) and Casa runs a wave scoped to that lane: it drafts that function's ready, independent plays in parallel, grades them, and commits the ones that pass. Use to focus a work session on a single function. Interactive and subscription-safe.
argument-hint: "<department> [k:N]"
---

# casa-department

The single-lane version of casa-board. Same wave mechanics (parallel draft, mandatory
grade gate, serial commit through the one writer), scoped to the department the founder
names. The ranking it draws from is still the ONE global, constraint-aware ranking; the
department is a pure FILTER over it, never its own ranker.

## Argument parsing

- The first argument is the department, one of the canonical 11: Strategy, Brand,
  Product, Engineering, Data, Growth, Sales, Finance, Legal, Success, Operations. Map a
  loose synonym to the closest one (marketing to Growth, design to Product, support to
  Success). If none is given, list the lanes from the board and ask which one.
- `k:N` bounds the parallel drafts (default 3).

## Steps

1. Sync:

   ```
   node ${CLAUDE_PLUGIN_ROOT}/scripts/brain.mjs sync company-brain
   ```

2. Compute the lane wave:

   ```
   node ${CLAUDE_PLUGIN_ROOT}/scripts/wave.mjs company-brain --department <Department> --k 3
   ```

   If the wave is empty, this lane has no ready work this cycle (it is a SUPPORT,
   MAINTENANCE, or IDLE lane right now). Say so honestly, show the lane's blocked/locked
   plays and what unblocks them, and suggest the lead lane from the board instead. STOP.

3. Fan out one in-session subagent per wave node, in parallel, exactly as in casa-board
   step 3: each drafts its play for THIS company into `company-brain/outputs/<nodeId>/`
   and returns the structured JSON only. Subagents mutate nothing.

4. Grade gate (mandatory; a self-grade never verifies):

   ```
   /casa-review grade <nodeId>
   ```

5. Serial-commit the passing drafts one at a time through the sole writer:

   ```
   node ${CLAUDE_PLUGIN_ROOT}/scripts/brain.mjs complete company-brain <nodeId>
   ```

6. Re-sync and report this lane's outcome plus its updated standing on the board (done /
   ready / blocked, and whether it is still the lead lane).

## Rules

- A department is a filter over the global ranking, never a separate ranker. Do not
  re-rank within the lane by feel.
- Only the planner's DAG-independent nodes draft together.
- The grade gate is mandatory; brain.mjs is the only writer; no fake progress.
- No em-dashes, no emojis.
