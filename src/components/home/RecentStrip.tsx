"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { PAPERS } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import { getReferenceDate } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export default function RecentStrip() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const today = getReferenceDate();

  const recent = PAPERS
    .filter((p) => {
      const d = new Date(p.date);
      const days = (today.getTime() - d.getTime()) / 86400000;
      return days <= 365 * 1.2; // last ~14 months
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 10);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section className="border-t border-[var(--border)] bg-[var(--panel)]/30">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              <Calendar size={12} />
              Recent Releases
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              近期发布
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              2025 至今的关键论文与模型，按时间倒序
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              className="w-8 h-8 rounded-full border border-[var(--border)] hover:bg-white/5 transition flex items-center justify-center"
              aria-label="向左"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="w-8 h-8 rounded-full border border-[var(--border)] hover:bg-white/5 transition flex items-center justify-center"
              aria-label="向右"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scrollbar-thin pb-3 -mx-1 px-1 snap-x snap-mandatory"
          style={{ scrollPaddingLeft: 4 }}
        >
          {recent.map((p) => {
            const team = TEAMS[p.team];
            const days = Math.round(
              (today.getTime() - +new Date(p.date)) / 86400000
            );
            const isFlagship = p.tier === "flagship";
            const isFresh = days < 90;
            return (
              <Link
                key={p.id}
                href={`/paper/${p.id}`}
                className="group shrink-0 w-[300px] snap-start rounded-xl border bg-[var(--panel)] p-4 transition hover:bg-[var(--panel-elev)] relative overflow-hidden"
                style={{
                  borderColor: isFlagship ? `${team.color}60` : "var(--border)",
                }}
              >
                {isFlagship && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(90deg, ${team.color}, ${team.accent})`,
                    }}
                  />
                )}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-[var(--muted)]">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: team.color }}
                    />
                    <span className="text-white">{team.name}</span>
                  </div>
                  {isFresh && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      NEW
                    </span>
                  )}
                </div>
                <div className="mt-2.5 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-white transition">
                  {p.titleZh ?? p.title}
                </div>
                <div className="mt-2 text-[10px] text-[var(--muted)] flex items-center gap-2">
                  <span>{formatDate(p.date)}</span>
                  <span className="opacity-50">·</span>
                  <span>
                    {days <= 0 ? "今日" : days < 30 ? `${days} 天前` : days < 365 ? `${Math.round(days / 30)} 个月前` : `${Math.round(days / 365)} 年前`}
                  </span>
                </div>
                {p.contributions.length > 0 && (
                  <div className="mt-3 text-[11px] text-[var(--foreground)]/65 leading-relaxed line-clamp-2">
                    {p.contributions.slice(0, 2).join(" · ")}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
