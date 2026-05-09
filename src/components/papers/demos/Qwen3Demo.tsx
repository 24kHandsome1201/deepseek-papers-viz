"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Sample {
  prompt: string;
  thinking: string;
  thinkingMs: number;
  thinkingTokens: number;
  fast: string;
  fastMs: number;
  fastTokens: number;
}

const SAMPLES: Sample[] = [
  {
    prompt: "求 ∫₀¹ x²·ln(1+x) dx 的精确值。",
    thinking:
      "拆分为 ∫₀¹ x²·ln(1+x) dx。令 u = ln(1+x), dv = x²dx, 则 du = dx/(1+x), v = x³/3。\n分部积分得 [x³ln(1+x)/3]₀¹ − ∫₀¹ x³/(3(1+x)) dx\n= ln2/3 − (1/3)∫₀¹ x³/(1+x) dx\n剩余分式做长除：x³/(1+x) = x² − x + 1 − 1/(1+x)\n积分 = 1/3 − 1/2 + 1 − ln2 = 5/6 − ln2\n代回 = ln2/3 − (5/6 − ln2)/3 = ln2/3 − 5/18 + ln2/3 = 2ln2/3 − 5/18",
    thinkingMs: 4800,
    thinkingTokens: 187,
    fast: "≈ 0.1864（数值近似）",
    fastMs: 180,
    fastTokens: 9,
  },
  {
    prompt: "把 'Hello World' 翻译成法语。",
    thinking:
      "用户要求基础翻译。'Hello World' 在法语中常见为 'Bonjour le monde' 或 'Salut le monde'。前者更常用作打招呼用语，后者偏口语。这里没有上下文，选择规范译法。",
    thinkingMs: 800,
    thinkingTokens: 42,
    fast: "Bonjour le monde",
    fastMs: 60,
    fastTokens: 4,
  },
  {
    prompt: "三只狼一只羊在河边，一艘只能载两只动物的船……",
    thinking:
      "经典渡河变体。约束：船每次至多载 2 只动物，必须有动物划船；岸上若狼 > 羊 则羊被吃。\n初始 (3W,1S | 0)，目标 (0,0 | 3W,1S)。\n步骤 1: 1W+1S 过 → (2W,0 | 1W,1S)，左岸狼 2 羊 0 安全。\n步骤 2: 1S 回 → (2W,1S | 1W)，左岸 2W>1S 不安全！需重新规划。\n…(展开 4 个候选解空间，回溯)…\n最终方案：W+S 过 → W 回 → 2W 过 → W 回 → W+S 过。共 5 步。",
    thinkingMs: 6200,
    thinkingTokens: 256,
    fast: "5 步：先送 1 狼 1 羊，狼回，再送 2 狼，狼回，最后狼羊一起过。",
    fastMs: 220,
    fastTokens: 28,
  },
];

const SIZES = [
  { name: "Qwen3-0.6B", params: 0.6, type: "Dense", color: "#cbd5e1" },
  { name: "Qwen3-1.7B", params: 1.7, type: "Dense", color: "#94a3b8" },
  { name: "Qwen3-4B", params: 4, type: "Dense", color: "#615CED" },
  { name: "Qwen3-8B", params: 8, type: "Dense", color: "#615CED" },
  { name: "Qwen3-14B", params: 14, type: "Dense", color: "#7B5CFF" },
  { name: "Qwen3-32B", params: 32, type: "Dense", color: "#7B5CFF" },
  { name: "Qwen3-30B-A3B", params: 30, type: "MoE", active: 3, color: "#A78BFA" },
  { name: "Qwen3-235B-A22B", params: 235, type: "MoE", active: 22, color: "#F472B6" },
];

