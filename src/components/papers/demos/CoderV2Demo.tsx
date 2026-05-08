"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const CODE_BENCH = [
  { name: "HumanEval", coder1: 65.2, coderV2: 90.2, gpt4t: 88.4, claude35: 92.0 },
  { name: "HumanEval+", coder1: 60.4, coderV2: 86.6, gpt4t: 82.9, claude35: 87.2 },
  { name: "MBPP+", coder1: 64.2, coderV2: 76.2, gpt4t: 73.5, claude35: 79.4 },
  { name: "LiveCodeBench", coder1: 27.8, coderV2: 43.4, gpt4t: 35.1, claude35: 39.4 },
  { name: "SWE-Bench", coder1: 0.5, coderV2: 12.7, gpt4t: 11.7, claude35: 26.7 },
  { name: "Aider", coder1: 50.4, coderV2: 73.7, gpt4t: 72.9, claude35: 75.2 },
];

const TOP_LANGUAGES = [
  { name: "Python", weight: 100 },
  { name: "JavaScript", weight: 95 },
  { name: "TypeScript", weight: 90 },
  { name: "Java", weight: 88 },
  { name: "C++", weight: 85 },
  { name: "C", weight: 82 },
  { name: "Go", weight: 78 },
  { name: "Rust", weight: 76 },
  { name: "C#", weight: 72 },
  { name: "PHP", weight: 70 },
  { name: "Ruby", weight: 65 },
  { name: "Swift", weight: 62 },
  { name: "Kotlin", weight: 60 },
  { name: "Scala", weight: 55 },
  { name: "Haskell", weight: 50 },
  { name: "OCaml", weight: 45 },
  { name: "Erlang", weight: 42 },
  { name: "Elixir", weight: 40 },
  { name: "R", weight: 50 },
  { name: "Julia", weight: 45 },
  { name: "Lua", weight: 48 },
  { name: "Solidity", weight: 38 },
  { name: "Verilog", weight: 32 },
  { name: "Fortran", weight: 28 },
  { name: "Pascal", weight: 22 },
  { name: "COBOL", weight: 18 },
  { name: "Assembly", weight: 30 },
  { name: "Shell", weight: 60 },
  { name: "PowerShell", weight: 38 },
  { name: "SQL", weight: 70 },
  { name: "HTML", weight: 75 },
  { name: "CSS", weight: 65 },
  { name: "Vue", weight: 52 },
  { name: "Svelte", weight: 35 },
  { name: "Dart", weight: 50 },
];

const FAMILY_COLORS: Record<string, string> = {
  modern: "#4D6BFE",
  classic: "#A78BFA",
  niche: "#F472B6",
};

export default function CoderV2Demo() {
  const [highlightFamily, setHighlightFamily] = useState<string | null>(null);

  const benchOption = useMemo(
    () => ({
      grid: { left: 50, right: 30, top: 35, bottom: 30 },
      tooltip: { trigger: "axis" },
      legend: {
        data: ["Coder-V1", "Coder-V2", "GPT-4 Turbo", "Claude-3.5"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      xAxis: {
        type: "category",
        data: CODE_BENCH.map((b) => b.name),
        axisLabel: { color: "#cfd2e3", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        {
          name: "Coder-V1",
          type: "bar",
          data: CODE_BENCH.map((b) => b.coder1),
          itemStyle: { color: "#8b90a8", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: "Coder-V2",
          type: "bar",
          data: CODE_BENCH.map((b) => b.coderV2),
          itemStyle: { color: "#4D6BFE", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: "GPT-4 Turbo",
          type: "bar",
          data: CODE_BENCH.map((b) => b.gpt4t),
          itemStyle: { color: "#34D399", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: "Claude-3.5",
          type: "bar",
          data: CODE_BENCH.map((b) => b.claude35),
          itemStyle: { color: "#F472B6", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
      ],
    }),
    []
  );

  // Compute font sizes for word-cloud style
  const maxW = Math.max(...TOP_LANGUAGES.map((l) => l.weight));

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Code Intelligence"
        title="Coder-V2：338 种语言全面对标 GPT-4"
        desc="在 V2 基础上继续预训练 6T 代码 token，覆盖 338 种编程语言。在多个 code benchmark 上首次让开源模型与 GPT-4 Turbo / Claude-3.5 处于同一 tier。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            Code Benchmark 对标
          </div>
          <ReactECharts option={benchOption} style={{ height: 380 }} />
          <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
            * Coder-V2 在 HumanEval / MBPP+ / Aider 上已与闭源 frontier 持平，
            真实工程任务（SWE-Bench）仍落后 Claude-3.5。
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              支持的编程语言（节选 ≈10%）
            </div>
            <div className="text-[10px] text-[var(--muted)]">
              共 <span className="text-white font-semibold">338</span> 种
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 leading-relaxed">
            {TOP_LANGUAGES.map((lang) => {
              const family =
                lang.weight >= 80
                  ? "modern"
                  : lang.weight >= 50
                    ? "classic"
                    : "niche";
              const isHi = highlightFamily === family;
              const fontSize = 10 + (lang.weight / maxW) * 8;
              return (
                <motion.span
                  key={lang.name}
                  whileHover={{ scale: 1.08 }}
                  onClick={() =>
                    setHighlightFamily(highlightFamily === family ? null : family)
                  }
                  className="px-2 py-0.5 rounded-md cursor-pointer transition select-none"
                  style={{
                    fontSize,
                    color:
                      highlightFamily && !isHi
                        ? "rgba(139,144,168,0.4)"
                        : FAMILY_COLORS[family],
                    background:
                      highlightFamily && !isHi
                        ? "transparent"
                        : `${FAMILY_COLORS[family]}15`,
                    border: `1px solid ${
                      highlightFamily && !isHi
                        ? "rgba(255,255,255,0.05)"
                        : FAMILY_COLORS[family] + "55"
                    }`,
                    fontWeight: lang.weight > 80 ? 600 : 400,
                  }}
                >
                  {lang.name}
                </motion.span>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-wrap gap-3 text-[10px]">
            <Legend label="主流" color={FAMILY_COLORS.modern} />
            <Legend label="经典" color={FAMILY_COLORS.classic} />
            <Legend label="小众 / 嵌入式" color={FAMILY_COLORS.niche} />
            <span className="text-[var(--muted)]">点击徽章可筛选</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-3">
        <Card title="6T tokens" sub="代码继续预训练" color="#4D6BFE" />
        <Card title="338 种语言" sub="V1 仅 87 种" color="#A78BFA" />
        <Card title="128K 上下文" sub="支持完整仓库扫描" color="#34D399" />
      </div>
    </section>
  );
}

function Card({
  title,
  sub,
  color,
}: {
  title: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: `${color}55`, background: `${color}10` }}
    >
      <div className="text-2xl font-semibold tracking-tight" style={{ color }}>
        {title}
      </div>
      <div className="text-xs text-[var(--muted)] mt-1">{sub}</div>
    </div>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
