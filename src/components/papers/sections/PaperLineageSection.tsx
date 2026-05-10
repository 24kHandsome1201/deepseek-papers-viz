"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Layers, Wrench } from "lucide-react";
import { paperById, type LineageRef } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import SectionHeader from "@/components/papers/SectionHeader";
import { formatDate } from "@/lib/utils";

interface Props {
  lineage: LineageRef[];
}

const ROLE_META: Record<
  LineageRef["role"],
  { label: string; icon: React.ReactNode; color: string }
> = {
  predecessor: { label: "前驱", icon: <ArrowLeft size={12} />, color: "#94a3b8" },
  contemporary: {
    label: "同代",
    icon: <Layers size={12} />,
    color: "#60a5fa",
  },
  successor: {
    label: "继承者",
    icon: <ArrowRight size={12} />,
    color: "#34d399",
  },
  applies: { label: "应用于", icon: <Wrench size={12} />, color: "#a78bfa" },
};

export default function PaperLineageSection({ lineage }: Props) {
  // resolve refs to actual papers; drop dangling
  const resolved = lineage
    .map((r) => ({ ref: r, paper: paperById(r.id) }))
    .filter((x) => x.paper);

  if (resolved.length === 0) return null;

  // group by role to keep visual hierarchy
  const order: LineageRef["role"][] = [
    "predecessor",
    "contemporary",
    "applies",
    "successor",
  ];
  const grouped = order
    .map((role) => ({
      role,
      items: resolved.filter((x) => x.ref.role === role),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Lineage"
        title="技术族谱"
        desc="这篇论文继承自谁、与谁同代、被谁继承——把孤立的论文嵌回时间线里。"
      />

      <div className="space-y-6">
        {grouped.map(({ role, items }) => {
          const meta = ROLE_META[role];
          return (
            <div key={role}>
              <div
                className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-2"
                style={{ color: meta.color }}
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background: `${meta.color}22` }}
                >
                  {meta.icon}
                </span>
                {meta.label}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(({ ref, paper }) => {
                  const team = TEAMS[paper!.team];
                  return (
                    <Link
                      key={ref.id}
                      href={`/paper/${ref.id}`}
                      className="group rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ background: team.color }}
                        />
                        {team.name}
                        <span className="opacity-50">·</span>
                        {formatDate(paper!.date)}
                      </div>
                      <div className="mt-1 font-medium text-sm group-hover:text-white transition">
                        {paper!.titleZh ?? paper!.title}
                      </div>
                      {ref.note && (
                        <div className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                          {ref.note}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
