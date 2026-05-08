"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Brain, Lightbulb } from "lucide-react";

type Step =
  | { type: "think"; text: string }
  | { type: "reflect"; text: string }
  | { type: "verify"; text: string }
  | { type: "answer"; text: string };

const SCRIPTS: Record<string, { prompt: string; steps: Step[] }> = {
  aha: {
    prompt:
      "找出方程 √(a − √(a + x)) = x 的所有正实数解（其中 a > 1）",
    steps: [
      { type: "think", text: "我先观察这个方程的结构：根号套根号，含两个变量 a 和 x。" },
      { type: "think", text: "尝试两边平方：a − √(a + x) = x²。" },
      { type: "think", text: "整理：√(a + x) = a − x²。" },
      { type: "think", text: "再次平方：a + x = (a − x²)² = a² − 2ax² + x⁴。" },
      { type: "reflect", text: "等等… 让我换个角度，重新评估这一步。" },
      { type: "reflect", text: "这里出现了一个 *aha* 时刻：让我重新审视这个方程。" },
      { type: "think", text: "把方程整理成关于 x 的多项式可能很乱。换一种思路。" },
      { type: "think", text: "注意若令 y = √(a + x)，则原方程变为 √(a − y) = x，配上 y² = a + x。" },
      { type: "think", text: "于是有 a − y = x² 和 a + x = y²，两式相减：x + y = y² − x² = (y−x)(y+x)。" },
      { type: "think", text: "因 x + y > 0，可两边同除得 1 = y − x，即 y = x + 1。" },
      { type: "think", text: "代回 y² = a + x：(x+1)² = a + x ⇒ x² + x + 1 = a。" },
      { type: "verify", text: "解得 x = (−1 + √(4a − 3))/2，需 a > 3/4，与题设 a > 1 相容。" },
      { type: "verify", text: "验证：代回原方程，左右两端相等 ✓" },
      { type: "answer", text: "x = (−1 + √(4a − 3)) / 2" },
    ],
  },
  count: {
    prompt: "Strawberry 这个单词中字母 r 出现了几次？",
    steps: [
      { type: "think", text: "让我逐个字母数：s-t-r-a-w-b-e-r-r-y。" },
      { type: "think", text: "第一个 r 出现在第 3 位。" },
      { type: "reflect", text: "等等，我需要更仔细地数。重新来一遍。" },
      { type: "think", text: "S(1) T(2) R(3) A(4) W(5) B(6) E(7) R(8) R(9) Y(10)。" },
      { type: "verify", text: "位置 3、8、9 都是 r。共 3 个。" },
      { type: "answer", text: "字母 r 出现了 3 次。" },
    ],
  },
};

const TYPE_STYLES: Record<Step["type"], { color: string; label: string }> = {
  think: { color: "#60A5FA", label: "Thinking" },
  reflect: { color: "#F59E0B", label: "Reflecting" },
  verify: { color: "#34D399", label: "Verifying" },
  answer: { color: "#A78BFA", label: "Answer" },
};

