"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { paperById } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import { formatDate } from "@/lib/utils";

export default function R1Hero() {
  const paper = paperById("deepseek-r1")!;
  const team = TEAMS[paper.team];

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(900px 500px at 20% 10%, ${team.color}33, transparent 60%),
            radial-gradient(700px 400px at 80% 0%, #7B5CFF22, transparent 60%),
            #08090f
          `,
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-[0.05]" style={{
        backgroundImage:
          "linear-gradient(0deg, white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="max-w-6xl mx-auto px-6 pt-6 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-white transition"
        >
          <ArrowLeft size={13} />
          返回图谱
        </Link>

        <div className="mt-8 flex items-center gap-2 text-xs text-[var(--muted)]">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: team.color }}
          />
          <span className="text-white">{team.name}</span>
          <span className="opacity-50">·</span>
          <span>{formatDate(paper.date)}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-white/10">
            Flagship · 深度演示
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-4 text-4xl md:text-5xl font-bold leading-tight tracking-tight"
        >
          DeepSeek-R1
          <span className="block mt-2 text-lg md:text-xl font-normal text-[var(--muted)] leading-snug">
            Incentivizing Reasoning Capability in LLMs via Reinforcement Learning
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 max-w-2xl text-base text-[var(--foreground)]/80 leading-relaxed"
        >
          R1 证明了一个反直觉的事实：在足够强的预训练模型上，<b className="text-white">仅使用规则奖励 + GRPO 强化学习</b>，
          模型就能自发涌现「反思 / 回溯 / 验证」等长链推理行为，无需任何思维链 SFT 数据。
          R1 进一步把这种能力蒸馏到 1.5B–70B 的小模型中，全面对齐甚至超越 OpenAI o1。
        </motion.p>

        <div className="mt-6 flex flex-wrap gap-3">
          {paper.arxiv && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://arxiv.org/abs/${paper.arxiv}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-white/5 transition"
            >
              arXiv:{paper.arxiv}
              <ExternalLink size={13} />
            </a>
          )}
          {paper.github && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://github.com/${paper.github}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-white/5 transition"
            >
              <GithubIcon size={13} />
              {paper.github}
            </a>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {paper.metrics?.map((m) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/70 backdrop-blur p-4"
            >
              <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                {m.label}
              </div>
              <div className="mt-1.5 text-2xl font-semibold tracking-tight">
                {m.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
