"use client";

import { Paper } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import PaperHero from "@/components/papers/PaperHero";
import PaperFooterNav from "@/components/papers/PaperFooterNav";
import { PAPER_DEMOS } from "@/components/papers/demoRegistry";
import PaperPipelineSection from "@/components/papers/sections/PaperPipelineSection";
import PaperKeyTechniquesSection from "@/components/papers/sections/PaperKeyTechniquesSection";
import PaperBenchmarksSection from "@/components/papers/sections/PaperBenchmarksSection";
import PaperInsightsSection from "@/components/papers/sections/PaperInsightsSection";
import PaperLineageSection from "@/components/papers/sections/PaperLineageSection";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface Props {
  paper: Paper;
}

export default function PaperDeepView({ paper }: Props) {
  const Demo = PAPER_DEMOS[paper.id];
  const team = TEAMS[paper.team];

  const hasPipeline = (paper.pipeline?.length ?? 0) > 0;
  const hasTechniques = (paper.keyTechniques?.length ?? 0) > 0;
  const hasBenchmarks = (paper.benchmarks?.length ?? 0) >= 3;
  const hasInsights = (paper.insights?.length ?? 0) > 0;
  const hasLineage = (paper.lineage?.length ?? 0) > 0;

  return (
    <main className="min-h-screen bg-background">
      <PaperHero
        paper={paper}
        badge={Demo ? "Interactive Demo" : "Deep Dive"}
      />

      {Demo ? (
        <>
          <Divider />
          <Demo />
        </>
      ) : null}

      {hasPipeline && (
        <>
          <Divider />
          <PaperPipelineSection
            stages={paper.pipeline!}
            teamColor={team.color}
          />
        </>
      )}

      {hasTechniques && (
        <>
          <Divider />
          <PaperKeyTechniquesSection
            techniques={paper.keyTechniques!}
            teamColor={team.color}
          />
        </>
      )}

      {hasBenchmarks && (
        <>
          <Divider />
          <PaperBenchmarksSection
            benchmarks={paper.benchmarks!}
            teamColor={team.color}
            modelName={paper.titleZh?.split(/[:：]/)[0] ?? paper.id}
          />
        </>
      )}

      {hasInsights && (
        <>
          <Divider />
          <PaperInsightsSection
            insights={paper.insights!}
            teamColor={team.color}
          />
        </>
      )}

      {hasLineage && (
        <>
          <Divider />
          <PaperLineageSection lineage={paper.lineage!} />
        </>
      )}

      <Divider />
      <ContextSection paper={paper} />

      {paper.team === "deepseek" && paper.id !== "deepseek-r1" && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div
            className="rounded-2xl border p-6 flex items-center justify-between gap-4 flex-wrap"
            style={{
              borderColor: `${team.color}40`,
              background: `linear-gradient(135deg, ${team.color}15, transparent)`,
            }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Sparkles size={12} className="text-[#4D6BFE]" />
                想看完整深度演示？
              </div>
              <div className="mt-1 text-base font-semibold">
                DeepSeek-R1 提供 5 大模块的可玩交互
              </div>
              <div className="text-xs text-[var(--muted)] mt-0.5">
                训练流水线 / GRPO 模拟器 / Aha 时刻 / Benchmark / 蒸馏家族
              </div>
            </div>
            <Link
              href="/paper/deepseek-r1"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#4D6BFE] to-[#7B5CFF] text-white hover:brightness-110 transition"
            >
              进入 R1 深度演示 →
            </Link>
          </div>
        </section>
      )}

      <PaperFooterNav currentId={paper.id} />
    </main>
  );
}

function Divider() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="border-t border-[var(--border)]" />
    </div>
  );
}

function ContextSection({ paper }: { paper: Paper }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
          核心贡献
        </div>
        <ul className="space-y-2.5">
          {paper.contributions.map((c) => (
            <li key={c} className="text-sm flex items-start gap-2 leading-snug">
              <span
                className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                style={{ background: TEAMS[paper.team].color }}
              />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
          摘要
        </div>
        <p className="text-sm leading-relaxed text-[var(--foreground)]/85">
          {paper.summary}
        </p>
        {paper.buildsOn.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-2">
              基于 / 延伸自
            </div>
            <div className="flex flex-wrap gap-1.5">
              {paper.buildsOn.map((id) => (
                <Link
                  key={id}
                  href={`/paper/${id}`}
                  className="px-2 py-0.5 rounded-md text-xs border border-[var(--border)] hover:bg-white/5 transition"
                >
                  {id}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
