"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { BenchmarkPoint } from "@/data/papers";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Props {
  benchmarks: BenchmarkPoint[];
  teamColor: string;
  modelName: string;
}

export default function PaperBenchmarksSection({
  benchmarks,
  teamColor,
  modelName,
}: Props) {
  const hasBaseline = benchmarks.some((b) => b.baseline !== undefined);
  const radarBenches = benchmarks.slice(0, 8);
  const barBenches = benchmarks.filter((b) => b.baseline !== undefined);

  const radarOption = useMemo(() => {
    const baselineLabel =
      barBenches.find((b) => b.baselineModel)?.baselineModel ?? "Baseline";

    const series: Record<string, unknown>[] = [
      {
        type: "radar",
        emphasis: { lineStyle: { width: 3 } },
        data: [
          {
            value: radarBenches.map((b) => b.value),
            name: modelName,
            itemStyle: { color: teamColor },
            lineStyle: { color: teamColor, width: 2 },
            areaStyle: { color: teamColor, opacity: 0.18 },
          },
        ],
      },
    ];

    if (hasBaseline) {
      (series[0].data as Record<string, unknown>[]).push({
        value: radarBenches.map((b) => b.baseline ?? 0),
        name: baselineLabel,
        itemStyle: { color: "#94a3b8" },
        lineStyle: { color: "#94a3b8", width: 1.5, type: "dashed" },
        areaStyle: { color: "#94a3b8", opacity: 0.06 },
      });
    }

    return {
      tooltip: { trigger: "item" },
      legend: {
        data: hasBaseline ? [modelName, baselineLabel] : [modelName],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        bottom: 0,
        itemGap: 16,
      },
      radar: {
        indicator: radarBenches.map((b) => ({
          name: b.name,
          max: b.max ?? 100,
        })),
        shape: "polygon",
        splitNumber: 4,
        axisName: { color: "#cfd2e3", fontSize: 11 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        splitArea: {
          areaStyle: {
            color: ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.04)"],
          },
        },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      series,
    };
  }, [radarBenches, modelName, teamColor, hasBaseline, barBenches]);

  const barOption = useMemo(() => {
    const baselineLabel =
      barBenches.find((b) => b.baselineModel)?.baselineModel ?? "Baseline";
    return {
      grid: { left: 50, right: 30, top: 30, bottom: 30 },
      tooltip: { trigger: "axis" },
      legend: {
        data: [baselineLabel, modelName],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
        right: 0,
      },
      xAxis: {
        type: "category",
        data: barBenches.map((b) => b.name),
        axisLabel: { color: "#cfd2e3", fontSize: 11 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value",
        max: Math.max(...barBenches.map((b) => Math.max(b.value, b.baseline ?? 0))) <= 100 ? 100 : null,
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        {
          name: baselineLabel,
          type: "bar",
          data: barBenches.map((b) => b.baseline ?? 0),
          itemStyle: { color: "#94a3b8", borderRadius: [4, 4, 0, 0] },
          barWidth: 22,
        },
        {
          name: modelName,
          type: "bar",
          data: barBenches.map((b) => b.value),
          itemStyle: { color: teamColor, borderRadius: [4, 4, 0, 0] },
          barWidth: 22,
        },
      ],
    };
  }, [barBenches, modelName, teamColor]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Benchmarks"
        title="性能对标"
        desc={
          hasBaseline
            ? "雷达图给出能力轮廓，柱状图突出相对基线的提升幅度。"
            : "本论文公开报告的关键 benchmark 分数。"
        }
      />

      <div
        className={`grid gap-6 ${
          hasBaseline ? "lg:grid-cols-2" : "lg:grid-cols-1"
        }`}
      >
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            能力轮廓
          </div>
          <ReactECharts
            option={radarOption}
            style={{ height: 420 }}
            theme="dark"
          />
        </div>

        {hasBaseline && barBenches.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              相对基线提升
            </div>
            <ReactECharts option={barOption} style={{ height: 420 }} />
          </div>
        )}
      </div>
    </section>
  );
}
