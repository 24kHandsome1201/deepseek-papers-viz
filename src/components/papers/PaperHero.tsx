"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { Paper } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import { formatDate } from "@/lib/utils";

interface Props {
  paper: Paper;
  badge?: string;
}

export default function PaperHero({ paper, badge }: Props) {
  const team = TEAMS[paper.team];
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(900px 500px at 18% 5%, ${team.color}33, transparent 60%), radial-gradient(700px 400px at 82% 0%, ${team.accent}1f, transparent 60%), #08090f`,
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-white transition"
        >
          <ArrowLeft size={13} />
          返回图谱
        </Link>

        <div className="mt-7 flex items-center gap-2 text-xs text-[var(--muted)] flex-wrap">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: team.color }}
          />
          <span className="text-white">{team.name}</span>
          <span className="opacity-50">·</span>
          <span>{formatDate(paper.date)}</span>
          {badge && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
              style={{
                background: `${team.color}25`,
                color: team.color,
                border: `1px solid ${team.color}55`,
              }}
            >
              {badge}
            </span>
          )}
          {paper.tier === "flagship" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-white/10">
              Flagship
            </span>
          )}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-3 text-3xl md:text-5xl font-bold leading-tight tracking-tight"
        >
          {paper.titleZh ?? paper.title.split(":")[0]}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-2 text-sm md:text-base text-[var(--muted)] leading-snug"
        >
          {paper.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 max-w-2xl text-base text-[var(--foreground)]/85 leading-relaxed"
        >
          {paper.summary}
        </motion.p>

        <div className="mt-5 flex flex-wrap gap-2">
          {paper.arxiv && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://arxiv.org/abs/${paper.arxiv}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-white/5 transition text-xs"
            >
              arXiv:{paper.arxiv}
              <ExternalLink size={11} />
            </a>
          )}
          {paper.github && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://github.com/${paper.github}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-white/5 transition text-xs"
            >
              <GithubIcon size={11} />
              {paper.github}
            </a>
          )}
        </div>

        {paper.metrics && paper.metrics.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {paper.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/70 backdrop-blur p-4"
              >
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {m.label}
                </div>
                <div className="mt-1.5 text-xl font-semibold tracking-tight">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
