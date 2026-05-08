"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/papers/SectionHeader";

type Mode = "full" | "sliding" | "dsa";

const MODES: { id: Mode; name: string; color: string; desc: string }[] = [
  { id: "full", name: "Full Attention", color: "#F59E0B", desc: "标准全注意力，O(n²) 计算" },
  { id: "sliding", name: "Sliding Window", color: "#A78BFA", desc: "Mistral 风格固定窗口，丢失远距离依赖" },
  { id: "dsa", name: "DSA (V3.2)", color: "#4D6BFE", desc: "动态选择重要 token，远距与近距并存" },
];

export default function DSADemo() {
  const [mode, setMode] = useState<Mode>("dsa");
  const [seqLen, setSeqLen] = useState(48); // visualization seq len
  const [topK, setTopK] = useState(8); // for DSA: top-K kept

  const matrix = useMemo(() => {
    const m: number[][] = [];
    for (let i = 0; i < seqLen; i++) {
      const row: number[] = [];
      for (let j = 0; j < seqLen; j++) {
        if (j > i) {
          row.push(-1); // masked
        } else if (mode === "full") {
          row.push(1);
        } else if (mode === "sliding") {
          row.push(i - j < 8 ? 1 : 0);
        } else {
          // DSA: keep nearest few + top-K "important" tokens (deterministic via hash)
          const local = i - j < 4;
          const score = ((j * 1009 + i * 31337) % 100) / 100; // pseudo importance
          row.push(local || score > (1 - topK / seqLen) ? 1 : 0);
        }
      }
      m.push(row);
    }
    return m;
  }, [mode, seqLen, topK]);

  const computeOps = useMemo(() => {
    const total = seqLen * seqLen;
    let active = 0;
    matrix.forEach((row) =>
      row.forEach((c) => {
        if (c === 1) active++;
      })
    );
    return { total, active, ratio: active / total };
  }, [matrix, seqLen]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="DeepSeek-V3.2 · DSA"
        title="DeepSeek Sparse Attention"
        desc="V3.2 引入 DSA（Dynamic Sparse Attention）：每个 query 动态选择最相关的 top-K 个 key 进行注意力计算，绕过 O(n²) 成本，但保留长距依赖的能力。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              选择注意力模式
            </div>
            <div className="space-y-2">
              {MODES.map((m) => {
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className="w-full text-left rounded-md border p-3 transition"
                    style={{
                      borderColor: isActive ? m.color : "var(--border)",
                      background: isActive ? `${m.color}15` : "transparent",
                    }}
                  >
                    <div
                      className="text-sm font-medium"
                      style={{ color: isActive ? "#fff" : "#cfd2e3" }}
                    >
                      {m.name}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                <span>序列长度</span>
                <span className="text-white font-mono">{seqLen}</span>
              </div>
              <input
                type="range"
                min={16}
                max={64}
                step={2}
                value={seqLen}
                onChange={(e) => setSeqLen(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            {mode === "dsa" && (
              <div>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                  <span>动态保留 top-K</span>
                  <span className="text-white font-mono">{topK}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={16}
                  step={1}
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              计算量
            </div>
            <div className="text-3xl font-semibold tabular-nums" style={{ color: MODES.find((m) => m.id === mode)!.color }}>
              {(computeOps.ratio * 100).toFixed(1)}%
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-1">
              of full attention ({computeOps.active} / {computeOps.total} ops)
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                animate={{ width: `${computeOps.ratio * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full"
                style={{ background: MODES.find((m) => m.id === mode)!.color }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              注意力矩阵 (query 行 × key 列)
            </div>
            <div className="text-[10px] text-[var(--muted)]">
              <span style={{ color: MODES.find((m) => m.id === mode)!.color }}>
                ▣
              </span>{" "}
              attended ·{" "}
              <span className="text-[#5a607a]">▣</span> skipped ·{" "}
              <span className="text-[#2a2d3a]">▣</span> masked
            </div>
          </div>

          <div className="aspect-square w-full max-w-[480px] mx-auto bg-[#0a0a0a] rounded-md p-1 overflow-hidden">
            <div
              className="grid w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${seqLen}, 1fr)`,
                gap: 1,
              }}
            >
              {matrix.flatMap((row, i) =>
                row.map((c, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    initial={false}
                    animate={{
                      backgroundColor:
                        c === -1
                          ? "#1a1d2b"
                          : c === 1
                            ? MODES.find((m) => m.id === mode)!.color
                            : "rgba(255,255,255,0.04)",
                      opacity: c === -1 ? 0.5 : c === 1 ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.3, delay: (i + j) * 0.0008 }}
                    className="rounded-[1px]"
                  />
                ))
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-[var(--muted)] leading-relaxed">
            <span className="text-white font-medium">观察：</span>
            DSA 模式下，每行 query 既保留近邻 token，也散布远距离的「重要 token」点。
            随 top-K 调小，矩阵越稀疏，但语义保真度（论文报告 &lt; 0.3% 退化）仍接近 full attention。
            这是 V3.2 在长上下文下显著提速的关键。
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-3">
        <Card label="vs full attention" value="≈ 30-40% FLOPs" color="#4D6BFE" />
        <Card label="质量退化" value="< 0.3%" color="#34D399" hint="V3.2 vs V3 报告" />
        <Card label="长上下文" value="164K → 1M (V4)" color="#A78BFA" hint="DSA 为 V4 1M 铺路" />
      </div>
    </section>
  );
}

function Card({
  label,
  value,
  color,
  hint,
}: {
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: `${color}55`, background: `${color}10` }}
    >
      <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xl font-semibold mt-1" style={{ color }}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-[var(--muted)] mt-1">{hint}</div>}
    </div>
  );
}
