"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const SIZES = [
  { name: "0.5B", params: 0.5, mmlu: 47.6, gsm8k: 41.6, humaneval: 30.5 },
  { name: "1.5B", params: 1.5, mmlu: 60.9, gsm8k: 68.5, humaneval: 56.7 },
  { name: "3B", params: 3, mmlu: 65.6, gsm8k: 79.1, humaneval: 64.6 },
  { name: "7B", params: 7, mmlu: 74.2, gsm8k: 85.4, humaneval: 79.9 },
  { name: "14B", params: 14, mmlu: 79.7, gsm8k: 90.2, humaneval: 84.1 },
  { name: "32B", params: 32, mmlu: 83.3, gsm8k: 92.9, humaneval: 88.4 },
  { name: "72B", params: 72, mmlu: 86.1, gsm8k: 95.8, humaneval: 86.6 },
];

const DATA_BREAKDOWN = [
  { name: "中英网页", tokens: 7.2, color: "#615CED" },
  { name: "代码", tokens: 5.5, color: "#A78BFA" },
  { name: "数学", tokens: 1.2, color: "#F472B6" },
  { name: "学术 / 书籍", tokens: 2.4, color: "#34D399" },
  { name: "多语种 / 其他", tokens: 1.7, color: "#F59E0B" },
];

const TIMELINE = [
  { name: "Qwen 1", date: "2023.08", tokens: 2.4, params: 14 },
  { name: "Qwen 1.5", date: "2024.02", tokens: 3, params: 72 },
  { name: "Qwen 2", date: "2024.06", tokens: 7, params: 72 },
  { name: "Qwen 2.5", date: "2024.09", tokens: 18, params: 72, featured: true },
  { name: "Qwen 3", date: "2025.05", tokens: 36, params: 235 },
];

export default function Qwen25Demo() {
  const [metric, setMetric] = useState<"mmlu" | "gsm8k" | "humaneval">("mmlu");

  const totalTokens = DATA_BREAKDOWN.reduce((s, d) => s + d.tokens, 0);

  const scaleOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    legend: {
      data: ["MMLU", "GSM8K", "HumanEval"],
      textStyle: { color: "#cfd2e3", fontSize: 11 },
      top: 0,
    },
    xAxis: {
      type: "log" as const,
      name: "params (B)",
      nameTextStyle: { color: "#8b90a8", fontSize: 10 },
      axisLabel: {
        color: "#8b90a8",
        fontSize: 10,
        formatter: (v: number) => `${v}B`,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    yAxis: {
      type: "value" as const,
      max: 100,
      name: "score",
      nameTextStyle: { color: "#8b90a8", fontSize: 10 },
      axisLabel: { color: "#8b90a8", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    series: [
      {
        name: "MMLU",
        type: "line" as const,
        symbolSize: 8,
        data: SIZES.map((s) => [s.params, s.mmlu]),
        lineStyle: { color: "#615CED", width: 2 },
        itemStyle: { color: "#615CED" },
        smooth: true,
      },
      {
        name: "GSM8K",
        type: "line" as const,
        symbolSize: 8,
        data: SIZES.map((s) => [s.params, s.gsm8k]),
        lineStyle: { color: "#34D399", width: 2 },
        itemStyle: { color: "#34D399" },
        smooth: true,
      },
      {
        name: "HumanEval",
        type: "line" as const,
        symbolSize: 8,
        data: SIZES.map((s) => [s.params, s.humaneval]),
        lineStyle: { color: "#F472B6", width: 2 },
        itemStyle: { color: "#F472B6" },
        smooth: true,
      },
    ],
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Qwen2.5 · 2024.09"
        title="18T tokens 喂出 7 档全尺寸开源"
        desc="Qwen2.5 把训练数据从 Qwen2 的 7T 直接拉到 18T，并以 0.5B / 1.5B / 3B / 7B / 14B / 32B / 72B 七档全尺寸开源 —— 几乎每个能耗预算的开发者都能找到「正好」的 Qwen。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Data composition */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            18T tokens 数据组成
          </div>
          <div className="text-4xl font-bold tracking-tight mb-1">
            {totalTokens.toFixed(1)}T
          </div>
          <div className="text-[11px] text-[var(--muted)] mb-4">
            约相当于 1.4 亿本中等长度小说
          </div>
          <div className="space-y-2">
            {DATA_BREAKDOWN.map((d) => {
              const pct = (d.tokens / totalTokens) * 100;
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[var(--foreground)]/85">{d.name}</span>
                    <span className="font-mono text-[var(--muted)]">
                      {d.tokens}T · {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: d.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-[11px] text-[var(--muted)] leading-relaxed">
            * 与 Llama-3 (15T) 体量相近，但代码与多语种比例更高，使 Qwen2.5 在中英双语 / code benchmark 上保持优势。
          </div>
        </div>

        {/* Scaling chart */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              7 档尺寸 vs Benchmark
            </div>
            <div className="text-[10px] text-[var(--muted)]">log-scale x</div>
          </div>
          <ReactECharts option={scaleOption} style={{ height: 320 }} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            {(["mmlu", "gsm8k", "humaneval"] as const).map((k) => {
              const small = SIZES[0][k];
              const big = SIZES[SIZES.length - 1][k];
              const delta = (big - small).toFixed(1);
              return (
                <button
                  key={k}
                  onClick={() => setMetric(k)}
                  className="rounded-md border p-2 text-left transition"
                  style={{
                    borderColor: metric === k ? "#615CED" : "var(--border)",
                    background: metric === k ? "#615CED15" : "transparent",
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    {k.toUpperCase()}
                  </div>
                  <div className="font-semibold mt-0.5">
                    +{delta} pts <span className="text-[var(--muted)] font-normal">0.5B → 72B</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline of training data */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">
          Qwen 系列训练 token 演化
        </div>
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border)]" />
          <div className="grid grid-cols-5 gap-3 relative">
            {TIMELINE.map((t) => {
              const maxTokens = Math.max(...TIMELINE.map((x) => x.tokens));
              const h = (t.tokens / maxTokens) * 100;
              return (
                <div key={t.name} className="flex flex-col items-center gap-2">
                  <div className="h-32 w-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6 }}
                      className="w-full rounded-t-md"
                      style={{
                        background: t.featured
                          ? "linear-gradient(180deg, #615CED, #7B5CFF)"
                          : "rgba(255,255,255,0.08)",
                        border: t.featured ? "1px solid #fff5" : "none",
                      }}
                    />
                  </div>
                  <div
                    className="text-xs font-semibold text-center"
                    style={{ color: t.featured ? "#fff" : "#cfd2e3" }}
                  >
                    {t.name}
                  </div>
                  <div className="text-[10px] text-[var(--muted)]">{t.date}</div>
                  <div
                    className="text-[10px] font-mono"
                    style={{ color: t.featured ? "#A78BFA" : "var(--muted)" }}
                  >
                    {t.tokens}T tokens
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 text-xs text-[var(--muted)]">
          * Qwen2.5 是「数据飞轮」从 7T → 18T 的关键节点，奠定 Qwen3 235B MoE 与 Qwen3.6 frontier 的预训练底座。
        </div>
      </div>
    </section>
  );
}
