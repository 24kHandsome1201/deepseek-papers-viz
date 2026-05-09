"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ModelScores {
  id: string;
  name: string;
  color: string;
  // Three buckets per ARC dim: agentic, reasoning, coding
  // Numbers are overall (mean across each bucket's micro-benchmarks).
  // Source: GLM-4.5 paper Figure 1 + reported nums (rounded).
  agentic: number;
  reasoning: number;
  coding: number;
  // micro
  tau: number; // TAU-Bench
  bfcl: number; // BFCL v3
  browse: number; // BrowseComp
  aime: number; // AIME 24
  gpqa: number; // GPQA
  swe: number; // SWE-Bench Verified
  term: number; // Terminal-Bench
}

const MODELS: ModelScores[] = [
  {
    id: "glm45",
    name: "GLM-4.5",
    color: "#0E8FFD",
    agentic: 55.2,
    reasoning: 63.2,
    coding: 50.9,
    tau: 70.1,
    bfcl: 77.8,
    browse: 26.4,
    aime: 91.0,
    gpqa: 79.1,
    swe: 64.2,
    term: 37.5,
  },
  {
    id: "claude-opus",
    name: "Claude Opus 4",
    color: "#D97757",
    agentic: 50.2,
    reasoning: 59.8,
    coding: 51.0,
    tau: 64.0,
    bfcl: 72.0,
    browse: 18.1,
    aime: 80.0,
    gpqa: 79.6,
    swe: 67.6,
    term: 43.2,
  },
  {
    id: "o3",
    name: "OpenAI o3",
    color: "#10A37F",
    agentic: 48.5,
    reasoning: 66.1,
    coding: 47.0,
    tau: 60.5,
    bfcl: 68.0,
    browse: 28.6,
    aime: 91.6,
    gpqa: 83.3,
    swe: 69.1,
    term: 30.2,
  },
  {
    id: "kimi-k2",
    name: "Kimi K2",
    color: "#F2C94C",
    agentic: 46.0,
    reasoning: 58.0,
    coding: 49.5,
    tau: 66.1,
    bfcl: 72.5,
    browse: 14.1,
    aime: 49.5,
    gpqa: 75.1,
    swe: 65.8,
    term: 30.0,
  },
  {
    id: "qwen3",
    name: "Qwen3-235B",
    color: "#615CED",
    agentic: 41.0,
    reasoning: 60.0,
    coding: 43.0,
    tau: 55.0,
    bfcl: 68.0,
    browse: 13.0,
    aime: 85.7,
    gpqa: 71.1,
    swe: 41.8,
    term: 22.0,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1-0528",
    color: "#4D6BFE",
    agentic: 38.0,
    reasoning: 60.0,
    coding: 42.0,
    tau: 51.4,
    bfcl: 64.0,
    browse: 11.5,
    aime: 87.5,
    gpqa: 79.0,
    swe: 44.6,
    term: 22.5,
  },
];

const ARC_DIMS = [
  { name: "Agentic", max: 70, key: "agentic" as const },
  { name: "Reasoning", max: 90, key: "reasoning" as const },
  { name: "Coding", max: 70, key: "coding" as const },
];

const MICRO_DIMS: { name: string; max: number; key: keyof ModelScores }[] = [
  { name: "TAU-Bench", max: 80, key: "tau" },
  { name: "BFCL v3", max: 85, key: "bfcl" },
  { name: "BrowseComp", max: 35, key: "browse" },
  { name: "AIME 24", max: 100, key: "aime" },
  { name: "GPQA", max: 90, key: "gpqa" },
  { name: "SWE-Bench V", max: 75, key: "swe" },
  { name: "Terminal-Bench", max: 50, key: "term" },
];

export default function GLMArcRadarDemo() {
  const [view, setView] = useState<"arc" | "micro">("micro");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["glm45", "claude-opus", "o3", "kimi-k2"])
  );

  const dims = useMemo(
    () => (view === "arc" ? ARC_DIMS : MICRO_DIMS),
    [view]
  );

  const option = useMemo(() => {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
      },
      legend: {
        data: MODELS.filter((m) => selected.has(m.id)).map((m) => m.name),
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      radar: {
        indicator: dims.map((d) => ({
          name: d.name,
          max: d.max,
        })),
        radius: "65%",
        center: ["50%", "55%"],
        splitNumber: 5,
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
          data: MODELS.filter((m) => selected.has(m.id)).map((m) => ({
            name: m.name,
            value: dims.map((d) => m[d.key as keyof ModelScores] as number),
            lineStyle: {
              width: m.id === "glm45" ? 3 : 1.5,
              color: m.color,
            },
            itemStyle: { color: m.color },
            areaStyle: {
              color: m.color,
              opacity: m.id === "glm45" ? 0.18 : 0.06,
            },
          })),
        },
      ],
    };
  }, [dims, selected]);

  const toggleModel = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else next.add(id);
    setSelected(next);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="GLM-4.5 · ARC Foundation"
        title="ARC 三合一:Agentic、Reasoning、Coding"
        desc="GLM-4.5 在三类基准上同时进入第一梯队。下方雷达图可切换 ARC 三大类视图与微观基准视图,自由勾选对比模型。GLM-4.5 用更小的激活参数(32B / 12B)做到与 Opus 4 / o3 同档。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              视图
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["arc", "ARC 三大类"],
                  ["micro", "细分基准"],
                ] as const
              ).map(([k, name]) => {
                const isActive = view === k;
                return (
                  <button
                    key={k}
                    onClick={() => setView(k)}
                    className="rounded-md border px-3 py-2 text-xs transition"
                    style={{
                      borderColor: isActive ? "#0E8FFD" : "var(--border)",
                      background: isActive ? "#0E8FFD15" : "transparent",
                      color: isActive ? "#fff" : "var(--muted)",
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              对比模型
            </div>
            <div className="space-y-1.5">
              {MODELS.map((m) => {
                const isActive = selected.has(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleModel(m.id)}
                    className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-xs transition"
                    style={{
                      borderColor: isActive ? m.color : "var(--border)",
                      background: isActive ? `${m.color}15` : "transparent",
                      color: isActive ? "#fff" : "var(--muted)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: m.color }}
                      />
                      {m.name}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {isActive ? "●" : "○"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#0E8FFD]/40 bg-[#0E8FFD]/[0.06] p-4 text-xs leading-relaxed text-[var(--muted)]">
            <span className="text-white font-medium">关键观察:</span>
            GLM-4.5(355B / 32B 激活)是开源模型中
            <span className="text-white"> Agentic 第一</span>;在 SWE-Bench Verified 上以 64.2 接近 Claude Opus 4(67.6),且参数量与价格远低于闭源对手。Air 版(106B / 12B 激活)进一步压低部署门槛。
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <ReactECharts
            option={option}
            style={{ height: 460 }}
            notMerge
          />
        </div>
      </div>
    </section>
  );
}
