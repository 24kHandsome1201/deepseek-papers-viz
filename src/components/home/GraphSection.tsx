"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Compass, Maximize2, Info } from "lucide-react";
import TeamFilter from "@/components/TeamFilter";
import PaperDrawer from "@/components/PaperDrawer";
import { TEAMS } from "@/data/teams";

const KnowledgeGraph = dynamic(() => import("@/components/KnowledgeGraph"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[460px] text-sm text-[var(--muted)]">
      正在加载图谱…
    </div>
  ),
});

export default function GraphSection() {
  const [active, setActive] = useState<Set<string>>(
    new Set(Object.keys(TEAMS))
  );
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section
      id="graph"
      className="border-t border-[var(--border)] bg-[var(--panel)]/20"
    >
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              <Compass size={12} />
              Full Graph
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              全景知识图谱
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
              横轴 = 时间 · 纵轴 = 团队 · 连线 = 技术继承。
              单击节点查看摘要，双击进入详情；★ = 旗舰，
              <span className="text-emerald-400"> 绿色脉冲</span> = 90 天内的最新发布。
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/70 backdrop-blur p-4">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              筛选团队
            </span>
            <TeamFilter active={active} onChange={setActive} />
          </div>

          <div className="relative rounded-xl border border-[var(--border)] bg-[var(--background)]/40">
            <KnowledgeGraph
              activeTeams={active}
              onSelect={setSelected}
              selectedId={selected}
            />
            <PaperDrawer
              paperId={selected}
              onClose={() => setSelected(null)}
            />
          </div>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-[10px] text-[var(--muted)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-yellow-300">★</span> Flagship
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                NEW &lt; 90 天
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Info size={11} />
                单击 / 双击 节点交互
              </span>
            </div>
            <span>
              <Maximize2 size={11} className="inline mr-1" />
              页面宽度不足时可横向滚动
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
