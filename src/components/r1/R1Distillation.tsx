"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

interface Distill {
  name: string;
  base: string;
  size: string;
  aime: number;
  math: number;
  color: string;
}

const DISTILLED: Distill[] = [
  { name: "R1-Distill-Qwen-1.5B", base: "Qwen2.5-Math-1.5B", size: "1.5B", aime: 28.9, math: 83.9, color: "#7DD3FC" },
  { name: "R1-Distill-Qwen-7B", base: "Qwen2.5-Math-7B", size: "7B", aime: 55.5, math: 92.8, color: "#60A5FA" },
  { name: "R1-Distill-Llama-8B", base: "Llama-3.1-8B", size: "8B", aime: 50.4, math: 89.1, color: "#818CF8" },
  { name: "R1-Distill-Qwen-14B", base: "Qwen2.5-14B", size: "14B", aime: 69.7, math: 93.9, color: "#A78BFA" },
  { name: "R1-Distill-Qwen-32B", base: "Qwen2.5-32B", size: "32B", aime: 72.6, math: 94.3, color: "#C084FC" },
  { name: "R1-Distill-Llama-70B", base: "Llama-3.3-70B", size: "70B", aime: 70.0, math: 94.5, color: "#E879F9" },
];

export default function R1Distillation() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
          Distillation
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">
          推理能力蒸馏
        </h2>
        <p className="mt-2 text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
          R1 用 80 万条 SFT 数据把推理能力蒸馏到 6 个不同尺寸的 Dense 模型。
          其中 <b className="text-white">7B 蒸馏模型在 AIME 上击败 GPT-4o</b>，
          32B 蒸馏模型对齐甚至超过 OpenAI o1-mini —— 颠覆了「小模型推理弱」的认知。
        </p>
      </div>

      <div className="relative">
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="px-6 py-4 rounded-xl border-2 text-center"
            style={{
              borderColor: "#4D6BFE",
              background:
                "linear-gradient(135deg, rgba(77,107,254,0.18), rgba(123,92,255,0.12))",
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Teacher
            </div>
            <div className="mt-1 text-lg font-semibold">DeepSeek-R1</div>
            <div className="text-xs text-[var(--muted)]">671B MoE · 37B 激活</div>
          </motion.div>
        </div>

        <div className="flex items-center justify-center mb-6 text-[var(--muted)]">
          <ArrowDown size={20} />
        </div>

        <div className="text-center text-[10px] uppercase tracking-wider text-[var(--muted)] mb-4">
          采样 800K 条高质量 (Q, CoT, A) → 在小模型上做 SFT
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DISTILLED.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-xl border bg-[var(--panel)] p-4 relative overflow-hidden"
              style={{ borderColor: `${d.color}55` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: d.color }}
              />
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-mono" style={{ color: d.color }}>
                  {d.size}
                </div>
                <div className="text-[10px] text-[var(--muted)]">
                  base: {d.base}
                </div>
              </div>
              <div className="mt-1 text-sm font-medium leading-snug">
                {d.name}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <Stat label="AIME 24" value={`${d.aime}%`} color={d.color} />
                <Stat label="MATH-500" value={`${d.math}%`} color={d.color} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 text-sm leading-relaxed text-[var(--foreground)]/85">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
            一个反直觉发现
          </div>
          论文还做了对照实验：直接对 32B base 模型做 RL，效果远不如「先用 R1 蒸馏出 32B，再做 RL」。
          这说明 <b className="text-white">推理能力的发现需要更大的模型</b>，但一旦发现后，
          可以高效迁移到小模型上。
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-md bg-white/[0.03] px-2 py-1.5">
      <div className="text-[9px] text-[var(--muted)] uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
