"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import type { Insight } from "@/data/papers";
import SectionHeader from "@/components/papers/SectionHeader";

interface Props {
  insights: Insight[];
  teamColor: string;
}

export default function PaperInsightsSection({ insights, teamColor }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Key Insights"
        title="关键洞察"
        desc="论文中那些「值得记下来的非显然事实」——通常是设计哲学、反直觉发现或行业级影响。"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((it, i) => (
          <motion.figure
            key={it.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="relative rounded-2xl p-5 border"
            style={{
              borderColor: `${teamColor}40`,
              background: `linear-gradient(135deg, ${teamColor}15, transparent)`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: `${teamColor}33`, color: teamColor }}
              >
                <Lightbulb size={14} />
              </span>
              <figcaption className="text-sm font-semibold">
                {it.title}
              </figcaption>
            </div>
            <blockquote className="text-sm leading-relaxed text-[var(--foreground)]/85">
              {it.body}
            </blockquote>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
