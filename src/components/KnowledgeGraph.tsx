"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PAPERS, Paper } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import { formatDate } from "@/lib/utils";

interface Props {
  activeTeams: Set<string>;
  onSelect: (paperId: string | null) => void;
  selectedId: string | null;
}

const TODAY = new Date("2026-05-08");
const ROW_H = 78;
const NODE_R_FLAGSHIP = 24;
const NODE_R = 9;
const NODE_R_STUB = 7;
const PADDING_L = 132;
const PADDING_R = 60;
const PADDING_T = 36;
const PADDING_B = 56;

export default function KnowledgeGraph({
  activeTeams,
  onSelect,
  selectedId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hover, setHover] = useState<{
    paper: Paper;
    cx: number;
    cy: number;
  } | null>(null);

  const layout = useMemo(() => {
    const visible = PAPERS.filter((p) => activeTeams.has(p.team));
    const teamIds = Array.from(activeTeams);
    const teamRow: Record<string, number> = {};
    teamIds.forEach((t, i) => (teamRow[t] = i));

    // X axis = date
    const allDates = visible.map((p) => +new Date(p.date));
    const minDate = Math.min(...allDates, +new Date("2024-01-01"));
    const maxDate = Math.max(...allDates, TODAY.getTime());

    const W = 1180;
    const H = teamIds.length * ROW_H + PADDING_T + PADDING_B;

    const xFor = (iso: string) => {
      const t = +new Date(iso);
      return (
        PADDING_L +
        ((t - minDate) / (maxDate - minDate)) * (W - PADDING_L - PADDING_R)
      );
    };
    const yFor = (team: string) =>
      PADDING_T + (teamRow[team] + 0.5) * ROW_H;

    // Year ticks
    const startYear = new Date(minDate).getFullYear();
    const endYear = new Date(maxDate).getFullYear();
    const yearTicks: { label: string; x: number }[] = [];
    for (let y = startYear; y <= endYear; y++) {
      // Q1 of each year + Q3
      const quarters = [`${y}-01-01`, `${y}-07-01`];
      quarters.forEach((q) => {
        const qt = +new Date(q);
        if (qt >= minDate && qt <= maxDate) {
          yearTicks.push({
            label:
              q.endsWith("01-01") ? `${y}` : `${y} H2`,
            x: xFor(q),
          });
        }
      });
    }

    // Today line
    const todayX = xFor(TODAY.toISOString().slice(0, 10));

    return {
      W,
      H,
      visible,
      teamIds,
      xFor,
      yFor,
      yearTicks,
      todayX,
    };
  }, [activeTeams]);

  const visibleIds = new Set(layout.visible.map((p) => p.id));

  // selected neighborhood
  const selectedPaper = selectedId
    ? PAPERS.find((p) => p.id === selectedId)
    : null;
  const neighborhood = useMemo(() => {
    if (!selectedPaper) return null;
    const ns = new Set<string>([selectedPaper.id]);
    selectedPaper.buildsOn.forEach((b) => ns.add(b));
    PAPERS.forEach((p) => {
      if (p.buildsOn.includes(selectedPaper.id)) ns.add(p.id);
    });
    return ns;
  }, [selectedPaper]);

  const isDimmed = (id: string) => {
    if (!neighborhood) return false;
    return !neighborhood.has(id);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-auto scrollbar-thin">
      <svg
        viewBox={`0 0 ${layout.W} ${layout.H}`}
        className="w-full"
        style={{ minWidth: 760, height: layout.H }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="flagshipGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={layout.W} height={layout.H} fill="url(#grid)" />

        {/* swim lane backgrounds */}
        {layout.teamIds.map((tid, i) => {
          const team = TEAMS[tid];
          return (
            <g key={tid}>
              <rect
                x={PADDING_L - 8}
                y={PADDING_T + i * ROW_H}
                width={layout.W - PADDING_L - PADDING_R + 16}
                height={ROW_H}
                fill={i % 2 === 0 ? "rgba(255,255,255,0.012)" : "transparent"}
              />
              {/* team label on the left */}
              <foreignObject
                x={8}
                y={PADDING_T + i * ROW_H + ROW_H / 2 - 16}
                width={PADDING_L - 16}
                height={32}
              >
                <div className="flex items-center gap-2 h-full">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: team.color }}
                  />
                  <div className="min-w-0">
                    <div
                      className="text-[12px] font-semibold leading-none truncate"
                      style={{ color: "#e8eaf3" }}
                    >
                      {team.name}
                    </div>
                    <div className="text-[9px] text-[var(--muted)] mt-0.5 truncate">
                      {team.org}
                    </div>
                  </div>
                </div>
              </foreignObject>
              {/* lane separator */}
              <line
                x1={PADDING_L - 8}
                x2={layout.W - PADDING_R}
                y1={PADDING_T + (i + 1) * ROW_H}
                y2={PADDING_T + (i + 1) * ROW_H}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* year axis */}
        <line
          x1={PADDING_L}
          x2={layout.W - PADDING_R}
          y1={layout.H - PADDING_B + 14}
          y2={layout.H - PADDING_B + 14}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        {layout.yearTicks.map((t) => (
          <g key={t.label}>
            <line
              x1={t.x}
              x2={t.x}
              y1={PADDING_T - 8}
              y2={layout.H - PADDING_B + 14}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={t.x}
              y={layout.H - PADDING_B + 30}
              textAnchor="middle"
              className="text-[10px] fill-[var(--muted)] font-mono"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* today line */}
        <line
          x1={layout.todayX}
          x2={layout.todayX}
          y1={PADDING_T - 8}
          y2={layout.H - PADDING_B + 14}
          stroke="rgba(52, 211, 153, 0.5)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
        <text
          x={layout.todayX + 4}
          y={PADDING_T - 12}
          className="text-[10px] fill-emerald-400 font-mono"
        >
          NOW
        </text>

        {/* edges */}
        {layout.visible.map((p) =>
          p.buildsOn
            .filter((b) => visibleIds.has(b))
            .map((b) => {
              const src = PAPERS.find((x) => x.id === b)!;
              const x1 = layout.xFor(src.date);
              const y1 = layout.yFor(src.team);
              const x2 = layout.xFor(p.date);
              const y2 = layout.yFor(p.team);
              const team = TEAMS[p.team];
              const isHi =
                neighborhood &&
                neighborhood.has(p.id) &&
                neighborhood.has(b);
              const isDim = neighborhood && !isHi;
              const cx = (x1 + x2) / 2;
              const cy = (y1 + y2) / 2 - 18;
              return (
                <path
                  key={`${b}->${p.id}`}
                  d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                  fill="none"
                  stroke={team.color}
                  strokeOpacity={isDim ? 0.06 : isHi ? 0.95 : 0.35}
                  strokeWidth={isHi ? 2.5 : 1.5}
                />
              );
            })
        )}

        {/* nodes */}
        {layout.visible.map((p) => {
          const team = TEAMS[p.team];
          const cx = layout.xFor(p.date);
          const cy = layout.yFor(p.team);
          const isFlagship = p.tier === "flagship";
          const r = isFlagship
            ? NODE_R_FLAGSHIP
            : p.tier === "stub"
              ? NODE_R_STUB
              : NODE_R;
          const days =
            (TODAY.getTime() - +new Date(p.date)) / 86400000;
          const isFresh = days < 90;
          const dim = isDimmed(p.id);
          const sel = selectedId === p.id;

          return (
            <g
              key={p.id}
              opacity={dim ? 0.18 : 1}
              style={{ cursor: "pointer", transition: "opacity 220ms" }}
              onMouseEnter={() => setHover({ paper: p, cx, cy })}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(p.id);
              }}
              onDoubleClick={() => router.push(`/paper/${p.id}`)}
            >
              {/* fresh pulse */}
              {isFresh && !dim && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 4}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="1.5"
                  opacity="0.55"
                  className="origin-center"
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    animation: "pulseRing 2.2s ease-out infinite",
                  }}
                />
              )}
              {/* flagship halo */}
              {isFlagship && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 14}
                  fill="url(#flagshipGlow)"
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={team.color}
                stroke={sel ? "#ffffff" : team.accent}
                strokeWidth={sel ? 3 : isFlagship ? 3 : 1.5}
                strokeOpacity={sel ? 1 : 0.6}
              />

              {/* flagship inner star */}
              {isFlagship && (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  className="fill-white"
                  style={{ fontSize: 14, fontWeight: 700 }}
                >
                  ★
                </text>
              )}

              {/* label */}
              <text
                x={cx}
                y={cy + r + 14}
                textAnchor="middle"
                className="fill-[var(--foreground)]"
                style={{
                  fontSize: isFlagship ? 12 : 10,
                  fontWeight: isFlagship ? 600 : 400,
                  pointerEvents: "none",
                }}
              >
                <ShortLabel text={p.titleZh ?? p.title.split(":")[0]} flagship={isFlagship} />
              </text>
            </g>
          );
        })}
      </svg>

      {hover && (
        <HoverCard
          paper={hover.paper}
          cx={hover.cx}
          cy={hover.cy}
          containerWidth={layout.W}
        />
      )}

      <style jsx>{`
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          80% {
            transform: scale(1.8);
            opacity: 0;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function ShortLabel({ text, flagship }: { text: string; flagship: boolean }) {
  const limit = flagship ? 24 : 16;
  return text.length > limit ? text.slice(0, limit - 1) + "…" : text;
}

function HoverCard({
  paper,
  cx,
  cy,
  containerWidth,
}: {
  paper: Paper;
  cx: number;
  cy: number;
  containerWidth: number;
}) {
  const team = TEAMS[paper.team];
  const flipLeft = cx > containerWidth - 320;
  const left = (cx / containerWidth) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        left: `${left}%`,
        top: cy,
        transform: `translate(${flipLeft ? "calc(-100% - 24px)" : "24px"}, -50%)`,
      }}
      className="pointer-events-none z-30 max-w-[320px] rounded-xl border border-[var(--border)] bg-[var(--panel-elev)]/95 backdrop-blur-md px-3 py-2 shadow-2xl"
    >
      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: team.color }}
        />
        {team.name} · {formatDate(paper.date)}
        {paper.tier === "flagship" && (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-white/10 text-[9px] uppercase tracking-wider">
            Flagship
          </span>
        )}
      </div>
      <div className="text-sm font-medium mt-1 leading-snug">
        {paper.titleZh ?? paper.title}
      </div>
      {paper.contributions.length > 0 && (
        <div className="mt-1.5 text-[11px] text-[var(--muted)] leading-relaxed">
          {paper.contributions.slice(0, 3).join(" · ")}
        </div>
      )}
      <div className="mt-2 text-[10px] text-[var(--muted)] opacity-80">
        单击聚焦 · 双击进入详情
      </div>
    </motion.div>
  );
}
