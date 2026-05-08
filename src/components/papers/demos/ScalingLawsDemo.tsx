"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/papers/SectionHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Chinchilla:  N* ≈ G · C^a,  D* ≈ G' · C^b   (a≈b≈0.5)
// DeepSeek-LLM (recalibrated): a ≈ 0.524, b ≈ 0.476 — slightly favor data over params
const CHINCHILLA = { aN: 0.5, aD: 0.5, kN: 0.6, kD: 20 / 0.6 };
const DEEPSEEK = { aN: 0.524, aD: 0.476, kN: 0.45, kD: 35 / 0.45 };

function optimal(C: number, law: typeof CHINCHILLA) {
  const N = law.kN * Math.pow(C, law.aN);
  const D = law.kD * Math.pow(C, law.aD);
  return { N, D, tokenPerParam: D / N };
}

function fmtParams(N: number) {
  if (N >= 1e12) return `${(N / 1e12).toFixed(2)}T`;
  if (N >= 1e9) return `${(N / 1e9).toFixed(2)}B`;
  if (N >= 1e6) return `${(N / 1e6).toFixed(2)}M`;
  return N.toFixed(0);
}

export default function ScalingLawsDemo() {
  // logC range: 18 → 25 (FLOPs from ~1e18 to ~3e25)
  const [logC, setLogC] = useState(22.5); // ≈ 3e22
  const C0 = Math.pow(10, logC);

  const ch = optimal(C0, CHINCHILLA);
  const ds = optimal(C0, DEEPSEEK);

  const chartOption = useMemo(() => {
    const xs: number[] = [];
    const cN: number[] = [];
    const cD: number[] = [];
    const dN: number[] = [];
    const dD: number[] = [];
    for (let lc = 18; lc <= 25.2; lc += 0.1) {
      const cc = Math.pow(10, lc);
      xs.push(parseFloat(lc.toFixed(2)));
      cN.push(optimal(cc, CHINCHILLA).N);
      cD.push(optimal(cc, CHINCHILLA).D);
      dN.push(optimal(cc, DEEPSEEK).N);
      dD.push(optimal(cc, DEEPSEEK).D);
    }
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: { axisValue: string; seriesName: string; value: number }[]) => {
          const lc = parseFloat(params[0].axisValue);
          const lines = [`<div style="font-size:11px;color:#8b90a8">C = 10<sup>${lc.toFixed(1)}</sup> FLOPs</div>`];
          params.forEach((p) => {
            const v = p.value;
            const name = p.seriesName;
            const isParam = name.includes("N");
            lines.push(
              `<div style="font-size:11px"><b>${name}</b>: ${isParam ? fmtParams(v) : v.toExponential(2) + " tok"}</div>`
            );
          });
          return lines.join("");
        },
      },
      legend: {
        data: ["Chinchilla N*", "DeepSeek N*", "Chinchilla D*", "DeepSeek D*"],
        textStyle: { color: "#cfd2e3", fontSize: 11 },
        top: 0,
      },
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      xAxis: {
        type: "category",
        data: xs.map((x) => x.toFixed(1)),
        name: "log₁₀(C)  [FLOPs]",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: "#8b90a8", fontSize: 11 },
        axisLabel: { color: "#8b90a8", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: [
        {
          type: "log",
          name: "N (params)",
          nameTextStyle: { color: "#8b90a8", fontSize: 10 },
          axisLabel: {
            color: "#8b90a8",
            fontSize: 10,
            formatter: (v: number) => fmtParams(v),
          },
          splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
        },
        {
          type: "log",
          name: "D (tokens)",
          nameTextStyle: { color: "#8b90a8", fontSize: 10 },
          axisLabel: {
            color: "#8b90a8",
            fontSize: 10,
            formatter: (v: number) => v.toExponential(0),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Chinchilla N*",
          type: "line",
          showSymbol: false,
          data: cN,
          lineStyle: { color: "#F59E0B", width: 2, type: "dashed" },
          itemStyle: { color: "#F59E0B" },
          yAxisIndex: 0,
        },
        {
          name: "DeepSeek N*",
          type: "line",
          showSymbol: false,
          data: dN,
          lineStyle: { color: "#4D6BFE", width: 3 },
          itemStyle: { color: "#4D6BFE" },
          yAxisIndex: 0,
        },
        {
          name: "Chinchilla D*",
          type: "line",
          showSymbol: false,
          data: cD,
          lineStyle: { color: "#A78BFA", width: 2, type: "dashed" },
          itemStyle: { color: "#A78BFA" },
          yAxisIndex: 1,
        },
        {
          name: "DeepSeek D*",
          type: "line",
          showSymbol: false,
          data: dD,
          lineStyle: { color: "#34D399", width: 3 },
          itemStyle: { color: "#34D399" },
          yAxisIndex: 1,
        },
        // current point
        {
          type: "scatter",
          symbolSize: 14,
          data: [{ value: [logC.toFixed(1), ds.N], itemStyle: { color: "#fff" } }],
          yAxisIndex: 0,
          tooltip: { show: false },
          z: 10,
        },
      ],
    };
  }, [logC, ds.N]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Core Insight"
        title="Scaling Laws 重新校准"
        desc="DeepSeek-LLM 在中文 + 英文混合数据上拟合发现：与 Chinchilla 略有差异——参数量应略多增长（α≈0.524），数据应略缓增长（β≈0.476）。下方曲线随你调整训练算力 C 实时变化。"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <ReactECharts option={chartOption} style={{ height: 380 }} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              <span>训练算力 C</span>
              <span className="text-white font-mono">
                10<sup>{logC.toFixed(1)}</sup>
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={25}
              step={0.1}
              value={logC}
              onChange={(e) => setLogC(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[9px] text-[var(--muted)] mt-1 font-mono">
              <span>1e18</span>
              <span>1e22 (V1)</span>
              <span>1e25 (V3)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              当前算力下最优配置
            </div>
            <CompareRow
              label="N* (参数)"
              chinchilla={fmtParams(ch.N)}
              deepseek={fmtParams(ds.N)}
            />
            <CompareRow
              label="D* (tokens)"
              chinchilla={ch.D.toExponential(2)}
              deepseek={ds.D.toExponential(2)}
            />
            <CompareRow
              label="D / N"
              chinchilla={`${ch.tokenPerParam.toFixed(1)}×`}
              deepseek={`${ds.tokenPerParam.toFixed(1)}×`}
            />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elev)] p-4 text-xs leading-relaxed text-[var(--muted)]">
            <span className="text-white font-medium">关键观察：</span>
            DeepSeek 的拟合在大算力区间下，倾向<span className="text-white">略大模型 + 略多 token</span>，
            但「token / param 比」明显高于 Chinchilla 的 20:1。这一发现指导了 V1 / V2 / V3 的尺寸选择。
          </div>
        </div>
      </div>
    </section>
  );
}

function CompareRow({
  label,
  chinchilla,
  deepseek,
}: {
  label: string;
  chinchilla: string;
  deepseek: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-[var(--muted)]">{label}</div>
      <div className="grid grid-cols-2 gap-2 mt-0.5">
        <div className="rounded-md border border-[var(--border)] bg-white/[0.02] px-2 py-1.5">
          <div className="text-[9px] text-[#F59E0B]">Chinchilla</div>
          <div className="text-sm font-mono">{chinchilla}</div>
        </div>
        <div className="rounded-md border border-[#4D6BFE]/40 bg-[#4D6BFE]/10 px-2 py-1.5">
          <div className="text-[9px] text-[#4D6BFE]">DeepSeek</div>
          <div className="text-sm font-mono text-white">{deepseek}</div>
        </div>
      </div>
    </div>
  );
}