export default function Qwen3Demo() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [thinking, setThinking] = useState(true);
  const [tick, setTick] = useState(0);
  const sample = SAMPLES[sampleIdx];

  // tick-based animation; step is derived from tick % lines so we don't have
  // to reset state when sample/thinking changes — changing the dependency
  // simply remounts the trace via the AnimatePresence key below.
  useEffect(() => {
    if (!thinking) return;
    const id = setInterval(() => setTick((t) => t + 1), 700);
    return () => clearInterval(id);
  }, [thinking]);

  const lineCount = sample.thinking.split("\n").length;
  const step = thinking ? tick % (lineCount + 1) : lineCount;

  const sizeOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      grid: { left: 130, right: 60, top: 20, bottom: 30 },
      tooltip: {
        formatter: (p: { name: string; value: number; data: { type: string; active?: number } }) => {
          const d = p.data;
          if (d.type === "MoE")
            return `<b>${p.name}</b><br/>总参数 ${p.value}B<br/>激活 ${d.active}B`;
          return `<b>${p.name}</b><br/>${d.type} · ${p.value}B`;
        },
      },
      xAxis: {
        type: "log",
        max: 300,
        min: 0.5,
        axisLabel: {
          color: "#8b90a8",
          fontSize: 10,
          formatter: (v: number) => (v >= 1 ? `${v}B` : `${v.toFixed(1)}B`),
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "category",
        data: SIZES.map((s) => s.name),
        axisLabel: { color: "#cfd2e3", fontSize: 11 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      series: [
        {
          type: "bar",
          data: SIZES.map((s) => ({
            value: s.params,
            type: s.type,
            active: s.active,
            itemStyle: {
              color: s.color,
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            color: "#cfd2e3",
            fontSize: 10,
            formatter: (p: { value: number; data: { type: string; active?: number } }) =>
              p.data.type === "MoE" ? `${p.value}B (A${p.data.active}B)` : `${p.value}B`,
          },
          barWidth: 14,
        },
      ],
    }),
    []
  );

  const visibleLines = sample.thinking.split("\n").slice(0, step);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Qwen3 · Hybrid Reasoning"
        title="一个模型，两种大脑"
        desc="Qwen3 把 OpenAI o1 的「先思考再回答」与传统 LLM 的「快速直答」融进同一权重，仅靠 system prompt / 推理参数即可切换。下面真实复刻这两种模式的输出对比。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Mode toggle + sample picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              切换思考模式
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setThinking(true)}
                className="rounded-xl border p-4 transition text-left"
                style={{
                  borderColor: thinking ? "#615CED" : "var(--border)",
                  background: thinking
                    ? "linear-gradient(135deg, #615CED22, transparent)"
                    : "transparent",
                }}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Brain size={14} style={{ color: "#615CED" }} />
                  <span style={{ color: thinking ? "#fff" : "#cfd2e3" }}>Thinking</span>
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  /think · 输出推理链 + 答案
                </div>
              </button>
              <button
                onClick={() => setThinking(false)}
                className="rounded-xl border p-4 transition text-left"
                style={{
                  borderColor: !thinking ? "#F472B6" : "var(--border)",
                  background: !thinking
                    ? "linear-gradient(135deg, #F472B622, transparent)"
                    : "transparent",
                }}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap size={14} style={{ color: "#F472B6" }} />
                  <span style={{ color: !thinking ? "#fff" : "#cfd2e3" }}>Non-thinking</span>
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  /no_think · 直接给最终答案
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              选一个 prompt
            </div>
            <div className="space-y-2">
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSampleIdx(i)}
                  className="w-full text-left rounded-md border p-3 transition text-xs"
                  style={{
                    borderColor: sampleIdx === i ? "#615CED" : "var(--border)",
                    background: sampleIdx === i ? "#615CED15" : "transparent",
                    color: sampleIdx === i ? "#fff" : "#cfd2e3",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight size={11} className="mt-0.5 opacity-60 shrink-0" />
                    <span className="leading-snug">{s.prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output panel */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              模型输出
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-white/5">
                延迟 {thinking ? sample.thinkingMs : sample.fastMs} ms
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5">
                tokens {thinking ? sample.thinkingTokens : sample.fastTokens}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${sampleIdx}-${thinking}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {thinking ? (
                <div>
                  <div className="rounded-xl border border-[#615CED]/40 bg-[#615CED]/10 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-[#A78BFA] font-mono mb-2">
                      &lt;thinking&gt;
                    </div>
                    <pre className="font-mono text-[12px] whitespace-pre-wrap leading-relaxed text-[var(--foreground)]/85">
                      {visibleLines.join("\n")}
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-3 bg-[#A78BFA] align-middle ml-0.5"
                      />
                    </pre>
                  </div>
                  <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-mono mb-2">
                      最终答案
                    </div>
                    <div className="text-sm">{sample.fast}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#F472B6]/40 bg-[#F472B6]/10 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[#F472B6] font-mono mb-2">
                    direct answer
                  </div>
                  <div className="text-sm leading-relaxed">{sample.fast}</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-md border border-[var(--border)] p-2.5">
              <div className="text-[var(--muted)]">Thinking 准确率</div>
              <div className="font-semibold text-[#A78BFA] mt-0.5">+22% AIME</div>
            </div>
            <div className="rounded-md border border-[var(--border)] p-2.5">
              <div className="text-[var(--muted)]">Non-thinking 速度</div>
              <div className="font-semibold text-[#F472B6] mt-0.5">26× 更快</div>
            </div>
          </div>
        </div>
      </div>

      {/* Size matrix */}
      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              Family Coverage
            </div>
            <div className="text-base font-semibold mt-1">从手机到 H100：8 档全尺寸开源</div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#615CED" }} />
              Dense
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#A78BFA" }} />
              MoE
            </span>
          </div>
        </div>
        <ReactECharts option={sizeOption} style={{ height: 320 }} />
        <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
          * Qwen3 一次发布覆盖 0.6B 端侧到 235B 旗舰 MoE，激活参数 22B。MoE 版仅做思考模式优化以摊薄长 CoT 成本。
        </div>
      </div>
    </section>
  );
}
