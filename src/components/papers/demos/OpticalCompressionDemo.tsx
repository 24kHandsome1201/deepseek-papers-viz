"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/papers/SectionHeader";
import { motion } from "framer-motion";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Empirically inspired curve (paper Fig. (a) on Fox bench):
// At ratio 9-10x, accuracy ~97%. At ratio 20x, ~60%. Drop is roughly logistic.
function ocrAccuracy(ratio: number) {
  // Logistic with center 14, slope -0.45, asymptotes 35..98
  const center = 14;
  const slope = -0.42;
  const lo = 35;
  const hi = 98;
  const v = lo + (hi - lo) / (1 + Math.exp(-slope * (ratio - center)));
  return Math.max(0, Math.min(100, v));
}

export default function OpticalCompressionDemo() {
  const [textTokens, setTextTokens] = useState(2000);
  const [visionTokens, setVisionTokens] = useState(200);

  const ratio = visionTokens === 0 ? 0 : textTokens / visionTokens;
  const accuracy = ocrAccuracy(ratio);

  const chartOption = useMemo(() => {
    const xs: number[] = [];
    for (let r = 1; r <= 30; r += 0.25) xs.push(+r.toFixed(2));
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: { axisValue: string; value: number }[]) => {
          const r = parseFloat(params[0].axisValue);
          return `<div style="font-size:11px"><b>${r.toFixed(1)}× 压缩</b><br/>OCR 精度 ${params[0].value.toFixed(1)}%</div>`;
        },
      },
      grid: { left: 50, right: 24, top: 30, bottom: 50 },
      xAxis: {
        type: "category",
        data: xs,
        name: "压缩比 (text tokens / vision tokens)",
        nameLocation: "middle",
        nameGap: 32,
        nameTextStyle: { color: "#8b90a8", fontSize: 11 },
        axisLabel: {
          color: "#8b90a8",
          fontSize: 10,
          interval: 15,
          formatter: (v: string) => `${parseFloat(v).toFixed(0)}×`,
        },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        name: "OCR 精度 (%)",
        min: 0,
        max: 100,
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        {
          name: "DeepSeek-OCR",
          type: "line" as const,
          data: xs.map((r) => +ocrAccuracy(r).toFixed(2)),
          showSymbol: false,
          smooth: true,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#4D6BFE55" },
                { offset: 1, color: "#4D6BFE00" },
              ],
            },
          },
          lineStyle: { width: 2.6, color: "#4D6BFE" },
          itemStyle: { color: "#4D6BFE" },
        },
        {
          type: "line" as const,
          data: [],
          markLine: {
            silent: true,
            symbol: "none",
            label: { show: false },
            lineStyle: { color: "#7B8FFF", width: 1.5, type: "dashed" },
            data: [{ xAxis: ratio.toFixed(2) }],
          },
        },
        {
          type: "scatter" as const,
          symbolSize: 14,
          data: [[ratio.toFixed(2), accuracy.toFixed(2)]],
          itemStyle: {
            color: "#fff",
            borderColor: "#4D6BFE",
            borderWidth: 2,
          },
          z: 10,
        },
      ],
    };
  }, [ratio, accuracy]);

  // Vision token visualization grid: scaled bar
  const gridSize = Math.max(2, Math.min(20, Math.round(Math.sqrt(visionTokens / 25))));

  // Compute notable benchmark points
  const benchmarks = [
    { name: "Fox 9.7×", textTokens: 970, visionTokens: 100 },
    { name: "OmniDoc 100tok", textTokens: 1500, visionTokens: 100 },
    { name: "高压缩 20×", textTokens: 4000, visionTokens: 200 },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="DeepSeek-OCR · Contexts Optical Compression"
        title="把长文本拍成图片再「读」回来"
        desc="DeepSeek-OCR 提出用图像作为长上下文的有损压缩载体:DeepEncoder 把长文档压成少量 vision tokens,再由 3B-MoE / 570M 激活的解码器还原。10× 压缩仍 97% 精度,20× 仍 ~60%——光学压缩为长上下文与「记忆遗忘」打开了新方向。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                <span>原始文本 token 数</span>
                <span className="text-white font-mono">
                  {textTokens.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={6000}
                step={50}
                value={textTokens}
                onChange={(e) => setTextTokens(parseInt(e.target.value))}
                className="w-full accent-[#4D6BFE]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                <span>Vision token 预算</span>
                <span className="text-white font-mono">{visionTokens}</span>
              </div>
              <input
                type="range"
                min={64}
                max={800}
                step={16}
                value={visionTokens}
                onChange={(e) => setVisionTokens(parseInt(e.target.value))}
                className="w-full accent-[#4D6BFE]"
              />
            </div>
          </div>

          <motion.div
            key={`${textTokens}-${visionTokens}`}
            initial={{ scale: 0.98, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-[#4D6BFE]/40 bg-[#4D6BFE]/[0.06] p-5"
          >
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              当前压缩状态
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-white font-mono">
                {ratio.toFixed(1)}×
              </span>
              <span className="text-[11px] text-[var(--muted)]">压缩比</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  OCR 精度
                </div>
                <div className="text-2xl font-mono font-semibold text-white">
                  {accuracy.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Token 节省
                </div>
                <div className="text-2xl font-mono font-semibold text-[#4D6BFE]">
                  {((1 - 1 / Math.max(1, ratio)) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </motion.div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              快速跳到论文基准
            </div>
            <div className="flex flex-col gap-2">
              {benchmarks.map((b) => (
                <button
                  key={b.name}
                  onClick={() => {
                    setTextTokens(b.textTokens);
                    setVisionTokens(b.visionTokens);
                  }}
                  className="text-left rounded-md border border-[var(--border)] px-3 py-2 text-xs hover:border-[#4D6BFE]/60 transition"
                >
                  <span className="text-white">{b.name}</span>
                  <span className="text-[var(--muted)]">
                    {" "}
                    · {b.textTokens} text → {b.visionTokens} vision
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              压缩比 → OCR 精度曲线 (Fox bench inspired)
            </div>
            <ReactECharts option={chartOption} style={{ height: 280 }} notMerge />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              压缩示意:{textTokens} text tokens → {visionTokens} vision tokens
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="border border-[var(--border)] rounded-lg p-3 bg-white/[0.02]">
                <div className="text-[10px] text-[var(--muted)] mb-2">
                  Text tokens (原始)
                </div>
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "repeat(40, 1fr)",
                    gap: 1,
                  }}
                >
                  {Array.from({
                    length: Math.min(800, textTokens),
                  }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-[1px]"
                      style={{
                        background: "rgba(255,255,255,0.18)",
                      }}
                    />
                  ))}
                </div>
                {textTokens > 800 && (
                  <div className="text-[9px] text-[var(--muted)] mt-1">
                    + {textTokens - 800} more
                  </div>
                )}
              </div>
              <div className="border border-[#4D6BFE]/40 rounded-lg p-3 bg-[#4D6BFE]/[0.04]">
                <div className="text-[10px] text-[#7B8FFF] mb-2">
                  Vision tokens (压缩)
                </div>
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gap: 2,
                  }}
                >
                  {Array.from({
                    length: gridSize * gridSize,
                  }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-[2px]"
                      style={{
                        background: "#4D6BFE",
                        // deterministic pseudo-random opacity per cell
                        opacity: 0.7 + 0.3 * (((i * 9301 + 49297) % 233280) / 233280),
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
