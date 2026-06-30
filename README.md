# Capx Casa

The open control plane for building a company from your terminal.

AI made a single developer as productive as a whole team. Capx Casa does the same
for the founder. A solo founder is excellent at one thing, but a company is a hundred
things at once. Casa holds the hundred: it figures out which of them matter for
your specific business, puts them in the right order, runs what it can, and tells
you what to do next, every time you open the terminal.

Casa is an open-source (MIT) Claude Code plugin. It runs inside your own Claude
Code, on your own plan. No SaaS login, no hosted inference, nothing to deploy. The
terminal is the source of truth. An optional local Console gives you a visual,
interactive control surface on localhost when you want one, running on the same
machine, against the same files, with no account and no cloud.

## What it gives you

- A library of 169 company-building playbooks (the "what to do"), each owned by one of
  eleven departments (Strategy, Brand, Product, Engineering, Data, Growth, Sales, Finance,
  Legal, Success, Operations).
- A department board: your whole company as lanes, one per function, each with its own
  north star. Casa diagnoses the ONE binding constraint that is the company's do-or-die
  problem right now and leads the departments that resolve it, so you always know which
  function to push and why.
- A constraint-first router that selects the playbooks relevant to your business,
  sequences them by dependency, and ranks them so the work that resolves your binding
  constraint leads, not a generic checklist.
- An always-on advisor that recommends your single next best action on every session,
  plus a parallel "wave" mode that drafts several independent plays at once.
- A Chief of Staff (`/casa-cos`) that opens each session by reading the whole business and
  routing your next move to the operator who runs it, under your autonomy settings.
- Fourteen specialist operator agents, derived per company from your type and binding
  constraint, that do the department work; the existing review panel checks it.
- A parallel-dispatch engine (`/casa-parallel`) that splits a big task across subagents
  when, and only when, the work is independent and large enough to pay off, then
  auto-merges and verifies the result with a real test run.
- A cross-terminal ledger so work in any terminal becomes shared context for the rest,
  with per-department autonomy dials and an approvals queue that stops anything which
  spends money, ships publicly, or is irreversible until you say go.
- Recurring loops for the work that never finishes (metrics, customers, growth).
- A company brain: durable, versioned, plain-text memory that makes every run compound
  on the last.
- An optional local Console: a visual, interactive department board with the company's
  health and its loops, that can also start work for you.

## The Console (optional, local, interactive)

The Console is a visual control surface for the company, served on localhost from
the same company brain the terminal reads. It is optional and everything in Casa
works without it. Launch it with `/casa-console`.

What you can do in it:

- See the whole company at a glance. The default view is the department board: one lane
  per function, each showing its north star, its standing (Lead, Support, Maintenance, or
  Idle), and its single next move, under a banner that names the binding constraint and the
  lanes leading on it. Click a lane to expand its full catalog of plays by status. The
  level-by-level build map is still there as a reference view, colored by one of five states
  (done, agent can do it, needs your input, needs your approval, blocked by earlier work).
- Open any node for its detail. Each node shows a plain-language TLDR and advisor
  notes, the gradeable deliverable spec (what a good output contains), a quality
  score for finished work with its gaps, the rendered output, recent activity, and a
  chat to refine it.
- Start work, not just watch it. Buttons run a ready play, mark it complete, approve
  or request changes on a gate, or re-score and improve finished work. A per-node
  chat lets you ask for a change in words.
- Watch the company's health. A single health score breaks into the dimensions that
  move it (do-or-die coverage, momentum, quality of finished work, open gates, loop
  hygiene), with per-department roll-ups and a "make done work better" list of work
  that is ungraded or below the bar.
- Track loops and spend. The Loops view shows every recurring cadence with its due
  or locked status; the Health view shows spend to date through Capx Pay, labeled
  distinctly and never charged by the Console.

How it stays safe and subscription-only:

- Deterministic actions (mark complete, mark a loop ran) run the engine inline. The
  engine remains the only writer of company state, so a click can never skip a gate
  or invent a dependency.
- Anything that needs an LLM (run a play, refine by chat, re-score) is queued, not
  executed. You drain that queue yourself with `/casa-serve` in your own Claude Code
  session. The Console never spawns an agent and never runs headless.
- The Console binds to localhost only, adds no dependencies to the plugin runtime,
  and reads the same plain-text brain you can read in the terminal.

## How Casa organizes the work: departments

Casa organizes a company the way a founder thinks about it: by DEPARTMENT. Every playbook
belongs to one of eleven functions, and Casa shows your company as a board of department
lanes, each with its own north star (a projection of the one company north star onto that
function).

| Department | What it owns |
|---|---|
| Strategy | The company north star, the binding constraint, the driver tree |
| Product | Activation and time to first value |
| Engineering | Shipping the product at reliable quality |
| Data | Instrumentation, so every other lane has a real number |
| Growth | Activated acquisition at a sustainable cost |
| Sales | Pipeline to closed revenue |
| Success | Retention and expansion |
| Finance | Runway, pricing, and unit economics |
| Legal | Entity, contracts, and regulatory clearance |
| Brand | Positioning, narrative, and message resonance |
| Operations | Cost to serve, fulfillment, and recurring-loop discipline |

