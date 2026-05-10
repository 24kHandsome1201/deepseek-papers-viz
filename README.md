# 中国开源大模型论文知识图谱

> 可交互的中文开源大模型论文图谱：横轴时间 / 纵轴团队，节点为论文。
> 涵盖 DeepSeek、Qwen、Kimi、GLM、MiniCPM、Yi、Baichuan、InternLM、Hunyuan、MiniMax 等团队，
> 每篇论文都配有结构化的「核心贡献 / 关键技术 / 训练流水线 / Benchmark / 关键洞察」深度页，
> 旗舰论文（如 DeepSeek-R1 / V3 / V4 / Kimi K2 / GLM-4.5）还附带 bespoke 交互演示。

线上演示：https://github.com/24khandsome1201/deepseek-papers-viz

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | **Next.js 16** App Router + React 19 (RSC) |
| 样式 | Tailwind CSS v4 (no `tailwind.config.js`，全在 `globals.css` 配置) |
| 可视化 | 手写 SVG 时间线 + framer-motion；图表用 ECharts (`echarts-for-react`) |
| 公式 | KaTeX (`react-katex`) |
| 类型 | TypeScript strict, `paths: { "@/*": ["./src/*"] }` |

> ⚠️ Next.js 16 的 `PageProps` / `params` 已是异步 (`await props.params`)，写新页面前请参考 `node_modules/next/dist/docs/`，不要套用旧版 `params: { id: string }` 的同步签名。

## 目录结构

```text
src/
├─ app/                         App Router 入口
│  ├─ page.tsx                  首页 (Hero / Recent / Flagship Grid / Graph)
│  ├─ paper/[id]/page.tsx       论文详情通用路由（数据驱动深度页）
│  └─ paper/deepseek-r1/        R1 bespoke 5 模块深度演示
├─ components/
│  ├─ home/                     首页板块
│  ├─ papers/
│  │  ├─ PaperHero.tsx          通用顶部
│  │  ├─ PaperDeepView.tsx      通用深度页主模板
│  │  ├─ sections/              数据驱动的深度模块
│  │  │   ├─ PaperPipelineSection.tsx
│  │  │   ├─ PaperKeyTechniquesSection.tsx
│  │  │   ├─ PaperBenchmarksSection.tsx
│  │  │   ├─ PaperInsightsSection.tsx
│  │  │   └─ PaperLineageSection.tsx
│  │  ├─ demoRegistry.ts        paper id → bespoke demo 组件 (lazy import)
│  │  └─ demos/                 各论文的 bespoke 交互演示
│  ├─ r1/                       DeepSeek-R1 专属 5 模块
│  └─ KnowledgeGraph.tsx        首页 SVG 图谱
├─ data/
│  ├─ papers.ts                 唯一论文数据源（详见下方 schema）
│  └─ teams.ts                  团队元数据（颜色 / 名称 / 机构）
├─ lib/
│  ├─ site.ts                   站点常量 + getReferenceDate()
│  └─ utils.ts                  cn() / formatDate()
└─ types/
   └─ react-katex.d.ts          react-katex 缺失的类型补丁

scripts/
└─ validate-papers.ts           build 前的论文数据校验脚本
```

## 本地开发

```bash
npm install
npm run dev          # 启动 http://localhost:3000
npm run validate:papers   # 单独跑数据校验
npm run build        # 校验 + 构建（CI 也跑这个）
npm run lint         # eslint
```

> Node ≥ 22 推荐（用到 `--experimental-strip-types` 直接执行 TS 校验脚本）。

---

## 论文数据模型

唯一数据源：`src/data/papers.ts`。每篇论文按下面的 schema 写一个对象即可，深度页会自动渲染。

