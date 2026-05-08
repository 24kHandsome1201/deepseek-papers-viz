"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { PAPERS } from "@/data/papers";
import { TEAMS } from "@/data/teams";

interface Props {
  currentId: string;
}

export default function PaperFooterNav({ currentId }: Props) {
  const dsPapers = PAPERS.filter((p) => p.team === "deepseek").sort(
    (a, b) => +new Date(a.date) - +new Date(b.date)
  );
  const idx = dsPapers.findIndex((p) => p.id === currentId);
  const prev = idx > 0 ? dsPapers[idx - 1] : null;
  const next = idx < dsPapers.length - 1 ? dsPapers[idx + 1] : null;

  return (
    <footer className="border-t border-[var(--border)] mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/paper/${prev.id}`}
            className="group rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 hover:bg-[var(--panel-elev)] transition"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <ArrowLeft size={12} />
              上一篇
            </div>
            <div className="mt-2 text-sm font-semibold leading-snug group-hover:text-white">
              {prev.titleZh ?? prev.title.split(":")[0]}
            </div>
            <div className="text-xs text-[var(--muted)] mt-1">
              {TEAMS[prev.team].name} · {prev.date}
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/paper/${next.id}`}
            className="group rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 hover:bg-[var(--panel-elev)] transition text-right"
          >
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-[var(--muted)]">
              下一篇
              <ArrowRight size={12} />
            </div>
            <div className="mt-2 text-sm font-semibold leading-snug group-hover:text-white">
              {next.titleZh ?? next.title.split(":")[0]}
            </div>
            <div className="text-xs text-[var(--muted)] mt-1">
              {TEAMS[next.team].name} · {next.date}
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="group rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 hover:bg-[var(--panel-elev)] transition text-right"
          >
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-[var(--muted)]">
              回到图谱
              <ArrowRight size={12} />
            </div>
            <div className="mt-2 text-sm font-semibold leading-snug group-hover:text-white">
              探索更多 DeepSeek 论文
            </div>
          </Link>
        )}
      </div>
    </footer>
  );
}
