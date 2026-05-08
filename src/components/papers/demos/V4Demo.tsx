"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const CONTEXTS = [
  { name: "GPT-4 Turbo", k: 128, color: "#34D399" },
  { name: "Claude 3.5", k: 200, color: "#F472B6" },
  { name: "DeepSeek V3", k: 64, color: "#8b90a8" },
  { name: "DeepSeek V3.2", k: 164, color: "#A78BFA" },
  { name: "Gemini 1.5 Pro", k: 1000, color: "#F59E0B" },
  { name: "DeepSeek V4", k: 1000, color: "#4D6BFE", featured: true },
];

const PRICING = [
  { name: "Claude Opus 4.5", price: 25, color: "#F472B6" },
  { name: "GPT-5.4", price: 18, color: "#34D399" },
  { name: "Gemini 2.5 Pro", price: 12, color: "#F59E0B" },
  { name: "Qwen3.6 Max", price: 6.4, color: "#A78BFA" },
  { name: "Kimi K2.6", price: 5.2, color: "#1F1F1F" },
  { name: "DeepSeek V4", price: 3.48, color: "#4D6BFE", featured: true },
];

const CODEFORCES = [
  { name: "DeepSeek V2", elo: 1100 },
  { name: "DeepSeek V3", elo: 1450 },
  { name: "DeepSeek R1", elo: 2029 },
  { name: "DeepSeek V3.2", elo: 2410 },
  { name: "GPT-5.4", elo: 2980 },
  { name: "Gemini 2.5", elo: 3050 },
  { name: "DeepSeek V4-Pro", elo: 3206 },
];

