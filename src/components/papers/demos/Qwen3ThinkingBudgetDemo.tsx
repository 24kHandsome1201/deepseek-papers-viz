"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/papers/SectionHeader";
import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Task {
  id: string;
  name: string;
  // empirically inspired curve params: y = baseline + delta * (1 - exp(-budget / tau))
  baseline: number;
  delta: number;
  tau: number;
  desc: string;
}

const TASKS: Task[] = [
  {
    id: "aime",
    name: "AIME 2024",
    baseline: 28,
    delta: 58,
    tau: 4500,
    desc: "数学竞赛,长链推理获益明显",
  },
  {
    id: "gpqa",
    name: "GPQA Diamond",
    baseline: 41,
    delta: 30,
    tau: 3500,
    desc: "研究生级科学题,中等收益",
  },
  {
    id: "mmlu",
    name: "MMLU-Redux",
    baseline: 84,
    delta: 6,
    tau: 1500,
    desc: "通用知识,thinking 收益小",
  },
  {
    id: "ifeval",
    name: "IFEval",
    baseline: 86,
    delta: -2,
    tau: 800,
    desc: "指令跟随,过度思考反而下降",
  },
];

function curve(budget: number, t: Task) {
  return t.baseline + t.delta * (1 - Math.exp(-budget / t.tau));
}

export default function Qwen3ThinkingBudgetDemo() {
  const [budget, setBudget] = useState(8000);
  const isThinking = budget > 0;

  const chartOption = useMemo(() => {
    const xs: number[] = [];
    for (let b = 0; b <= 16000; b += 250) xs.push(b);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: { axisValue: string; seriesName: string; value: number }[]) => {
          const b = parseInt(params[0].axisValue);
          const lines = [
            `<div style="font-size:11px;color:#8b90a8">budget = ${b} tokens</div>`,
          ];
          params.forEach((p) => {
            lines.push(
              `<div style="font-size:11px"><b>${p.seriesName}</b>: ${p.value.toFixed(1)}</div>`
            );
          });
          return lines.join("");
        },
      },
      legend: {
        data: TASKS.map((t) => t.name),
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 50, right: 24, top: 40, bottom: 50 },
      xAxis: {
        type: "category",
        data: xs,
        name: "Thinking Budget (tokens)",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: "#8b90a8", fontSize: 11 },
        axisLabel: {
          color: "#8b90a8",
          fontSize: 10,
          interval: 7,
        },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        name: "Score",
        min: 0,
        max: 100,
        nameTextStyle: { color: "#8b90a8", fontSize: 10 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        ...TASKS.map((t, i) => ({
          name: t.name,
          type: "line" as const,
          showSymbol: false,
          smooth: true,
          data: xs.map((b) => +curve(b, t).toFixed(2)),
          lineStyle: {
            width: 2.5,
            color: ["#615CED", "#34D399", "#F59E0B", "#F472B6"][i],
          },
          itemStyle: {
            color: ["#615CED", "#34D399", "#F59E0B", "#F472B6"][i],
          },
        })),
        // marker for current budget
        {
          type: "line",
          markLine: {
            silent: true,
            symbol: "none",
            label: { show: false },
            lineStyle: { color: "#fff", type: "dashed", width: 1 },
            data: [{ xAxis: budget }],
          },
          data: [],
        },
      ],
    };
  }, [budget]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Qwen3 · Hybrid Thinking"
        title="Thinking Budget:推理时按 token 预算调度"
        desc="Qwen3 把 chat 与 reasoning 模型合二为一:同一个权重通过 chat template 切换 thinking / non-thinking;并新增 thinking budget,让你在推理时实时分配 token,延迟可控。下方拖动滑块看四类基准随预算的变化。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              <span>Thinking Budget</span>
              <span className="text-white font-mono">
                {budget.toLocaleString()} tok
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={16000}
              step={250}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full accent-[#615CED]"
            />
            <div className="flex justify-between text-[9px] text-[var(--muted)] mt-1 font-mono">
              <span>0 (Non-Thinking)</span>
              <span>16K</span>
            </div>
          </div>

          <motion.div
            key={isThinking ? "think" : "fast"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border p-5"
            style={{
              borderColor: isThinking ? "#615CED55" : "#34D39955",
              background: isThinking
                ? "linear-gradient(135deg, #615CED15, transparent)"
                : "linear-gradient(135deg, #34D39915, transparent)",
            }}
          >
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              {isThinking ? (
                <Brain size={14} className="text-[#615CED]" />
              ) : (
                <Zap size={14} className="text-[#34D399]" />
              )}
              当前模式
            </div>
            <div className="mt-1 text-base font-semibold text-white">
              {isThinking ? "Thinking Mode" : "Non-Thinking Mode"}
            </div>
            <div className="mt-2 text-[11px] text-[var(--muted)] leading-relaxed">
              {isThinking
                ? "模型在 <think>...</think> 内做长链推理,然后给最终答案;延迟随 budget 增长。"
                : "直接给答案,无 <think> 块,延迟最低,适合一般对话与指令跟随。"}
            </div>
          </motion.div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed text-[var(--muted)]">
            <span className="text-white font-medium">观察:</span>
            <span className="text-white"> AIME 与 GPQA</span> 受益于更高 budget,
            <span className="text-white"> MMLU</span> 增益小,而
            <span className="text-white"> IFEval</span>(指令跟随)在过高 budget
            下反而轻微下滑——这是 hybrid thinking 模型的典型 trade-off。
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <ReactECharts
            option={chartOption}
            style={{ height: 380 }}
            notMerge
          />
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {TASKS.map((t, i) => {
              const score = curve(budget, t);
              return (
                <div
                  key={t.id}
                  className="rounded-lg border border-[var(--border)] bg-white/[0.02] px-3 py-2"
                >
                  <div
                    className="text-[10px] uppercase tracking-wider"
                    style={{
                      color: ["#615CED", "#34D399", "#F59E0B", "#F472B6"][i],
                    }}
                  >
                    {t.name}
                  </div>
                  <div className="mt-0.5 text-lg font-mono font-semibold text-white">
                    {score.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
