"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ArrowRight, Box } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { paperById } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import { formatDate } from "@/lib/utils";

interface Props {
  paperId: string | null;
  onClose: () => void;
}

export default function PaperDrawer({ paperId, onClose }: Props) {
  const paper = paperId ? paperById(paperId) : null;
  const team = paper ? TEAMS[paper.team] : null;

  return (
    <AnimatePresence>
      {paper && team && (
        <motion.div
          key={paper.id}
          initial={{ x: 480, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 480, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="absolute inset-x-3 top-3 bottom-3 z-40 rounded-2xl border border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur-xl shadow-2xl flex flex-col scrollbar-thin overflow-hidden sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-[min(420px,calc(100%-2rem))]"
        >
          <div
            className="px-5 pt-5 pb-4 border-b border-[var(--border)]"
            style={{
              background: `linear-gradient(135deg, ${team.color}22, transparent)`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: team.color }}
                />
                <span>{team.name}</span>
                <span className="opacity-50">·</span>
                <span>{formatDate(paper.date)}</span>
                {paper.tier === "flagship" && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase tracking-wider">
                    Flagship
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-white/5 text-[var(--muted)] hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
            <h2 className="mt-3 text-lg font-semibold leading-snug">
              {paper.titleZh ?? paper.title}
            </h2>
            {paper.titleZh && (
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                {paper.title}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-5">
            <p className="text-sm leading-relaxed text-[var(--foreground)]/85">
              {paper.summary}
            </p>

            {paper.contributions.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                  核心贡献
                </div>
                <ul className="space-y-1.5">
                  {paper.contributions.map((c) => (
                    <li
                      key={c}
                      className="text-sm flex items-start gap-2 leading-snug"
                    >
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                        style={{ background: team.color }}
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {paper.metrics && paper.metrics.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                  关键指标
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {paper.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-[var(--border)] bg-[var(--panel-elev)] p-2.5"
                    >
                      <div className="text-[10px] text-[var(--muted)]">
                        {m.label}
                      </div>
                      <div className="text-sm font-medium mt-0.5">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {paper.arxiv && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://arxiv.org/abs/${paper.arxiv}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] hover:bg-white/5 transition"
                >
                  arXiv:{paper.arxiv}
                  <ExternalLink size={12} />
                </a>
              )}
              {paper.github && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://github.com/${paper.github}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] hover:bg-white/5 transition"
                >
                  <GithubIcon size={12} />
                  {paper.github}
                </a>
              )}
              {paper.hf && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://huggingface.co/${paper.hf}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] hover:bg-white/5 transition"
                >
                  <Box size={12} />
                  {paper.hf}
                </a>
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-[var(--border)]">
            <Link
              href={`/paper/${paper.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition"
              style={{
                background: paper.tier === "flagship" ? team.color : "rgba(255,255,255,0.06)",
                color: paper.tier === "flagship" ? "#fff" : "#e8eaf3",
              }}
            >
              {paper.tier === "flagship" ? "进入深度演示" : "查看详情"}
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
