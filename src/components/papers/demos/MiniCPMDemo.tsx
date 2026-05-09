"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Smartphone, Cpu } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const DEVICES = [
  { name: "iPhone 14 Pro", ram: 6, tps: 18 },
  { name: "Pixel 8", ram: 8, tps: 22 },
  { name: "Snapdragon 8 Gen 3", ram: 12, tps: 36 },
  { name: "M2 MacBook Air", ram: 16, tps: 84 },
  { name: "RTX 4090 (台式)", ram: 24, tps: 220 },
];

interface Block {
  i: number;
  start: number;
  end: number;
}

export default function MiniCPMDemo() {
  // visualize InfLLM: long context divided into blocks; recent K full + memory-recall top-K others
  const [seqLen, setSeqLen] = useState(96); // visualization tokens (each token is one cell)
  const [blockSize, setBlockSize] = useState(8);
  const [recentBlocks, setRecentBlocks] = useState(2);
  const [memoryTopK, setMemoryTopK] = useState(2);

  const [rawQueryPos, setRawQueryPos] = useState(95);
  const queryPos = Math.min(rawQueryPos, seqLen - 1);

  const blocks: Block[] = useMemo(() => {
    const out: Block[] = [];
    for (let i = 0; i < Math.ceil(seqLen / blockSize); i++) {
      out.push({ i, start: i * blockSize, end: Math.min((i + 1) * blockSize, seqLen) });
    }
    return out;
  }, [seqLen, blockSize]);

  const queryBlock = Math.floor(queryPos / blockSize);

  // pseudo importance per block based on query
  const blockScore = useMemo(() => {
    return blocks.map((b) => {
      const seed = (b.i * 31 + queryBlock * 17 + 1009) % 100;
      return seed / 100;
    });
  }, [blocks, queryBlock]);

  // pick which blocks are "active" (recent + top-K memory-recall non-recent)
  const activeBlocks = useMemo(() => {
    const recentSet = new Set<number>();
    for (let i = 0; i < recentBlocks; i++) {
      const idx = queryBlock - i;
      if (idx >= 0) recentSet.add(idx);
    }
    // top-K among non-recent, non-current
    const candidates = blocks
      .filter((b) => !recentSet.has(b.i))
      .map((b) => ({ i: b.i, score: blockScore[b.i] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, memoryTopK)
      .map((x) => x.i);
    return { recent: recentSet, memory: new Set(candidates) };
  }, [blocks, blockScore, queryBlock, recentBlocks, memoryTopK]);

  const activeTokenCount =
    (activeBlocks.recent.size + activeBlocks.memory.size) * blockSize;
  const ratio = activeTokenCount / seqLen;

  const speedOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {},
      grid: { left: 130, right: 60, top: 10, bottom: 30 },
      xAxis: {
        type: "value",
        axisLabel: { color: "#8b90a8", fontSize: 10, formatter: (v: number) => `${v} tps` },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      yAxis: {
        type: "category",
        data: DEVICES.map((d) => d.name),
        axisLabel: { color: "#cfd2e3", fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          data: DEVICES.map((d) => ({
            value: d.tps,
            itemStyle: { color: "#F2994A", borderRadius: [0, 4, 4, 0] },
          })),
          label: {
            show: true,
            position: "right",
            color: "#cfd2e3",
            fontSize: 10,
            formatter: (p: { value: number }) => `${p.value} tok/s`,
          },
          barWidth: 14,
        },
      ],
    }),
    []
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="MiniCPM 3 · 端侧 4B"
        title="InfLLM：让 4B 模型读 32K 上下文"
        desc="MiniCPM 3 用 InfLLM 把长上下文切成块，仅把最近的 K 块 + 「按相关性 recall」的 top-K 个旧块送进 attention。下面把这个分块召回机制可视化，并展示在端侧设备上的实测推理速度。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <Slider label="序列长度 (token)" value={seqLen} setValue={setSeqLen} min={32} max={256} step={16} />
            <Slider label="块大小" value={blockSize} setValue={setBlockSize} min={4} max={16} step={2} />
            <Slider label="保留最近块数" value={recentBlocks} setValue={setRecentBlocks} min={1} max={4} step={1} />
            <Slider label="记忆召回 top-K" value={memoryTopK} setValue={setMemoryTopK} min={0} max={4} step={1} />
            <Slider label="Query 位置" value={queryPos} setValue={setRawQueryPos} min={0} max={seqLen - 1} step={1} />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              attention 负担
            </div>
            <div className="flex items-end gap-3 mb-2">
              <div className="text-3xl font-bold tracking-tight" style={{ color: "#F2994A" }}>
                {(ratio * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-[var(--muted)] mb-1">tokens 参与 attn</div>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2">
              <motion.div
                animate={{ width: `${ratio * 100}%` }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #F2994A, #FFB46B)" }}
              />
            </div>
            <div className="text-[11px] text-[var(--muted)] leading-relaxed">
              全注意力会用 100%，InfLLM 在长上下文上把这个数字稳定在 ~10-25%，让 4B 模型能跑 32K 输入。
            </div>
          </div>
        </div>

        {/* Block visualization */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              分块视图（query 位于 block #{queryBlock}）
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#F2994A" }} />
                recent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#0E8FFD" }} />
                memory-recall
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-white/10" />
                inactive
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {blocks.map((b) => {
              const isRecent = activeBlocks.recent.has(b.i);
              const isMem = activeBlocks.memory.has(b.i);
              const score = blockScore[b.i];
              const cellW = `calc(${100 / Math.min(16, blocks.length)}% - 4px)`;
              return (
                <motion.div
                  key={b.i}
                  animate={{
                    scale: isRecent || isMem ? 1.0 : 0.94,
                    opacity: isRecent || isMem ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.25 }}
                  className="rounded-md p-2 flex flex-col items-center justify-center text-center"
                  style={{
                    minHeight: 56,
                    width: cellW,
                    minWidth: 48,
                    background: isRecent
                      ? "rgba(242,153,74,0.18)"
                      : isMem
                        ? "rgba(14,143,253,0.18)"
                        : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${
                      isRecent ? "#F2994A" : isMem ? "#0E8FFD" : "var(--border)"
                    }`,
                  }}
                >
                  <div className="text-[10px] font-mono">B{b.i}</div>
                  <div className="text-[9px] text-[var(--muted)] mt-0.5">
                    {b.start}-{b.end - 1}
                  </div>
                  {isMem && (
                    <div className="text-[8px] mt-0.5" style={{ color: "#0E8FFD" }}>
                      score {score.toFixed(2)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="text-xs text-[var(--muted)] leading-relaxed">
            InfLLM = <strong className="text-white">recent window</strong> +
            <strong className="text-white"> external memory</strong>。每块通过 representative key 计算与 query 的相关性，仅 top-K 个被「召回」进 attention，其余跳过。
          </div>
        </div>
      </div>

      {/* Edge speed */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              端侧实测速度
            </div>
            <div className="text-base font-semibold mt-1 flex items-center gap-2">
              <Smartphone size={16} className="text-[#F2994A]" />
              MiniCPM 3 (4B) 在不同设备上的解码 tps
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-mono">
            <Cpu size={12} />
            int4 量化，512 token 输出
          </div>
        </div>
        <ReactECharts option={speedOption} style={{ height: 240 }} />
        <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
          * 4B 参数 + InfLLM 让 MiniCPM 3 成为「跑得动 32K 上下文」的最小开源模型，把端侧 RAG 与本地 agent 拉到日常手机能玩的水平。
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
        <span>{label}</span>
        <span className="text-white font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="w-full accent-[#F2994A]"
      />
    </div>
  );
}
