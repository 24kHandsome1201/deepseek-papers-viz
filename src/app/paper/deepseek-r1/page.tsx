import R1Hero from "@/components/r1/R1Hero";
import R1Pipeline from "@/components/r1/R1Pipeline";
import GRPODemo from "@/components/r1/GRPODemo";
import ReasoningDemo from "@/components/r1/ReasoningDemo";
import R1Benchmarks from "@/components/r1/R1Benchmarks";
import R1Distillation from "@/components/r1/R1Distillation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DeepSeekR1Page() {
  return (
    <main className="min-h-screen bg-background">
      <R1Hero />
      <R1Pipeline />
      <SectionDivider />
      <GRPODemo />
      <SectionDivider />
      <ReasoningDemo />
      <SectionDivider />
      <R1Benchmarks />
      <SectionDivider />
      <R1Distillation />

      <footer className="border-t border-[var(--border)] mt-10 py-12 text-center text-xs text-[var(--muted)]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] hover:bg-white/5 transition text-[var(--foreground)]"
        >
          回到图谱探索更多论文
          <ArrowRight size={13} />
        </Link>
        <div className="mt-6 opacity-70">
          数据来源：arXiv 2501.12948 · DeepSeek-R1 Technical Report
        </div>
      </footer>
    </main>
  );
}

function SectionDivider() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="border-t border-[var(--border)]" />
    </div>
  );
}
