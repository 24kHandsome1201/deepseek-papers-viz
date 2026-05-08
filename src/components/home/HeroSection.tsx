"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PAPERS } from "@/data/papers";
import { TEAMS } from "@/data/teams";

export default function HeroSection() {
  const flagships = PAPERS.filter((p) => p.tier === "flagship").length;
  const teamCount = Object.keys(TEAMS).length;
  const totalPapers = PAPERS.length;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 glow-bg" />
      <div className="absolute inset-0 -z-10 opacity-[0.035]" style={{
        backgroundImage:
          "linear-gradient(0deg, white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--panel)]/60 backdrop-blur text-[11px] text-[var(--muted)]"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          截至 2026 年 5 月 · 持续更新
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]"
        >
          中国开源大模型
          <span className="block bg-gradient-to-r from-[#4D6BFE] via-[#8E89FF] to-[#E879F9] bg-clip-text text-transparent">
            论文知识图谱
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-5 text-base md:text-lg text-[var(--foreground)]/80 leading-relaxed max-w-3xl"
        >
          以 DeepSeek 主线为脉络，串联 Qwen / Kimi / GLM / 智谱 / 面壁等团队的开源工作。
          每个节点都是一篇论文，每条连线都是一次技术继承。
          <span className="text-white"> 双击任一节点</span>即可进入详情页，
          <span className="text-white">DeepSeek-R1 提供完整可玩的交互演示</span>。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="/paper/deepseek-r1"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#4D6BFE] to-[#7B5CFF] hover:brightness-110 shadow-lg shadow-[#4D6BFE]/30 transition"
          >
            <Sparkles size={15} />
            进入 DeepSeek-R1 深度演示
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#graph"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-white/5 transition"
          >
            浏览图谱
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 grid grid-cols-3 gap-4 max-w-md"
        >
          <Stat label="论文" value={String(totalPapers)} />
          <Stat label="团队" value={String(teamCount)} />
          <Stat label="旗舰节点" value={String(flagships)} />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mt-0.5">
        {label}
      </div>
    </div>
  );
}
