"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/papers/SectionHeader";
import { motion } from "framer-motion";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const STEPS = 200;

// Simulate training loss curves with optional spikes for Muon.
function lossSeries(
  variant: "adamw" | "muon" | "muonclip",
  qkClipThresh: number
) {
  const out: { step: number; loss: number; qkMax: number; clipped: boolean }[] = [];
  let loss = 4.5;
  for (let i = 0; i < STEPS; i++) {
    // base smooth descent
    loss = Math.max(0.95, 4.5 * Math.exp(-i / 70) + 1.0 + 0.06 * Math.sin(i / 7));

    // spike events depending on variant; QK softmax max grows with steps
    const baseQK = 50 + (i / STEPS) * 250 + 18 * Math.sin(i / 5);
    let qkMax = baseQK;
    let clipped = false;
    let spike = 0;

    if (variant === "adamw") {
      // moderate token efficiency baseline (slightly higher loss curve)
      loss += 0.18;
      // adamw rarely spikes but is less efficient
      if (i === 95 || i === 138) spike = 0.4;
    } else if (variant === "muon") {
      // Muon is more token-efficient (slightly lower curve), but qk softmax explodes → spikes
      loss -= 0.05;
      if (qkMax > 220) spike = Math.min(2.5, (qkMax - 220) / 60);
      if (i > 60 && i % 23 === 0) spike += 1.4; // catastrophic spikes
    } else {
      // muonclip = Muon + QK-Clip: cap qk softmax max
      loss -= 0.08;
      if (qkMax > qkClipThresh) {
        clipped = true;
        qkMax = qkClipThresh; // clipped to threshold
      }
    }

    loss += spike;
    out.push({ step: i, loss: +loss.toFixed(3), qkMax: +qkMax.toFixed(1), clipped });
  }
  return out;
}

