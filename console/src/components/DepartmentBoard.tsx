// The v2 DEPARTMENT BOARD: the founder's whole company as department lanes, each with its own
// (display-only) north star and a single move, led by the ONE diagnosed binding constraint. A lane
// never ranks its own work; its move is the top item of the same global, constraint-aware ranking
// that belongs to the lane, so the board is a LENS, never a per-department curriculum. Click a lane
// to expand its full play catalog (education-as-hero): the founder learns what exists and where.

import { useState } from "react";
import { company, type BoardLane, type BoardLaneTask } from "../mockData";

const INTENSITY: Record<BoardLane["intensity"], { label: string; cls: string }> = {
  lead: { label: "Lead", cls: "bg-agent-500 text-white" },
  support: { label: "Support", cls: "bg-approve-50 text-approve-700" },
  maintenance: { label: "Maintenance", cls: "bg-canvas text-ink-500" },
  idle: { label: "Idle", cls: "bg-canvas text-ink-400" },
};

const STATE_DOT: Record<string, { cls: string; label: string }> = {
  completed: { cls: "bg-approve-500", label: "done" },
  input: { cls: "bg-human-500", label: "ready" },
  approval: { cls: "bg-human-500", label: "needs you" },
  agent: { cls: "bg-agent-500", label: "working" },
  locked: { cls: "bg-ink-200", label: "locked" },
};

function CatalogRow({ t }: { t: BoardLaneTask }) {
  const d = STATE_DOT[t.state] || STATE_DOT.locked;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${d.cls}`} />
      <span className={`flex-1 truncate text-[11px] ${t.state === "locked" ? "text-ink-300" : "text-ink-700"}`}>{t.title}</span>
      <span className="font-mono text-[9px] text-ink-300">L{t.level < 0 ? "0" : t.level}</span>
      <span className="w-12 shrink-0 text-right font-mono text-[9px] text-ink-400">{d.label}</span>
    </div>
  );
}

function Lane({ lane, expanded, onToggle, onOpenTask }: {
  lane: BoardLane; expanded: boolean; onToggle: () => void; onOpenTask: (id: string) => void;
}) {
  const tag = INTENSITY[lane.intensity];
  const move = lane.topMove;
  return (
    <div className={`flex flex-col rounded-xl border bg-surface p-4 shadow-card ${lane.isLead ? "border-agent-300 ring-1 ring-agent-200" : "border-line"}`}>
      <button type="button" onClick={onToggle} className="flex items-start justify-between text-left">
        <div className="min-w-0">
          <span className="text-sm font-semibold text-ink-900">{lane.department}</span>
          {lane.northStar && <div className="mt-0.5 truncate text-[10px] text-ink-400">{lane.northStar}</div>}
        </div>
        <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide ${tag.cls}`}>{tag.label}</span>
      </button>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full bg-approve-500" style={{ width: `${lane.pct}%` }} />
        </div>
        <span className="font-mono text-[10px] tabular text-ink-400">{lane.done}/{lane.total}</span>
      </div>
      <div className="mt-1 flex gap-3 font-mono text-[10px] text-ink-400">
        {lane.ready > 0 && <span className="text-human-600">{lane.ready} ready</span>}
        {lane.blocked > 0 && <span>{lane.blocked} blocked</span>}
        {lane.working > 0 && <span className="text-agent-600">{lane.working} working</span>}
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <div className="font-mono text-[9px] uppercase tracking-wider text-ink-300">
          {lane.isLead ? "Your move" : "Available in this function"}
        </div>
        {move ? (
          <button type="button" onClick={() => onOpenTask(move.id)} className="mt-1 w-full text-left">
            <div className="text-xs font-medium leading-snug text-ink-800 hover:text-ink-950">{move.title}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-ink-400">{move.criticalityLabel}</span>
              {move.humanGate && <span className="rounded bg-human-50 px-1 font-mono text-[9px] text-human-700">needs you</span>}
            </div>
          </button>
        ) : (
          <div className="mt-1 text-xs text-ink-300">No ready work in this lane.</div>
        )}
      </div>

      {expanded && lane.catalog.length > 0 && (
        <div className="mt-3 border-t border-line pt-2">
          <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-ink-300">All plays in {lane.department} ({lane.catalog.length})</div>
          <div className="max-h-56 overflow-auto pr-1">
            {lane.catalog.map((t) => <CatalogRow key={t.id} t={t} />)}
          </div>
        </div>
      )}
      <button type="button" onClick={onToggle} className="mt-2 self-start font-mono text-[9px] uppercase tracking-wider text-ink-300 hover:text-ink-600">
        {expanded ? "hide plays" : `show all ${lane.total} plays`}
      </button>
    </div>
  );
}

function DriverTree() {
  const board = company.board || [];
  const leads = board.filter((l) => l.isLead);
  if (!company.northStar) return null;
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="font-mono text-2xs uppercase tracking-wider text-ink-400">North star</div>
      <div className="mt-0.5 text-base font-semibold text-ink-900">{company.northStar}</div>
      {leads.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {leads.map((l) => (
            <div key={l.department} className="text-[11px]">
              <span className="font-medium text-agent-700">{l.department}</span>
              <span className="text-ink-400"> drives </span>
              <span className="text-ink-600">{l.northStar}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConstraintBanner() {
  const c = company.constraint;
  if (!c) return null;
  if (c.missing) {
    return (
      <div className="rounded-xl border border-human-300 bg-human-50 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-human-500 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-white">No constraint</span>
          <span className="text-sm font-semibold text-human-800">This ranking is generic. Do not trust it.</span>
        </div>
        <p className="mt-1.5 text-xs text-human-700">
          No binding constraint has been diagnosed, so the board cannot tell which department leads. Run the constraint
          step of /casa-start. {c.defaultLead ? `Showing ${c.defaultLead} as a type default guess only.` : ""}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-agent-200 bg-agent-50 p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-2xs uppercase tracking-wider text-agent-700">Binding constraint</span>
        <span className="text-sm font-semibold text-ink-900">{c.label}</span>
        {c.leadDepartments.length > 0 && (
          <span className="text-xs text-ink-500">Lead: <span className="font-medium text-ink-700">{c.leadDepartments.join(", ")}</span></span>
        )}
        {typeof c.winGap === "number" && (
          <span className="rounded bg-agent-100 px-1.5 font-mono text-[10px] text-agent-700">{Math.round(c.winGap * 100)}% to target</span>
        )}
      </div>
      {c.win && <p className="mt-1 text-xs text-ink-500">Win: {c.win}</p>}
    </div>
  );
}

export function DepartmentBoard({ onOpenTask }: { onOpenTask: (id: string) => void }) {
  const board = company.board || [];
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">{company.name || "Your company"}</h1>
          <p className="text-xs text-ink-500">{company.oneLiner}</p>
        </div>

        <DriverTree />
        <ConstraintBanner />

        {board.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-400">
            No departments yet. Run /casa-start to build the company brain.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {board.map((lane) => (
              <Lane
                key={lane.department}
                lane={lane}
                expanded={open === lane.department}
                onToggle={() => setOpen(open === lane.department ? null : lane.department)}
                onOpenTask={onOpenTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
