"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Cpu, Scale } from "lucide-react";
import { BlockMath } from "react-katex";
import SectionHeader from "@/components/papers/SectionHeader";

const TABS = [
  {
    id: "mtp",
    label: "MTP · 多 token 预测",
    icon: <Layers size={14} />,
    color: "#4D6BFE",
  },
  {
    id: "fp8",
    label: "FP8 · 混合精度训练",
    icon: <Cpu size={14} />,
    color: "#A78BFA",
  },
  {
    id: "auxfree",
    label: "Aux-loss-free 路由",
    icon: <Scale size={14} />,
    color: "#34D399",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function V3Demo() {
  const [tab, setTab] = useState<TabId>("mtp");

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="DeepSeek-V3 · Three Innovations"
        title="把 671B MoE 训练压到 558 万美元"
        desc="V3 带来 3 项工程级革新：MTP（多 token 预测）让单步 forward 预测多步、提升 inference 与训练利用率；FP8 混合精度大规模工业化；辅助损失免化的负载均衡，避免传统 aux-loss 的副作用。"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition"
              style={{
                borderColor: isActive ? t.color : "var(--border)",
                background: isActive ? `${t.color}1A` : "transparent",
                color: isActive ? "#fff" : "var(--muted)",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "mtp" && <MTPPanel />}
          {tab === "fp8" && <FP8Panel />}
          {tab === "auxfree" && <AuxFreePanel />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ===================== MTP ===================== */

function MTPPanel() {
  const [step, setStep] = useState(0);
  const tokens = ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"];
  const D = 2; // depth of MTP

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (tokens.length - D));
    }, 1500);
    return () => clearInterval(id);
  }, [tokens.length]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">
          单次 forward 同时预测 token t+1 与 t+2
        </div>

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {tokens.map((t, i) => {
            const isPast = i <= step;
            const isCur = i === step;
            const isNext = i === step + 1;
            const isNextNext = i === step + 2;
            return (
              <motion.div
                key={i}
                animate={{
                  scale: isCur ? 1.1 : 1,
                }}
                className="relative px-3 py-2 rounded-md text-sm font-mono"
                style={{
                  background: isCur
                    ? "#4D6BFE"
                    : isPast
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.02)",
                  color: isCur ? "#fff" : isPast ? "#cfd2e3" : "#5a607a",
                  border: `1px solid ${
                    isCur
                      ? "#4D6BFE"
                      : isNext
                        ? "#4D6BFE99"
                        : isNextNext
                          ? "#A78BFA99"
                          : "var(--border)"
                  }`,
                }}
              >
                {t}
                {isNext && (
                  <span className="absolute -top-2 -right-1 text-[9px] px-1 rounded bg-[#4D6BFE] text-white">
                    head₁
                  </span>
                )}
                {isNextNext && (
                  <span className="absolute -top-2 -right-1 text-[9px] px-1 rounded bg-[#A78BFA] text-white">
                    head₂
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed">
          <div className="text-[var(--muted)] mb-2">
            传统 LLM 只用 1 个 head 预测 t+1。MTP 在主干之外串接 D 个轻量
            transformer block，每个负责预测 t+(d+1)：
          </div>
          <BlockMath math={"\\mathcal{L}_{\\text{MTP}} = \\sum_{d=1}^{D} \\lambda_d \\cdot \\mathrm{CE}(\\hat{y}_{t+d+1}^{(d)},\\, y_{t+d+1})"} />
          <div className="text-[var(--muted)] mt-2">
            训练时 MTP 作为辅助目标提升数据利用率；推理时 head₁ 还能用于
            <span className="text-white"> speculative decoding</span>，~1.8× 加速。
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Stat label="预测深度 D" value="2" color="#4D6BFE" />
        <Stat
          label="次 token 接受率"
          value="85%~95%"
          color="#A78BFA"
          hint="speculative decode 接受比例"
        />
        <Stat
          label="推理吞吐"
          value="≈ 1.8×"
          color="#34D399"
          hint="实测加速比"
        />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed text-[var(--muted)]">
          MTP 不增加发布的模型大小（推理时只需 main head），D 个辅助 head
          可在部署时丢弃，是<span className="text-white">「免费午餐」式</span>
          设计。
        </div>
      </div>
    </div>
  );
}

/* ===================== FP8 ===================== */

function FP8Panel() {
  const data = [
    { name: "FP32", bits: 32, color: "#8b90a8", note: "训练标配（旧时代）" },
    { name: "BF16", bits: 16, color: "#A78BFA", note: "目前主流" },
    { name: "FP8 (V3)", bits: 8, color: "#4D6BFE", note: "DeepSeek-V3 工业化", featured: true },
    { name: "INT4 (推理)", bits: 4, color: "#34D399", note: "仅推理量化" },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">
          每个权重的存储位宽
        </div>
        <div className="space-y-3">
          {data.map((d) => {
            const pct = (d.bits / 32) * 100;
            return (
              <div key={d.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className="font-medium"
                    style={{ color: d.featured ? "#fff" : "#cfd2e3" }}
                  >
                    {d.name}
                  </span>
                  <span className="text-[var(--muted)]">{d.note}</span>
                </div>
                <div className="h-7 rounded-md bg-white/[0.04] overflow-hidden flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full flex items-center justify-end px-2"
                    style={{ background: d.color }}
                  >
                    <span className="text-[10px] font-mono text-[#0a0a0a] font-semibold">
                      {d.bits} bits
                    </span>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="vs BF16 显存" value="-50%" color="#4D6BFE" />
          <Stat label="vs BF16 通信" value="-50%" color="#4D6BFE" />
          <Stat label="收敛差距" value="< 0.25%" color="#34D399" hint="V3 vs BF16 baseline" />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 text-xs leading-relaxed">
        <div className="text-sm font-semibold mb-2 text-white">为什么以前不敢用 FP8？</div>
        <div className="text-[var(--muted)] mb-3">
          FP8 的动态范围窄，乘加误差容易在大模型 / 长训练下累积。
        </div>
        <div className="text-sm font-semibold mb-2 text-white">V3 的解法</div>
        <ul className="space-y-1.5 text-[var(--muted)]">
          <li>• 细粒度 scaling：tile-wise & block-wise 量化</li>
          <li>• 关键 op（embedding / output / RMSNorm）保留 BF16</li>
          <li>• 通信前先做 FP8 量化，反向再 dequant</li>
          <li>• Master weight 仍用 FP32 存储</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-[var(--border)] text-[var(--muted)]">
          这是<span className="text-white">首次在 600B+ 模型完整训练里用 FP8</span>，
          为业界打开了门。
        </div>
      </div>
    </div>
  );
}

/* ===================== Aux-Loss-Free ===================== */

function AuxFreePanel() {
  const [step, setStep] = useState(0);
  const experts = 8;
  const tokens = 24;

  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), 800);
    return () => clearInterval(id);
  }, []);

  // Simulate routing — with bias updates over time, distribution becomes more uniform
  const seed = Math.floor(step / 4);
  const buckets = Array.from({ length: experts }, () => 0);
  for (let i = 0; i < tokens; i++) {
    const skew = Math.max(0, 1 - seed * 0.15);
    const r = ((i * 7919 + seed * 1009) % 100) / 100;
    let target;
    if (r < skew) target = i % 3;
    else target = (i + seed) % experts;
    buckets[target] = (buckets[target] ?? 0) + 1;
  }

  const max = Math.max(...buckets);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">
          <span>专家负载分布（实时变化）</span>
          <span>更新次数 {seed}</span>
        </div>

        <div className="grid grid-cols-8 gap-2">
          {buckets.map((b, i) => {
            const ratio = b / max;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full h-32 flex items-end">
                  <motion.div
                    animate={{ height: `${ratio * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="w-full rounded-t"
                    style={{
                      background:
                        seed > 4
                          ? "#34D399"
                          : `hsl(${190 - i * 8} 70% ${50 + (1 - ratio) * 20}%)`,
                    }}
                  />
                </div>
                <div className="text-[10px] font-mono text-[var(--muted)] mt-1">
                  E{i + 1}
                </div>
                <div className="text-[10px] tabular-nums text-white">{b}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border)] text-xs leading-relaxed text-[var(--muted)]">
          初始时少数专家被 token 抢占（hot expert），随后路由器为每个专家维护一个
          <span className="text-white"> 偏置项 b_i</span>：
          <span className="mt-2 block">
            <BlockMath math={"\\hat{s}_i = s_i + b_i,\\quad b_i \\leftarrow b_i + \\gamma\\,\\mathrm{sign}(\\bar{f} - f_i)"} />
          </span>
          热门专家的 b 被压低，冷门的被抬高，最终趋于均匀，
          <span className="text-white"> 完全不需要传统的辅助 balance loss</span>。
        </div>
      </div>

      <div className="space-y-4">
        <Stat label="去除的 loss 项" value="aux-loss" color="#34D399" hint="不再扰动主任务梯度" />
        <Stat
          label="路由稳定性"
          value="↑↑"
          color="#4D6BFE"
          hint="不与 LM loss 冲突"
        />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed text-[var(--muted)]">
          传统 aux-loss（Switch / GShard）会迫使路由「为了平衡而平衡」，伤害模型质量。V3 的偏置法只调整 routing 决策，不改变梯度，
          <span className="text-white">保留了路由的语义自由度</span>。
        </div>
      </div>
    </div>
  );
}

function Stat({
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
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-elev)] p-3">
      <div className="text-[10px] text-[var(--muted)]">{label}</div>
      <div className="text-xl font-semibold mt-0.5" style={{ color }}>
        {value}
      </div>
      {hint && (
        <div className="text-[10px] text-[var(--muted)] mt-0.5">{hint}</div>
      )}
    </div>
  );
}
