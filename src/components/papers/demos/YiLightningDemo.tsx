"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Lang {
  code: string;
  name: string;
  family: string;
  routedExperts: number[]; // top-3 experts (idx)
  weight: number;
}

const LANGS: Lang[] = [
  { code: "中", name: "中文", family: "Sino-Tibetan", routedExperts: [3, 12, 27], weight: 1.0 },
  { code: "EN", name: "English", family: "Indo-European", routedExperts: [3, 7, 18], weight: 0.95 },
  { code: "JA", name: "日本語", family: "Japonic", routedExperts: [12, 22, 27], weight: 0.7 },
  { code: "KO", name: "한국어", family: "Koreanic", routedExperts: [22, 27, 11], weight: 0.65 },
  { code: "ES", name: "Español", family: "Indo-European", routedExperts: [7, 18, 4], weight: 0.85 },
  { code: "FR", name: "Français", family: "Indo-European", routedExperts: [7, 18, 9], weight: 0.85 },
  { code: "DE", name: "Deutsch", family: "Indo-European", routedExperts: [7, 9, 14], weight: 0.8 },
  { code: "RU", name: "Русский", family: "Indo-European", routedExperts: [7, 14, 4], weight: 0.75 },
  { code: "AR", name: "العربية", family: "Afro-Asiatic", routedExperts: [4, 14, 24], weight: 0.6 },
  { code: "HI", name: "हिन्दी", family: "Indo-European", routedExperts: [4, 7, 14], weight: 0.55 },
  { code: "PT", name: "Português", family: "Indo-European", routedExperts: [7, 18, 4], weight: 0.7 },
  { code: "VI", name: "Tiếng Việt", family: "Austroasiatic", routedExperts: [12, 4, 24], weight: 0.5 },
];

const NUM_EXPERTS = 32;

const FAMILY_COLOR: Record<string, string> = {
  "Sino-Tibetan": "#27AE60",
  "Indo-European": "#5DD992",
  Japonic: "#F2994A",
  Koreanic: "#A78BFA",
  "Afro-Asiatic": "#F472B6",
  Austroasiatic: "#0E8FFD",
};

const BENCH = [
  { name: "MMLU (英)", yi: 81.5, gpt4o: 88.7, claude35: 88.3, qwen25: 84.2 },
  { name: "C-Eval (中)", yi: 86.4, gpt4o: 78.9, claude35: 76.5, qwen25: 90.0 },
  { name: "AlignBench", yi: 8.07, gpt4o: 7.96, claude35: 7.82, qwen25: 7.42, max: 10 },
  { name: "Arena 多语种", yi: 1287, gpt4o: 1245, claude35: 1217, qwen25: 1240, max: 1500 },
];