export default function MuonClipDemo() {
  const [variant, setVariant] = useState<"adamw" | "muon" | "muonclip">(
    "muonclip"
  );
  const [thresh, setThresh] = useState(180);

  const data = useMemo(
    () => ({
      adamw: lossSeries("adamw", thresh),
      muon: lossSeries("muon", thresh),
      muonclip: lossSeries("muonclip", thresh),
    }),
    [thresh]
  );

  const stats = useMemo(() => {
    const calc = (s: ReturnType<typeof lossSeries>) => {
      const final = s[s.length - 1].loss;
      const maxLoss = Math.max(...s.map((d) => d.loss));
      const spikes = s.filter((d) => d.loss > 2.5).length;
      const maxQK = Math.max(...s.map((d) => d.qkMax));
      return { final, maxLoss, spikes, maxQK };
    };
    return {
      adamw: calc(data.adamw),
      muon: calc(data.muon),
      muonclip: calc(data.muonclip),
    };
  }, [data]);

  const chartOption = useMemo(() => {
    const xs = Array.from({ length: STEPS }, (_, i) => i * 75); // pretend each step = 75 B tokens (~15.5T over 200)
    const series = (
      [
        ["adamw", "AdamW", "#A78BFA"],
        ["muon", "Muon", "#F59E0B"],
        ["muonclip", "MuonClip (K2)", "#F2C94C"],
      ] as const
    ).map(([k, name, color]) => ({
      name,
      type: "line" as const,
      data: data[k].map((d) => d.loss),
      showSymbol: false,
      smooth: false,
      lineStyle: {
        width: variant === k ? 2.6 : 1.2,
        color,
        opacity: variant === k ? 1 : 0.45,
      },
      itemStyle: { color },
      emphasis: { focus: "series" as const },
    }));
    return {
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        data: ["AdamW", "Muon", "MuonClip (K2)"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 50, right: 24, top: 36, bottom: 50 },
      xAxis: {
        type: "category",
        data: xs,
        name: "已训练 tokens (B)",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: "#8b90a8", fontSize: 11 },
        axisLabel: {
          color: "#8b90a8",
          fontSize: 10,
          interval: 24,
          formatter: (v: string) => `${(parseInt(v) / 1000).toFixed(1)}T`,
        },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        name: "Training Loss",
        min: 0.8,
        max: 5,
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series,
    };
  }, [data, variant]);

  const qkOption = useMemo(() => {
    const xs = Array.from({ length: STEPS }, (_, i) => i * 75);
    const muonQK = data.muon.map((d) => d.qkMax);
    const clipQK = data.muonclip.map((d) => d.qkMax);
    return {
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        data: ["Muon  S_max", "MuonClip  S_max"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 50, right: 24, top: 36, bottom: 40 },
      xAxis: {
        type: "category",
        data: xs,
        axisLabel: {
          color: "#8b90a8",
          fontSize: 9,
          interval: 24,
          formatter: (v: string) => `${(parseInt(v) / 1000).toFixed(1)}T`,
        },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        name: "S_max = max QKᵀ",
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        {
          name: "Muon  S_max",
          type: "line",
          data: muonQK,
          showSymbol: false,
          lineStyle: { width: 1.6, color: "#F59E0B", opacity: 0.7 },
          itemStyle: { color: "#F59E0B" },
        },
        {
          name: "MuonClip  S_max",
          type: "line",
          data: clipQK,
          showSymbol: false,
          lineStyle: { width: 2.2, color: "#F2C94C" },
          itemStyle: { color: "#F2C94C" },
        },
        {
          type: "line",
          markLine: {
            silent: true,
            symbol: "none",
            data: [
              {
                yAxis: thresh,
                lineStyle: { color: "#F2C94C", type: "dashed", width: 1 },
                label: {
                  formatter: `clip τ = ${thresh}`,
                  color: "#F2C94C",
                  fontSize: 10,
                },
              },
            ],
          },
          data: [],
        },
      ],
    };
  }, [data, thresh]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Kimi K2 · Optimizer"
        title="MuonClip:用 QK-Clip 修复 Muon 的训练不稳定"
        desc="Muon 优化器训练 token 效率高于 AdamW,但 QKᵀ 的 softmax 输入容易爆炸,导致大模型上 loss spike。Kimi K2 提出 QK-Clip:对每层 attention 动态缩放 W_Q / W_K,使 S_max 始终 ≤ τ,从而 15.5T tokens 训练零 loss spike。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              选择优化器
            </div>
            <div className="space-y-2">
              {(
                [
                  ["adamw", "AdamW", "#A78BFA", "稳定但 token 效率低"],
                  ["muon", "Muon", "#F59E0B", "高 token 效率,QK 爆炸 → spike"],
                  [
                    "muonclip",
                    "MuonClip (K2)",
                    "#F2C94C",
                    "Muon + QK-Clip,稳又高效",
                  ],
                ] as const
              ).map(([k, name, color, desc]) => {
                const isActive = variant === k;
                return (
                  <button
                    key={k}
                    onClick={() => setVariant(k)}
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
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              <span>QK-Clip 阈值 τ</span>
              <span className="text-white font-mono">{thresh}</span>
            </div>
            <input
              type="range"
              min={100}
              max={300}
              step={5}
              value={thresh}
              onChange={(e) => setThresh(parseInt(e.target.value))}
              className="w-full accent-[#F2C94C]"
            />
            <div className="text-[10px] text-[var(--muted)] mt-1.5 leading-relaxed">
              S_max 超过 τ 时,把 W_Q / W_K 同时缩 √(τ / S_max),保持
              <span className="text-white">前向数值不变</span>但抑制后向爆炸。
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              200 步累计统计
            </div>
            {(
              [
                ["adamw", "AdamW", "#A78BFA"],
                ["muon", "Muon", "#F59E0B"],
                ["muonclip", "MuonClip", "#F2C94C"],
              ] as const
            ).map(([k, name, color]) => (
              <motion.div
                key={k}
                animate={{ opacity: variant === k ? 1 : 0.5 }}
                className="flex items-center justify-between py-1"
              >
                <span style={{ color }}>{name}</span>
                <span className="text-[var(--muted)] font-mono text-[11px]">
                  loss {stats[k].final.toFixed(2)} · spike {stats[k].spikes}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              Training Loss
            </div>
            <ReactECharts
              option={chartOption}
              style={{ height: 240 }}
              notMerge
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              QKᵀ Softmax 最大值 (S_max)
            </div>
            <ReactECharts
              option={qkOption}
              style={{ height: 200 }}
              notMerge
            />
          </div>
        </div>
      </div>
    </section>
  );
}
