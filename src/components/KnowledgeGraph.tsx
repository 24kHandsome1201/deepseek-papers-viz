"use client";

import { useMemo, useState } from "react";
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

const TODAY = new Date("2026-05-09");
const ROW_H = 130;
const NODE_R_FLAGSHIP = 22;
const NODE_R = 8;
const NODE_R_STUB = 7;
const PADDING_L = 156;
const PADDING_R = 80;
const PADDING_T = 44;
const PADDING_B = 64;
const W = 1680;
const COLLISION_PX = 80;
const SLOT_OFFSETS = [0, -34, 34, -68, 68]; // px from row center

interface NodePos {
  paper: Paper;
  cx: number;
  cy: number;
  slot: number;
  labelBelow: boolean;
}

export default function KnowledgeGraph({
  activeTeams,
  onSelect,
  selectedId,
}: Props) {
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
    const span = maxDate - minDate || 1;

    const H = teamIds.length * ROW_H + PADDING_T + PADDING_B;

    const xFor = (iso: string) => {
      const t = +new Date(iso);
      return (
        PADDING_L + ((t - minDate) / span) * (W - PADDING_L - PADDING_R)
      );
    };
    const teamCenterY = (team: string) =>
      PADDING_T + (teamRow[team] + 0.5) * ROW_H;

    // Compute node positions with collision avoidance per team
    const positions = new Map<string, NodePos>();
    for (const tid of teamIds) {
      const teamPapers = visible
        .filter((p) => p.team === tid)
        .sort((a, b) => +new Date(a.date) - +new Date(b.date));
      // walk through and assign slots based on x distance to previous
      const placed: NodePos[] = [];
      for (const p of teamPapers) {
        const cx = xFor(p.date);
        // pick smallest slot whose nearest previous-slot neighbor is far enough
        let chosen = 0;
        for (let s = 0; s < SLOT_OFFSETS.length; s++) {
          const ok = placed.every(
            (q) =>
              q.slot !== s ||
              Math.abs(q.cx - cx) >= COLLISION_PX
          );
          if (ok) {
            chosen = s;
            break;
          }
        }
        const cy = teamCenterY(tid) + SLOT_OFFSETS[chosen];
        const labelBelow = SLOT_OFFSETS[chosen] <= 0; // above-center → label below
        const pos: NodePos = { paper: p, cx, cy, slot: chosen, labelBelow };
        placed.push(pos);
        positions.set(p.id, pos);
      }
    }

    // Year ticks
    const startYear = new Date(minDate).getFullYear();
    const endYear = new Date(maxDate).getFullYear();
    const yearTicks: { label: string; x: number; major: boolean }[] = [];
    for (let y = startYear; y <= endYear + 1; y++) {
      for (const m of [1, 4, 7, 10]) {
        const q = `${y}-${String(m).padStart(2, "0")}-01`;
        const qt = +new Date(q);
        if (qt >= minDate && qt <= maxDate + 1000 * 60 * 60 * 24 * 30) {
          yearTicks.push({
            label: m === 1 ? `${y}` : `${m === 4 ? "Q2" : m === 7 ? "Q3" : "Q4"}`,
            x: xFor(q),
            major: m === 1,
          });
        }
      }
    }

    const todayX = xFor(TODAY.toISOString().slice(0, 10));

    return {
      W,
      H,
      visible,
      teamIds,
      xFor,
      teamCenterY,
      yearTicks,
      todayX,
      positions,
    };
  }, [activeTeams]);

  const visibleIds = new Set(layout.visible.map((p) => p.id));

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
    <div className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-thin">
      <svg
        viewBox={`0 0 ${layout.W} ${layout.H}`}
        width={layout.W}
        height={layout.H}
        preserveAspectRatio="xMinYMin meet"
        style={{ maxWidth: "none", display: "block" }}
        className="select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="flagshipGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.22" />
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
                x={PADDING_L - 12}
                y={PADDING_T + i * ROW_H}
                width={layout.W - PADDING_L - PADDING_R + 24}
                height={ROW_H}
                fill={i % 2 === 0 ? "rgba(255,255,255,0.014)" : "transparent"}
              />
              <foreignObject
                x={10}
                y={PADDING_T + i * ROW_H + ROW_H / 2 - 18}
                width={PADDING_L - 22}
                height={36}
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
              <line
                x1={PADDING_L - 12}
                x2={layout.W - PADDING_R}
                y1={PADDING_T + (i + 1) * ROW_H}
                y2={PADDING_T + (i + 1) * ROW_H}
                stroke="rgba(255,255,255,0.05)"
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
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        {layout.yearTicks.map((t, i) => (
          <g key={`${t.label}-${i}`}>
            <line
              x1={t.x}
              x2={t.x}
              y1={PADDING_T - 8}
              y2={layout.H - PADDING_B + 14}
              stroke={
                t.major ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"
              }
              strokeWidth="1"
              strokeDasharray={t.major ? "0" : "3 4"}
            />
            <text
              x={t.x}
              y={layout.H - PADDING_B + 32}
              textAnchor="middle"
              className={t.major ? "fill-white" : "fill-[var(--muted)]"}
              style={{
                fontSize: t.major ? 12 : 9,
                fontWeight: t.major ? 600 : 400,
                fontFamily: "var(--font-geist-mono)",
              }}
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
          stroke="rgba(52, 211, 153, 0.55)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
        <text
          x={layout.todayX + 6}
          y={PADDING_T - 12}
          className="fill-emerald-400"
          style={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
        >
          NOW
        </text>

        {/* edges */}
        {layout.visible.map((p) =>
          p.buildsOn
            .filter((b) => visibleIds.has(b))
            .map((b) => {
              const srcPos = layout.positions.get(b);
              const tgtPos = layout.positions.get(p.id);
              if (!srcPos || !tgtPos) return null;
              const team = TEAMS[p.team];
              const isHi =
                neighborhood &&
                neighborhood.has(p.id) &&
                neighborhood.has(b);
              const isDim = neighborhood && !isHi;
              const cx = (srcPos.cx + tgtPos.cx) / 2;
              const cy = (srcPos.cy + tgtPos.cy) / 2 - 22;
              return (
                <path
                  key={`${b}->${p.id}`}
                  d={`M ${srcPos.cx} ${srcPos.cy} Q ${cx} ${cy} ${tgtPos.cx} ${tgtPos.cy}`}
                  fill="none"
                  stroke={team.color}
                  strokeOpacity={isDim ? 0.05 : isHi ? 0.95 : 0.32}
                  strokeWidth={isHi ? 2.5 : 1.4}
                />
              );
            })
        )}

        {/* nodes */}
        {layout.visible.map((p) => {
          const pos = layout.positions.get(p.id);
          if (!pos) return null;
          const team = TEAMS[p.team];
          const cx = pos.cx;
          const cy = pos.cy;
          const isFlagship = p.tier === "flagship";
          const r = isFlagship
            ? NODE_R_FLAGSHIP
            : p.tier === "stub"
              ? NODE_R_STUB
              : NODE_R;
          const days = (TODAY.getTime() - +new Date(p.date)) / 86400000;
          const isFresh = days < 90;
          const dim = isDimmed(p.id);
          const sel = selectedId === p.id;
          const labelY = pos.labelBelow ? cy + r + 14 : cy - r - 8;
          const labelText = p.titleZh ?? p.title.split(":")[0];
          const limit = isFlagship ? 22 : 14;
          const shortLabel =
            labelText.length > limit
              ? labelText.slice(0, limit - 1) + "…"
              : labelText;

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
              {isFresh && !dim && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 4}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="1.5"
                  opacity="0.6"
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    animation: "pulseRing 2.2s ease-out infinite",
                  }}
                />
              )}
              {isFlagship && (
                <circle cx={cx} cy={cy} r={r + 16} fill="url(#flagshipGlow)" />
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
              {isFlagship && (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  className="fill-white"
                  style={{ fontSize: 13, fontWeight: 700 }}
                >
                  ★
                </text>
              )}
              {/* label background pill for readability */}
              {!dim && (
                <text
                  x={cx}
                  y={labelY}
                  textAnchor="middle"
                  className="fill-[var(--foreground)]"
                  style={{
                    fontSize: isFlagship ? 11.5 : 10,
                    fontWeight: isFlagship ? 600 : 400,
                    pointerEvents: "none",
                    paintOrder: "stroke",
                    stroke: "#08090f",
                    strokeWidth: 3,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                  }}
                >
                  {shortLabel}
                </text>
              )}
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
          containerHeight={layout.H}
        />
      )}

      <style jsx>{`
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          80% {
            transform: scale(1.9);
            opacity: 0;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function HoverCard({
  paper,
  cx,
  cy,
  containerWidth,
  containerHeight,
}: {
  paper: Paper;
  cx: number;
  cy: number;
  containerWidth: number;
  containerHeight: number;
}) {
  const team = TEAMS[paper.team];
  const flipLeft = cx > containerWidth - 360;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        left: `${(cx / containerWidth) * 100}%`,
        top: `${(cy / containerHeight) * 100}%`,
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