export default function ReasoningDemo() {
  const [scriptKey, setScriptKey] =
    useState<keyof typeof SCRIPTS>("aha");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const script = SCRIPTS[scriptKey];

  useEffect(() => {
    if (!playing) return;
    if (step >= script.steps.length) return;
    const delay = script.steps[step].text.length * 18 + 600;
    timer.current = setTimeout(() => {
      setStep((s) => s + 1);
    }, delay / speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, playing, scriptKey, speed, script.steps]);

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setStep(0);
    setPlaying(true);
  };

  const visible = script.steps.slice(0, step + 1);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
          Emergent Behavior
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">
          长链推理的「Aha 时刻」
        </h2>
        <p className="mt-2 text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
          在 GRPO 训练过程中，R1-Zero 没有被任何人教过「反思」——
          但它自发涌现出 <span className="text-[#F59E0B]">「等等，让我重新评估」</span>、
          <span className="text-[#34D399]">「让我验证一下」</span> 这类 meta-cognitive 行为。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              选择题目
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setScriptKey("aha");
                  reset();
                }}
                className="w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition"
                style={{
                  borderColor:
                    scriptKey === "aha" ? "var(--accent)" : "var(--border)",
                  background:
                    scriptKey === "aha" ? "var(--accent-soft)" : "transparent",
                }}
              >
                <div className="text-[10px] uppercase text-[var(--muted)] mb-1">
                  数学竞赛 · 论文原文示例
                </div>
                <div className="font-mono text-white/90">
                  √(a − √(a + x)) = x
                </div>
              </button>
              <button
                onClick={() => {
                  setScriptKey("count");
                  reset();
                }}
                className="w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition"
                style={{
                  borderColor:
                    scriptKey === "count" ? "var(--accent)" : "var(--border)",
                  background:
                    scriptKey === "count" ? "var(--accent-soft)" : "transparent",
                }}
              >
                <div className="text-[10px] uppercase text-[var(--muted)] mb-1">
                  经典 LLM 失误题
                </div>
                <div className="font-mono text-white/90">
                  How many r in &quot;strawberry&quot;?
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              <span>播放</span>
              <span className="text-white">{step}/{script.steps.length}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-md border border-[var(--border)] hover:bg-white/5 text-sm transition"
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? "暂停" : "继续"}
              </button>
              <button
                onClick={reset}
                className="px-3 py-2 rounded-md border border-[var(--border)] hover:bg-white/5 text-sm transition"
                title="重置"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mb-1">
                <span>速度</span>
                <span className="text-white">{speed.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              图例
            </div>
            <div className="space-y-1.5 text-xs">
              {(Object.keys(TYPE_STYLES) as Step["type"][]).map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: TYPE_STYLES[t].color }}
                  />
                  <span style={{ color: TYPE_STYLES[t].color }}>
                    {TYPE_STYLES[t].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2 text-xs">
              <Brain size={14} className="text-[var(--accent)]" />
              <span className="text-[var(--muted)]">用户提问：</span>
              <span className="text-white font-mono">{script.prompt}</span>
            </div>
            <div className="px-5 py-5 space-y-3 min-h-[440px] max-h-[560px] overflow-y-auto scrollbar-thin">
              <AnimatePresence>
                {visible.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono"
                      style={{
                        background: `${TYPE_STYLES[s.type].color}22`,
                        color: TYPE_STYLES[s.type].color,
                      }}
                    >
                      {s.type === "reflect" ? (
                        <Lightbulb size={12} />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[10px] uppercase tracking-wider mb-0.5"
                        style={{ color: TYPE_STYLES[s.type].color }}
                      >
                        {TYPE_STYLES[s.type].label}
                      </div>
                      <TypewriterLine
                        text={s.text}
                        color={
                          s.type === "answer" ? "#fff" : "rgba(232,234,243,0.85)"
                        }
                        bold={s.type === "answer"}
                        speed={18 / speed}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {step >= script.steps.length && (
                <div className="mt-6 px-3 py-2.5 rounded-md bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-xs text-[var(--foreground)]/85 leading-relaxed">
                  <b className="text-white">关键观察：</b>
                  在没有任何「反思」标注的情况下，模型在 RL 中自发学会了在中途停下来重新审视自己的推理。
                  论文称之为 <i>aha moment</i>，是涌现智能的一个直接证据。
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TypewriterLine(props: {
  text: string;
  color: string;
  bold?: boolean;
  speed: number;
}) {
  return <TypewriterLineInner key={`${props.text}-${props.speed}`} {...props} />;
}

function TypewriterLineInner({
  text,
  color,
  bold,
  speed,
}: {
  text: string;
  color: string;
  bold?: boolean;
  speed: number;
}) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <div
      className={`text-sm leading-relaxed ${bold ? "font-semibold" : ""}`}
      style={{ color }}
    >
      {shown}
      {shown.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 align-middle ml-0.5 bg-current opacity-60 animate-pulse" />
      )}
    </div>
  );
}
