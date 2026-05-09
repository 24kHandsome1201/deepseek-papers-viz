"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COMPARE = [
  { name: "Qwen2.5-72B", tokens: 18, mmlu: 86.1, hours: 100, color: "#615CED", featured: false },
  { name: "Llama-3.1-70B", tokens: 15, mmlu: 86.0, hours: 88, color: "#cbd5e1", featured: false },
  { name: "DeepSeek-V2", tokens: 8.1, mmlu: 78.5, hours: 50, color: "#4D6BFE", featured: false },
  { name: "InternLM3-8B", tokens: 4, mmlu: 76.4, hours: 22, color: "#9B51E0", featured: true },
];

const QUALITY_LAYERS = [
  { name: "网页爬取", ratio: 100, surviving: 100, color: "#8b90a8" },
  { name: "+ 语言识别 / 去重", ratio: 70, surviving: 70, color: "#A78BFA" },
  { name: "+ 启发式过滤", ratio: 35, surviving: 35, color: "#C58CFF" },
  { name: "+ 模型质量分类器", ratio: 18, surviving: 18, color: "#9B51E0" },
  { name: "+ 知识密度筛选 (本工作)", ratio: 8, surviving: 8, color: "#7B5CFF" },
];

const MODES = [
  { id: "general", name: "通用模式", color: "#9B51E0", desc: "/ 标准对话 / 写作" },
  { id: "reasoning", name: "深度思考", color: "#C58CFF", desc: "/think 长链 reasoning" },
];

export default function InternLM3Demo() {
  const [mode, setMode] = useState("general");

  const efficiency = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        formatter: (p: { name: string; data: { value: [number, number]; tokens: number; hours: number } }) =>
          `<b>${p.name}</b><br/>训练 tokens: ${p.data.tokens}T<br/>MMLU: ${p.data.value[1]}<br/>GPU·小时: ~${p.data.hours}k`,
      },
      grid: { left: 50, right: 30, top: 30, bottom: 40 },
      xAxis: {
        type: "value",
        name: "训练 tokens (T)",
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      yAxis: {
        type: "value",
        min: 70,
        max: 90,
        name: "MMLU",
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      series: [
        {
          type: "scatter",
          data: COMPARE.map((m) => ({
            name: m.name,
            value: [m.tokens, m.mmlu],
            tokens: m.tokens,
            hours: m.hours,
            symbolSize: 18 + Math.log10(m.hours) * 6,
            itemStyle: {
              color: m.color,
              borderColor: m.featured ? "#fff" : undefined,
              borderWidth: m.featured ? 2 : 0,
            },
            label: {
              show: true,
              formatter: m.name,
              position: "top",
              color: m.featured ? "#fff" : "#cfd2e3",
              fontSize: 10,
            },
          })),
        },
      ],
    }),
    []
  );

  const finalSurviving = QUALITY_LAYERS[QUALITY_LAYERS.length - 1].surviving;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="InternLM3 · 2025.01"
        title="只用 4T 高质量 token 训出对标 Qwen2.5-72B 的 8B"
        desc="InternLM3 把训练数据规模降回 4T，但通过 5 道清洗管线只保留 8% 高知识密度数据。结果：8B 的 InternLM3 在 MMLU 上几乎追平 Qwen2.5-72B，而 GPU 用量仅其 1/4.5。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Quality funnel */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            数据清洗漏斗
          </div>
          <div className="space-y-1">
            {QUALITY_LAYERS.map((l, i) => {
              const widthPct = l.surviving;
              return (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-44 text-[11px] text-[var(--foreground)]/85 leading-tight">
                    {l.name}
                  </div>
                  <div className="flex-1 relative h-7 bg-white/5 rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 + 0.1 }}
                      className="h-full"
                      style={{ background: l.color }}
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-mono text-white/85">
                      {l.surviving}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg border border-[#9B51E0]/40 bg-[#9B51E0]/10 p-3">
            <div className="text-[10px] uppercase text-[var(--muted)]">最终留存</div>
            <div className="flex items-end gap-2 mt-1">
              <div className="text-2xl font-bold" style={{ color: "#C58CFF" }}>
                {finalSurviving}%
              </div>
              <div className="text-xs text-[var(--muted)] mb-0.5">≈ 4T 高密度 tokens</div>
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-1.5 leading-relaxed">
              其余 92% 多是低信息冗余（重复、SEO 垃圾、广告、机器翻译），InternLM3 主张「精」胜「量」。
            </div>
          </div>
        </div>

        {/* Efficiency scatter */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
            tokens / MMLU 帕累托前沿
          </div>
          <ReactECharts option={efficiency} style={{ height: 320 }} />
          <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
            * 圆面积 ∝ GPU·小时。InternLM3-8B 在左下角（少 token / 少 GPU）但 MMLU 仍跻身 70+ 区。其他点是同期开源旗舰。
          </div>
        </div>
      </div>

      {/* Dual-mode demo */}
      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              双模式输出
            </div>
            <div className="text-base font-semibold mt-1">
              同一权重，两种回答风格
            </div>
          </div>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className="px-4 py-1.5 rounded-full border text-xs transition"
                style={{
                  borderColor: mode === m.id ? m.color : "var(--border)",
                  background: mode === m.id ? `${m.color}20` : "transparent",
                  color: mode === m.id ? "#fff" : "var(--muted)",
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4">
            <div className="text-[10px] uppercase text-[var(--muted)] mb-2">user</div>
            <div className="text-sm font-mono">
              证明：对任意正整数 n，n³ - n 一定能被 6 整除。
            </div>
          </div>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border p-4"
            style={{
              borderColor: MODES.find((m) => m.id === mode)!.color + "60",
              background: MODES.find((m) => m.id === mode)!.color + "12",
            }}
          >
            <div className="text-[10px] uppercase font-mono mb-2" style={{ color: MODES.find((m) => m.id === mode)!.color }}>
              {mode === "general" ? "assistant" : "<thinking>"}
            </div>
            {mode === "general" ? (
              <div className="text-sm leading-relaxed">
                n³ − n = n(n−1)(n+1)，是三个连续整数的乘积。其中至少有一个偶数（被 2 整除）和一个 3 的倍数（被 3 整除），所以被 6 整除。∎
              </div>
            ) : (
              <pre className="font-mono text-[12px] whitespace-pre-wrap leading-relaxed">
{`先做因式分解：
  n³ - n = n(n² - 1) = n(n - 1)(n + 1)

观察 1：n - 1, n, n + 1 是三个连续整数
观察 2：连续 2 个整数中必有一个偶数，所以乘积 % 2 = 0
观察 3：连续 3 个整数中必有一个被 3 整除，所以乘积 % 3 = 0
结论：乘积同时被 2 和 3 整除 → 被 6 整除。

(自检：取 n=4，4·3·5=60=6·10 ✓；n=5，5·4·6=120=6·20 ✓)
∴ n³ - n 总是 6 的倍数。`}
              </pre>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
