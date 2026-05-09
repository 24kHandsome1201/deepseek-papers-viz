"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface MoEBlock {
  i: number;
  topic: "reason" | "agent" | "code" | "general";
  shared?: boolean;
}

const TOPIC_COLOR: Record<string, string> = {
  reason: "#0E8FFD",
  agent: "#5DB7FF",
  code: "#A78BFA",
  general: "#34D399",
};

function buildExperts(): MoEBlock[] {
  const arr: MoEBlock[] = [];
  // 64 experts for visualization (real GLM-4.5: 160 routed)
  const topics: MoEBlock["topic"][] = ["reason", "agent", "code", "general"];
  for (let i = 0; i < 60; i++) {
    arr.push({ i, topic: topics[i % topics.length] });
  }
  // 4 shared
  for (let i = 0; i < 4; i++) {
    arr.push({ i: 60 + i, topic: "general", shared: true });
  }
  return arr;
}

const EXPERTS = buildExperts();

const PROMPTS = [
  { id: "reason", label: "数学题 / 推理题", topic: "reason" as const, color: TOPIC_COLOR.reason },
  { id: "agent", label: "调用 API / 工具", topic: "agent" as const, color: TOPIC_COLOR.agent },
  { id: "code", label: "写一段 Python", topic: "code" as const, color: TOPIC_COLOR.code },
  { id: "general", label: "日常对话", topic: "general" as const, color: TOPIC_COLOR.general },
];

const BENCH = [
  { name: "AIME 2024", glm45: 76.4, glm4: 41.2, qwen3: 81.5, dsv3: 83.3 },
  { name: "GPQA Diamond", glm45: 71.2, glm4: 56.0, qwen3: 71.1, dsv3: 73.8 },
  { name: "SWE-Bench", glm45: 64.2, glm4: 42.5, qwen3: 65.5, dsv3: 65.9 },
  { name: "Tau-bench", glm45: 67.8, glm4: 48.1, qwen3: 64.2, dsv3: 60.7 },
];

