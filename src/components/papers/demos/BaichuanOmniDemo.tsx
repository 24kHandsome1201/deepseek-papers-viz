"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, Image as ImageIcon, AudioLines, Video, Layers } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

const MODALITIES = [
  {
    id: "text",
    name: "文本",
    icon: <Type size={16} />,
    color: "#EB5757",
    encoder: "BPE Tokenizer",
    sample: '"夕阳下，海鸥在飞。"',
    tokens: 7,
  },
  {
    id: "image",
    name: "图像",
    icon: <ImageIcon size={16} />,
    color: "#F2994A",
    encoder: "ViT-L/14",
    sample: "640×480 海面落日 .jpg",
    tokens: 256,
  },
  {
    id: "audio",
    name: "音频",
    icon: <AudioLines size={16} />,
    color: "#27AE60",
    encoder: "Whisper-large + adapter",
    sample: "12s 海浪 + 鸥叫 .wav",
    tokens: 600,
  },
  {
    id: "video",
    name: "视频",
    icon: <Video size={16} />,
    color: "#A78BFA",
    encoder: "TimeSformer (32 fps)",
    sample: "8s 海岸延时 .mp4",
    tokens: 1024,
  },
];

const PIPELINE_STEPS = [
  { id: 0, label: "原始输入", desc: "4 路异构信号" },
  { id: 1, label: "模态编码器", desc: "各模态独立 encoder → token 序列" },
  { id: 2, label: "Projector", desc: "线性投影到统一隐空间 d=4096" },
  { id: 3, label: "联合 LLM", desc: "Decoder-only Transformer 吃统一序列" },
  { id: 4, label: "输出", desc: "文本回答 / 图像 / 音频" },
];

const SAMPLE_INPUT = {
  text: "下面这段视频里有什么声音？请用中文描述场景。",
  video: "/imgs/sea-sunset.mp4",
};

const SAMPLE_OUTPUT =
  "视频是一段海岸日落的延时。能听到持续的海浪拍岸声，约 0:04 起伴随海鸥鸣叫，背景有微弱的风声。整体氛围平静、带一丝孤寂感。";

export default function BaichuanOmniDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => (p >= PIPELINE_STEPS.length - 1 ? 0 : p + 1));
    }, 1700);
    return () => clearInterval(id);
  }, []);

  const totalTokens = MODALITIES.reduce((s, m) => s + m.tokens, 0);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Baichuan-Omni · 2024.10"
        title="一个模型理解 文 / 图 / 音 / 视频"
        desc="Baichuan-Omni 是首批端到端开源的全模态模型。下面把它的输入处理管线展开 ——4 路异构信号通过各自 encoder 投影到同一隐空间，再被同一 Transformer 解码消化。"
      />

      {/* Pipeline progress */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              前向管线（自动播放）
            </div>
            <div className="text-base font-semibold mt-1">
              当前：{PIPELINE_STEPS[phase].label}
            </div>
          </div>
          <div className="flex gap-1">
            {PIPELINE_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setPhase(i)}
                className="w-9 h-2 rounded-full transition"
                style={{
                  background: i <= phase ? "#EB5757" : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] text-[var(--muted)]">
          {PIPELINE_STEPS[phase].desc}
        </div>
      </div>

      <div className="relative grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        {/* Left: 4 modality streams */}
        <div className="space-y-3">
          {MODALITIES.map((m) => {
            const showInput = phase >= 0;
            const encoded = phase >= 1;
            const projected = phase >= 2;
            return (
              <motion.div
                key={m.id}
                initial={false}
                animate={{
                  opacity: showInput ? 1 : 0.4,
                  scale: showInput ? 1 : 0.97,
                }}
                className="rounded-xl border p-3 flex items-center gap-3"
                style={{
                  borderColor: encoded ? m.color : "var(--border)",
                  background: encoded ? `${m.color}10` : "transparent",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${m.color}25`,
                    color: m.color,
                    border: `1px solid ${m.color}50`,
                  }}
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: encoded ? "#fff" : "#cfd2e3" }}>
                    {m.name}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] truncate">{m.sample}</div>
                  {encoded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-[10px] font-mono"
                      style={{ color: m.color }}
                    >
                      [{m.encoder}] → {m.tokens} tokens {projected ? "→ d=4096" : ""}
                    </motion.div>
                  )}
                </div>
                {/* arrow */}
                <AnimatePresence>
                  {encoded && (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: [0, 12, 0], opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="text-[var(--muted)]"
                    >
                      →
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          <div className="rounded-md bg-white/5 p-2.5 text-[11px] text-[var(--muted)] font-mono">
            合计 token 数：{totalTokens}（统一 d=4096）
          </div>
        </div>

        {/* Center: unified LLM */}
        <div className="flex items-center justify-center">
          <motion.div
            animate={{
              boxShadow:
                phase >= 3
                  ? "0 0 0 8px rgba(235,87,87,0.18), 0 0 32px rgba(235,87,87,0.4)"
                  : "0 0 0 0 rgba(235,87,87,0)",
            }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border-2 p-5 text-center min-w-[180px]"
            style={{
              borderColor: phase >= 3 ? "#EB5757" : "var(--border)",
              background: phase >= 3
                ? "linear-gradient(135deg, #EB575720, transparent)"
                : "var(--panel)",
            }}
          >
            <Layers size={28} className="mx-auto mb-2 text-[#EB5757]" />
            <div className="text-sm font-semibold">联合 LLM</div>
            <div className="text-[11px] text-[var(--muted)] mt-1">
              Decoder-only<br />
              7B params<br />
              统一 token 流
            </div>
          </motion.div>
        </div>

        {/* Right: output */}
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4">
            <div className="text-[10px] uppercase text-[var(--muted)] mb-2">user</div>
            <div className="text-xs">{SAMPLE_INPUT.text}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-white/5">
              <Video size={11} className="text-[#A78BFA]" />
              {SAMPLE_INPUT.video}
            </div>
          </div>

          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-[#EB5757]/40 bg-[#EB5757]/10 p-4"
              >
                <div className="text-[10px] uppercase font-mono text-[#EB5757] mb-2">
                  Baichuan-Omni 输出
                </div>
                <div className="text-sm leading-relaxed">{SAMPLE_OUTPUT}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {phase < 4 && (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center">
              <div className="text-[10px] uppercase text-[var(--muted)] font-mono">
                等待生成...
              </div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mt-2 inline-flex gap-1"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#EB5757]"
                  />
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid sm:grid-cols-4 gap-3 text-sm">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-[11px] text-[var(--muted)] uppercase">支持模态</div>
          <div className="font-semibold mt-1">4 路</div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">文 + 图 + 音 + 视</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-[11px] text-[var(--muted)] uppercase">隐空间维度</div>
          <div className="font-semibold mt-1">d = 4096</div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">所有模态共享</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-[11px] text-[var(--muted)] uppercase">主干参数</div>
          <div className="font-semibold mt-1">7B</div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">Decoder-only</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-[11px] text-[var(--muted)] uppercase">训练阶段</div>
          <div className="font-semibold mt-1">3 阶段</div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">单模 → 双模 → 全模</div>
        </div>
      </div>
    </section>
  );
}
