"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RefreshCw, FileCode, Bug, GitPullRequest, Map } from "lucide-react";
import SectionHeader from "@/components/papers/SectionHeader";

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: React.ReactNode;
}

const AGENTS: Agent[] = [
  { id: "planner", name: "Planner", role: "拆解任务 / 制定 PR 计划", color: "#A78BFA", icon: <Map size={14} /> },
  { id: "coder", name: "Coder", role: "写代码 / 改文件", color: "#F2C94C", icon: <FileCode size={14} /> },
  { id: "tester", name: "Tester", role: "跑测试 / 找 bug", color: "#34D399", icon: <Bug size={14} /> },
  { id: "reviewer", name: "Reviewer", role: "Code review / 提交 PR", color: "#F472B6", icon: <GitPullRequest size={14} /> },
];

interface Action {
  agent: string;
  text: string;
  delta?: { added?: number; removed?: number; tests?: { pass: number; fail: number } };
}

const TIMELINE: Action[] = [
  { agent: "planner", text: "目标：把缓存层从 Redis 切到 KeyDB。计划 4 步：① 加 KeyDB client；② 抽象 CacheBackend；③ 改测试；④ 更新 docs。" },
  { agent: "coder", text: "新建 lib/cache/keydb.ts (实现 CacheBackend 接口)", delta: { added: 87, removed: 0 } },
  { agent: "coder", text: "重构 lib/cache/index.ts → 通过 env 选择 backend", delta: { added: 24, removed: 18 } },
  { agent: "tester", text: "运行 pnpm test... 3 个用例失败：cache.spec.ts 假设了 Redis 的 EXPIRE 行为", delta: { tests: { pass: 142, fail: 3 } } },
  { agent: "planner", text: "调整：在 keydb.ts 用 PEXPIRE 替代，并把 cache.spec.ts 改成 backend-agnostic" },
  { agent: "coder", text: "修复 lib/cache/keydb.ts (PEXPIRE)，重写 cache.spec.ts", delta: { added: 32, removed: 19 } },
  { agent: "tester", text: "再跑 pnpm test... 全部通过 ✓", delta: { tests: { pass: 145, fail: 0 } } },
  { agent: "reviewer", text: "Diff 总览 OK；新增 docs/cache.md；提交 PR #1842", delta: { added: 41, removed: 0 } },
];

export default function KimiK26Demo() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => (s >= TIMELINE.length - 1 ? -1 : s + 1));
    }, 1700);
    return () => clearInterval(id);
  }, [playing]);

  const totals = TIMELINE.slice(0, step + 1).reduce(
    (acc, a) => {
      if (a.delta?.added) acc.added += a.delta.added;
      if (a.delta?.removed) acc.removed += a.delta.removed;
      if (a.delta?.tests) acc.tests = a.delta.tests;
      return acc;
    },
    { added: 0, removed: 0, tests: { pass: 0, fail: 0 } as { pass: number; fail: number } }
  );

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeader
        eyebrow="Kimi K2.6 · 2026.04"
        title="多 agent 编排：一个 issue → 一个 PR"
        desc="K2.6 在长会话稳定性和工具调用上对 K2 做了大幅迭代。Moonshot 把 4 个角色（Planner / Coder / Tester / Reviewer）封进同一权重，按状态机切换，让 K2.6 能在没人看的情况下跑完一个完整 PR。"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Agents row */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            4 个 agent 角色
          </div>
          <div className="space-y-2">
            {AGENTS.map((a) => {
              const isActive =
                step >= 0 && TIMELINE[step]?.agent === a.id;
              return (
                <motion.div
                  key={a.id}
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    borderColor: isActive ? a.color : "rgba(255,255,255,0.1)",
                  }}
                  className="rounded-xl border p-3 flex items-center gap-3 transition"
                  style={{
                    background: isActive ? `${a.color}15` : "transparent",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${a.color}25`,
                      color: a.color,
                      border: `1px solid ${a.color}50`,
                    }}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: isActive ? "#fff" : "#cfd2e3" }}>
                      {a.name}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] truncate">{a.role}</div>
                  </div>
                  {isActive && (
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: a.color }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border border-[var(--border)] p-2">
              <div className="text-[10px] uppercase text-[var(--muted)]">+ lines</div>
              <div className="text-sm font-mono text-[#34D399]">+{totals.added}</div>
            </div>
            <div className="rounded-md border border-[var(--border)] p-2">
              <div className="text-[10px] uppercase text-[var(--muted)]">- lines</div>
              <div className="text-sm font-mono text-[#F472B6]">-{totals.removed}</div>
            </div>
            <div className="rounded-md border border-[var(--border)] p-2">
              <div className="text-[10px] uppercase text-[var(--muted)]">tests</div>
              <div className="text-sm font-mono">
                <span className="text-[#34D399]">{totals.tests.pass}</span>
                <span className="text-[var(--muted)]">/</span>
                <span className="text-[#F472B6]">{totals.tests.fail}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] flex items-center gap-1.5 text-xs hover:bg-white/5"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
              {playing ? "暂停" : "继续"}
            </button>
            <button
              onClick={() => {
                setStep(-1);
                setPlaying(true);
              }}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] flex items-center gap-1.5 text-xs hover:bg-white/5"
            >
              <RefreshCw size={12} />
              重置
            </button>
          </div>
        </div>

        {/* Action log */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-3">
            会话日志（自动播放）
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin">
            <AnimatePresence initial={false}>
              {TIMELINE.slice(0, step + 1).map((a, i) => {
                const agent = AGENTS.find((x) => x.id === a.agent)!;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-md border p-3"
                    style={{
                      borderColor: i === step ? agent.color : "var(--border)",
                      background:
                        i === step ? `${agent.color}10` : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                        style={{
                          background: `${agent.color}25`,
                          color: agent.color,
                          border: `1px solid ${agent.color}55`,
                        }}
                      >
                        {agent.name}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">step {i + 1}</span>
                    </div>
                    <div className="text-xs font-mono leading-relaxed">{a.text}</div>
                    {a.delta && (
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono">
                        {a.delta.added !== undefined && a.delta.added > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-[#34D399]/15 text-[#34D399]">
                            +{a.delta.added}
                          </span>
                        )}
                        {a.delta.removed !== undefined && a.delta.removed > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-[#F472B6]/15 text-[#F472B6]">
                            -{a.delta.removed}
                          </span>
                        )}
                        {a.delta.tests && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5">
                            tests: {a.delta.tests.pass} pass, {a.delta.tests.fail} fail
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {step < 0 && (
              <div className="text-center text-[var(--muted)] text-xs py-8">
                等待 K2.6 启动...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-[11px] text-[var(--muted)] uppercase">SWE-Bench</div>
          <div className="font-semibold mt-1">70.5%</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">+8.4 pp vs K2</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-[11px] text-[var(--muted)] uppercase">连续会话长度</div>
          <div className="font-semibold mt-1">8h+</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">无明显 drift</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-[11px] text-[var(--muted)] uppercase">工具调用成功率</div>
          <div className="font-semibold mt-1">93.2%</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">vs K2 84.1%</div>
        </div>
      </div>
    </section>
  );
}
