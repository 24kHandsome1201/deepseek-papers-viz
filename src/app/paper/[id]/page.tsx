import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { paperById, PAPERS } from "@/data/papers";
import { TEAMS } from "@/data/teams";
import { formatDate } from "@/lib/utils";
import { hasDemo } from "@/components/papers/demoRegistry";
import PaperDeepView from "@/components/papers/PaperDeepView";

export function generateStaticParams() {
  // exclude deepseek-r1 because it has its own dedicated page at /paper/deepseek-r1
  return PAPERS.filter((p) => p.id !== "deepseek-r1").map((p) => ({ id: p.id }));
}

export default async function PaperPage(props: PageProps<"/paper/[id]">) {
  const { id } = await props.params;

  if (id === "deepseek-r1") {
    // shouldn't happen in practice (the static route wins), but guard anyway
    redirect("/paper/deepseek-r1");
  }

  const paper = paperById(id);
  if (!paper) notFound();

  // If we have an interactive demo for this paper, render the deep view
  if (hasDemo(paper.id)) {
    return <PaperDeepView paper={paper} />;
  }

  // Otherwise fall back to the simple stub page
  const team = TEAMS[paper.team];
  return (
    <main className="min-h-screen">
      <section className="relative border-b border-[var(--border)] overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(700px 360px at 20% 0%, ${team.color}22, transparent 60%), #08090f`,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-white"
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
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
              style={{
                background: paper.tier === "flagship" ? "#ffffff15" : "transparent",
                border: paper.tier === "flagship" ? "none" : "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              {paper.tier === "flagship" ? "Flagship" : "Stub · 待补充"}
            </span>
          </div>

          <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
            {paper.titleZh ?? paper.title}
          </h1>
          {paper.titleZh && (
            <p className="mt-2 text-sm text-[var(--muted)]">{paper.title}</p>
          )}

          <p className="mt-6 text-base leading-relaxed text-[var(--foreground)]/85 max-w-2xl">
            {paper.summary}
          </p>

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
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            核心贡献
          </div>
          <ul className="space-y-2">
            {paper.contributions.map((c) => (
              <li key={c} className="text-sm flex items-start gap-2">
                <span
                  className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                  style={{ background: team.color }}
                />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {paper.metrics && paper.metrics.length > 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              关键指标
            </div>
            <div className="grid grid-cols-2 gap-2">
              {paper.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel-elev)] p-3"
                >
                  <div className="text-[10px] text-[var(--muted)]">{m.label}</div>
                  <div className="text-base font-semibold mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)]/40 p-5 flex items-center justify-center text-xs text-[var(--muted)]">
            指标数据待补充
          </div>
        )}
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
          <Sparkles size={20} className="mx-auto text-[var(--accent)] mb-2" />
          <div className="text-sm text-[var(--foreground)]/85">
            本论文为占位页（stub）。
            DeepSeek 全主线（共 9 篇）均已配交互演示，可点击进入。
          </div>
          <Link
            href="/paper/deepseek-r1"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4D6BFE] to-[#7B5CFF] text-sm font-medium hover:brightness-110 transition"
          >
            查看 DeepSeek-R1 深度演示
          </Link>
        </div>
      </section>
    </main>
  );
}
