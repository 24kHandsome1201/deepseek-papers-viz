"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Mode = "dense" | "sliding" | "infllm";

const MODES: { id: Mode; name: string; color: string; desc: string }[] = [
  {
    id: "dense",
    name: "Dense",
    color: "#A78BFA",
    desc: "标准 O(n²) 全注意力,长上下文显存爆炸",
  },
  {
    id: "sliding",
    name: "Sliding Window",
    color: "#F59E0B",
    desc: "固定窗口,长依赖丢失",
  },
  {
    id: "infllm",
    name: "InfLLM v2",
    color: "#F2994A",
    desc: "可训练块级稀疏:近邻 + Top-K 关键块",
  },
];

// Compute the mask matrix
function computeMask(mode: Mode, seqLen: number, blockSize: number, topK: number) {
  const mask: number[][] = [];
  const numBlocks = Math.ceil(seqLen / blockSize);
  // Pseudo-importance score: deterministic per (qb, kb)
  const score = (qb: number, kb: number) =>
    ((qb * 9301 + kb * 49297 + 233280) % 233280) / 233280;
  // Local block range (always include): last 2 blocks
  const localBlocks = 2;

  for (let i = 0; i < seqLen; i++) {
    const row: number[] = [];
    const qb = Math.floor(i / blockSize);
    const importantPerQ = new Set<number>();
    if (mode === "infllm") {
      // pick top-K key blocks by score
      const cands: { kb: number; s: number }[] = [];
      for (let kb = 0; kb < numBlocks; kb++) {
        if (kb > qb) continue; // causal
        cands.push({ kb, s: score(qb, kb) });
      }
      cands.sort((a, b) => b.s - a.s);
      cands.slice(0, topK).forEach((c) => importantPerQ.add(c.kb));
    }

    for (let j = 0; j < seqLen; j++) {
      if (j > i) {
        row.push(-1);
        continue;
      }
      const kb = Math.floor(j / blockSize);
      if (mode === "dense") {
        row.push(1);
      } else if (mode === "sliding") {
        row.push(qb - kb < localBlocks ? 1 : 0);
      } else {
        // infllm
        if (qb - kb < localBlocks || importantPerQ.has(kb)) row.push(1);
        else row.push(0);
      }
    }
    mask.push(row);
  }
  return mask;
}

export default function InfLLMv2Demo() {
  const [mode, setMode] = useState<Mode>("infllm");
  const [seqLen] = useState(64);
  const [blockSize, setBlockSize] = useState(8);
  const [topK, setTopK] = useState(2);

  const mask = useMemo(
    () => computeMask(mode, seqLen, blockSize, topK),
    [mode, seqLen, blockSize, topK]
  );

  const stats = useMemo(() => {
    let active = 0;
    let totalCausal = 0;
    mask.forEach((row, i) =>
      row.forEach((c, j) => {
        if (j > i) return;
        totalCausal++;
        if (c === 1) active++;
      })
    );
    return {
      active,
      totalCausal,
      ratio: totalCausal === 0 ? 0 : active / totalCausal,
    };
  }, [mask]);

  // Throughput / latency curve at different context lengths
  const speedOption = useMemo(() => {
    const lens = [4, 8, 16, 32, 64, 128, 256];
    const dense = lens.map((l) => +(l * l * 0.04).toFixed(2));
    const localWindowTokens = 2 * blockSize;
    const sliding = lens.map((l) => +(l * localWindowTokens * 0.04).toFixed(2));
    const infllm = lens.map((l) =>
      +(l * (localWindowTokens + topK * blockSize) * 0.04).toFixed(2)
    );
    return {
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        data: ["Dense", "Sliding", "InfLLM v2"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 50, right: 24, top: 36, bottom: 50 },
      xAxis: {
        type: "category",
        data: lens.map((l) => `${l}K`),
        name: "上下文长度",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: "#8b90a8", fontSize: 11 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "log",
        name: "解码延迟 (相对)",
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        {
          name: "Dense",
          type: "line",
          data: dense,
          smooth: true,
          lineStyle: { width: 2, color: "#A78BFA" },
          itemStyle: { color: "#A78BFA" },
        },
        {
          name: "Sliding",
          type: "line",
          data: sliding,
          smooth: true,
          lineStyle: { width: 2, color: "#F59E0B" },
          itemStyle: { color: "#F59E0B" },
        },
        {
          name: "InfLLM v2",
          type: "line",
          data: infllm,
          smooth: true,
          lineStyle: { width: 2.6, color: "#F2994A" },
          itemStyle: { color: "#F2994A" },
        },
      ],
    };
  }, [blockSize, topK]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="MiniCPM-4 · InfLLM v2"
        title="可训练的块级稀疏注意力"
        desc="MiniCPM-4 把上下文按 block 切分,每个 query 只关注「最近若干块 + Top-K 关键块」。这种稀疏模式在训练和推理都生效,显著降低端侧设备上长序列推理的延迟。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              注意力模式
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

          {mode === "infllm" && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                  <span>Block size</span>
                  <span className="text-white font-mono">{blockSize}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={16}
                  step={2}
                  value={blockSize}
                  onChange={(e) => setBlockSize(parseInt(e.target.value))}
                  className="w-full accent-[#F2994A]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                  <span>Top-K 关键块</span>
                  <span className="text-white font-mono">{topK}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-[#F2994A]"
                />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              因果掩码内激活率
            </div>
            <div className="text-2xl font-semibold text-white">
              {(stats.ratio * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-1">
              {stats.active} / {stats.totalCausal} 个 (Q,K) 计算被保留
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              注意力掩码 ({seqLen}×{seqLen})
            </div>
            <div
              className="grid mx-auto"
              style={{
                width: "min(420px, 100%)",
                gridTemplateColumns: `repeat(${seqLen}, 1fr)`,
                gap: 1,
              }}
            >
              {mask.map((row, i) =>
                row.map((c, j) => {
                  let bg = "transparent";
                  if (c === -1) bg = "rgba(255,255,255,0.02)";
                  else if (c === 1)
                    bg =
                      MODES.find((m) => m.id === mode)?.color ?? "#F2994A";
                  else bg = "rgba(255,255,255,0.04)";
                  return (
                    <div
                      key={`${i}-${j}`}
                      style={{
                        aspectRatio: "1 / 1",
                        background: bg,
                        opacity: c === 1 ? 0.85 : 1,
                      }}
                    />
                  );
                })
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "#F2994A" }}
                />
                attended
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-white/[0.04]" />
                skipped
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-white/[0.02]" />
                causal mask
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              端侧解码延迟 vs 上下文长度
            </div>
            <ReactECharts option={speedOption} style={{ height: 220 }} notMerge />
          </div>
        </div>
      </div>
    </section>
  );
}
