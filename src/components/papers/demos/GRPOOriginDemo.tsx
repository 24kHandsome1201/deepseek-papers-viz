"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap } from "lucide-react";
import { BlockMath, InlineMath } from "react-katex";
import SectionHeader from "@/components/papers/SectionHeader";

const COMPONENTS = [
  { id: "policy", label: "Policy π", color: "#4D6BFE", required: true },
  { id: "ref", label: "Reference π_ref", color: "#A78BFA", required: true },
  { id: "reward", label: "Reward Model", color: "#F472B6", required: true },
  { id: "critic", label: "Value (Critic)", color: "#F59E0B", required: false },
];

export default function GRPOOriginDemo() {
  const [variant, setVariant] = useState<"ppo" | "grpo">("grpo");

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Algorithmic Origin"
        title="GRPO 的诞生"
        desc="DeepSeekMath 首次提出 Group Relative Policy Optimization，省掉了 PPO 中昂贵的 Critic 网络，把训练显存与计算成本降到一半。这一算法后来成为 R1 推理涌现的根基。"
      />

      <div className="grid lg:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setVariant("ppo")}
          className="text-left rounded-xl border p-5 transition"
          style={{
            borderColor: variant === "ppo" ? "#F59E0B" : "var(--border)",
            background:
              variant === "ppo"
                ? "linear-gradient(135deg, rgba(245,158,11,0.12), transparent)"
                : "var(--panel)",
          }}
        >
          <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
            Baseline
          </div>
          <div className="mt-1 text-base font-semibold">PPO</div>
          <div className="text-[11px] text-[var(--muted)] mt-1">
            标准 RLHF：策略 + 参考 + 奖励 + Critic（4 模型）
          </div>
        </button>
        <button
          onClick={() => setVariant("grpo")}
          className="text-left rounded-xl border p-5 transition"
          style={{
            borderColor: variant === "grpo" ? "#4D6BFE" : "var(--border)",
            background:
              variant === "grpo"
                ? "linear-gradient(135deg, rgba(77,107,254,0.12), transparent)"
                : "var(--panel)",
          }}
        >
          <div className="text-xs uppercase tracking-wider text-[#4D6BFE]">
            DeepSeekMath
          </div>
          <div className="mt-1 text-base font-semibold">GRPO</div>
          <div className="text-[11px] text-[var(--muted)] mt-1">
            去掉 Critic，用「组内相对优势」估计 baseline（3 模型）
          </div>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">
            训练时所需模型
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COMPONENTS.map((c) => {
              const dropped = c.id === "critic" && variant === "grpo";
              return (
                <motion.div
                  key={c.id}
                  initial={false}
                  animate={{
                    opacity: dropped ? 0.25 : 1,
                    scale: dropped ? 0.93 : 1,
                  }}
                  className="relative rounded-xl border p-4 text-center"
                  style={{
                    borderColor: dropped ? "var(--border)" : `${c.color}55`,
                    background: dropped ? "transparent" : `${c.color}12`,
                  }}
                >
                  <Cpu
                    size={18}
                    className="mx-auto mb-1.5"
                    style={{ color: dropped ? "#8b90a8" : c.color }}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: dropped ? "#8b90a8" : "#fff" }}
                  >
                    {c.label}
                  </div>
                  {dropped && (
                    <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                      removed
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric
              label="GPU 显存占用"
              value={variant === "ppo" ? "100%" : "~75%"}
              color={variant === "ppo" ? "#F59E0B" : "#4D6BFE"}
            />
            <Metric
              label="训练吞吐"
              value={variant === "ppo" ? "1.0×" : "≈1.4×"}
              color={variant === "ppo" ? "#F59E0B" : "#4D6BFE"}
            />
          </div>

          <div className="mt-5 pt-5 border-t border-[var(--border)]">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              优势函数 (Advantage)
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={variant}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {variant === "ppo" ? (
                  <div>
                    <BlockMath math={"\\hat{A}_t = \\delta_t + \\gamma\\lambda \\delta_{t+1} + \\dots,\\ \\delta_t = r_t + \\gamma V_\\phi(s_{t+1}) - V_\\phi(s_t)"} />
                    <div className="text-[11px] text-[var(--muted)] mt-2">
                      需要训练独立的 critic <InlineMath math="V_\\phi" /> 估计每步价值；
                      critic 通常和 policy 同等大小，显存翻倍。
                    </div>
                  </div>
                ) : (
                  <div>
                    <BlockMath math={"\\hat{A}_i = \\frac{r_i - \\mathrm{mean}(r_1, \\dots, r_G)}{\\mathrm{std}(r_1, \\dots, r_G)}"} />
                    <div className="text-[11px] text-[var(--muted)] mt-2">
                      对同一 prompt 采样 G 条回答，用「组内 z-score」直接当 advantage。
                      <span className="text-white"> 完全跳过价值估计</span>。
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              <Zap size={12} />
              数学推理 benchmark
            </div>
            <BarRow label="GSM8K (V1 7B base)" v={64.2} max={100} color="#8b90a8" />
            <BarRow label="GSM8K (DeepSeekMath SFT)" v={82.9} max={100} color="#A78BFA" />
            <BarRow label="GSM8K (DeepSeekMath + GRPO)" v={88.2} max={100} color="#4D6BFE" highlight />
            <div className="mt-4 border-t border-[var(--border)] pt-3" />
            <BarRow label="MATH (V1 7B base)" v={15.7} max={100} color="#8b90a8" />
            <BarRow label="MATH (DeepSeekMath SFT)" v={46.8} max={100} color="#A78BFA" />
            <BarRow label="MATH (DeepSeekMath + GRPO)" v={51.7} max={100} color="#4D6BFE" highlight />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed text-[var(--muted)]">
            <span className="text-white font-medium">影响：</span>
            一年后，DeepSeek-R1 直接复用 GRPO，不仅省成本，还意外发现纯 RL（无 SFT）也能涌现长链推理 ——
            <Link href="/paper/deepseek-r1" className="text-[#4D6BFE] underline-offset-2 hover:underline">
              {" "}
              进入 R1 演示
            </Link>
            。
          </div>
        </div>
      </div>
    </section>
  );
}

function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  // small wrapper to avoid bringing next/link inline (kept simple)
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-elev)] p-3">
      <div className="text-[10px] text-[var(--muted)]">{label}</div>
      <div className="text-xl font-semibold mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function BarRow({
  label,
  v,
  max,
  color,
  highlight,
}: {
  label: string;
  v: number;
  max: number;
  color: string;
  highlight?: boolean;
}) {
  const pct = (v / max) * 100;
  return (
    <div className="my-1.5">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className={highlight ? "text-white font-medium" : "text-[var(--muted)]"}>
          {label}
        </span>
        <span className="font-mono tabular-nums" style={{ color }}>
          {v.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
