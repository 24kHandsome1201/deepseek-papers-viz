"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const LONG_CHAIN: { tag: string; text: string; importance: number }[] = [
  { tag: "restate", text: "题目要求求 ∫ x²·sin(x) dx，先复述：被积函数是 x² 与 sin x 的乘积。", importance: 0.2 },
  { tag: "plan", text: "想到分部积分。令 u = x², dv = sin(x) dx。", importance: 0.9 },
  { tag: "compute", text: "du = 2x dx，v = -cos(x)。", importance: 0.7 },
  { tag: "compute", text: "得到 -x²·cos(x) + ∫ 2x·cos(x) dx。", importance: 0.95 },
  { tag: "self-check", text: "看一下符号是否对…对的，分部积分公式是 ∫ u dv = uv - ∫ v du。", importance: 0.1 },
  { tag: "plan", text: "再次分部积分：u = 2x, dv = cos(x) dx → du = 2dx, v = sin(x)。", importance: 0.9 },
  { tag: "compute", text: "= 2x·sin(x) - ∫ 2·sin(x) dx = 2x·sin(x) + 2cos(x)。", importance: 0.95 },
  { tag: "back-trace", text: "回代到主式。", importance: 0.4 },
  { tag: "answer", text: "最终：-x²·cos(x) + 2x·sin(x) + 2cos(x) + C", importance: 1.0 },
];

const SHORT_CHAIN: { text: string }[] = [
  { text: "分部积分：u = x², dv = sin x dx" },
  { text: "→ -x²cos x + ∫ 2x cos x dx" },
  { text: "再次分部积分：u = 2x, dv = cos x dx" },
  { text: "→ 2x sin x + 2cos x" },
  { text: "答：-x²cos x + 2x sin x + 2cos x + C" },
];

const RL_CURVE_DATA = [
  { step: 0, math: 35, code: 30, longCtx: 28 },
  { step: 1, math: 41, code: 36, longCtx: 32 },
  { step: 2, math: 49, code: 42, longCtx: 39 },
  { step: 3, math: 56, code: 47, longCtx: 45 },
  { step: 4, math: 63, code: 53, longCtx: 51 },
  { step: 5, math: 71, code: 58, longCtx: 56 },
  { step: 6, math: 76, code: 62, longCtx: 60 },
  { step: 7, math: 80, code: 65, longCtx: 63 },
];

