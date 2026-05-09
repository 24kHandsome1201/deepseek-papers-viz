"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/papers/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Path = "und" | "gen";

export default function JanusDecoupledDemo() {
  const [path, setPath] = useState<Path>("und");

  const benchOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        data: ["Janus (单编码器)", "Janus-Pro (解耦)"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 64, right: 24, top: 36, bottom: 30 },
      xAxis: {
        type: "category",
        data:
          path === "und"
            ? ["POPE", "MME-P/20", "GQA", "MMMU", "Avg"]
            : ["GenEval", "DPG-Bench"],
        axisLabel: { color: "#8b90a8", fontSize: 11 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        {
          name: "Janus (单编码器)",
          type: "bar",
          barWidth: "30%",
          data:
            path === "und"
              ? [87.0, 70.4, 59.1, 30.5, 61.8]
              : [0.61, 0.80].map((v) => v * 100),
          itemStyle: { color: "#7B8FFF" },
        },
        {
          name: "Janus-Pro (解耦)",
          type: "bar",
          barWidth: "30%",
          data:
            path === "und"
              ? [88.8, 79.1, 62.0, 41.0, 67.7]
              : [0.80, 0.84].map((v) => v * 100),
          itemStyle: { color: "#4D6BFE" },
        },
      ],
    }),
    [path]
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Janus / Janus-Pro"
        title="解耦视觉编码:理解走 SigLIP,生成走 VQ-VAE"
        desc="Chameleon 等模型让同一个视觉编码器同时服务理解与生成,然而两者所需的视觉信息粒度差异很大。Janus 把视觉编码解耦成两条路径,但共享一个 Transformer 主干——既消除冲突,也保留统一架构的简洁。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              选择任务
            </div>
            <div className="space-y-2">
              {(
                [
                  ["und", "Multimodal Understanding", "#7B8FFF"],
                  ["gen", "Text-to-Image Generation", "#F472B6"],
                ] as const
              ).map(([k, name, color]) => {
                const isActive = path === k;
                return (
                  <button
                    key={k}
                    onClick={() => setPath(k)}
                    className="w-full text-left rounded-md border p-3 transition"
                    style={{
                      borderColor: isActive ? color : "var(--border)",
                      background: isActive ? `${color}15` : "transparent",
                    }}
                  >
                    <div
                      className="text-sm font-medium"
                      style={{ color: isActive ? "#fff" : "#cfd2e3" }}
                    >
                      {name}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">
                      {k === "und"
                        ? "图像 → SigLIP 抽语义 → LM 输出文本"
                        : "文本 → LM 自回归 → VQ-VAE 解码出图"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed text-[var(--muted)]">
            <div className="text-white font-medium mb-1">为什么要解耦?</div>
            理解任务需要
            <span className="text-white"> 语义级抽象特征</span>;生成任务需要
            <span className="text-white"> 像素级低层细节</span>。共享一个视觉编码器会强制两个目标互相妥协,Janus 用两条独立路径解开这个冲突。
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline diagram */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">
              管线示意
            </div>
            <AnimatePresence mode="wait">
              {path === "und" ? (
                <motion.div
                  key="und"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-5 items-center gap-2 text-[11px]"
                >
                  <Box title="🖼️ Image" sub="输入" color="#7B8FFF" />
                  <Arrow label="encode" />
                  <Box
                    title="SigLIP Enc."
                    sub="语义视觉特征"
                    color="#7B8FFF"
                    highlight
                  />
                  <Arrow label="project + concat" />
                  <Box title="LM Backbone" sub="自回归生成 token" color="#4D6BFE" highlight />
                  <div className="col-span-3" />
                  <Arrow label="output" />
                  <Box title="📝 Text" sub="answer" color="#7B8FFF" />
                </motion.div>
              ) : (
                <motion.div
                  key="gen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-5 items-center gap-2 text-[11px]"
                >
                  <Box title="📝 Text" sub="prompt" color="#F472B6" />
                  <Arrow label="tokenize" />
                  <Box title="LM Backbone" sub="自回归生成 token" color="#4D6BFE" highlight />
                  <Arrow label="image tokens" />
                  <Box
                    title="VQ-VAE Dec."
                    sub="像素级生成"
                    color="#F472B6"
                    highlight
                  />
                  <div className="col-span-4" />
                  <Box title="🖼️ Image" sub="output" color="#F472B6" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
              <Tag color="#7B8FFF" label="理解路径" desc="SigLIP encoder" />
              <Tag color="#4D6BFE" label="共享 LM" desc="单一自回归 Transformer" />
              <Tag color="#F472B6" label="生成路径" desc="VQ-VAE encoder/decoder" />
            </div>
          </div>

          {/* Bench compare */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              Janus vs Janus-Pro · {path === "und" ? "理解基准" : "生成基准"}
            </div>
            <ReactECharts option={benchOption} style={{ height: 240 }} notMerge />
          </div>
        </div>
      </div>
    </section>
  );
}

function Box({
  title,
  sub,
  color,
  highlight,
}: {
  title: string;
  sub: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-lg border p-3 text-center transition"
      style={{
        borderColor: highlight ? color : "var(--border)",
        background: highlight ? `${color}15` : "transparent",
      }}
    >
      <div className="text-xs font-semibold text-white">{title}</div>
      <div className="text-[10px] text-[var(--muted)] mt-0.5">{sub}</div>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center text-[10px] text-[var(--muted)]">
      <span>{label}</span>
      <div className="text-base">→</div>
    </div>
  );
}

function Tag({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) {
  return (
    <div
      className="rounded-md border p-2"
      style={{ borderColor: `${color}55`, background: `${color}10` }}
    >
      <div className="text-xs font-medium" style={{ color }}>
        {label}
      </div>
      <div className="text-[10px] text-[var(--muted)]">{desc}</div>
    </div>
  );
}
