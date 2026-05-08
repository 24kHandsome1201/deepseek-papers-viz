"use client";

import { TEAMS } from "@/data/teams";
import { PAPERS } from "@/data/papers";
import { cn } from "@/lib/utils";

interface Props {
  active: Set<string>;
  onChange: (next: Set<string>) => void;
}

export default function TeamFilter({ active, onChange }: Props) {
  const counts: Record<string, number> = {};
  for (const p of PAPERS) counts[p.team] = (counts[p.team] ?? 0) + 1;

  const toggle = (id: string) => {
    const next = new Set(active);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else next.add(id);
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {Object.values(TEAMS).map((t) => {
        const isActive = active.has(t.id);
        const cnt = counts[t.id] ?? 0;
        return (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition",
              isActive
                ? "border-transparent"
                : "border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-white/20"
            )}
            style={
              isActive
                ? {
                    background: `${t.color}20`,
                    color: t.color,
                    borderColor: `${t.color}50`,
                  }
                : undefined
            }
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: t.color }}
            />
            {t.name}
            <span className="opacity-60">·{cnt}</span>
          </button>
        );
      })}
    </div>
  );
}