export default function YiLightningDemo() {
  const [activeLang, setActiveLang] = useState<string>("中");
  const lang = LANGS.find((l) => l.code === activeLang)!;

  const benchOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      legend: {
        data: ["Yi-Lightning", "GPT-4o", "Claude-3.5", "Qwen2.5-72B"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 60, right: 30, top: 30, bottom: 30 },
      xAxis: {
        type: "category",
        data: BENCH.map((b) => b.name),
        axisLabel: { color: "#cfd2e3", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      series: [
        {
          name: "Yi-Lightning",
          type: "bar",
          data: BENCH.map((b) => b.yi),
          itemStyle: { color: "#27AE60", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
        {
          name: "GPT-4o",
          type: "bar",
          data: BENCH.map((b) => b.gpt4o),
          itemStyle: { color: "#34D399", borderRadius: [4, 4, 0, 0], opacity: 0.6 },
          barWidth: 12,
        },
        {
          name: "Claude-3.5",
          type: "bar",
          data: BENCH.map((b) => b.claude35),
          itemStyle: { color: "#F472B6", borderRadius: [4, 4, 0, 0], opacity: 0.6 },
          barWidth: 12,
        },
        {
          name: "Qwen2.5-72B",
          type: "bar",
          data: BENCH.map((b) => b.qwen25),
          itemStyle: { color: "#615CED", borderRadius: [4, 4, 0, 0] },
          barWidth: 12,
        },
      ],
    }),
    []
  );

  // auto cycle through languages
  useEffect(() => {
    const id = setInterval(() => {
      setActiveLang((curr) => {
        const idx = LANGS.findIndex((l) => l.code === curr);
        return LANGS[(idx + 1) % LANGS.length].code;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Yi-Lightning · 2024.10"
        title="多语种 MoE：12 种语言共享 32 专家"
        desc="Yi-Lightning 是零一万物的 MoE 旗舰模型。下面演示每种语言被路由到的 top-3 专家：印欧语系共享相似专家集合，而中、日、阿拉伯等表意 / 形态差异大的语言会路由到独立专家。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Language picker */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            选择语言（自动循环）
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map((l) => {
              const active = activeLang === l.code;
              const c = FAMILY_COLOR[l.family];
              return (
                <button
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  className="rounded-lg border p-2.5 text-center transition"
                  style={{
                    borderColor: active ? c : "var(--border)",
                    background: active ? `${c}20` : "transparent",
                  }}
                >
                  <div
                    className="text-sm font-semibold"
                    style={{ color: active ? "#fff" : "#cfd2e3" }}
                  >
                    {l.code}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] truncate">{l.name}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-[11px] text-[var(--muted)] leading-relaxed">
            * 颜色编码语系。同语系（如印欧）会高频共享专家，跨语系几乎完全独立。
          </div>

          <div className="mt-4 rounded-lg border border-[var(--border)] p-3">
            <div className="text-[10px] uppercase text-[var(--muted)] mb-1">当前路由 top-3</div>
            <div className="flex items-center gap-2 font-mono text-xs">
              {lang.routedExperts.map((e) => (
                <span
                  key={e}
                  className="px-2 py-0.5 rounded"
                  style={{
                    background: `${FAMILY_COLOR[lang.family]}25`,
                    color: FAMILY_COLOR[lang.family],
                    border: `1px solid ${FAMILY_COLOR[lang.family]}55`,
                  }}
                >
                  E{e}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expert grid */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            32 路专家网格 · 高亮 = 当前激活
          </div>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: NUM_EXPERTS }, (_, i) => {
              const isActive = lang.routedExperts.includes(i);
              return (
                <motion.div
                  key={i}
                  animate={{
                    scale: isActive ? 1.06 : 0.94,
                    opacity: isActive ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.3 }}
                  className="aspect-square rounded-md flex items-center justify-center text-[11px] font-mono"
                  style={{
                    background: isActive ? FAMILY_COLOR[lang.family] : "#11131c",
                    border: isActive
                      ? `2px solid ${FAMILY_COLOR[lang.family]}`
                      : "1px solid var(--border)",
                    color: isActive ? "#fff" : "var(--muted)",
                  }}
                >
                  {i}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-md border border-[var(--border)] p-2.5">
              <div className="text-[10px] text-[var(--muted)] uppercase">总专家</div>
              <div className="font-semibold mt-0.5">{NUM_EXPERTS}</div>
            </div>
            <div className="rounded-md border border-[var(--border)] p-2.5">
              <div className="text-[10px] text-[var(--muted)] uppercase">每 token 激活</div>
              <div className="font-semibold mt-0.5">3 (top-3)</div>
            </div>
            <div className="rounded-md border border-[var(--border)] p-2.5">
              <div className="text-[10px] text-[var(--muted)] uppercase">语种支持</div>
              <div className="font-semibold mt-0.5">12+</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
          Yi-Lightning vs frontier
        </div>
        <ReactECharts option={benchOption} style={{ height: 280 }} />
        <div className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
          * Yi-Lightning 在中文 (C-Eval) 与多语种 Arena 上反超 GPT-4o；MMLU 略落后但接近。AlignBench / Arena 数值已按 max 归一展示。
        </div>
      </div>
    </section>
  );
}
