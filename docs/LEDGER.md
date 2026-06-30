# The ledger (Casa v4 memory-sync substrate)

The ledger is how activity in any terminal becomes context for the main chat. It is an
append-only JSONL file at `<brainDir>/ledger.jsonl`. Every terminal and agent appends one
line per event; the Chief of Staff reads it each turn. Transcripts stay local to each
terminal and are pulled on demand only - the ledger carries the thin, durable signal.

## Why append-only

Many terminals (and later many accounts) write at once with no coordination. Each
`appendFileSync` of a single line is atomic on POSIX (`O_APPEND`), so concurrent writers
never corrupt each other and there is no lock. A reader takes a task's most recent event
as its current state.

## Event schema

One JSON object per line. Only `task` is required; the rest are filled or optional.

| field | meaning |
|---|---|
| `ts` | ISO timestamp (auto if absent) |
| `id` | unique event id (auto) |
| `terminal` | who emitted: `main`, a department, or an account (default `main`) |
| `dept` | department context (e.g. `engineering`, `marketing`) |
| `agent` | the agent that acted (e.g. `casa-marketer`, `dispatcher`) |
| `task` | short task id/label (required) |
| `status` | `started` \| `running` \| `blocked` \| `done` \| `merged` \| `failed` \| `cancelled` |
| `artifact` | PATH to a produced file, never its contents |
| `decision` | short distilled outcome (surfaced to the CoS, compacted to memory) |
| `parent` | parent task id, for fan-out children |
| `note` | short freeform note |

`blocked` is the signal for the approvals queue (Phase 4): a worker that hits an
`always_ask` action writes `blocked`, and the CoS surfaces it in the main terminal.

## CLI

```
node scripts/ledger.mjs append <brainDir> '{"task":"ship-api","dept":"engineering","status":"running"}'
node scripts/ledger.mjs tail   <brainDir> [n]
node scripts/ledger.mjs status <brainDir>     # counts + in-flight + blocked
node scripts/ledger.mjs digest <brainDir>     # markdown digest for memory compaction
```

## Business-state view

`scripts/cos-context.mjs` assembles the read-only view the Chief of Staff reads each turn:
the company profile and level, the per-department autonomy dials (`dials.json`, default in
`templates/company-brain/`), and the live in-flight / blocked / recent-decision lists from
the ledger. It writes nothing.
