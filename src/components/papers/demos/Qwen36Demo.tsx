"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const MODELS = [
  { id: "qwen36", name: "Qwen3.6 Max", color: "#615CED", featured: true, org: "Qwen" },
  { id: "ds4", name: "DeepSeek V4-Pro", color: "#4D6BFE", org: "DeepSeek" },
  { id: "k26", name: "Kimi K2.6", color: "#F2C94C", org: "Moonshot" },
  { id: "gpt54", name: "GPT-5.4", color: "#34D399", org: "OpenAI", closed: true },
  { id: "claude45", name: "Claude Opus 4.5", color: "#F472B6", org: "Anthropic", closed: true },
];

interface Bench {
  name: string;
  values: Record<string, number>;
  unit: string;
  higher: boolean;
}

const BENCHES: Bench[] = [
  {
    name: "SWE-Bench Verified",
    values: { qwen36: 71.2, ds4: 73.8, k26: 70.5, gpt54: 69.4, claude45: 78.6 },
    unit: "%",
    higher: true,
  },
  {
    name: "Codeforces Elo",
    values: { qwen36: 3104, ds4: 3206, k26: 2980, gpt54: 2980, claude45: 2870 },
    unit: " Elo",
    higher: true,
  },
  {
    name: "AIME 2025",
    values: { qwen36: 91.4, ds4: 93.2, k26: 89.6, gpt54: 94.8, claude45: 90.2 },
    unit: "%",
    higher: true,
  },
  {
    name: "GPQA Diamond",
    values: { qwen36: 81.5, ds4: 82.7, k26: 79.4, gpt54: 84.2, claude45: 83.1 },
    unit: "%",
    higher: true,
  },
  {
    name: "Tau-bench (Agent)",
    values: { qwen36: 68.4, ds4: 71.5, k26: 73.2, gpt54: 72.6, claude45: 74.8 },
    unit: "%",
    higher: true,
  },
  {
    name: "API 价格 ($/Mtok)",
    values: { qwen36: 6.4, ds4: 3.48, k26: 5.2, gpt54: 18, claude45: 25 },
    unit: "$",
    higher: false,
  },
];

export default function Qwen36Demo() {
  const [highlightId, setHighlightId] = useState<string | null>("qwen36");
  const [bench, setBench] = useState(BENCHES[0]);

  const radarOption = useMemo(() => {
    const indicator = BENCHES.filter((b) => b.higher).map((b) => ({
      name: b.name.replace(" Verified", "").replace(" Diamond", ""),
      max: Math.max(...Object.values(b.values)) * 1.05,
    }));
    return {
      backgroundColor: "transparent",
      tooltip: {},
      legend: {
        data: MODELS.map((m) => m.name),
        textStyle: { color: "#cfd2e3", fontSize: 10 },
        bottom: 0,
        itemGap: 8,
      },
      radar: {
        indicator,
        shape: "polygon",
        center: ["50%", "48%"],
        radius: "62%",
        splitArea: {
          areaStyle: {
            color: ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.04)"],
          },
        },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        axisName: { color: "#cfd2e3", fontSize: 10 },
      },
      series: [
        {
          type: "radar",
          data: MODELS.map((m) => {
            const dim = BENCHES.filter((b) => b.higher).map((b) => b.values[m.id]);
            const isFaded = highlightId && highlightId !== m.id;
            return {
              name: m.name,
              value: dim,
              symbol: "circle",
              symbolSize: m.id === highlightId ? 6 : 4,
              lineStyle: {
                color: m.color,
                width: m.id === highlightId ? 3 : 1.5,
                opacity: isFaded ? 0.25 : 1,
              },
              areaStyle: {
                color: m.color,
                opacity: m.id === highlightId ? 0.18 : isFaded ? 0.04 : 0.08,
              },
              itemStyle: { color: m.color },
            };
          }),
        },
      ],
    };
  }, [highlightId]);

  const benchOption = useMemo(() => {
    const sorted = [...MODELS].sort((a, b) => {
      const va = bench.values[a.id];
      const vb = bench.values[b.id];
      return bench.higher ? vb - va : va - vb;
    });
    return {
      backgroundColor: "transparent",
      grid: { left: 130, right: 80, top: 10, bottom: 30 },
      tooltip: {},
      xAxis: {
        type: "value",
        axisLabel: {
          color: "#8b90a8",
          fontSize: 10,
          formatter: (v: number) =>
            bench.unit === "$" ? `$${v}` : bench.unit === " Elo" ? v : `${v}${bench.unit}`,
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      yAxis: {
        type: "category",
        data: sorted.map((m) => m.name),
        axisLabel: { color: "#cfd2e3", fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          data: sorted.map((m) => ({
            value: bench.values[m.id],
            itemStyle: {
              color: m.color,
              borderColor: m.featured ? "#fff" : undefined,
              borderWidth: m.featured ? 2 : 0,
              opacity: m.closed ? 0.55 : 1,
            },
          })),
          label: {
            show: true,
            position: "right",
            color: "#cfd2e3",
            fontSize: 10,
            formatter: (p: { value: number }) =>
              bench.unit === "$" ? `$${p.value}` : `${p.value}${bench.unit === " Elo" ? "" : bench.unit}`,
          },
          barWidth: 16,
        },
      ],
    };
  }, [bench]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Qwen3.6 · 2026 Q2"
        title="2026 中国开源三强 vs 闭源 frontier"
        desc="Qwen3.6 Max / DeepSeek V4 / Kimi K2.6 在 2026 年 4 月几乎同时发布，均以开源权重直接对标 GPT-5 / Claude Opus 4.5。这里横向对比六大维度。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            高亮某个模型（推理基准）
          </div>
          <div className="space-y-2">
            {MODELS.map((m) => {
              const isActive = highlightId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setHighlightId(isActive ? null : m.id)}
                  className="w-full text-left rounded-md border p-3 transition flex items-center gap-3"
                  style={{
                    borderColor: isActive ? m.color : "var(--border)",
                    background: isActive ? `${m.color}18` : "transparent",
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium"
                      style={{ color: isActive ? "#fff" : "#cfd2e3" }}
                    >
                      {m.name}
                      {m.featured && (
                        <Trophy size={11} className="inline ml-1.5" style={{ color: m.color }} />
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      {m.org}
                      {m.closed ? " · 闭源" : " · 开源"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
            5 大推理 / agent 维度雷达
          </div>
          <ReactECharts option={radarOption} style={{ height: 380 }} />
        </div>
      </div>

      {/* Per-bench bar chart */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              逐项基准
            </div>
            <div className="text-base font-semibold mt-1">{bench.name}</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BENCHES.map((b) => (
              <button
                key={b.name}
                onClick={() => setBench(b)}
                className="px-3 py-1.5 rounded-full text-[11px] border transition"
                style={{
                  borderColor: bench.name === b.name ? "#615CED" : "var(--border)",
                  background: bench.name === b.name ? "#615CED20" : "transparent",
                  color: bench.name === b.name ? "#fff" : "var(--muted)",
                }}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
        <motion.div
          key={bench.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <ReactECharts option={benchOption} style={{ height: 240 }} />
        </motion.div>
        <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
          * 闭源模型显示为半透明。在 SWE-Bench / Tau-bench 这类 agentic 任务上，Claude 仍领先；但在数学 / 代码竞赛纯推理任务上，开源三强已与闭源 frontier 同台。
        </div>
      </div>
    </section>
  );
}
