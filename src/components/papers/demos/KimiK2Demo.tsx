"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BlockMath, InlineMath } from "react-katex";
import { Play, Pause } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Synthesised training-loss curves illustrating the qualitative difference
// AdamW shows occasional spikes (logit explosion); Muon is smoother but can
// drift without clip; MuonClip combines smoothness with bounded gradients.
function genCurve(opt: "adamw" | "muon" | "muonclip", n = 200) {
  const out: number[] = [];
  let l = 4.5;
  let velocity = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const base = 4.5 - 2.4 * Math.log10(1 + 9 * t);
    let noise = 0;
    if (opt === "adamw") {
      noise = (Math.sin(i * 0.55) + Math.cos(i * 0.31)) * 0.04;
      // occasional spike
      if (i === 47 || i === 112 || i === 168) noise += 0.45 + Math.random() * 0.3;
    } else if (opt === "muon") {
      noise = (Math.sin(i * 0.21) + Math.cos(i * 0.18)) * 0.025;
      if (i === 134) noise += 0.32;
    } else {
      noise = (Math.sin(i * 0.18) + Math.cos(i * 0.13)) * 0.015;
    }
    velocity = velocity * 0.9 + noise * 0.1;
    l = base + velocity;
    out.push(parseFloat(l.toFixed(3)));
  }
  return out;
}

// Agentic loop steps for the "Open Agentic Intelligence" demo
const AGENT_STEPS = [
  {
    role: "user",
    label: "User",
    text: "帮我分析这个 CSV 文件并画出销售趋势图",
    color: "#cfd2e3",
  },
  {
    role: "thought",
    label: "Plan",
    text: "需要：① 读取文件 ② 解析列 ③ 选时间序列 ④ 调用 matplotlib",
    color: "#A78BFA",
  },
  {
    role: "tool",
    label: "Tool: read_file",
    text: 'pd.read_csv("sales.csv") → 12 cols × 8420 rows',
    color: "#34D399",
  },
  {
    role: "thought",
    label: "Plan",
    text: "时间列是 'order_date'，金额列是 'revenue'。按月聚合。",
    color: "#A78BFA",
  },
  {
    role: "tool",
    label: "Tool: python",
    text: "df.groupby(df.order_date.dt.to_period('M')).revenue.sum()",
    color: "#34D399",
  },
  {
    role: "tool",
    label: "Tool: plot",
    text: "plt.plot(monthly.index, monthly.values) → /tmp/trend.png",
    color: "#34D399",
  },
  {
    role: "assistant",
    label: "Final",
    text: "已生成趋势图，2024 年 Q4 同比增长 38%（[trend.png]）",
    color: "#F2C94C",
  },
];