export default function GLM45Demo() {
  const [mode, setMode] = useState<"reason" | "fast">("reason");
  const [promptId, setPromptId] = useState("reason");
  const prompt = PROMPTS.find((p) => p.id === promptId)!;

  // routing: in reason mode use top-8, in fast mode use top-4
  const topK = mode === "reason" ? 8 : 4;

  const routed = useMemo(() => {
    // pick experts matching the topic + some random matching
    const matching = EXPERTS.filter((e) => e.topic === prompt.topic && !e.shared);
    const shared = EXPERTS.filter((e) => e.shared);
    const target = matching.slice(0, topK - shared.length).map((e) => e.i);
    return new Set([...target, ...shared.map((s) => s.i)]);
  }, [prompt, topK]);

  const benchOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        data: ["GLM-4 (老)", "GLM-4.5 (新)", "Qwen3-235B", "DeepSeek-V3"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 50, right: 30, top: 30, bottom: 30 },
      xAxis: {
        type: "category",
        data: BENCH.map((b) => b.name),
        axisLabel: { color: "#cfd2e3", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      series: [
        {
          name: "GLM-4 (老)",
          type: "bar",
          data: BENCH.map((b) => b.glm4),
          itemStyle: { color: "#8b90a8", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: "GLM-4.5 (新)",
          type: "bar",
          data: BENCH.map((b) => b.glm45),
          itemStyle: { color: "#0E8FFD", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: "Qwen3-235B",
          type: "bar",
          data: BENCH.map((b) => b.qwen3),
          itemStyle: { color: "#615CED", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: "DeepSeek-V3",
          type: "bar",
          data: BENCH.map((b) => b.dsv3),
          itemStyle: { color: "#4D6BFE", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
      ],
    }),
    []
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="GLM-4.5 · 2025.07"
        title="智谱 355B MoE：reasoning 与 agent 一锅烩"
        desc="GLM-4.5 把推理与 agent 行为整合进同一个 MoE 模型，并提供两档输出模式（思考 / 直答）。下面把它的专家路由可视化：根据 prompt 类型动态激活不同子集。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Mode + prompt picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              选择模式
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("reason")}
                className="rounded-xl border p-3 transition text-left"
                style={{
                  borderColor: mode === "reason" ? "#0E8FFD" : "var(--border)",
                  background: mode === "reason"
                    ? "linear-gradient(135deg, #0E8FFD22, transparent)"
                    : "transparent",
                }}
              >
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Brain size={13} style={{ color: "#0E8FFD" }} />
                  <span style={{ color: mode === "reason" ? "#fff" : "#cfd2e3" }}>Reasoning</span>
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">top-8 专家</div>
              </button>
              <button
                onClick={() => setMode("fast")}
                className="rounded-xl border p-3 transition text-left"
                style={{
                  borderColor: mode === "fast" ? "#34D399" : "var(--border)",
                  background: mode === "fast"
                    ? "linear-gradient(135deg, #34D39922, transparent)"
                    : "transparent",
                }}
              >
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Zap size={13} style={{ color: "#34D399" }} />
                  <span style={{ color: mode === "fast" ? "#fff" : "#cfd2e3" }}>Fast</span>
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">top-4 专家</div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              输入类别（影响路由）
            </div>
            <div className="space-y-2">
              {PROMPTS.map((p) => {
                const active = promptId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPromptId(p.id)}
                    className="w-full text-left rounded-md border p-2.5 transition flex items-center gap-2"
                    style={{
                      borderColor: active ? p.color : "var(--border)",
                      background: active ? `${p.color}18` : "transparent",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span
                      className="text-xs"
                      style={{ color: active ? "#fff" : "#cfd2e3" }}
                    >
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              当前激活
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-[var(--border)] p-2">
                <div className="text-[10px] text-[var(--muted)] uppercase">总专家</div>
                <div className="font-mono text-sm">64</div>
              </div>
              <div className="rounded-md border border-[var(--border)] p-2">
                <div className="text-[10px] text-[var(--muted)] uppercase">激活</div>
                <div className="font-mono text-sm" style={{ color: "#0E8FFD" }}>
                  {routed.size}
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] p-2">
                <div className="text-[10px] text-[var(--muted)] uppercase">活参</div>
                <div className="font-mono text-sm">
                  ~{((routed.size / 64) * 32).toFixed(0)}B
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expert grid */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              MoE 专家拓扑（60 routed + 4 shared）
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
              {Object.entries(TOPIC_COLOR).map(([k, c]) => (
                <span key={k} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm" style={{ background: c }} />
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-8 gap-1.5">
            {EXPERTS.map((e) => {
              const isRouted = routed.has(e.i);
              return (
                <motion.div
                  key={e.i}
                  animate={{
                    scale: isRouted ? 1.06 : 0.96,
                    opacity: isRouted ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.28 }}
                  className="aspect-square rounded-md flex items-center justify-center text-[8px] font-mono relative"
                  style={{
                    background: isRouted ? TOPIC_COLOR[e.topic] : "#11131c",
                    border: e.shared
                      ? "1.5px dashed #fff"
                      : `1px solid ${isRouted ? "transparent" : "var(--border)"}`,
                    color: isRouted ? "#fff" : "var(--muted)",
                  }}
                >
                  {e.shared ? "S" : e.i}
                </motion.div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
            * 虚线方块 (S) 是共享专家，每次必激活；其余按 topic 与模式动态选择 top-K。Reasoning 模式激活更多专家来处理多步推理，Fast 模式则用最少必要专家保速度。
          </div>
        </div>
      </div>

      {/* Bench compare */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
          GLM-4.5 vs 同期开源 frontier
        </div>
        <ReactECharts option={benchOption} style={{ height: 280 }} />
      </div>
    </section>
  );
}
