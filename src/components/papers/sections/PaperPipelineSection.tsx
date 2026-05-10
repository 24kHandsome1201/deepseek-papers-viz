"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { PipelineStage } from "@/data/papers";
import SectionHeader from "@/components/papers/SectionHeader";

interface Props {
  stages: PipelineStage[];
  teamColor: string;
  eyebrow?: string;
  title?: string;
  desc?: string;
}

export default function PaperPipelineSection({
  stages,
  teamColor,
  eyebrow = "Training Pipeline",
  title = "训练 / 构建流水线",
  desc = "点击任一阶段查看输入、输出与关键创新。",
}: Props) {
  const [active, setActive] = useState(0);
  const stage = stages[active];
  const c = (s: PipelineStage) => s.color ?? teamColor;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader eyebrow={eyebrow} title={title} desc={desc} />

      <div
        className="grid gap-3 mb-8"
        style={{
          gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
        }}
      >
        {stages.map((s, i) => {
          const isActive = i === active;
          const isPast = i < active;
          const sc = c(s);
          return (
            <button
              key={s.num + s.title}
              onClick={() => setActive(i)}
              className="group text-left relative rounded-xl border p-4 transition overflow-hidden"
              style={{
                borderColor: isActive ? sc : "var(--border)",
                background: isActive
                  ? `linear-gradient(135deg, ${sc}1A, transparent)`
                  : "var(--panel)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono"
                  style={{ color: isActive ? sc : "var(--muted)" }}
                >
                  {s.num}
                </span>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  style={{
                    background: isActive ? sc : "rgba(255,255,255,0.05)",
                    color: isActive ? "#0a0a0a" : sc,
                  }}
                >
                  {isPast ? <Check size={14} /> : s.num}
                </span>
              </div>
              <div
                className="mt-3 font-medium text-sm"
                style={{ color: isActive ? "#fff" : "#cfd2e3" }}
              >
                {s.title}
              </div>
              {s.subtitle && (
                <div className="text-[10px] text-[var(--muted)] mt-0.5 truncate">
                  {s.subtitle}
                </div>
              )}
              {i < stages.length - 1 && (
                <span
                  className="hidden md:block absolute right-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-px"
                  style={{
                    background: i < active ? c(stages[i + 1]) : "var(--border)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage.num + stage.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden"
        >
          <div
            className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${c(stage)}1A, transparent)`,
            }}
          >
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{ background: `${c(stage)}33`, color: c(stage) }}
            >
              {stage.num}
            </span>
            <div>
              <div className="text-base font-semibold">{stage.title}</div>
              {stage.subtitle && (
                <div className="text-xs text-[var(--muted)]">
                  {stage.subtitle}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            <p className="text-sm leading-relaxed text-[var(--foreground)]/85">
              {stage.desc}
            </p>

            {(stage.inputs?.length ||
              stage.outputs?.length ||
              stage.innovations?.length) && (
              <div className="grid md:grid-cols-3 gap-4">
                {stage.inputs?.length ? (
                  <Block
                    label="输入"
                    items={stage.inputs}
                    color={c(stage)}
                  />
                ) : null}
                {stage.outputs?.length ? (
                  <Block
                    label="输出"
                    items={stage.outputs}
                    color={c(stage)}
                  />
                ) : null}
                {stage.innovations?.length ? (
                  <Block
                    label="关键创新"
                    items={stage.innovations}
                    color={c(stage)}
                  />
                ) : null}
              </div>
            )}
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
