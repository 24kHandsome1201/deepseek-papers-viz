"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, Flame, Filter, Sparkles, Check } from "lucide-react";

interface Stage {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  desc: string;
  inputs: string[];
  outputs: string[];
  innovations: string[];
  color: string;
}

const STAGES: Stage[] = [
  {
    id: "stage1",
    num: "01",
    title: "冷启动 SFT",
    subtitle: "Cold Start Supervised Fine-Tuning",
    icon: <Snowflake size={18} />,
    color: "#7DD3FC",
    desc: "用数千条高质量长链推理样本（人工 + R1-Zero 输出再修复）对 V3-Base 做 SFT。这一步避免了 R1-Zero 阶段输出可读性差、语言混杂的问题，给 RL 一个可读、稳定的起点。",
    inputs: ["DeepSeek-V3 Base (671B MoE)", "数千条 long-CoT 冷启动数据"],
    outputs: ["可读性更好的初始策略 π₀"],
    innovations: ["对比 R1-Zero：先注入「人类风格」再 RL"],
  },
  {
    id: "stage2",
    num: "02",
    title: "推理 RL（GRPO）",
    subtitle: "Reasoning-Oriented Reinforcement Learning",
    icon: <Flame size={18} />,
    color: "#FB923C",
    desc: "在数学、编码、逻辑等可自动验证的任务上做 RL。奖励来自规则：答案正确性 + 格式正确（必须包含 <think>...</think>）。语言一致性奖励抑制中英混杂。",
    inputs: ["π₀ 策略", "可验证任务 prompt 集"],
    outputs: ["在推理任务上接近收敛的策略 π₁"],
    innovations: [
      "GRPO：组内相对优势替代 critic",
      "规则奖励而非奖励模型，避免 reward hacking",
      "「Aha 时刻」涌现：模型自主反思",
    ],
  },
  {
    id: "stage3",
    num: "03",
    title: "拒绝采样 + SFT",
    subtitle: "Rejection Sampling & Supervised Fine-Tuning",
    icon: <Filter size={18} />,
    color: "#A78BFA",
    desc: "用 π₁ 对大量提示采样，保留正确且高质量的回答（约 60 万条推理样本 + 20 万条非推理样本），再加上写作 / 角色扮演等通用数据，重新做一次 SFT 形成「通才」基座。",
    inputs: ["π₁ 多次采样结果", "通用任务 SFT 数据"],
    outputs: ["80 万条高质量样本", "通用化模型 π₂"],
    innovations: [
      "保留 CoT 但筛掉错误 / 语言混杂",
      "把「推理专家」回炉成「全能选手」",
    ],
  },
  {
    id: "stage4",
    num: "04",
    title: "全场景 RL",
    subtitle: "RL for All Scenarios",
    icon: <Sparkles size={18} />,
    color: "#34D399",
    desc: "再做一轮 RL，奖励来自规则（推理任务）+ 偏好模型（开放任务的 helpfulness / harmlessness）。最终得到 DeepSeek-R1。",
    inputs: ["π₂ 策略", "推理 + 偏好 + 安全 prompt"],
    outputs: ["DeepSeek-R1（最终发布版）"],
    innovations: ["双奖励融合：规则 ⊕ 偏好模型"],
  },
];

export default function R1Pipeline() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
          Training Pipeline
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">
          四阶段训练流水线
        </h2>
        <p className="mt-2 text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
          点击任意阶段查看输入 / 输出与关键创新。从「冷启动」到「全场景 RL」，
          R1 的训练像一条精心设计的多次回炉的钢条。
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-8">
        {STAGES.map((s, i) => {
          const isActive = i === active;
          const isPast = i < active;
          return (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className="group text-left relative rounded-xl border p-4 transition overflow-hidden"
              style={{
                borderColor: isActive ? s.color : "var(--border)",
                background: isActive
                  ? `linear-gradient(135deg, ${s.color}1A, transparent)`
                  : "var(--panel)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono"
                  style={{ color: isActive ? s.color : "var(--muted)" }}
                >
                  {s.num}
                </span>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: isActive ? s.color : "rgba(255,255,255,0.05)",
                    color: isActive ? "#0a0a0a" : s.color,
                  }}
                >
                  {isPast ? <Check size={14} /> : s.icon}
                </span>
              </div>
              <div
                className="mt-3 font-medium text-sm"
                style={{ color: isActive ? "#fff" : "#cfd2e3" }}
              >
                {s.title}
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">
                {s.subtitle}
              </div>

              {/* connector line */}
              {i < STAGES.length - 1 && (
                <span
                  className="hidden md:block absolute right-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-px"
                  style={{
                    background: i < active ? STAGES[i + 1].color : "var(--border)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden"
        >
          <div
            className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${stage.color}1A, transparent)`,
            }}
          >
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${stage.color}33`, color: stage.color }}
            >
              {stage.icon}
            </span>
            <div>
              <div className="text-base font-semibold">{stage.title}</div>
              <div className="text-xs text-[var(--muted)]">{stage.subtitle}</div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            <p className="text-sm leading-relaxed text-[var(--foreground)]/85">
              {stage.desc}
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <Block label="输入" items={stage.inputs} color={stage.color} />
              <Block label="输出" items={stage.outputs} color={stage.color} />
              <Block label="关键创新" items={stage.innovations} color={stage.color} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function Block({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-elev)] p-3">
      <div
        className="text-[10px] uppercase tracking-wider mb-2"
        style={{ color }}
      >
        {label}
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li
            key={it}
            className="text-xs leading-snug flex items-start gap-1.5"
          >
            <span
              className="mt-1 w-1 h-1 rounded-full shrink-0"
              style={{ background: color }}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
