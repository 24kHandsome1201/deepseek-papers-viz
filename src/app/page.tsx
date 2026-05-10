import HeroSection from "@/components/home/HeroSection";
import RecentStrip from "@/components/home/RecentStrip";
import FlagshipGrid from "@/components/home/FlagshipGrid";
import GraphSection from "@/components/home/GraphSection";
import { getReferenceDate } from "@/lib/site";

export default function HomePage() {
  const referenceDate = getReferenceDate().toISOString();

  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <RecentStrip referenceDate={referenceDate} />
      <FlagshipGrid />
      <GraphSection referenceDate={referenceDate} />
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-8 py-10 px-6 text-center text-xs text-[var(--muted)]">
      <div>
        中国开源大模型论文图谱 · 2024.01 — 2026.05
      </div>
      <div className="mt-2 opacity-70">
        数据持续更新自 arXiv / GitHub / HuggingFace · 内容仅供研究参考
      </div>
    </footer>
  );
}
