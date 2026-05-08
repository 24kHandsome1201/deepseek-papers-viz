"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Play } from "lucide-react";
import { BlockMath, InlineMath } from "react-katex";

interface Sample {
  id: number;
  text: string;
  reward: number;
  correct: boolean;
}

const SAMPLE_BANKS: Record<string, Sample[][]> = {
  math: [
    [
      { id: 1, text: "设 x = 3，则 2x + 5 = 11 ✗ 答案 11", reward: 0, correct: false },
      { id: 2, text: "x=3 ⇒ 2·3+5 = 6+5 = 11，再代回原式…", reward: 0, correct: false },
      { id: 3, text: "把 2x+5=11 改写为 2x=6，x=3 ✓", reward: 1, correct: true },
      { id: 4, text: "2x = 11-5 = 6，x = 3。验证：2·3+5=11 ✓", reward: 1, correct: true },
      { id: 5, text: "猜 x=2，2·2+5=9 ≠ 11，重试 x=3 ✓", reward: 1, correct: true },
      { id: 6, text: "x = 11/2 + 5 = 10.5 ✗", reward: 0, correct: false },
      { id: 7, text: "移项：2x = 11-5 = 6 → x = 3 ✓", reward: 1, correct: true },
      { id: 8, text: "x = (11-5)/2 = 3 ✓", reward: 1, correct: true },
    ],
  ],
  code: [
    [
      { id: 1, text: "for i in range(n): sum+=i  # 缺初始化", reward: 0, correct: false },
      { id: 2, text: "sum=0; for i in range(n+1): sum+=i  # off-by-one", reward: 0, correct: false },
      { id: 3, text: "return n*(n+1)//2  ✓", reward: 1, correct: true },
      { id: 4, text: "s=0\\nfor i in range(1,n+1): s+=i\\nreturn s ✓", reward: 1, correct: true },
      { id: 5, text: "return sum(range(n+1)) ✓", reward: 1, correct: true },
      { id: 6, text: "递归实现，n 大时栈溢出 ✗", reward: 0, correct: false },
      { id: 7, text: "math.factorial(n) ✗ 题目要的是求和", reward: 0, correct: false },
      { id: 8, text: "return n*(n-1)//2 ✗ 公式错", reward: 0, correct: false },
    ],
  ],
  logic: [
    [
      { id: 1, text: "若 A→B，¬B，则 ¬A（反证）✓", reward: 1, correct: true },
      { id: 2, text: "肯定后件谬误：B 真 ⇒ A 真 ✗", reward: 0, correct: false },
      { id: 3, text: "¬A ⇒ ¬B 与原命题逆否等价 ✗", reward: 0, correct: false },
      { id: 4, text: "由 modus tollens 直接得 ¬A ✓", reward: 1, correct: true },
      { id: 5, text: "等等，让我再检查一遍前提... ✓", reward: 1, correct: true },
      { id: 6, text: "随机猜：A 真 ✗", reward: 0, correct: false },
      { id: 7, text: "A→B 等价 ¬B→¬A ⇒ ¬A ✓", reward: 1, correct: true },
      { id: 8, text: "结论无法判定 ✗", reward: 0, correct: false },
    ],
  ],
};

const TASKS = {
  math: { label: "数学题", prompt: "求解 2x + 5 = 11" },
  code: { label: "代码题", prompt: "实现 1+2+...+n 求和" },
  logic: { label: "逻辑题", prompt: "已知 A→B，¬B，推出？" },
};

