"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, RefreshCw } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const TOKENS = [
  { word: "积分", topic: "math" },
  { word: "斐波那契", topic: "math" },
  { word: "import", topic: "code" },
  { word: "function", topic: "code" },
  { word: "诗词", topic: "lit" },
  { word: "莎士比亚", topic: "lit" },
  { word: "DNA", topic: "bio" },
  { word: "细胞", topic: "bio" },
  { word: "宋朝", topic: "hist" },
  { word: "罗马", topic: "hist" },
];

const TOPIC_COLOR: Record<string, string> = {
  math: "#60A5FA",
  code: "#A78BFA",
  lit: "#F472B6",
  bio: "#34D399",
  hist: "#F59E0B",
};

interface Variant {
  name: string;
  totalExperts: number;
  shared: number;
  topK: number;
  color: string;
  desc: string;
}

const VARIANTS: Record<string, Variant> = {
  conventional: {
    name: "传统 MoE (GShard / Switch)",
    totalExperts: 8,
    shared: 0,
    topK: 2,
    color: "#F59E0B",
    desc: "8 个粗粒度专家，每 token top-2",
  },
  deepseek: {
    name: "DeepSeekMoE",
    totalExperts: 16,
    shared: 2,
    topK: 6,
    color: "#4D6BFE",
    desc: "16 细粒度专家 + 2 共享专家，每 token top-6",
  },
};

interface Routing {
  tokenIdx: number;
  expertIds: number[]; // routed expert indices (excluding shared)
}

function pseudoRoute(tokenIdx: number, variant: Variant): Routing {
  // deterministic per (token, variant)
  const seed = tokenIdx * 1009 + variant.totalExperts * 7;
  const arr: number[] = [];
  for (let i = 0; i < variant.topK; i++) {
    const v = (seed * (i + 11) * 31337) % variant.totalExperts;
    if (!arr.includes(Math.abs(v))) arr.push(Math.abs(v));
    if (arr.length === variant.topK) break;
  }
  // pad
  let extra = 0;
  while (arr.length < variant.topK && extra < variant.totalExperts) {
    if (!arr.includes(extra)) arr.push(extra);
    extra++;
  }
  return { tokenIdx, expertIds: arr };
}

// Pretend specialization: in DeepSeek, with more experts, each expert
// is more topic-specialized. Compute "specialization purity".
function specializationLabel(expertIdx: number, variant: Variant): string {
  if (variant === VARIANTS.conventional) {
    // 8 experts, 5 topics → mixed
    const topics = Object.keys(TOPIC_COLOR);
    const t = topics[expertIdx % topics.length];
    return `通用·${t}+`;
  } else {
    const topics = Object.keys(TOPIC_COLOR);
    const t = topics[expertIdx % topics.length];
    return t;
  }
}

