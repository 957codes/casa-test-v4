// Casa v4 - autonomy gates: decide whether an action runs auto, needs a proposal, or must
// stop for human approval. This is the enforcement half of the autonomy dials (cos.mjs
// reads the dials to BRIEF; this decides at EXECUTION time).
//
// Two independent rules:
//   1. The always-ask line is per-ACTION and absolute: spending money, going public,
//      merging to main, anything destructive or irreversible or human_gate -> BLOCK,
//      no matter how autonomous the department is set.
//   2. Otherwise the department dial decides: `auto` runs, `approve_first` proposes.

import { autonomyFor } from "./cos.mjs";

export const ALWAYS_ASK = ["spend_money", "go_public", "merge_to_main", "destructive"];

// Which always-ask reasons an action triggers, from its flags (usually lifted from the
// playbook frontmatter: human_gate, reversibility) or an explicit `gates` array.
export function triggeredGates(action = {}) {
  const g = new Set(Array.isArray(action.gates) ? action.gates : []);
  if (action.spends_money) g.add("spend_money");
  if (action.publishes || action.go_public) g.add("go_public");
  if (action.merges || action.merge_to_main) g.add("merge_to_main");
  if (action.destructive) g.add("destructive");
  if (action.human_gate) g.add("human_gate");
  if (action.reversibility === "hard") g.add("irreversible");
  return [...g];
}

// decision: "block" (needs the founder) | "auto" (dispatch) | "propose" (ask first).
export function gateDecision(action = {}, dials = {}) {
  const autonomy = autonomyFor(action.department, dials);
  const reasons = triggeredGates(action);
  if (reasons.length) return { decision: "block", reasons, autonomy };
  return { decision: autonomy === "auto" ? "auto" : "propose", reasons: [], autonomy };
}

if (process.argv[1] && (await import("node:url")).fileURLToPath(import.meta.url) === process.argv[1]) {
  const action = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const dials = process.argv[3] ? JSON.parse(process.argv[3]) : {};
  console.log(JSON.stringify(gateDecision(action, dials), null, 2));
}
