// Casa v4 - task ledger: the append-only, cross-terminal activity log.
//
// Every terminal / agent appends ONE JSON line per event to <brainDir>/ledger.jsonl.
// Append-only is the whole point: many terminals (and later many accounts) can write
// concurrently with no coordination, because each appendFileSync of a single line is
// atomic on POSIX (O_APPEND). The Chief of Staff reads this to know what is in flight,
// what is blocked (needs approval), and what was decided - without reading transcripts.
//
// usage:
//   node scripts/ledger.mjs append <brainDir> '<json-event>'
//   node scripts/ledger.mjs tail   <brainDir> [n]
//   node scripts/ledger.mjs status <brainDir>
//   node scripts/ledger.mjs digest <brainDir>
//
// event shape (only `task` is required; everything else is filled / optional):
//   { ts, id, terminal, dept, agent, task, status, artifact, decision, parent, note }
//   status in: started | running | blocked | done | merged | failed | cancelled
//   - artifact: a PATH to a produced file, never its contents (keeps the ledger thin)
//   - decision: a short distilled outcome, surfaced to the CoS and compacted to memory

import { appendFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const TERMINAL_STATUSES = new Set(["done", "merged", "failed", "cancelled"]);
export const OPEN_STATUSES = new Set(["started", "running", "blocked"]);
const ALL_STATUSES = new Set([...TERMINAL_STATUSES, ...OPEN_STATUSES]);

const ledgerPath = (dir) => join(dir, "ledger.jsonl");

let _seq = 0;
function genId() {
  _seq = (_seq + 1) % 1e6;
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 1e6).toString(36);
  return `evt_${t}${r}${_seq.toString(36)}`;
}

// Fill defaults and validate the minimal shape. Throws on a missing task or bad status.
export function normalize(event = {}) {
  const e = { ...event };
  if (!e.task) throw new Error("ledger: event needs a task");
  if (!e.ts) e.ts = new Date().toISOString();
  if (!e.id) e.id = genId();
  if (!e.status) e.status = "started";
  if (!ALL_STATUSES.has(e.status)) throw new Error(`ledger: unknown status "${e.status}"`);
  if (!e.terminal) e.terminal = "main";
  return e;
}

// Keep events thin: a single-line append is only atomic for a modest write. Large
// blobs belong in a file referenced by `artifact`, not inlined into the ledger.
export const MAX_EVENT_BYTES = 16384;

export function appendEvent(dir, event) {
  const e = normalize(event);
  const line = JSON.stringify(e) + "\n";
  const bytes = Buffer.byteLength(line, "utf8");
  if (bytes > MAX_EVENT_BYTES) {
    throw new Error(
      `ledger: event too large (${bytes}B > ${MAX_EVENT_BYTES}B). ` +
      "Put big content in a file and pass its path as `artifact`, not inline."
    );
  }
  appendFileSync(ledgerPath(dir), line);
  return e;
}

export function readEvents(dir) {
  const p = ledgerPath(dir);
  if (!existsSync(p)) return [];
  const out = [];
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const s = line.trim();
    if (!s) continue;
    try { out.push(JSON.parse(s)); } catch { /* skip a torn/partial line */ }
  }
  return out;
}

export function tail(dir, n = 20) {
  const all = readEvents(dir);
  return all.slice(Math.max(0, all.length - n));
}

// Latest event per task, in append order (a task's state is its most recent event).
export function byTask(dir, events = readEvents(dir)) {
  const m = new Map();
  for (const e of events) if (e.task) m.set(e.task, e);
  return m;
}

export function inFlight(dir) {
  return [...byTask(dir).values()].filter((e) => OPEN_STATUSES.has(e.status));
}

export function blocked(dir) {
  return [...byTask(dir).values()].filter((e) => e.status === "blocked");
}

export function aggregateByStatus(dir) {
  const counts = {};
  for (const e of byTask(dir).values()) counts[e.status] = (counts[e.status] || 0) + 1;
  return counts;
}

export function decisions(dir, n = 50) {
  const ds = readEvents(dir).filter((e) => e.decision);
  return ds.slice(Math.max(0, ds.length - n));
}

// Distill the ledger into a short markdown digest - the input to durable-memory compaction.
export function compact(dir) {
  const events = readEvents(dir);
  const tasks = byTask(dir, events);
  const done = [...tasks.values()].filter((e) => e.status === "done" || e.status === "merged");
  const open = [...tasks.values()].filter((e) => OPEN_STATUSES.has(e.status));
  const ds = events.filter((e) => e.decision);
  const lines = [];
  lines.push(`# Ledger digest (${events.length} events, ${tasks.size} tasks)`);
  lines.push("");
  lines.push(`## Decisions (${ds.length})`);
  for (const e of ds) lines.push(`- [${e.dept || e.terminal}] ${e.decision} (${e.task})`);
  lines.push("");
  lines.push(`## In flight (${open.length})`);
  for (const e of open) lines.push(`- ${e.status.toUpperCase()} ${e.task} - ${e.agent || e.terminal}${e.dept ? " / " + e.dept : ""}`);
  lines.push("");
  lines.push(`## Completed (${done.length})`);
  for (const e of done) lines.push(`- ${e.task}${e.artifact ? " -> " + e.artifact : ""}`);
  return lines.join("\n") + "\n";
}

// --- CLI (only runs when invoked directly, so tests can import the API safely) ---
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , cmd, dir, ...rest] = process.argv;
  if (!cmd || !dir) {
    console.error("usage: ledger.mjs append|tail|status|digest <brainDir> [...]");
    process.exit(2);
  }
  if (cmd === "append") {
    const e = appendEvent(dir, JSON.parse(rest.join(" ") || "{}"));
    console.log(e.id);
  } else if (cmd === "tail") {
    console.log(JSON.stringify(tail(dir, Number(rest[0]) || 20), null, 2));
  } else if (cmd === "status") {
    console.log(JSON.stringify({ counts: aggregateByStatus(dir), in_flight: inFlight(dir), blocked: blocked(dir) }, null, 2));
  } else if (cmd === "digest") {
    process.stdout.write(compact(dir));
  } else {
    console.error(`ledger: unknown command "${cmd}"`);
    process.exit(2);
  }
}
