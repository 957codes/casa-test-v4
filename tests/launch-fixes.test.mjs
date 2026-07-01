// Launch-hardening regression tests (2026-07-01). Covers the defects found by the
// first full user-perspective review: the CoS reading the binding constraint from the
// wrong file, silent north-star mis-derivation from a non-canonical type, the day-one
// loop pileup, fabricated state for a missing brain, the waiting-on-founder state, the
// autonomy dial CLI, and the answers-prove-it seeding.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { deriveStage, validateAnswers, CANONICAL_TYPES } from "../scripts/stage.mjs";
import { businessState } from "../scripts/cos-context.mjs";
import { INDEX, tmpBrain, cleanup, runScript } from "./helpers.mjs";

function answers(extra = {}) {
  return {
    type: "saas",
    secondary_type: "",
    company_name: "LedgerPeak",
    one_liner: "Accounting automation for logistics companies",
    icp: "CFOs at logistics firms",
    monetization: "subscription",
    traits: ["builds_software", "b2b", "high_acv", "recurring_revenue", "collects_user_data", "takes_payments"],
    tier: "revenue",
    gaps: [],
    north_star_archetype: "revenue_mrr",
    constraint_archetype: "no_revenue",
    win_definition: "Grow MRR",
    horizon: "quarter",
    anti_priorities: [],
    ...extra,
  };
}

function seedBrain(a = answers()) {
  const dir = tmpBrain();
  runScript("brain.mjs", ["init", dir]);
  writeFileSync(join(dir, "answers.json"), JSON.stringify(a));
  const applied = runScript("stage.mjs", ["apply", join(dir, "answers.json"), dir]);
  assert.equal(applied.code, 0, applied.stderr);
  const synced = runScript("brain.mjs", ["sync", dir]);
  assert.equal(synced.code, 0, synced.stderr);
  return dir;
}

// ---- type vocabulary: one canonical list end to end ----

test("validateAnswers rejects an audience word used as a type, naming the canonical set", () => {
  assert.throws(
    () => validateAnswers(answers({ type: "b2b" }), INDEX),
    (e) => e.message.includes('unknown business type "b2b"') && CANONICAL_TYPES.every((t) => e.message.includes(t)),
  );
});

test("validateAnswers accepts every canonical type", () => {
  for (const t of CANONICAL_TYPES) validateAnswers(answers({ type: t }), INDEX);
});

test("validateAnswers rejects a bad archetype and a bad gap with a suggestion", () => {
  assert.throws(
    () => validateAnswers(answers({ constraint_archetype: "no_luck" }), INDEX),
    /unknown constraint_archetype/,
  );
  assert.throws(
    () => validateAnswers(answers({ gaps: ["analytics"] }), INDEX),
    /Did you mean: .*analytics/,
  );
});

// ---- Core fields are optional (draft-map preview mid-interview) ----

test("deriveStage works without the Core pass fields", () => {
  const partial = answers();
  delete partial.north_star_archetype;
  delete partial.constraint_archetype;
  delete partial.win_definition;
  delete partial.horizon;
  const { profile, start_level, binding_constraint } = deriveStage(partial, INDEX);
  assert.equal(start_level, 5);
  assert.ok(profile.confirmed);
  // No constraint named: null, so the caller fails loud instead of serving generic ranking.
  assert.equal(binding_constraint, null);
});

// ---- answers-prove-it seeding ----

test("a subscription business past idea stage never gets revenue-model-selection as open work", () => {
  const { completed_seed } = deriveStage(answers(), INDEX);
  assert.ok(completed_seed.includes("revenue-model-selection"));
  // But an idea-stage business still does the thinking.
  const idea = deriveStage(answers({ tier: "idea" }), INDEX);
  assert.ok(!idea.completed_seed.includes("revenue-model-selection"));
});

// ---- integration over a real temp brain ----

test("cos-context reads the binding constraint stage.mjs wrote to state.json", () => {
  const dir = seedBrain();
  try {
    const s = businessState(dir);
    assert.equal(s.company.binding_constraint?.archetype, "no_revenue");
    assert.deepEqual(s.waiting_on_founder, {});
  } finally { cleanup(dir); }
});

test("NOW.md names the do-or-die constraint with its lead departments", () => {
  const dir = seedBrain();
  try {
    const now = readFileSync(join(dir, "NOW.md"), "utf8");
    assert.match(now, /Do-or-die constraint: no revenue yet/);
    assert.match(now, /lead\)/);
  } finally { cleanup(dir); }
});

