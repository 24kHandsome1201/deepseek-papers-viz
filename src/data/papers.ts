export interface PaperMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface Paper {
  id: string;
  team: string;
  title: string;
  titleZh?: string;
  date: string;
  arxiv?: string;
  github?: string;
  hf?: string;
  contributions: string[];
  buildsOn: string[];
  metrics?: PaperMetric[];
  summary: string;
  highlight?: boolean;
  tier?: "flagship" | "stub";
}

export const PAPERS: Paper[] = [
  // ============ DeepSeek 主线 ============
  {
    id: "deepseek-llm",
    team: "deepseek",
    title: "DeepSeek LLM: Scaling Open-Source Language Models with Longtermism",
    titleZh: "DeepSeek LLM：以长期主义扩展开源语言模型",
    date: "2024-01-05",
    arxiv: "2401.02954",
    github: "deepseek-ai/DeepSeek-LLM",
    contributions: ["重新校准 Scaling Laws", "数据/模型 token-FLOP 比", "7B / 67B 双尺寸"],
    buildsOn: [],
    metrics: [
      { label: "参数量", value: "7B / 67B" },
      { label: "训练 tokens", value: "2T" },
      { label: "MMLU", value: "71.3" },
    ],
    summary:
      "DeepSeek 团队的开山之作，重新拟合了 Chinchilla 类的 Scaling Laws，提出在固定算力下应给予数据更高权重，并发布 7B 与 67B 两档基础模型。",
    tier: "stub",
  },
  {
    id: "deepseek-moe",
    team: "deepseek",
    title: "DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models",
    titleZh: "DeepSeekMoE：通往专家极致专业化的 MoE 架构",
    date: "2024-01-11",
    arxiv: "2401.06066",
    github: "deepseek-ai/DeepSeek-MoE",
    contributions: ["细粒度专家切分", "共享专家 (Shared Experts)", "专家级 / 设备级负载均衡损失"],
    buildsOn: ["deepseek-llm"],
    metrics: [
      { label: "总参数", value: "16B" },
      { label: "激活参数", value: "2.8B" },
      { label: "专家数", value: "64 + 2 shared" },
    ],
    summary:
      "提出细粒度专家划分 (Fine-Grained Expert Segmentation) 与共享专家 (Shared Expert Isolation)，让每个专家承担更窄的知识切片，从而获得更高激活效率。",
    tier: "stub",
  },
  {
    id: "deepseek-math",
    team: "deepseek",
    title: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models",
    titleZh: "DeepSeekMath：推动开源模型数学推理能力的极限",
    date: "2024-02-05",
    arxiv: "2402.03300",
    github: "deepseek-ai/DeepSeek-Math",
    contributions: ["GRPO 算法 (无 critic 的 PPO 变体)", "DeepSeekMath Corpus (120B math tokens)", "数学预训练 + RL"],
    buildsOn: ["deepseek-llm"],
    metrics: [
      { label: "MATH (Top-1)", value: "51.7%" },
      { label: "GSM8K", value: "88.2%" },
      { label: "参数", value: "7B" },
    ],
    summary:
      "首次提出 GRPO（Group Relative Policy Optimization）—— 用同一 prompt 下多次采样的相对优势替代 critic 模型，大幅降低 RL 训练成本。这是后来 R1 推理范式的关键基石。",
    tier: "stub",
  },
  {
    id: "deepseek-v2",
    team: "deepseek",
    title: "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model",
    titleZh: "DeepSeek-V2：强大、经济、高效的 MoE 语言模型",
    date: "2024-05-07",
    arxiv: "2405.04434",
    github: "deepseek-ai/DeepSeek-V2",
    contributions: ["MLA (Multi-head Latent Attention)", "DeepSeekMoE 大规模化", "KV 缓存压缩 93.3%"],
    buildsOn: ["deepseek-moe", "deepseek-llm"],
    metrics: [
      { label: "总参数", value: "236B" },
      { label: "激活参数", value: "21B" },
      { label: "上下文", value: "128K" },
      { label: "训练成本", value: "↓42.5% vs V1" },
    ],
    summary:
      "MLA 通过低秩潜在向量压缩 KV 缓存，使长上下文推理显存与速度大幅优化；MoE 部分扩展到 160 路由专家。",
    tier: "stub",
  },
  {
    id: "deepseek-coder-v2",
    team: "deepseek",
    title: "DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence",
    titleZh: "DeepSeek-Coder-V2：在代码智能上突破闭源壁垒",
    date: "2024-06-17",
    arxiv: "2406.11931",
    github: "deepseek-ai/DeepSeek-Coder-V2",
    contributions: ["在 V2 基础上继续预训练 6T code tokens", "支持 338 种编程语言", "128K 上下文"],
    buildsOn: ["deepseek-v2"],
    metrics: [
      { label: "HumanEval", value: "90.2" },
      { label: "MBPP+", value: "76.2" },
      { label: "语言数", value: "338" },
    ],
    summary:
      "在 DeepSeek-V2 之上注入 6T code tokens，是首个在多个代码 benchmark 上对齐 GPT-4 Turbo 的开源模型。",
    tier: "stub",
  },
  {
    id: "deepseek-v3",
    team: "deepseek",
    title: "DeepSeek-V3 Technical Report",
    titleZh: "DeepSeek-V3 技术报告",
    date: "2024-12-26",
    arxiv: "2412.19437",
    github: "deepseek-ai/DeepSeek-V3",
    contributions: ["FP8 混合精度训练", "MTP (Multi-Token Prediction)", "Auxiliary-loss-free 负载均衡", "DualPipe 流水并行"],
    buildsOn: ["deepseek-v2", "deepseek-coder-v2"],
    metrics: [
      { label: "总参数", value: "671B" },
      { label: "激活参数", value: "37B" },
      { label: "训练 tokens", value: "14.8T" },
      { label: "训练 GPU·小时", value: "2.788M H800" },
    ],
    summary:
      "在 H800 GPU 集群上以约 558 万美元训练成本完成 671B MoE 模型预训练，首次在大规模训练中应用 FP8 与多 token 预测，引发业界对训练效率的广泛讨论。",
    tier: "stub",
  },
  {
    id: "deepseek-r1",
    team: "deepseek",
    title:
      "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
    titleZh: "DeepSeek-R1：通过强化学习激发大模型推理能力",
    date: "2025-01-22",
    arxiv: "2501.12948",
    github: "deepseek-ai/DeepSeek-R1",
    hf: "deepseek-ai/DeepSeek-R1",
    contributions: [
      "R1-Zero：纯 RL 无 SFT 涌现长链推理",
      "R1：冷启动 SFT → RL → 拒绝采样 → 二次 RL 四阶段流水",
      "推理蒸馏到 1.5B–70B Dense 模型",
      "推理过程开源 + 思维链可见",
    ],
    buildsOn: ["deepseek-v3", "deepseek-math"],
    metrics: [
      { label: "AIME 2024", value: "79.8%" },
      { label: "MATH-500", value: "97.3%" },
      { label: "Codeforces", value: "2029 Elo" },
      { label: "GPQA Diamond", value: "71.5%" },
    ],
    summary:
      "DeepSeek-R1 证明在足够强的基础模型上，纯强化学习（GRPO + 规则奖励）即可让模型自发涌现反思、回溯、验证等长链推理行为，并将能力蒸馏到小模型，全面对齐 OpenAI o1。",
    highlight: true,
    tier: "flagship",
  },
  {
    id: "deepseek-v3-2",
    team: "deepseek",
    title: "DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models",
    titleZh: "DeepSeek-V3.2：推动开源大模型前沿",
    date: "2025-12-02",
    arxiv: "2512.02556",
    github: "deepseek-ai/DeepSeek-V3.2",
    hf: "deepseek-ai/DeepSeek-V3.2",
    contributions: [
      "DSA：DeepSeek Sparse Attention 稀疏注意力",
      "Reasoning-first 架构：推理与 agent 一体化",
      "V3.2-Speciale 专家版（推理强化）",
      "继续压低长上下文推理成本",
    ],
    buildsOn: ["deepseek-v3", "deepseek-r1"],
    metrics: [
      { label: "总参数", value: "671B MoE" },
      { label: "上下文", value: "164K" },
      { label: "发布", value: "2025.12" },
    ],
    summary:
      "在 V3 与 R1 基础上引入 DeepSeek Sparse Attention，把推理 / agent 行为整合进基础模型，同时保持训练与推理的高效。是 V3 → V4 之间的过渡版本，奠定 V4 的基础。",
    tier: "stub",
  },
  {
    id: "deepseek-v4",
    team: "deepseek",
    title: "DeepSeek-V4 Preview (V4-Pro / V4-Flash)",
    titleZh: "DeepSeek-V4：开源权重的下一代旗舰",
    date: "2026-04-24",
    github: "deepseek-ai/DeepSeek-V4",
    hf: "deepseek-ai/DeepSeek-V4",
    contributions: [
      "1M 上下文窗口",
      "MIT 协议开源权重，V4-Pro / V4-Flash 双档",
      "Codeforces 3206（首批 frontier 级开源模型）",
      "推理成本进一步降低，agent 能力对标 GPT-5",
    ],
    buildsOn: ["deepseek-v3-2", "deepseek-r1"],
    metrics: [
      { label: "上下文", value: "1M" },
      { label: "Codeforces", value: "3206" },
      { label: "价格", value: "$3.48/Mtoken" },
      { label: "License", value: "MIT" },
    ],
    summary:
      "DeepSeek 一年后归来：V4-Pro / V4-Flash 同时以 MIT 协议放出权重。Codeforces 3206 超过 GPT-5.4，定价仅为 Claude 1/8。这次是 R1 之后又一次「冲击」事件级发布。",
    highlight: true,
    tier: "flagship",
  },

  // ============ 其他团队（占位打桩） ============
  {
    id: "qwen3",
    team: "qwen",
    title: "Qwen3 Technical Report",
    date: "2025-05-01",
    contributions: ["Hybrid 思考/非思考模式", "MoE + Dense 双路线", "0.6B–235B 全尺寸"],
    buildsOn: [],
    summary: "Qwen 系列最新一代，提供 0.6B–235B 全尺寸覆盖，支持思考模式动态切换。",
    tier: "flagship",
  },
  {
    id: "qwen3-6",
    team: "qwen",
    title: "Qwen3.6 / Qwen3.6 Plus / Qwen3.6 Max",
    date: "2026-04-15",
    contributions: ["全面对标 frontier 闭源模型", "agent 编码深度优化"],
    buildsOn: ["qwen3"],
    summary: "Qwen 在 2026 年 4 月的全尺寸刷新，与 Kimi K2.6、DeepSeek V4 形成「2026 中国开源三强」格局。",
    tier: "stub",
  },
  {
    id: "qwen2-5",
    team: "qwen",
    title: "Qwen2.5 Technical Report",
    date: "2024-09-19",
    arxiv: "2412.15115",
    contributions: ["18T tokens 预训练", "全尺寸开源"],
    buildsOn: [],
    summary: "Qwen 系列在 2024 年的旗舰发布，涵盖 0.5B 到 72B。",
    tier: "stub",
  },
  {
    id: "kimi-k2",
    team: "kimi",
    title: "Kimi K2: Open Agentic Intelligence",
    date: "2025-07-01",
    contributions: ["MuonClip 优化器", "1T 参数 MoE / 32B 激活", "Agentic 数据合成"],
    buildsOn: [],
    summary: "月之暗面 2025 年中发布的开源 1T MoE 模型，定义了「开源 agentic 模型」品类。",
    tier: "flagship",
  },
  {
    id: "kimi-k2-6",
    team: "kimi",
    title: "Kimi K2.6",
    date: "2026-04-18",
    contributions: ["更长自主编码会话", "多 agent 编排", "对标 Qwen3.6 / DeepSeek V4"],
    buildsOn: ["kimi-k2"],
    summary: "Moonshot 在 2026 年 4 月对 K2 的迭代，强化 agentic 长会话稳定性。",
    tier: "stub",
  },
  {
    id: "kimi-k1-5",
    team: "kimi",
    title: "Kimi k1.5: Scaling Reinforcement Learning with LLMs",
    date: "2025-01-22",
    arxiv: "2501.12599",
    contributions: ["长上下文 RL", "Long2Short 蒸馏"],
    buildsOn: [],
    summary: "与 R1 同日发布的推理模型技术报告，长上下文 RL 训练范式。",
    tier: "stub",
  },
  {
    id: "glm-4-5",
    team: "glm",
    title: "GLM-4.5",
    date: "2025-07-28",
    contributions: ["混合推理模型", "355B MoE"],
    buildsOn: [],
    summary: "智谱 AI 的旗舰开源 MoE 模型，覆盖 reasoning 与 agent 场景。",
    tier: "flagship",
  },
  {
    id: "minicpm-3",
    team: "minicpm",
    title: "MiniCPM 3",
    date: "2024-09-01",
    contributions: ["端侧高效模型", "InfLLM 长上下文"],
    buildsOn: [],
    summary: "面壁智能聚焦端侧的 4B 级别开源模型。",
    tier: "stub",
  },
  {
    id: "yi-lightning",
    team: "yi",
    title: "Yi-Lightning",
    date: "2024-10-16",
    arxiv: "2412.01253",
    contributions: ["MoE 混合专家", "强多语种"],
    buildsOn: [],
    summary: "零一万物的旗舰 MoE 模型。",
    tier: "stub",
  },
  {
    id: "internlm-3",
    team: "internlm",
    title: "InternLM3",
    date: "2025-01-15",
    contributions: ["双模式：通用 + 推理", "4T 高质量 tokens"],
    buildsOn: [],
    summary: "上海 AI 实验室发布的开源 LLM，强调高数据质量低 token 量训练。",
    tier: "stub",
  },
  {
    id: "baichuan-omni",
    team: "baichuan",
    title: "Baichuan-Omni",
    date: "2024-10-01",
    contributions: ["多模态融合", "图文音视频统一"],
    buildsOn: [],
    summary: "百川智能的开源全模态模型。",
    tier: "stub",
  },
];

export function paperById(id: string): Paper | undefined {
  return PAPERS.find((p) => p.id === id);
}

export function papersByTeam(team: string): Paper[] {
  return PAPERS.filter((p) => p.team === team);
}
