import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  normalize, appendEvent, readEvents, tail,
  inFlight, blocked, aggregateByStatus, decisions, compact, MAX_EVENT_BYTES,
} from "../scripts/ledger.mjs";

const tmp = () => mkdtempSync(join(tmpdir(), "casa-ledger-"));

test("normalize fills defaults and enforces the minimal shape", () => {
  const e = normalize({ task: "t1" });
  assert.ok(e.id && e.ts);
  assert.equal(e.status, "started");
  assert.equal(e.terminal, "main");
  assert.throws(() => normalize({}), /needs a task/);
  assert.throws(() => normalize({ task: "t", status: "weird" }), /unknown status/);
});

test("append + read round-trips and skips a torn line", () => {
  const d = tmp();
  appendEvent(d, { task: "t1", status: "started", terminal: "eng" });
  appendEvent(d, { task: "t1", status: "done", terminal: "eng", artifact: "/x.ts" });
  appendFileSync(join(d, "ledger.jsonl"), "{ this is not json\n"); // a partial/torn write
  const all = readEvents(d);
  assert.equal(all.length, 2, "malformed line is skipped, not fatal");
  assert.equal(all[1].artifact, "/x.ts");
  rmSync(d, { recursive: true, force: true });
});

test("a task's state is its latest event (drives in_flight / blocked)", () => {
  const d = tmp();
  appendEvent(d, { task: "a", status: "started" });
  appendEvent(d, { task: "a", status: "running" });
  appendEvent(d, { task: "b", status: "blocked" });
  appendEvent(d, { task: "c", status: "started" });
  appendEvent(d, { task: "c", status: "done" });
  assert.deepEqual(inFlight(d).map((e) => e.task).sort(), ["a", "b"]);
  assert.deepEqual(blocked(d).map((e) => e.task), ["b"]);
  const counts = aggregateByStatus(d);
  assert.deepEqual(counts, { running: 1, blocked: 1, done: 1 });
  rmSync(d, { recursive: true, force: true });
});

test("decisions surface, and compact builds a digest", () => {
  const d = tmp();
  appendEvent(d, { task: "a", status: "done", decision: "chose Postgres", dept: "engineering", artifact: "/a.md" });
  appendEvent(d, { task: "b", status: "running", agent: "casa-marketer", dept: "marketing" });
  assert.equal(decisions(d).length, 1);
  const dg = compact(d);
  assert.match(dg, /chose Postgres/);
  assert.match(dg, /In flight \(1\)/);
  assert.match(dg, /Completed \(1\)/);
  rmSync(d, { recursive: true, force: true });
});

test("oversized events are rejected to keep single-line appends atomic", () => {
  const d = tmp();
  const huge = "x".repeat(MAX_EVENT_BYTES + 1);
  assert.throws(() => appendEvent(d, { task: "big", note: huge }), /too large/);
  assert.equal(readEvents(d).length, 0, "nothing was written");
  rmSync(d, { recursive: true, force: true });
});

test("tail returns the last n, and many appends all land intact", () => {
  const d = tmp();
  for (let i = 0; i < 50; i++) appendEvent(d, { task: "bulk", status: "running", note: String(i) });
  assert.equal(readEvents(d).length, 50, "every append is a complete line");
  assert.equal(tail(d, 5).length, 5);
  assert.equal(tail(d, 5).at(-1).note, "49");
  rmSync(d, { recursive: true, force: true });
});
