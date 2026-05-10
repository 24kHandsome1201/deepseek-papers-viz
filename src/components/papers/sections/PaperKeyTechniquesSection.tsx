"use client";

import { motion } from "framer-motion";
import { BlockMath } from "react-katex";
import { Sparkles } from "lucide-react";
import type { KeyTechnique } from "@/data/papers";
import SectionHeader from "@/components/papers/SectionHeader";

interface Props {
  techniques: KeyTechnique[];
  teamColor: string;
}

export default function PaperKeyTechniquesSection({
  techniques,
  teamColor,
}: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Key Techniques"
        title="关键技术拆解"
        desc="把这篇论文相对前作真正改动的几处机制单独拎出来，标注「直觉」与「为什么重要」。"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {techniques.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5"
            style={{
              borderColor: `${teamColor}33`,
              background: `linear-gradient(135deg, ${teamColor}08, transparent), var(--panel)`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: `${teamColor}22`, color: teamColor }}
              >
                <Sparkles size={14} />
              </span>
              <div className="font-semibold text-base">{t.name}</div>
            </div>

            {t.formula && (
              <div className="rounded-md bg-black/40 border border-[var(--border)] px-3 py-2 mb-3 overflow-x-auto text-sm">
                <BlockMath math={t.formula} />
              </div>
            )}

            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
              直觉
            </div>
            <p className="text-sm leading-relaxed text-[var(--foreground)]/90 mb-3">
              {t.intuition}
            </p>

            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: teamColor }}
            >
              为什么重要
            </div>
            <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
              {t.why}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