export default function V4Demo() {
  const [tab, setTab] = useState<"ctx" | "elo" | "price">("ctx");

  const ctxOption = {
    grid: { left: 90, right: 50, top: 20, bottom: 30 },
    tooltip: {},
    xAxis: {
      type: "log",
      max: 1100,
      axisLabel: {
        color: "#8b90a8",
        formatter: (v: number) => `${v}K`,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    yAxis: {
      type: "category",
      data: CONTEXTS.map((c) => c.name),
      axisLabel: {
        color: (v: string) => (v.includes("DeepSeek V4") ? "#fff" : "#cfd2e3"),
        fontSize: 11,
      },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    series: [
      {
        type: "bar",
        data: CONTEXTS.map((c) => ({
          value: c.k,
          itemStyle: {
            color: c.color,
            borderColor: c.featured ? "#fff" : undefined,
            borderWidth: c.featured ? 2 : 0,
          },
        })),
        label: {
          show: true,
          position: "right",
          color: "#cfd2e3",
          fontSize: 10,
          formatter: (p: { value: number }) =>
            p.value >= 1000 ? `${p.value / 1000}M` : `${p.value}K`,
        },
        barWidth: 18,
      },
    ],
  };

  const eloOption = {
    grid: { left: 100, right: 50, top: 20, bottom: 30 },
    xAxis: {
      type: "value",
      min: 800,
      max: 3300,
      axisLabel: { color: "#8b90a8", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    yAxis: {
      type: "category",
      data: CODEFORCES.map((c) => c.name),
      axisLabel: { color: "#cfd2e3", fontSize: 11 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    series: [
      {
        type: "bar",
        data: CODEFORCES.map((c) => ({
          value: c.elo,
          itemStyle: {
            color: c.name.startsWith("DeepSeek V4")
              ? "#4D6BFE"
              : c.name.startsWith("DeepSeek")
                ? "#7B8FFF"
                : "#8b90a8",
            borderColor: c.name.startsWith("DeepSeek V4") ? "#fff" : undefined,
            borderWidth: c.name.startsWith("DeepSeek V4") ? 2 : 0,
          },
        })),
        label: {
          show: true,
          position: "right",
          color: "#cfd2e3",
          fontSize: 10,
          formatter: (p: { value: number }) => p.value,
        },
        barWidth: 18,
      },
    ],
  };

  const priceOption = {
    grid: { left: 110, right: 50, top: 20, bottom: 30 },
    xAxis: {
      type: "value",
      max: 30,
      axisLabel: {
        color: "#8b90a8",
        fontSize: 10,
        formatter: (v: number) => `$${v}`,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    yAxis: {
      type: "category",
      data: PRICING.map((c) => c.name),
      axisLabel: { color: "#cfd2e3", fontSize: 11 },
    },
    series: [
      {
        type: "bar",
        data: PRICING.map((p) => ({
          value: p.price,
          itemStyle: {
            color: p.color,
            borderColor: p.featured ? "#fff" : undefined,
            borderWidth: p.featured ? 2 : 0,
          },
        })),
        label: {
          show: true,
          position: "right",
          color: "#cfd2e3",
          fontSize: 10,
          formatter: (p: { value: number }) => `$${p.value.toFixed(2)}`,
        },
        barWidth: 18,
      },
    ],
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="DeepSeek-V4 · 2026.04.24"
        title="开源权重 frontier 模型"
        desc="V4-Pro 与 V4-Flash 同时以 MIT 协议放出权重。1M 上下文、Codeforces 3206、价格仅为 Claude 1/8。这是 R1 之后又一次「DeepSeek 冲击」。"
      />

      <div className="grid md:grid-cols-4 gap-3 mb-8">
        <Hero label="上下文" value="1M" color="#4D6BFE" />
        <Hero label="Codeforces" value="3206" color="#A78BFA" />
        <Hero label="开源协议" value="MIT" color="#34D399" />
        <Hero label="API 单价" value="$3.48/M" color="#F59E0B" />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <Tab id="ctx" current={tab} onClick={setTab} label="上下文长度对比" color="#4D6BFE" />
          <Tab id="elo" current={tab} onClick={setTab} label="Codeforces 演化" color="#A78BFA" />
          <Tab id="price" current={tab} onClick={setTab} label="API 定价对比" color="#F59E0B" />
        </div>
        {tab === "ctx" && <ReactECharts option={ctxOption} style={{ height: 320 }} />}
        {tab === "elo" && <ReactECharts option={eloOption} style={{ height: 360 }} />}
        {tab === "price" && <ReactECharts option={priceOption} style={{ height: 320 }} />}

        <div className="mt-4 text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--border)] pt-4">
          {tab === "ctx" && (
            <>
              V4 与 Gemini 2.5 Pro 并列第一梯队的 1M 上下文，但
              <span className="text-white"> 是唯一开源权重</span>。
            </>
          )}
          {tab === "elo" && (
            <>
              从 V2 (1100) 到 V4-Pro (3206) ，DeepSeek 在 Codeforces 上前进了 <span className="text-white">2106 分</span>，
              超过 GPT-5.4。
            </>
          )}
          {tab === "price" && (
            <>
              单价仅为 Claude Opus 4.5 的 <span className="text-white">14%</span>。
              这是 V3 / R1 之后的第三次「价格战」级别冲击。
            </>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 leading-relaxed">
        <div className="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
          为什么 V4 重要
        </div>
        <ol className="space-y-2 text-sm text-[var(--foreground)]/85 list-decimal list-inside">
          <li>
            <b className="text-white">第一个开源 1M 上下文 frontier-class 模型</b> ——
            过去这是 Gemini 的护城河。
          </li>
          <li>
            MIT 协议 + 权重公开，让企业完全可以在内网部署 frontier 能力。
          </li>
          <li>
            价格再次砍半，强迫西方 frontier 玩家跟降。
          </li>
          <li>
            技术栈延续 V3.2 的 DSA + R1 的 GRPO，体现「累积式」研究范式。
          </li>
        </ol>
      </div>
    </section>
  );
}

function Tab<T extends string>({
  id,
  current,
  onClick,
  label,
  color,
}: {
  id: T;
  current: T;
  onClick: (id: T) => void;
  label: string;
  color: string;
}) {
  const isActive = current === id;
  return (
    <button
      onClick={() => onClick(id)}
      className="px-3 py-1.5 rounded-md text-xs border transition"
      style={{
        borderColor: isActive ? color : "var(--border)",
        background: isActive ? `${color}1A` : "transparent",
        color: isActive ? "#fff" : "var(--muted)",
      }}
    >
      {label}
    </button>
  );
}

function Hero({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5"
      style={{
        borderColor: `${color}55`,
        background: `linear-gradient(135deg, ${color}1A, transparent)`,
      }}
    >
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight" style={{ color }}>
        {value}
      </div>
    </motion.div>
  );
}