```ts
interface Paper {
  // —— 必填 ——
  id: string;                // 全局唯一，用于路由和 buildsOn 引用
  team: string;              // 必须是 src/data/teams.ts 里的 key
  title: string;             // 英文原标题
  date: string;              // YYYY-MM-DD
  contributions: string[];   // 3–7 条 bullet，每条一句话讲清做了什么
  buildsOn: string[];        // 该论文继承自哪些 id（用于图谱连线 / 上下文）
  summary: string;           // 200–400 字中文摘要，落脚到「为什么重要」
  tier?: "flagship" | "stub";

  // —— 推荐填 ——
  titleZh?: string;
  arxiv?: string;            // 例 "2501.12948"
  github?: string;           // "owner/repo"
  hf?: string;               // huggingface 路径
  metrics?: { label: string; value: string; hint?: string }[]; // Hero 卡片

  // —— R1 粒度的结构化字段（可选，但越完整深度页越丰富）——
  pipeline?: {
    num: string;             // "01" / "02" ...
    title: string;
    subtitle?: string;
    desc: string;
    inputs?: string[];
    outputs?: string[];
    innovations?: string[];
    color?: string;          // hex; 缺省用团队主色
  }[];

  keyTechniques?: {
    name: string;            // "MLA" / "GRPO" / "DSA" ...
    formula?: string;        // KaTeX 源；可选
    intuition: string;       // 1–2 句解释
    why: string;             // 为什么这个改动重要
  }[];

  benchmarks?: {
    name: string;            // "AIME 2024" / "MMLU" ...
    value: number;           // 该论文模型分数
    baseline?: number;       // 对比基线分数
    baselineModel?: string;  // 对比基线名称
    max?: number;            // 雷达图量程，缺省 100
    higherIsBetter?: boolean;
  }[];

  insights?: {
    title: string;           // "Aha 时刻" / "Loss Spike 归零" ...
    body: string;            // 2–4 句关键观察 / 设计哲学
  }[];

  lineage?: {
    id: string;              // 必须是已存在的 paper id
    role: "predecessor" | "contemporary" | "successor" | "applies";
    note?: string;
  }[];
}
```

## 添加一篇新论文（30 秒）

1. 在 `src/data/papers.ts` 的 `PAPERS` 数组中加一个对象（参考 `deepseek-v3` / `deepseek-r1`）。
2. 跑 `npm run validate:papers`，根据报错把字段补齐。
3. 不需要改路由 —— 通用页 `/paper/[id]` 会自动渲染。

## 给一篇论文加 bespoke 交互演示（可选）

仅当通用模板无法表达该论文的关键直觉时才需要。

1. 在 `src/components/papers/demos/` 下新建 `MyDemo.tsx` (`"use client"`)。
2. 在 `src/components/papers/demoRegistry.ts` 注册：
   ```ts
   "your-paper-id": dynamic(
     () => import("@/components/papers/demos/MyDemo"),
     { loading: () => null }
   ),
   ```
3. 该 demo 会自动嵌入深度页，位于 Hero 之后、结构化模块之前。

## 升级一篇 stub 到 flagship 粒度

参考 `deepseek-r1` 的内容密度 —— 对应到结构化字段，意味着：

- `pipeline`: 3–5 个阶段（不是 1 个）
- `keyTechniques`: 至少 2 项独立技术
- `benchmarks`: 4–8 个对标项 + 至少一个 baseline
- `insights`: 1–3 段关键洞察
- `lineage`: 显式标注前驱 / 同代 / 继承者

填完把 `tier: "stub"` 改成 `tier: "flagship"`。`validate:papers` 会对 flagship 做更严格检查（`metrics` 必填、`contributions ≥ 3`）。

## 数据校验

`scripts/validate-papers.ts` 在每次 `npm run build` 前运行，会检查：

- 重复 id
- 未知 team
- `buildsOn` / `lineage` 悬空引用
- 日期格式
- demo registry 引用了不存在的 paper id
- flagship 论文是否缺少 metrics / contributions
- summary 是否过短

## 贡献内容

欢迎 PR 补全任何 stub 论文。原则：

- **优先填结构化字段**而不是写新 React 组件 —— 模板改一次，所有论文受益。
- 数字必须可溯源（arXiv 表格 / 官方 README / Tech Report）；不确定的写 `~` 或留空。
- 中文摘要落脚到 **「为什么这篇论文重要」**，避免单纯翻译 abstract。
- buildsOn 只填**直接继承**的论文，不要罗列所有相关工作。

## 许可证

代码：MIT。数据 / 论文摘要内容仅供研究参考，引用请回到对应论文。