export default function KimiK2Demo() {
  const [optimizer, setOptimizer] = useState<"adamw" | "muon" | "muonclip">("muonclip");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  const curves = useMemo(() => {
    return {
      adamw: genCurve("adamw"),
      muon: genCurve("muon"),
      muonclip: genCurve("muonclip"),
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => (s >= AGENT_STEPS.length - 1 ? 0 : s + 1));
    }, 1400);
    return () => clearInterval(id);
  }, [playing]);

  const lossOption = {
    backgroundColor: "transparent",
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    legend: {
      data: ["AdamW", "Muon", "MuonClip"],
      textStyle: { color: "#cfd2e3", fontSize: 11 },
      top: 0,
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: curves.muonclip.map((_, i) => i),
      name: "step (×1k)",
      nameTextStyle: { color: "#8b90a8", fontSize: 10 },
      axisLabel: { color: "#8b90a8", fontSize: 10 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    yAxis: {
      type: "value",
      name: "training loss",
      nameTextStyle: { color: "#8b90a8", fontSize: 10 },
      axisLabel: { color: "#8b90a8", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    series: [
      {
        name: "AdamW",
        type: "line",
        showSymbol: false,
        data: curves.adamw,
        lineStyle: {
          color: "#F472B6",
          width: optimizer === "adamw" ? 2.4 : 1.2,
          opacity: optimizer === "adamw" ? 1 : 0.4,
        },
        smooth: true,
      },
      {
        name: "Muon",
        type: "line",
        showSymbol: false,
        data: curves.muon,
        lineStyle: {
          color: "#A78BFA",
          width: optimizer === "muon" ? 2.4 : 1.2,
          opacity: optimizer === "muon" ? 1 : 0.4,
        },
        smooth: true,
      },
      {
        name: "MuonClip",
        type: "line",
        showSymbol: false,
        data: curves.muonclip,
        lineStyle: {
          color: "#F2C94C",
          width: optimizer === "muonclip" ? 2.6 : 1.2,
          opacity: optimizer === "muonclip" ? 1 : 0.4,
        },
        smooth: true,
      },
    ],
  };

  const finalLoss = {
    adamw: curves.adamw[curves.adamw.length - 1],
    muon: curves.muon[curves.muon.length - 1],
    muonclip: curves.muonclip[curves.muonclip.length - 1],
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Kimi K2 · 2025.07"
        title="MuonClip：把 1T MoE 平稳推上预训练终点"
        desc="Kimi K2 是首个将 Muon 优化器规模化到 1T 参数的开源 MoE。Muon 收敛更快但容易在长训练中 logit 爆炸；K2 的 MuonClip 在每步对 Q/K logit 投影做范数 clip，让训练曲线像 AdamW 一样稳定，同时保留 Muon 的样本效率。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Optimizer toggle + math */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              选择优化器
            </div>
            <div className="space-y-2">
              {([
                { id: "adamw", name: "AdamW (baseline)", desc: "稳定但样本效率低，K2 不用", color: "#F472B6" },
                { id: "muon", name: "Muon (orig)", desc: "正交化梯度，训练后期 logit 爆炸", color: "#A78BFA" },
                { id: "muonclip", name: "MuonClip (K2)", desc: "+ 投影 clip：稳定 + 高效", color: "#F2C94C" },
              ] as const).map((o) => {
                const active = optimizer === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setOptimizer(o.id)}
                    className="w-full text-left rounded-md border p-3 transition"
                    style={{
                      borderColor: active ? o.color : "var(--border)",
                      background: active ? `${o.color}18` : "transparent",
                    }}
                  >
                    <div className="text-sm font-medium" style={{ color: active ? "#fff" : "#cfd2e3" }}>
                      {o.name}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">{o.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              MuonClip 关键步骤
            </div>
            <div className="text-xs">
              <BlockMath math={"G_t = \\text{NewtonSchulz}(M_t)"} />
              <BlockMath
                math={
                  "\\hat W_t = W_{t-1} - \\eta\\, G_t \\quad (\\text{Muon update})"
                }
              />
              <BlockMath
                math={
                  "W_t \\leftarrow \\text{clip}(\\hat W_t,\\, \\tau_{q\\!k}) \\quad (\\text{K2's clip})"
                }
              />
            </div>
            <div className="text-[11px] text-[var(--muted)] leading-relaxed">
              对 attention 中
              <InlineMath math={"W^Q, W^K"} /> 投影矩阵的谱范数做硬 clip，
              <InlineMath math={"\\tau_{q\\!k}\\!\\approx\\!1.0"} />，避免 softmax 输入饱和。
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              最终训练 loss
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(["adamw", "muon", "muonclip"] as const).map((k) => (
                <div
                  key={k}
                  className="rounded-md p-2"
                  style={{
                    background: optimizer === k ? "rgba(255,255,255,0.06)" : "transparent",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="text-[10px] uppercase text-[var(--muted)]">{k}</div>
                  <div className="font-mono text-sm mt-0.5">{finalLoss[k].toFixed(3)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loss curve */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
            预训练 loss 曲线（合成示意）
          </div>
          <ReactECharts option={lossOption} style={{ height: 320 }} />
          <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
            * AdamW 偶发 logit-spike，Muon 后期出现尖峰，MuonClip 则全程平滑 —— 这是 K2 能跑完 15.5T tokens 而不发散的关键。
          </div>
        </div>
      </div>

      {/* Agentic loop demo */}
      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              Open Agentic Intelligence
            </div>
            <div className="text-base font-semibold mt-1">K2 的「思考 + 工具」循环</div>
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-3 py-1.5 rounded-md border border-[var(--border)] flex items-center gap-1.5 text-xs hover:bg-white/5"
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
            {playing ? "暂停" : "继续"}
          </button>
        </div>

        <div className="space-y-2">
          {AGENT_STEPS.map((s, i) => {
            const isActive = i === step;
            const isPast = i < step;
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.65 : 0.25,
                  scale: isActive ? 1 : 0.99,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 rounded-lg border p-3"
                style={{
                  borderColor: isActive ? s.color : "var(--border)",
                  background: isActive ? `${s.color}10` : "transparent",
                }}
              >
                <span
                  className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded shrink-0"
                  style={{
                    background: `${s.color}25`,
                    color: s.color,
                    border: `1px solid ${s.color}55`,
                  }}
                >
                  {s.label}
                </span>
                <div className="text-xs leading-relaxed font-mono whitespace-pre-wrap">
                  {s.text}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <Stat label="参数" value="1T" color="#F2C94C" />
          <Stat label="激活参数" value="32B" color="#A78BFA" />
          <Stat label="训练 tokens" value="15.5T" color="#34D399" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-md border p-3"
      style={{ borderColor: `${color}40`, background: `${color}10` }}
    >
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="text-base font-semibold mt-1" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
