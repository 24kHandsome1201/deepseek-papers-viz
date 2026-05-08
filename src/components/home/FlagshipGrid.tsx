"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { PAPERS } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import { formatDate } from "@/lib/utils";

export default function FlagshipGrid() {
  const flagships = PAPERS.filter((p) => p.tier === "flagship").sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

  return (
    <section className="max-w-[1480px] mx-auto px-4 sm:px-6 py-14">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          <Star size={12} />
          Flagship
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          旗舰论文
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          各团队最具代表性的工作，单击进入详情；
          <Link href="/paper/deepseek-r1" className="text-white underline-offset-2 hover:underline">
            DeepSeek-R1
          </Link>{" "}
          有完整可玩的交互演示。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flagships.map((p, i) => {
          const team = TEAMS[p.team];
          const isR1 = p.id === "deepseek-r1";
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Link
                href={`/paper/${p.id}`}
                className="group block relative h-full rounded-2xl border bg-[var(--panel)] p-5 hover:bg-[var(--panel-elev)] transition overflow-hidden"
                style={{
                  borderColor: `${team.color}40`,
                }}
              >
                <div
                  className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-30 transition group-hover:opacity-50"
                  style={{ background: team.color }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: team.color }}
                      />
                      <span className="text-white">{team.name}</span>
                      <span className="text-[var(--muted)] opacity-50 mx-1">·</span>
                      <span className="text-[var(--muted)]">{formatDate(p.date)}</span>
                    </div>
                    {isR1 ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-gradient-to-r from-[#4D6BFE] to-[#7B5CFF] text-white">
                        Deep Demo
                      </span>
                    ) : (
                      <ArrowUpRight
                        size={16}
                        className="text-[var(--muted)] group-hover:text-white transition"
                      />
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-semibold leading-snug">
                    {p.titleZh ?? p.title.split(":")[0]}
                  </h3>
                  <p className="mt-2 text-xs text-[var(--foreground)]/70 leading-relaxed line-clamp-3">
                    {p.summary}
                  </p>

                  {p.contributions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.contributions.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 text-[10px] rounded-full border border-[var(--border)] bg-white/[0.02] text-[var(--foreground)]/70"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.metrics && p.metrics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-x-4 gap-y-2">
                      {p.metrics.slice(0, 4).map((m) => (
                        <div key={m.label}>
                          <div className="text-[9px] uppercase tracking-wider text-[var(--muted)]">
                            {m.label}
                          </div>
                          <div className="text-sm font-semibold mt-0.5 tabular-nums">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