The board is a LENS, not a separate planner. Under the hood the engine still computes one
global, constraint-aware ranking; a department lane is a filtered view of it, never its own
ranking. That is what keeps the advice specific to YOUR company instead of a generic
per-function checklist.

The one thing that decides priority is the binding constraint: the do-or-die problem that,
left unsolved, kills the business at its current stage (no users, no revenue, a regulatory
gate, runway, reliability at scale, capacity). Casa names it, leads the departments that
resolve it (up to four co-leads), and sharpens the push by how far you are from your target.
Departments with no urgent work this cycle sit honestly as Support, Maintenance, or Idle, so
the board never pretends every lane is on fire.

Maturity still matters, but as an INTERNAL gate, not the founder-facing frame. Each play
carries a level (0 to 8) that controls when it becomes ready: you cannot run a launch play
before there is a product, and a play never surfaces before its prerequisites exist. You see
departments and a binding constraint; the engine sequences the work underneath.

## Commands

| Command | What it does |
|---|---|
| `/casa-start` | Run the stage interview, then select, sequence, and seed your build map |
| `/casa-priority` | Re-evaluate where the company is and get your ranked priorities for this session |
| `/casa-board` | See your company as department lanes led by the binding constraint, then run a wave of parallel drafts |
| `/casa-department <name>` | Focus a work session on one function (Engineering, Growth, Finance, ...) |
| `/casa-cos` | The Chief of Staff: open a session, see the next move and who runs it, what is blocked, and what can run in parallel, then dispatch it |
| `/casa-parallel` | Fan a big independent task out across subagents, auto-merge, and verify the result with a real test run |
| `/casa-next` | The always-on advisor: your single next best action |
| `/casa-map` | Show and approve your personalized build map |
| `/casa-loops` | Show and run recurring loops (pulse, retro, content, close) |
| `/casa-pay` | Run paid actions (domains, hosting, media, research) through Capx Pay |
| `/casa-console` | Launch the local visual Console (department board, health, loops) in your browser |
| `/casa-serve` | Execute the work the Console queued, one intent at a time, in your session |

### Craft and review

These do the work and check it.

| Command | What it does |
|---|---|
| `/casa-build` | Execute a ready playbook to a finished artifact and advance the state |
| `/casa-review` | Critique a decision, plan, or copy with a panel of specialist personas |
| `/casa-write` | Draft founder-facing copy to the canon, enforced by a linter |
| `/casa-design` | Build and verify product UI with production craft |
| `/casa-synthesize` | Turn raw customer notes into a ranked insight memo |
| `/casa-strategy` | Set and maintain the company strategy anchor |
| `/casa-readout` | Read the company numbers honestly |
| `/casa-ideate` | Generate, critique, and shortlist company moves |
| `/casa-experiment` | Frame and log a disciplined experiment |
| `/casa-compound` | Capture a lesson so the next run starts ahead |
| `/casa-refresh` | Sweep the learning store for drift |
| `/casa-pulse` | A time-windowed recap of the company |
| `/casa-promote` | Draft launch and announcement copy |

## Getting started

1. Make a new, empty project folder for your company and open it in Claude Code.
2. Install the plugin:

   ```
   /plugin marketplace add https://github.com/957codes/casa
   /plugin install capx-casa
   ```

3. Set up your company. Casa works for a brand-new idea or a business already
   running:

   ```
   /casa-start
   ```

   It asks a short series of questions to learn what the business is and where it is
   today, then builds a personalized map that starts at the right level. A raw idea
   gets validated first; an existing business skips ahead, with anything you have not
   done yet surfaced as catch-up work.

4. Every time you reopen the project, Casa greets you with your binding constraint, the
   department lanes leading on it, and your top priority. Run `/casa-board` to see the whole
   company by department, `/casa-priority` to re-evaluate, or `/casa-next` to act.

See `docs/ONBOARDING.md` for the full walkthrough.

## Updating Casa

When a new version is pushed, refresh the marketplace, update the plugin, and reload
it into your current session:

```
/plugin marketplace update capx-casa
/plugin update capx-casa@capx-casa
/reload-plugins
```

`/reload-plugins` activates the new skills and commands without restarting Claude Code.
Notes:

- The marketplace and the plugin are both named `capx-casa`. If `/plugin marketplace list`
  shows it under a different alias, use that name in steps 1 and 2.
- Casa is versioned by git commit, so every push counts as an update. If `/plugin update`
  reports "already up to date" when you know there are new commits, run the marketplace
  update first (it re-fetches the repo).
- The visual Console rebuilds itself on first use after an update: the next `/casa-console`
  runs `npm install && npm run build` once (about a minute) and serves the new UI.

## How it works

Read `docs/ARCHITECTURE.md` for the design, `docs/BUILD-PLAN.md` for the full
plan, `console/README.md` for the Console (how to build, run, and the two-way model
behind it), and `CLAUDE.md` for the operating contract this repo runs under.

## License

MIT. The skills, agents, loops, and router are free forever. Real-world actions
that cost money (domains, incorporation, hosting, generative media, research) run
through the companion product Capx Pay, which holds the wallet and the billing.
Casa never charges or holds funds. You can always bring your own keys and pay
nothing.