export default function MoERoutingDemo() {
  const [variantKey, setVariantKey] =
    useState<keyof typeof VARIANTS>("deepseek");
  const variant = VARIANTS[variantKey];
  const [tokenIdx, setTokenIdx] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setTokenIdx((i) => (i + 1) % TOKENS.length);
    }, 1500);
    return () => clearInterval(id);
  }, [auto]);

  const routing = useMemo(() => pseudoRoute(tokenIdx, variant), [
    tokenIdx,
    variant,
  ]);

  const cols = variant.totalExperts <= 8 ? 4 : 8;

  // Compute parameters & active params (for comparison)
  const E = variant.totalExperts; // routed experts
  const S = variant.shared;
  const K = variant.topK;
  // Assume each fine expert ~= conventional expert / (E_fg / 8)  to keep param parity
  const baselineExpertSize = 1; // arbitrary unit
  const fgExpertSize = baselineExpertSize * (8 / E);
  const totalParams = E * fgExpertSize + S * fgExpertSize * 2; // shared a bit larger
  const activeParams = K * fgExpertSize + S * fgExpertSize * 2;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Architecture"
        title="细粒度专家路由"
        desc="DeepSeekMoE 把 8 个粗粒度专家拆成 16 个细粒度专家，并新增 2 个「共享专家」承担通用知识。每个 token 走 top-6 — 看似激活更多，但每个专家更小，总激活参数反而下降。"
      />

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {(Object.keys(VARIANTS) as Array<keyof typeof VARIANTS>).map((k) => {
          const v = VARIANTS[k];
          const isActive = variantKey === k;
          return (
            <button
              key={k}
              onClick={() => setVariantKey(k)}
              className="text-left rounded-xl border p-4 transition"
              style={{
                borderColor: isActive ? v.color : "var(--border)",
                background: isActive
                  ? `linear-gradient(135deg, ${v.color}1A, transparent)`
                  : "var(--panel)",
              }}
            >
              <div
                className="text-xs uppercase tracking-wider"
                style={{ color: isActive ? v.color : "var(--muted)" }}
              >
                {isActive ? "● 当前" : "○"}
              </div>
              <div
                className="mt-1 font-medium text-sm"
                style={{ color: isActive ? "#fff" : "#cfd2e3" }}
              >
                {v.name}
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">
                {v.desc}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* token + router */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            输入 token
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {TOKENS.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setTokenIdx(i);
                  setAuto(false);
                }}
                className="px-2 py-1 rounded text-xs transition"
                style={{
                  background:
                    i === tokenIdx
                      ? TOPIC_COLOR[t.topic]
                      : "rgba(255,255,255,0.04)",
                  color: i === tokenIdx ? "#0a0a0a" : "#cfd2e3",
                  fontWeight: i === tokenIdx ? 600 : 400,
                }}
              >
                {t.word}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center my-6">
            <motion.div
              key={tokenIdx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-5 py-3 rounded-xl text-xl font-bold"
              style={{
                background: TOPIC_COLOR[TOKENS[tokenIdx].topic],
                color: "#0a0a0a",
              }}
            >
              {TOKENS[tokenIdx].word}
            </motion.div>
          </div>

          <div className="text-center text-[10px] uppercase tracking-wider text-[var(--muted)] my-2">
            ↓ Gate / Router
          </div>
          <div className="text-[10px] text-center text-[var(--muted)] mb-3">
            softmax(W_gate · h) → top-{K}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setTokenIdx((i) => (i + 1) % TOKENS.length);
                setAuto(false);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-md border border-[var(--border)] hover:bg-white/5 text-xs transition"
            >
              <RefreshCw size={12} />
              下一个 token
            </button>
            <button
              onClick={() => setAuto((a) => !a)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-md border border-[var(--border)] hover:bg-white/5 text-xs transition"
              style={{
                background: auto ? "var(--accent-soft)" : "transparent",
                color: auto ? "#fff" : "#cfd2e3",
              }}
            >
              <Play size={12} />
              {auto ? "自动播放中" : "自动播放"}
            </button>
          </div>
        </div>

        {/* experts grid */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              专家阵列
            </div>
            <div className="text-[11px] text-[var(--muted)]">
              共 <span className="text-white">{E + S}</span> 个 · 激活{" "}
              <span className="text-white">{K + S}</span> 个
            </div>
          </div>

          {variant.shared > 0 && (
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Shared Experts (始终激活，承担通用知识)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: variant.shared }).map((_, i) => (
                  <ExpertCell
                    key={`s${i}`}
                    label={`S${i + 1}`}
                    sublabel="通用"
                    color="#FFB46B"
                    activated
                    pulse
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Routed Experts (top-{K} 激活)
          </div>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
            }}
          >
            {Array.from({ length: E }).map((_, i) => {
              const activated = routing.expertIds.includes(i);
              return (
                <ExpertCell
                  key={i}
                  label={`E${i + 1}`}
                  sublabel={specializationLabel(i, variant)}
                  color={
                    activated
                      ? variant.color
                      : "rgba(255,255,255,0.06)"
                  }
                  activated={activated}
                />
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-[var(--border)]">
            <Stat
              label="总参数（相对单位）"
              value={totalParams.toFixed(2)}
              hint="保持总参数量不变"
              color="#cfd2e3"
            />
            <Stat
              label="单 token 激活参数"
              value={activeParams.toFixed(2)}
              hint={
                variantKey === "deepseek"
                  ? "更细粒度 → 更小激活"
                  : "粗粒度 → 大激活块"
              }
              color={variant.color}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 text-sm leading-relaxed text-[var(--foreground)]/85">
        <span className="text-white font-medium">三大创新：</span>
        <span className="text-[var(--muted)]"> (1) </span>
        <b>Fine-Grained Expert Segmentation</b>：把每个专家切得更窄，避免「样样通样样松」；
        <span className="text-[var(--muted)]"> (2) </span>
        <b>Shared Expert Isolation</b>：把通用知识抽离到共享专家，减少其他专家的冗余；
        <span className="text-[var(--muted)]"> (3) </span>
        <b>设备级负载均衡</b>：跨设备的额外 balance loss，避免单卡瓶颈。
      </div>
    </section>
  );
}

function ExpertCell({
  label,
  sublabel,
  color,
  activated,
  pulse,
}: {
  label: string;
  sublabel: string;
  color: string;
  activated: boolean;
  pulse?: boolean;
}) {
  return (
    <motion.div
      animate={{
        scale: activated ? 1 : 0.97,
        opacity: activated ? 1 : 0.5,
      }}
      transition={{ duration: 0.25 }}
      className="relative rounded-md p-2 text-center"
      style={{
        background: activated ? color : "rgba(255,255,255,0.04)",
        color: activated ? "#0a0a0a" : "#8b90a8",
        border: `1px solid ${activated ? color : "var(--border)"}`,
      }}
    >
      <div className="text-[10px] font-mono">{label}</div>
      <div className="text-[9px] mt-0.5 truncate">{sublabel}</div>
      {pulse && activated && (
        <span
          className="absolute inset-0 rounded-md ring-2 ring-[#FFB46B] animate-pulse"
          style={{ pointerEvents: "none" }}
        />
      )}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint?: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-elev)] p-3">
      <div className="text-[10px] text-[var(--muted)]">{label}</div>
      <div className="text-xl font-semibold mt-0.5 tabular-nums" style={{ color }}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-[var(--muted)] mt-0.5">{hint}</div>}
    </div>
  );
}
