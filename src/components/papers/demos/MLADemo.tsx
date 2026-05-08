"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BlockMath, InlineMath } from "react-katex";
import SectionHeader from "@/components/papers/SectionHeader";

interface Variant {
  id: "mha" | "gqa" | "mqa" | "mla";
  name: string;
  formula: string;
  cachePerLayer: (h: number, dh: number, ngroups: number, dc: number) => number;
  color: string;
  desc: string;
}

const VARIANTS: Variant[] = [
  {
    id: "mha",
    name: "MHA",
    formula: "n_h \\cdot d_h \\text{ per token (K)} + \\text{same (V)}",
    cachePerLayer: (h, dh) => 2 * h * dh,
    color: "#F472B6",
    desc: "标准多头注意力，每头独立的 K 和 V",
  },
  {
    id: "gqa",
    name: "GQA",
    formula: "n_g \\cdot d_h \\cdot 2",
    cachePerLayer: (_h, dh, ng) => 2 * ng * dh,
    color: "#A78BFA",
    desc: "Grouped Query Attention：多个 query 头共享 KV",
  },
  {
    id: "mqa",
    name: "MQA",
    formula: "1 \\cdot d_h \\cdot 2",
    cachePerLayer: (_h, dh) => 2 * dh,
    color: "#F59E0B",
    desc: "Multi Query：所有 query 头共享 1 套 KV",
  },
  {
    id: "mla",
    name: "MLA (DeepSeek-V2)",
    formula: "d_c + d_h^R",
    cachePerLayer: (_h, _dh, _ng, dc) => dc + 64, // dc + d_h^R (rope)
    color: "#4D6BFE",
    desc: "Multi-head Latent Attention：低秩潜在向量 c_t 替代 KV，仅缓存 c_t 与一小段 RoPE",
  },
];

export default function MLADemo() {
  const [ctxK, setCtxK] = useState(32); // context length in K tokens
  const [layers, setLayers] = useState(60);

  // Fix dims (V2-style): h=128 heads, d_h=128, n_g=8 (GQA), d_c=512
  const h = 128;
  const dh = 128;
  const ng = 8;
  const dc = 512;
  const tokens = ctxK * 1024;

  const data = useMemo(() => {
    return VARIANTS.map((v) => {
      const perLayerPerToken = v.cachePerLayer(h, dh, ng, dc);
      const totalElems = perLayerPerToken * tokens * layers;
      const bytes = totalElems * 2; // FP16
      return { v, bytes };
    });
  }, [tokens, layers]);

  const maxBytes = Math.max(...data.map((d) => d.bytes));

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Architecture · DeepSeek-V2"
        title="MLA：用低秩潜向量压缩 KV 缓存"
        desc="MLA 把每个 token 的所有头 K/V 压缩成一个共享的低秩潜在向量 c_t（≈512 维），推理时再投影回各头。结果：KV 缓存比 MHA 缩 93%，比 GQA 仍小 4×，几乎接近 MQA，但模型质量保持与 MHA 相当。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* controls */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              <span>上下文长度</span>
              <span className="text-white font-mono">{ctxK}K</span>
            </div>
            <input
              type="range"
              min={4}
              max={128}
              step={4}
              value={ctxK}
              onChange={(e) => setCtxK(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[9px] text-[var(--muted)] mt-1 font-mono">
              <span>4K</span>
              <span>128K (V2)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              <span>层数</span>
              <span className="text-white font-mono">{layers}</span>
            </div>
            <input
              type="range"
              min={32}
              max={80}
              step={4}
              value={layers}
              onChange={(e) => setLayers(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              MLA 数学形式
            </div>
            <div className="text-xs">
              <BlockMath math={"c_t = W^{DKV} h_t \\in \\mathbb{R}^{d_c}"} />
              <BlockMath math={"k_t = W^{UK} c_t,\\quad v_t = W^{UV} c_t"} />
            </div>
            <div className="mt-2 text-[11px] text-[var(--muted)] leading-relaxed">
              缓存的不是 K/V，而是<span className="text-white"> 低秩 c_t</span>（
              <InlineMath math="d_c \\ll n_h d_h" />），上投影矩阵
              <InlineMath math="W^{UK}, W^{UV}" /> 还能与 Q/O 投影合并，推理时无需显式还原。
            </div>
          </div>
        </div>

        {/* bars */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">
            KV 缓存大小 (FP16)
          </div>

          <div className="space-y-4">
            {data.map(({ v, bytes }) => {
              const pct = (bytes / maxBytes) * 100;
              const gb = bytes / 1e9;
              const mb = bytes / 1e6;
              const vsMHA = (bytes / data[0].bytes) * 100;
              return (
                <div key={v.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: v.color }}
                      />
                      <span className="text-sm font-medium text-white">
                        {v.name}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">
                        {v.desc}
                      </span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-right">
                      <span className="text-white">
                        {gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(0)} MB`}
                      </span>
                      <span className="text-[var(--muted)] ml-2">
                        {vsMHA.toFixed(1)}% of MHA
                      </span>
                    </div>
                  </div>
                  <div className="h-6 rounded-md bg-white/[0.04] overflow-hidden relative">
                    <motion.div
                      initial={false}
                      animate={{ width: `${Math.max(0.5, pct)}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-md flex items-center"
                      style={{
                        background: `linear-gradient(90deg, ${v.color}, ${v.color}cc)`,
                      }}
                    >
                      <span className="px-2 text-[10px] font-mono text-[#0a0a0a] whitespace-nowrap">
                        per-token: {v.cachePerLayer(h, dh, ng, dc)} elems × {layers} layers
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border)]">
            <Stat
              label="vs MHA"
              value={`-${(100 - (data[3].bytes / data[0].bytes) * 100).toFixed(1)}%`}
              color="#4D6BFE"
              hint="MLA 节省的缓存"
            />
            <Stat
              label="可同时跑的 batch"
              value={`${Math.floor(data[0].bytes / data[3].bytes)}×`}
              color="#34D399"
              hint="同等显存下的并发能力"
            />
            <Stat
              label="V2 上下文"
              value="128K"
              color="#A78BFA"
              hint="更长上下文成为可能"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        <Insight
          title="为什么 MLA 不损质量？"
          body="低秩压缩与 MHA 的「多视角」并不矛盾——上投影矩阵 W^UK / W^UV 给每个头独立的视角，潜在向量只是把存储压低，理论容量与 MHA 同阶。"
        />
        <Insight
          title="为什么训练成本也降低？"
          body="MLA 让 V2 把更多预算投入到 MoE / 数据 上；论文报告训练 V2 的总成本比 V1（67B Dense）下降 42.5%，吞吐提升 5.76 倍。"
        />
      </div>
    </section>
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

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="text-xs uppercase tracking-wider text-[#4D6BFE] mb-1.5">
        {title}
      </div>
      <div className="text-sm text-[var(--foreground)]/85 leading-relaxed">
        {body}
      </div>
    </div>
  );
}