test("onboarding starts loop cadences at day zero instead of all-overdue", () => {
  const dir = seedBrain();
  try {
    const state = JSON.parse(readFileSync(join(dir, "state.json"), "utf8"));
    assert.ok(Object.keys(state.loops || {}).length > 0, "loops stamped at apply");
    const now = readFileSync(join(dir, "NOW.md"), "utf8");
    assert.ok(!now.includes("Loops due now"), "no loop pileup on day one");
    const due = runScript("brain.mjs", ["due", dir]);
    assert.deepEqual(JSON.parse(due.stdout), []);
  } finally { cleanup(dir); }
});

test("waiting/unwait park a play on the founder and render in NOW.md", () => {
  const dir = seedBrain();
  try {
    const w = runScript("brain.mjs", ["waiting", dir, "problem-validation-interviews", "Talk to five customers this week"]);
    assert.equal(w.code, 0, w.stderr);
    let now = readFileSync(join(dir, "NOW.md"), "utf8");
    assert.match(now, /## Waiting on you/);
    assert.match(now, /Talk to five customers this week/);
    // Completing clears the flag.
    const c = runScript("brain.mjs", ["complete", dir, "problem-validation-interviews"]);
    assert.equal(c.code, 0, c.stderr);
    now = readFileSync(join(dir, "NOW.md"), "utf8");
    assert.ok(!now.includes("Waiting on you"));
    // unwait on a non-waiting id fails loudly.
    const u = runScript("brain.mjs", ["unwait", dir, "problem-validation-interviews"]);
    assert.equal(u.code, 2);
  } finally { cleanup(dir); }
});

test("waiting rejects an unknown playbook id", () => {
  const dir = seedBrain();
  try {
    const w = runScript("brain.mjs", ["waiting", dir, "not-a-playbook", "whatever"]);
    assert.equal(w.code, 2);
    assert.match(w.stderr, /unknown playbook id/);
  } finally { cleanup(dir); }
});

test("complete nudges when no artifact was recorded, and stays quiet when one exists", () => {
  const dir = seedBrain();
  try {
    const bare = runScript("brain.mjs", ["complete", dir, "why-now-memo"]);
    assert.match(bare.stdout, /no artifact recorded/);
    mkdirSync(join(dir, "outputs", "competitive-teardown"), { recursive: true });
    writeFileSync(join(dir, "outputs", "competitive-teardown", "teardown.md"), "# Teardown\n");
    const withArt = runScript("brain.mjs", ["complete", dir, "competitive-teardown"]);
    assert.ok(!withArt.stdout.includes("no artifact recorded"));
  } finally { cleanup(dir); }
});

// ---- autonomy dial CLI ----

test("gates.mjs dial sets a department dial and refuses junk", () => {
  const dir = seedBrain();
  try {
    const ok = runScript("gates.mjs", ["dial", dir, "growth", "auto"]);
    assert.equal(ok.code, 0, ok.stderr);
    const dials = JSON.parse(readFileSync(join(dir, "dials.json"), "utf8"));
    assert.equal(dials.departments.Growth, "auto");
    assert.ok(Array.isArray(dials.always_ask) && dials.always_ask.length >= 4, "always-ask line untouched");
    assert.equal(runScript("gates.mjs", ["dial", dir, "Vibes", "auto"]).code, 2);
    assert.equal(runScript("gates.mjs", ["dial", dir, "Growth", "yolo"]).code, 2);
  } finally { cleanup(dir); }
});

// ---- fail-loud on a missing brain ----

test("cos-context and wave refuse to fabricate a company for an empty folder", () => {
  const empty = tmpBrain();
  try {
    const cc = runScript("cos-context.mjs", [join(empty, "company-brain")]);
    assert.equal(cc.code, 2);
    assert.match(cc.stderr, /run \/casa-start/);
    const wv = runScript("wave.mjs", [join(empty, "company-brain")]);
    assert.equal(wv.code, 2);
    assert.match(wv.stderr, /run \/casa-start/);
  } finally { cleanup(empty); }
});

// ---- router CLI friendliness ----

test("router.mjs next on a directory explains itself instead of a stack trace", () => {
  const dir = seedBrain();
  try {
    const r = runScript("router.mjs", ["next", dir]);
    assert.equal(r.code, 2);
    assert.match(r.stderr, /expected a JSON file, got a directory/);
    assert.match(r.stderr, /company-brain\/profile\.json/);
    const ok = runScript("router.mjs", ["next", join(dir, "profile.json"), "--constraint", join(dir, "state.json")]);
    assert.equal(ok.code, 0, ok.stderr);
    assert.match(ok.stdout, /constraint=no_revenue/);
  } finally { cleanup(dir); }
});
