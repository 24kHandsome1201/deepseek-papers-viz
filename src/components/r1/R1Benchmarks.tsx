"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const BENCHMARKS = [
  { name: "AIME 2024", max: 100 },
  { name: "MATH-500", max: 100 },
  { name: "GPQA Diamond", max: 100 },
  { name: "Codeforces (pct)", max: 100 },
  { name: "MMLU", max: 100 },
  { name: "LiveCodeBench", max: 100 },
];

const MODELS = [
  {
    name: "DeepSeek-R1",
    color: "#4D6BFE",
    values: [79.8, 97.3, 71.5, 96.3, 90.8, 65.9],
  },
  {
    name: "OpenAI o1-1217",
    color: "#10B981",
    values: [79.2, 96.4, 75.7, 96.6, 91.8, 63.4],
  },
  {
    name: "DeepSeek-V3 (无 RL)",
    color: "#F59E0B",
    values: [39.2, 90.2, 59.1, 51.6, 88.5, 36.2],
  },
  {
    name: "GPT-4o",
    color: "#A78BFA",
    values: [9.3, 74.6, 49.9, 23.6, 87.2, 33.4],
  },
];

const BAR_BENCH = [
  { name: "AIME 2024", v3: 39.2, r1: 79.8 },
  { name: "MATH-500", v3: 90.2, r1: 97.3 },
  { name: "GPQA", v3: 59.1, r1: 71.5 },
  { name: "LiveCodeBench", v3: 36.2, r1: 65.9 },
];

export default function R1Benchmarks() {
  const radarOption = useMemo(
    () => ({
      tooltip: { trigger: "item" },
      legend: {
        data: MODELS.map((m) => m.name),
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        bottom: 0,
        itemGap: 16,
      },
      radar: {
        indicator: BENCHMARKS.map((b) => ({ name: b.name, max: b.max })),
        shape: "polygon",
        splitNumber: 4,
        axisName: {
          color: "#cfd2e3",
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        splitArea: {
          areaStyle: {
            color: ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.04)"],
          },
        },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      series: [
        {
          type: "radar",
          emphasis: { lineStyle: { width: 3 } },
          data: MODELS.map((m) => ({
            value: m.values,
            name: m.name,
            itemStyle: { color: m.color },
            lineStyle: { color: m.color, width: 2 },
            areaStyle: { color: m.color, opacity: 0.12 },
          })),
        },
      ],
    }),
    []
  );

  const barOption = useMemo(
    () => ({
      grid: { left: 50, right: 30, top: 30, bottom: 30 },
      tooltip: { trigger: "axis" },
      legend: {
        data: ["V3 (无 RL)", "R1 (RL 后)"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
        right: 0,
      },
      xAxis: {
        type: "category",
        data: BAR_BENCH.map((b) => b.name),
        axisLabel: { color: "#cfd2e3", fontSize: 11 },
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
          name: "V3 (无 RL)",
          type: "bar",
          data: BAR_BENCH.map((b) => b.v3),
          itemStyle: {
            color: "#F59E0B",
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: 24,
        },
        {
          name: "R1 (RL 后)",
          type: "bar",
          data: BAR_BENCH.map((b) => b.r1),
          itemStyle: {
            color: "#4D6BFE",
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: 24,
        },
      ],
    }),
    []
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
          Benchmarks
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">
          性能对标
        </h2>
        <p className="mt-2 text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
          R1 在数学、代码、研究生级科学问题上全面对齐 OpenAI o1，
          相对 V3（未做 RL 推理训练）的提升尤其惊人。
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            多维度雷达对标
          </div>
          <ReactECharts
            option={radarOption}
            style={{ height: 420 }}
            theme="dark"
          />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            RL 带来的提升（V3 → R1）
          </div>
          <ReactECharts option={barOption} style={{ height: 420 }} />
          <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
            * AIME 从 39.2% → 79.8%，几乎翻倍；LiveCodeBench 从 36.2% → 65.9%。
            这强烈印证了「在足够强的 base 上，RL 能榨出此前未被 SFT 激发出的推理能力」这一假设。
          </div>
        </div>
      </div>
    </section>
  );
}