export default function KimiK15Demo() {
  const [phase, setPhase] = useState<"long" | "distill" | "short">("long");
  const [highlightIdx, setHighlightIdx] = useState(0);

  useEffect(() => {
    if (phase !== "long") return;
    const id = setInterval(() => {
      setHighlightIdx((i) => (i + 1) % LONG_CHAIN.length);
    }, 1100);
    return () => clearInterval(id);
  }, [phase]);

  const longTokens = LONG_CHAIN.reduce((s, c) => s + c.text.length, 0);
  const shortTokens = SHORT_CHAIN.reduce((s, c) => s + c.text.length, 0);
  const compressRatio = (longTokens / shortTokens).toFixed(1);

  const rlOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        data: ["数学", "代码", "长上下文"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 50, right: 30, top: 30, bottom: 40 },
      xAxis: {
        type: "category",
        data: RL_CURVE_DATA.map((d) => d.step),
        name: "RL iter",
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
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
          name: "数学",
          type: "line",
          smooth: true,
          symbolSize: 6,
          data: RL_CURVE_DATA.map((d) => d.math),
          lineStyle: { color: "#1F1F1F", width: 2 },
          itemStyle: { color: "#1F1F1F" },
          areaStyle: { color: "rgba(31,31,31,0.15)" },
        },
        {
          name: "代码",
          type: "line",
          smooth: true,
          symbolSize: 6,
          data: RL_CURVE_DATA.map((d) => d.code),
          lineStyle: { color: "#F2C94C", width: 2 },
          itemStyle: { color: "#F2C94C" },
        },
        {
          name: "长上下文",
          type: "line",
          smooth: true,
          symbolSize: 6,
          data: RL_CURVE_DATA.map((d) => d.longCtx),
          lineStyle: { color: "#A78BFA", width: 2 },
          itemStyle: { color: "#A78BFA" },
        },
      ],
    }),
    []
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Kimi k1.5 · 2025.01"
        title="Long2Short：把 8K token 推理压成 200 token"
        desc="k1.5 与 R1 同日发布，并行回答了一个核心问题：「能不能让模型既会长链推理，又能在简单题上短答？」答案是用 Long2Short 蒸馏：先 RL 训出长链，再用短链 reward 把同一模型蒸到精炼输出。"
      />

      {/* Phase tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { id: "long", label: "Step 1 · Long-Context RL", color: "#A78BFA" },
          { id: "distill", label: "Step 2 · Long2Short Distill", color: "#F2C94C" },
          { id: "short", label: "Step 3 · 短链推理", color: "#34D399" },
        ] as const).map((p) => {
          const active = phase === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPhase(p.id)}
              className="px-4 py-2 rounded-full border text-sm transition"
              style={{
                borderColor: active ? p.color : "var(--border)",
                background: active ? `${p.color}1A` : "transparent",
                color: active ? "#fff" : "var(--muted)",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {phase === "long" && (
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
                  长链推理：每步带 tag，长度 ≈ {longTokens} 字
                </div>
                <div className="space-y-1.5">
                  {LONG_CHAIN.map((c, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: highlightIdx === i ? 1 : 0.5,
                        scale: highlightIdx === i ? 1.01 : 1,
                      }}
                      className="rounded-md border p-2.5 flex items-start gap-2"
                      style={{
                        borderColor: highlightIdx === i ? "#A78BFA" : "var(--border)",
                        background: highlightIdx === i ? "#A78BFA10" : "transparent",
                      }}
                    >
                      <span
                        className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background:
                            c.tag === "answer"
                              ? "#34D39925"
                              : c.tag === "self-check" || c.tag === "back-trace"
                                ? "#F472B625"
                                : "#A78BFA20",
                          color:
                            c.tag === "answer"
                              ? "#34D399"
                              : c.tag === "self-check" || c.tag === "back-trace"
                                ? "#F472B6"
                                : "#A78BFA",
                        }}
                      >
                        {c.tag}
                      </span>
                      <span className="text-xs leading-relaxed">{c.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
                  RL 训练曲线（合成）
                </div>
                <ReactECharts option={rlOption} style={{ height: 260 }} />
                <div className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
                  k1.5 用 long-context RL 训练，奖励 = 答案正确性 + 长度惩罚 + 反思鼓励，让模型自发涌现「自检」与「回溯」步骤（粉色 tag）。
                </div>
              </div>
            </div>
          )}

          {phase === "distill" && (
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-[10px] uppercase text-[var(--muted)] mb-2">长链 (teacher)</div>
                <div className="text-3xl font-bold tracking-tight">{longTokens}</div>
                <div className="text-[11px] text-[var(--muted)]">tokens / 题</div>
                <div className="mt-3 text-[11px] text-[var(--muted)] leading-relaxed">
                  含 9 步推理，平均 22 token / step；适合复杂题。
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ x: [0, 12, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[#F2C94C]"
                  >
                    <ArrowRight size={36} />
                  </motion.div>
                  <div className="text-xs text-[var(--muted)] mt-2 font-mono">
                    distill via short-len reward
                  </div>
                  <div className="mt-2 px-3 py-1 rounded-full bg-[#F2C94C]/15 border border-[#F2C94C]/40 text-xs text-[#F2C94C]">
                    × {compressRatio} 压缩
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#34D399]/40 bg-[#34D399]/10 p-5">
                <div className="text-[10px] uppercase text-[var(--muted)] mb-2">短链 (student)</div>
                <div className="text-3xl font-bold tracking-tight">{shortTokens}</div>
                <div className="text-[11px] text-[var(--muted)]">tokens / 题</div>
                <div className="mt-3 text-[11px] text-[var(--muted)] leading-relaxed">
                  仍保留正确推理结构，但去除自检 / 回溯 / 复述。
                </div>
              </div>
            </div>
          )}

          {phase === "short" && (
            <div className="rounded-2xl border border-[#34D399]/40 bg-[#34D399]/10 p-6">
              <div className="text-[11px] uppercase tracking-wider text-[#34D399] font-mono mb-4">
                短链输出（k1.5 蒸馏后）
              </div>
              <ol className="space-y-2.5">
                {SHORT_CHAIN.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.18, duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{s.text}</span>
                  </motion.li>
                ))}
              </ol>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <div className="text-[10px] text-[var(--muted)] uppercase">推理 tokens</div>
                  <div className="font-semibold mt-1">↓ {compressRatio}×</div>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <div className="text-[10px] text-[var(--muted)] uppercase">推理速度</div>
                  <div className="font-semibold mt-1">↑ ~3.7×</div>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <div className="text-[10px] text-[var(--muted)] uppercase">准确率</div>
                  <div className="font-semibold mt-1">≈ 持平</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