export default function GRPODemo() {
  const [task, setTask] = useState<keyof typeof TASKS>("math");
  const [groupSize, setGroupSize] = useState(8);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [seed, setSeed] = useState(0);

  const generate = () => {
    const bank = SAMPLE_BANKS[task][0];
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, groupSize);
    setSamples(shuffled);
    setSeed((s) => s + 1);
  };

  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    const rewards = samples.map((s) => s.reward);
    const mean = rewards.reduce((a, b) => a + b, 0) / rewards.length;
    const variance =
      rewards.reduce((a, b) => a + (b - mean) ** 2, 0) / rewards.length;
    const std = Math.sqrt(variance) || 1e-6;
    const advantages = rewards.map((r) => (r - mean) / std);
    return { mean, std, advantages };
  }, [samples]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
          Core Algorithm
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">
          GRPO 交互式推演
        </h2>
        <p className="mt-2 text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
          Group Relative Policy Optimization 的关键洞察：
          <b className="text-white"> 不需要 critic 模型</b>，
          只要在同一 prompt 下采样一组 G 条回答，用「这条回答相对组内平均的好坏」作为优势函数。
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* 左侧：公式与控制 */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
              GRPO 优势函数
            </div>
            <div className="text-sm">
              <BlockMath math={"\\hat{A}_{i} = \\frac{r_i - \\mathrm{mean}(\\{r_1,\\dots,r_G\\})}{\\mathrm{std}(\\{r_1,\\dots,r_G\\})}"} />
            </div>
            <div className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              对一个 prompt 采样 G 条回答 <InlineMath math="\{o_1,\ldots,o_G\}" />，
              用规则得到奖励 <InlineMath math="r_i" />；优势就是该样本在组内的 z-score。
              <span className="text-white"> 不需要价值网络</span>，显存与算力开销减半。
            </div>

            <div className="mt-4 text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              PPO 目标（裁剪后）
            </div>
            <div className="text-xs">
              <BlockMath math={"\\mathcal{J} = \\mathbb{E}\\Big[\\min\\big(\\rho_i \\hat{A}_i,\\ \\mathrm{clip}(\\rho_i, 1-\\epsilon, 1+\\epsilon)\\hat{A}_i\\big)\\Big] - \\beta\\, \\mathrm{KL}(\\pi\\,\\|\\,\\pi_{\\mathrm{ref}})"} />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                选择任务
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TASKS) as Array<keyof typeof TASKS>).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setTask(k);
                      setSamples([]);
                    }}
                    className="py-1.5 rounded-md text-xs border transition"
                    style={{
                      borderColor:
                        task === k ? "var(--accent)" : "var(--border)",
                      background:
                        task === k ? "var(--accent-soft)" : "transparent",
                      color: task === k ? "#fff" : "var(--muted)",
                    }}
                  >
                    {TASKS[k].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                <span>组内样本数 G</span>
                <span className="text-white">{groupSize}</span>
              </div>
              <input
                type="range"
                min={4}
                max={8}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[var(--panel-elev)] p-3">
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Prompt
              </div>
              <div className="mt-1 text-sm font-mono text-white">
                {TASKS[task].prompt}
              </div>
            </div>

            <button
              onClick={generate}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] hover:brightness-110 transition"
            >
              {samples.length === 0 ? <Play size={14} /> : <RefreshCw size={14} />}
              {samples.length === 0 ? "采样 G 条回答" : "重新采样"}
            </button>
          </div>
        </div>

        {/* 右侧：结果可视化 */}
        <div className="md:col-span-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 min-h-[480px]">
            {samples.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-[var(--muted)]">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Play size={18} />
                </div>
                <p className="text-sm">点击左侧「采样」开始演示 GRPO</p>
                <p className="text-xs mt-1">每条回答会被规则奖励打分，并计算组内相对优势</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                  <span>组内 G = {samples.length}</span>
                  {stats && (
                    <span>
                      均值 r̄ = <span className="text-white">{stats.mean.toFixed(2)}</span> · 标准差{" "}
                      <span className="text-white">{stats.std.toFixed(2)}</span>
                    </span>
                  )}
                </div>
                <AnimatePresence mode="popLayout">
                  {samples.map((s, i) => {
                    const adv = stats?.advantages[i] ?? 0;
                    const positive = adv > 0;
                    return (
                      <motion.div
                        key={`${seed}-${s.id}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="relative rounded-lg border bg-[var(--panel-elev)] p-3 pl-4"
                        style={{
                          borderColor: positive
                            ? "rgba(52,211,153,0.4)"
                            : "rgba(248,113,113,0.35)",
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                          style={{
                            background: positive ? "#34D399" : "#F87171",
                          }}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
                              <span className="font-mono">o_{i + 1}</span>
                              <span>·</span>
                              <span>
                                r = <span className="text-white">{s.reward}</span>
                              </span>
                            </div>
                            <div className="mt-1 text-xs font-mono leading-relaxed text-[var(--foreground)]/90 break-words">
                              {s.text}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-[var(--muted)]">
                              advantage
                            </div>
                            <div
                              className="text-base font-semibold tabular-nums"
                              style={{
                                color: positive ? "#34D399" : "#F87171",
                              }}
                            >
                              {adv >= 0 ? "+" : ""}
                              {adv.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        {/* advantage bar */}
                        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.abs(adv) * 50)}%`,
                              marginLeft: positive ? "50%" : `${50 - Math.min(50, Math.abs(adv) * 50)}%`,
                              background: positive ? "#34D399" : "#F87171",
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed">
                  <span className="text-white font-medium">观察：</span>
                  正优势的样本（绿）会被「鼓励」（梯度推向其方向），
                  负优势的（红）会被「抑制」。
                  这就是 R1 不需要任何 CoT 标注，仅靠最终答案对错就能学会推理的核心机制。
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
