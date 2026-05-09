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
  {
    id: "deepseek-llm",
    team: "deepseek",
    title: "DeepSeek LLM: Scaling Open-Source Language Models with Longtermism",
    titleZh: "DeepSeek LLM：以长期主义扩展开源语言模型",
    date: "2024-01-05",
    arxiv: "2401.02954",
    github: "deepseek-ai/DeepSeek-LLM",
    contributions: [
      "重新校准 Scaling Laws：以 non-embedding FLOPs/token (M) 取代参数量 N",
      "指出在更高质量数据下应向数据维度倾斜更多算力",
      "自建 2T tokens 多源高质量预训练语料",
      "用多步学习率调度替代 cosine，便于持续训练",
      "SFT + DPO 两阶段对齐，开源 Base 与 Chat",
      "7B / 67B 双尺寸，67B 全面超越 LLaMA-2 70B",
    ],
    buildsOn: [],
    metrics: [
      { label: "参数量", value: "7B / 67B" },
      { label: "训练 tokens", value: "2T" },
      { label: "MMLU (67B)", value: "71.3" },
      { label: "HumanEval (67B)", value: "73.8" },
    ],
    summary:
      "DeepSeek 对外发布的首篇技术报告，奠定后续所有工作的方法论基石。论文系统重做了 Scaling Laws 研究：用 non-embedding FLOPs/token (M) 取代参数量 N 作为模型规模度量，更准确地预测最优算力 / 数据 / 模型分配，并指出在更高质量数据下应给数据维度更大权重。基于此训练了 7B 与 67B 两档基础模型，使用 2T tokens 自建语料、多步学习率调度，配合 SFT + DPO 对齐。67B 在代码、数学、推理任务上全面超越 LLaMA-2 70B，Chat 版的开放式评测优于 GPT-3.5。",
    tier: "stub",
  },

  {
    id: "deepseek-coder",
    team: "deepseek",
    title:
      "DeepSeek-Coder: When the Large Language Model Meets Programming -- The Rise of Code Intelligence",
    titleZh: "DeepSeek-Coder:大模型遇见代码,代码智能崛起",
    date: "2024-01-25",
    arxiv: "2401.14196",
    github: "deepseek-ai/DeepSeek-Coder",
    contributions: [
      "1.3B – 33B 全尺寸开源代码模型",
      "项目级仓库感知预训练",
      "Fill-in-the-blank + 16K 上下文",
      "首个 HumanEval 对齐 GPT-3.5/Codex 的开源模型",
    ],
    buildsOn: [],
    metrics: [
      { label: "尺寸", value: "1.3B–33B" },
      { label: "训练 tokens", value: "2T" },
      { label: "上下文", value: "16K" },
      { label: "HumanEval", value: "79.3" },
    ],
    summary:
      "DeepSeek 在代码方向的开山作。项目级仓库内代码组合 + 仓库感知去重,2T tokens 从零训练。开源协议放宽到商用,首次以全开源模型在 HumanEval / MBPP 等多项基准上对齐甚至超过 Codex / GPT-3.5。",
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
    contributions: [
      "细粒度专家切分 (Fine-Grained Expert Segmentation)：把每个 FFN 拆成 mN 个更小专家、激活 mK 个，组合更灵活",
      "共享专家隔离 (Shared Expert Isolation)：始终激活的共享 FFN 承载共性知识，路由专家专注差异化能力",
      "专家级 + 设备级负载均衡损失，避免路由坍塌与跨机通信热点",
      "16B 总参 / 2.8B 激活，性能对齐 LLaMA2-7B / DeepSeek-7B 但仅用 ~40% 算力",
      "扩展至 145B 大模型 (DeepSeekMoE 145B preview)，验证可大规模化",
      "为 V2 / V3 / V3.2 / V4 的 MoE 路由器奠定统一范式",
    ],
    buildsOn: ["deepseek-llm"],
    metrics: [
      { label: "总参数", value: "16B" },
      { label: "激活参数", value: "2.8B" },
      { label: "专家数", value: "64 + 2 shared" },
      { label: "算力 vs LLaMA2-7B", value: "~40%" },
    ],
    summary:
      "DeepSeek 在 MoE 架构上的首篇核心论文，以 16B 总参 / 2.8B 激活的开源模型实现与 LLaMA2-7B 相当的性能，但仅用约 40% 的训练 / 推理算力。论文提出两项关键策略：(1) 细粒度专家切分 —— 把每个 FFN 拆成更多更小的专家并按比例增加激活数，让专家组合更灵活、知识更不重叠；(2) 共享专家隔离 —— 预留 1–2 个总是激活的共享专家承载共性知识，使路由专家能专注差异化能力。配合专家级 + 设备级负载均衡损失，奠定了 V2 / V3 / V3.2 / V4 一脉相承的 MoE 设计基础。",
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
    contributions: [
      "提出 GRPO (Group Relative Policy Optimization)：去 critic 的 PPO 变体，用组内相对优势替代价值函数",
      "DeepSeekMath Corpus：从 Common Crawl 用 fastText 分类器迭代召回的 120B 数学 token",
      "在 DeepSeek-Coder-Base-v1.5 7B 之上做数学领域继续预训练",
      "链式推理 (CoT) 与工具/程序辅助推理 (PoT) 联合 SFT",
      "7B 模型在 MATH 上 Top-1 达 51.7%，逼近 Gemini-Ultra / GPT-4",
      "自洽 (cons@64) 在 MATH 上达 60.9%，无需外部工具或投票",
    ],
    buildsOn: ["deepseek-llm"],
    metrics: [
      { label: "参数", value: "7B" },
      { label: "MATH (Top-1)", value: "51.7%" },
      { label: "MATH (cons@64)", value: "60.9%" },
      { label: "GSM8K", value: "88.2%" },
    ],
    summary:
      "DeepSeek 进军数学推理的里程碑论文，也是 GRPO 算法的诞生之地。论文在 DeepSeek-Coder-Base-v1.5 7B 之上继续预训练 120B 数学相关 token (用 fastText 分类器在 Common Crawl 上迭代召回构造的 DeepSeekMath Corpus)，再经 SFT 与 RL。GRPO 是 PPO 的轻量变体——去掉 critic 网络，改用同一 prompt 下多次采样的组内相对优势作为基线，显著降低显存与训练成本。最终 DeepSeekMath-7B 不依赖工具与投票，在竞赛级 MATH 上 Top-1 达 51.7%，cons@64 达 60.9%，逼近 Gemini-Ultra / GPT-4。GRPO 后来成为 R1 推理范式的核心算法，被广泛复用到全行业的推理后训练。",
    tier: "stub",
  },

  {
    id: "deepseek-vl",
    team: "deepseek",
    title: "DeepSeek-VL: Towards Real-World Vision-Language Understanding",
    titleZh: "DeepSeek-VL:面向真实世界场景的视觉语言模型",
    date: "2024-03-08",
    arxiv: "2403.05525",
    github: "deepseek-ai/DeepSeek-VL",
    contributions: [
      "混合视觉编码器(SigLIP + SAM-B)",
      "1024×1024 高分辨率,固定 token 预算",
      "面向真实场景的指令数据 taxonomy",
      "保留 LLM 能力的 VL 预训练策略",
    ],
    buildsOn: ["deepseek-llm"],
    metrics: [
      { label: "尺寸", value: "1.3B / 7B" },
      { label: "分辨率", value: "1024" },
      { label: "数据来源", value: "Web/PDF/OCR/图表" },
    ],
    summary:
      "DeepSeek 多模态线的起点。强调真实使用场景(网页、PDF、OCR、图表),引入混合视觉编码器以兼顾语义抽取与高分辨率细节,同时保持基模型纯文本能力不退化。",
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
    contributions: [
      "MLA (Multi-head Latent Attention)：把 K/V 投影到低秩共享潜向量再上投影，KV 缓存压缩 93.3%",
      "DeepSeekMoE 大规模化：160 路由专家 + 2 共享专家，每 token 激活 6 个",
      "8.1T tokens 高质量多源语料预训练 + SFT + RL 完整管线",
      "训练成本相比 DeepSeek 67B 下降 42.5%，最大生成吞吐提升 5.76 倍",
      "原生 128K 上下文（YaRN 长度外推）",
      "开源 236B 旗舰与 16B / 2.4B 激活的 V2-Lite，方便研究者复现",
    ],
    buildsOn: ["deepseek-moe", "deepseek-llm"],
    metrics: [
      { label: "总参数", value: "236B" },
      { label: "激活参数", value: "21B" },
      { label: "上下文", value: "128K" },
      { label: "KV 缓存", value: "↓93.3%" },
      { label: "训练成本", value: "↓42.5%" },
      { label: "生成吞吐", value: "×5.76" },
    ],
    summary:
      "DeepSeek 首个大规模旗舰 MoE 模型 (236B 总参 / 21B 激活)，论文确立了影响全行业的两项核心架构。(1) Multi-head Latent Attention (MLA)：把每个头的 Key 和 Value 投影到低秩共享潜向量、再按需上投影，使 KV 缓存压缩到 GQA / MHA 的极小比例，长上下文推理显存与延迟同时下降。(2) DeepSeekMoE 大规模化：160 路由专家 + 2 共享专家、每 token 仅激活 6 个，配合负载均衡与训练稳定性优化。在 8.1T tokens 上预训练，相比 DeepSeek 67B 训练成本下降 42.5%、KV 缓存压缩 93.3%、最大生成吞吐提升 5.76 倍，原生支持 128K 上下文。MLA + DeepSeekMoE 这套组合此后被 V3 / V3.2 / V4 一脉相承。",
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
    contributions: [
      "在 DeepSeek-V2 中间 checkpoint 上继续预训练 6T tokens (60% 代码 / 10% 数学 / 30% 自然语言)",
      "支持的编程语言从 v1 的 86 种扩展到 338 种",
      "上下文长度从 16K 拉长到 128K",
      "开源 16B / 2.4B 激活 (Lite) 与 236B / 21B 激活两档",
      "HumanEval / MBPP+ / LiveCodeBench / MATH 等多项指标与 GPT-4 Turbo / Claude 3 Opus / Gemini 1.5 Pro 持平或更优",
      "首个在标准代码 benchmark 上系统性对齐顶级闭源模型的开源 MoE",
    ],
    buildsOn: ["deepseek-v2"],
    metrics: [
      { label: "HumanEval", value: "90.2" },
      { label: "MBPP+", value: "76.2" },
      { label: "语言数", value: "338" },
      { label: "上下文", value: "128K" },
    ],
    summary:
      "在 DeepSeek-V2 的中间 checkpoint 之上继续预训练 6T tokens (60% 代码 / 10% 数学 / 30% 自然语言)，并把支持的编程语言从 v1 的 86 种扩展到 338 种、上下文从 16K 拉长到 128K。发布 16B 总参 / 2.4B 激活 (Lite) 和 236B / 21B 激活两档。在 HumanEval、MBPP+、LiveCodeBench、MATH 等多个 benchmark 上首次对齐甚至超过 GPT-4 Turbo / Claude 3 Opus / Gemini 1.5 Pro，是开源代码模型的关键转折点；其评测体系也成为后续 V3 / V4 比较代码与数学能力的基线。",
    tier: "stub",
  },

  {
    id: "janus-pro",
    team: "deepseek",
    title:
      "Janus-Pro: Unified Multimodal Understanding and Generation with Data and Model Scaling",
    titleZh: "Janus-Pro:解耦视觉编码器,统一理解与生成",
    date: "2025-01-29",
    arxiv: "2501.17811",
    github: "deepseek-ai/Janus",
    hf: "deepseek-ai/Janus-Pro-7B",
    contributions: [
      "解耦视觉编码:理解走 SigLIP,生成走 VQ-VAE",
      "单一自回归 Transformer 统一两种任务",
      "1B / 7B 双档,纯开源",
      "GenEval / DPG-Bench 超过 SDXL / DALL·E 3",
    ],
    buildsOn: ["deepseek-vl"],
    metrics: [
      { label: "尺寸", value: "1B / 7B" },
      { label: "GenEval", value: "0.80" },
      { label: "DPG-Bench", value: "84.2" },
    ],
    summary:
      "Janus 系列的进化版。前作发现「同一视觉编码器同时服务 understanding 与 generation」会冲突,Janus-Pro 把两条路径解耦但共享一个 Transformer 主干,在小尺寸下同时把多模态理解和文生图都推到 SOTA 区间。",
    tier: "stub",
  },

  {
    id: "deepseek-vl2",
    team: "deepseek",
    title:
      "DeepSeek-VL2: Mixture-of-Experts Vision-Language Models for Advanced Multimodal Understanding",
    titleZh: "DeepSeek-VL2:首个 MoE 视觉语言模型",
    date: "2024-12-13",
    arxiv: "2412.10302",
    github: "deepseek-ai/DeepSeek-VL2",
    contributions: [
      "动态分块的高分辨率视觉编码",
      "DeepSeekMoE + MLA 作为语言主干",
      "Tiny / Small / Base 三档(1.0B / 2.8B / 4.5B 激活)",
      "OCR、文档、图表、Grounding 全面对齐 InternVL2 / Qwen2-VL",
    ],
    buildsOn: ["deepseek-vl", "deepseek-moe", "deepseek-v2"],
    metrics: [
      { label: "激活参数", value: "1.0–4.5B" },
      { label: "视觉编码", value: "动态 tiling" },
      { label: "上下文", value: "128K" },
    ],
    summary:
      "把 DeepSeek-VL 的混合视觉编码升级为「动态 tiling」(支持任意宽高比、最长边 1152px),并把 LLM 主干换成 DeepSeekMoE + MLA,进一步压低激活参数下的多模态推理成本。",
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
    contributions: [
      "Auxiliary-loss-free 负载均衡：用 per-expert 偏置替代辅助损失，避免均衡损失污染主梯度",
      "Multi-Token Prediction (MTP)：训练时预测 D 个未来 token，提供更密的训练信号并支持推理端投机解码",
      "FP8 混合精度训练：首个大规模验证 FP8 端到端训练 671B 模型",
      "DualPipe 流水并行：让计算-通信几乎零气泡重叠，跨节点 all-to-all 内核深度优化",
      "在 14.8T tokens 上预训练，仅消耗 2.788M H800 GPU 小时（约 $5.58M）",
      "训练全程零不可恢复 loss spike，把 R1 长链推理蒸馏回 V3 改进通用能力",
    ],
    buildsOn: ["deepseek-v2", "deepseek-coder-v2"],
    metrics: [
      { label: "总参数", value: "671B" },
      { label: "激活参数", value: "37B" },
      { label: "训练 tokens", value: "14.8T" },
      { label: "训练 GPU·小时", value: "2.788M H800" },
      { label: "训练成本", value: "~$5.58M" },
      { label: "上下文", value: "128K" },
    ],
    summary:
      "DeepSeek 在 2024 年底发布的旗舰 MoE 模型 (671B 总参 / 37B 激活)，技术报告震动业界。架构延续 V2 的 MLA + DeepSeekMoE，但在训练侧引入三项关键创新：(1) Auxiliary-loss-free 负载均衡，用 per-expert 偏置替代辅助损失，避免均衡损失污染主梯度；(2) Multi-Token Prediction (MTP)，训练时预测多个未来 token，提供更密的信号并支持推理端投机解码；(3) FP8 混合精度训练 + DualPipe 流水并行 + 通信内核深度优化。端到端在 H800 集群完成 14.8T tokens 预训练，仅消耗约 2.788M GPU 小时（~$5.58M），全程零不可恢复 loss spike，并把 R1 的长链推理能力蒸馏回 V3 提升对话质量，是「低成本训练大 MoE」范式的奠基之作。",
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
      "R1-Zero：以 V3-Base 为起点，纯 RL (GRPO + 规则奖励) 无 SFT 涌现长链推理",
      "著名「Aha 时刻」：模型自发反思、回溯并主动延长思考长度",
      "R1 四阶段流水：冷启动 SFT → 推理 RL → 拒绝采样多任务 SFT → 全场景二次 RL",
      "推理能力蒸馏到 1.5B / 7B / 8B / 14B / 32B / 70B 共 6 个 Qwen 与 Llama 稠密模型",
      "MIT 协议完全开源权重 + 思维链全程可见",
      "推理性能整体对齐 OpenAI o1-1217，引发 2025 年开源推理浪潮",
    ],
    buildsOn: ["deepseek-v3", "deepseek-math"],
    metrics: [
      { label: "AIME 2024", value: "79.8%" },
      { label: "MATH-500", value: "97.3%" },
      { label: "Codeforces", value: "2029 Elo" },
      { label: "GPQA Diamond", value: "71.5%" },
    ],
    summary:
      "DeepSeek 推理范式的奠基之作，证明在足够强的基础模型 (V3-Base) 上，纯强化学习就能让模型自发涌现反思 / 回溯 / 自我验证等长链推理行为。R1-Zero 全程不用 SFT，直接 GRPO + 规则奖励 (准确率 + 格式) 在数学 / 编程任务上训练，过程中观察到著名的「Aha 时刻」—— 模型自发延长思考、改写解法。为解决 R1-Zero 的可读性差与中英混用问题，R1 引入「冷启动 SFT → 推理 RL → 拒绝采样多任务 SFT → 全场景二次 RL」四阶段流水，整体对齐 OpenAI o1-1217。同时把推理能力蒸馏到 1.5B / 7B / 8B / 14B / 32B / 70B 共 6 个 Qwen / Llama 稠密模型并以 MIT 协议开源、思维链全程可见，是 2025 年最具影响力的开源模型事件。",
    highlight: true,
    tier: "flagship",
  },

  {
    id: "deepseek-prover-v2",
    team: "deepseek",
    title:
      "DeepSeek-Prover-V2: Advancing Formal Mathematical Reasoning via Reinforcement Learning for Subgoal Decomposition",
    titleZh: "DeepSeek-Prover-V2:子目标分解 + RL 推动形式化证明",
    date: "2025-04-30",
    arxiv: "2504.21801",
    github: "deepseek-ai/DeepSeek-Prover-V2",
    contributions: [
      "递归子目标分解 + V3 冷启动 CoT",
      "Lean 4 形式证明 + 强化学习",
      "MiniF2F 88.9% / PutnamBench 49 / 658",
      "自带 ProverBench(含 AIME 2024-25)",
    ],
    buildsOn: ["deepseek-v3", "deepseek-math"],
    metrics: [
      { label: "总参数", value: "671B" },
      { label: "MiniF2F-test", value: "88.9%" },
      { label: "PutnamBench", value: "49 / 658" },
    ],
    summary:
      "把 DeepSeek-V3 用作「informal teacher」,先把题目递归分解为子目标,再让 Lean 4 在子目标级别完成证明并合成 chain-of-thought,最后做 RL。把 informal 与 formal 数学两条线统一进同一模型。",
    tier: "stub",
  },

  {
    id: "deepseek-ocr",
    team: "deepseek",
    title: "DeepSeek-OCR: Contexts Optical Compression",
    titleZh: "DeepSeek-OCR:用「视觉 token」压缩长上下文",
    date: "2025-10-21",
    arxiv: "2510.18234",
    github: "deepseek-ai/DeepSeek-OCR",
    hf: "deepseek-ai/DeepSeek-OCR",
    contributions: [
      "用图像作为长上下文的有损压缩载体",
      "DeepEncoder + DeepSeek3B-MoE-A570M 解码",
      "10× 压缩仍 97% OCR 精度,20× 仍 ~60%",
      "OmniDocBench 用 100 vision tokens 超 GOT-OCR2.0",
    ],
    buildsOn: ["deepseek-vl2", "deepseek-moe"],
    metrics: [
      { label: "解码器", value: "3B-MoE / 570M 激活" },
      { label: "≤10× 压缩精度", value: "97%" },
      { label: "20× 压缩精度", value: "~60%" },
      { label: "吞吐", value: "200K+ 页/天 (A100)" },
    ],
    summary:
      "把长文本「拍成图片」再让一个紧凑的 MoE 多模态模型还原。在 ≤10× 压缩比下精度仍 97%,把光学压缩开辟为 LLM 长上下文 / 记忆遗忘机制的一个新研究方向。",
    tier: "stub",
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
      "DSA (DeepSeek Sparse Attention)：首次实现细粒度稀疏注意力，长上下文训练 / 推理算力与显存大幅下降，质量几乎无损",
      "可扩展 RL 框架 + 大规模后训练算力，让基础模型直接对齐 GPT-5",
      "V3.2-Speciale 高算力变体：在 2025 IMO / IOI 上达到金牌级成绩，推理能力比肩 Gemini-3.0-Pro",
      "大规模 Agentic 任务合成管线：把推理能力系统化注入工具调用 / 多步交互场景",
      "延续 V3 的 671B MoE / MLA 架构，但训练-推理成本继续压低",
      "V3 → V4 之间的关键过渡，DSA 为 V4 的 1M 长上下文铺路",
    ],
    buildsOn: ["deepseek-v3", "deepseek-r1"],
    metrics: [
      { label: "总参数", value: "671B MoE" },
      { label: "激活参数", value: "~37B" },
      { label: "长上下文", value: "DSA 稀疏" },
      { label: "IMO / IOI 2025", value: "金牌" },
      { label: "发布", value: "2025.12" },
    ],
    summary:
      "DeepSeek 在 2025 年底发布的「推理-Agent 一体化」旗舰，是 V3 → V4 之间的关键过渡。论文围绕三大突破：(1) DeepSeek Sparse Attention (DSA) —— 首次实现细粒度稀疏注意力，在长上下文训练 / 推理中大幅降低算力与显存，但保持与稠密注意力几乎一致的输出质量；(2) 可扩展 RL 框架与大规模后训练算力，让基础模型直接对齐 GPT-5；高算力变体 V3.2-Speciale 在 2025 IMO 与 IOI 上拿到金牌级表现，推理能力比肩 Gemini-3.0-Pro；(3) 大规模 Agentic 任务合成管线，把推理能力系统化注入工具调用 / 多步交互场景，显著提升 agent 的泛化与指令遵循。架构上沿用 V3 的 671B MoE，但 DSA 让 1M-class 长上下文成为可能，为 V4 铺路。",
    tier: "stub",
  },

  {
    id: "deepseek-v4",
    team: "deepseek",
    title: "DeepSeek-V4 Preview: Towards Highly Efficient Million-Token Context Intelligence",
    titleZh: "DeepSeek-V4 Preview：迈向百万 token 长上下文的高效旗舰",
    date: "2026-04-24",
    github: "deepseek-ai/DeepSeek-V4",
    hf: "deepseek-ai/DeepSeek-V4-Pro",
    contributions: [
      "双档同时开源：V4-Pro (1.6T 总参 / 49B 激活) + V4-Flash (284B / 13B 激活)",
      "原生 1M token 上下文，所有官方服务默认开启",
      "混合注意力 CSA + HCA：1M 长度下单 token 推理 FLOPs 降到 V3.2 的 27%、KV 缓存降到 10%",
      "Manifold-Constrained Hyper-Connections (mHC) 替代普通残差，强化深层信号传播",
      "全程 Muon 优化器（embedding 用 AdamW），收敛更快更稳定",
      "两阶段后训练：领域专家独立 SFT + GRPO，再 on-policy 蒸馏统一为单模型",
      "MIT 协议开源权重，V4-Pro-Max 在 SWE-bench Verified / LiveCodeBench 等 agent / 编程榜上对齐 Claude Opus 与 GPT-5 系",
    ],
    buildsOn: ["deepseek-v3-2", "deepseek-r1"],
    metrics: [
      { label: "V4-Pro 参数", value: "1.6T / 49B 激活" },
      { label: "V4-Flash 参数", value: "284B / 13B 激活" },
      { label: "上下文", value: "1M" },
      { label: "训练 tokens", value: "32T+" },
      { label: "SWE-bench V", value: "80.6%" },
      { label: "LiveCodeBench", value: "93.5" },
      { label: "License", value: "MIT" },
    ],
    summary:
      "DeepSeek 在 R1 之后约一年的下一代旗舰，以 V4-Pro (1.6T / 49B 激活) 和 V4-Flash (284B / 13B 激活) 双档同时 MIT 协议开源权重，原生 1M token 上下文。架构相比 V3.2 做了三处大改：(1) 混合注意力 —— Compressed Sparse Attention (CSA) + Heavily Compressed Attention (HCA) 共同把 1M 长度下的单 token 推理 FLOPs 降到 V3.2 的 27%、KV 缓存降到 10%；(2) 流形约束超连接 (mHC) 替代普通残差，强化深层信号传播；(3) 全程 Muon 优化器。32T+ tokens 预训练 + 「领域专家培养 → on-policy 蒸馏统一」两阶段后训练。最高算力档 V4-Pro-Max 在 SWE-bench Verified 80.6%、LiveCodeBench 93.5，agent 编程能力对齐 Claude Opus 4.6 与 GPT-5 系，但 API 价格约为顶级闭源旗舰的 1/8。是继 R1 之后又一次开源「冲击」事件。",
    highlight: true,
    tier: "flagship",
  },

  {
    id: "qwen2",
    team: "qwen",
    title: "Qwen2 Technical Report",
    titleZh: "Qwen2 技术报告",
    date: "2024-07-15",
    arxiv: "2407.10671",
    github: "QwenLM/Qwen2",
    contributions: [
      "0.5B – 72B 全尺寸 + 57B-A14B MoE",
      "30+ 语种,长上下文 128K",
      "Qwen2-72B-Instruct 在 Arena-Hard 48.1",
    ],
    buildsOn: [],
    metrics: [
      { label: "尺寸", value: "0.5B–72B" },
      { label: "MMLU(72B)", value: "84.2" },
      { label: "GSM8K", value: "89.5" },
    ],
    summary:
      "Qwen 在 2024 年中的全面升级,首次同时放出 0.5B / 1.5B / 7B / 57B-MoE / 72B 五档,把开源 dense 72B 推到 GPT-4 同档基准水平。",
    tier: "stub",
  },

  {
    id: "qwen2-5",
    team: "qwen",
    title: "Qwen2.5 Technical Report",
    titleZh: "Qwen2.5 技术报告",
    date: "2024-12-19",
    arxiv: "2412.15115",
    github: "QwenLM/Qwen2.5",
    contributions: [
      "18T tokens 高质量预训练",
      "1M+ SFT + 多阶段 RL",
      "0.5B–72B 全尺寸开源(Apache 2.0)",
      "长文本与结构化输出大幅提升",
    ],
    buildsOn: ["qwen2"],
    metrics: [
      { label: "尺寸", value: "0.5B–72B" },
      { label: "训练 tokens", value: "18T" },
      { label: "MMLU(72B)", value: "86.1" },
    ],
    summary:
      "Qwen 系列在 2024 年底的旗舰发布。预训练 token 从 7T 涨到 18T,后训练做超大规模 SFT + 多阶段 RL,开源 72B 在多项基准上接近 405B 的 Llama-3.1-Instruct。",
    tier: "stub",
  },

  {
    id: "qwen2-5-coder",
    team: "qwen",
    title: "Qwen2.5-Coder Technical Report",
    titleZh: "Qwen2.5-Coder 技术报告",
    date: "2024-09-18",
    arxiv: "2409.12186",
    github: "QwenLM/Qwen2.5-Coder",
    contributions: [
      "0.5B / 1.5B / 3B / 7B / 14B / 32B 全尺寸",
      "5.5T code tokens 继续预训练",
      "10+ 代码基准 SOTA",
      "32B-Instruct 对齐 GPT-4o-2024-08-06",
    ],
    buildsOn: ["qwen2-5"],
    metrics: [
      { label: "HumanEval(32B)", value: "92.7" },
      { label: "MBPP", value: "90.2" },
      { label: "LiveCodeBench", value: "31.4" },
    ],
    summary:
      "在 Qwen2.5 上继续注入 5.5T 代码 tokens,通过细致的数据清洗与合成,把 6 个尺寸的 Coder 全做到同尺寸 SOTA;32B 是首个真正同档对齐 GPT-4o 的开源代码模型。",
    tier: "stub",
  },

  {
    id: "qwq-32b",
    team: "qwen",
    title: "QwQ-32B: Embracing the Power of Reinforcement Learning",
    titleZh: "QwQ-32B:用 RL 把 32B 推到 R1 同档",
    date: "2025-03-06",
    github: "QwenLM/QwQ",
    hf: "Qwen/QwQ-32B",
    contributions: [
      "在 Qwen2.5-32B 基础上做大规模推理 RL",
      "32B 参数对齐 DeepSeek-R1(671B / 37B 激活)",
      "集成工具调用 / Agent 行为",
      "Apache 2.0 开源权重",
    ],
    buildsOn: ["qwen2-5"],
    metrics: [
      { label: "参数量", value: "32B (Dense)" },
      { label: "AIME 2024", value: "79.5" },
      { label: "LiveCodeBench", value: "63.4" },
    ],
    summary:
      "Qwen 团队对推理型模型的回应:在 Qwen2.5-32B 上跑大规模 RL,32B Dense 模型在数学、代码、Agent 任务上和 DeepSeek-R1(671B)同档。证明 RL Scaling 是另一条独立的能力增长曲线。",
    tier: "stub",
  },

  {
    id: "qwen3",
    team: "qwen",
    title: "Qwen3 Technical Report",
    titleZh: "Qwen3 技术报告",
    date: "2025-05-14",
    arxiv: "2505.09388",
    github: "QwenLM/Qwen3",
    hf: "Qwen/Qwen3-235B-A22B",
    contributions: [
      "Hybrid Thinking / Non-Thinking 单模型双模式",
      "Thinking Budget:推理时按 token 预算切换深度",
      "0.6B–235B 全尺寸 dense + MoE",
      "119 语种,Apache 2.0 全开源",
    ],
    buildsOn: ["qwen2-5"],
    metrics: [
      { label: "旗舰", value: "235B-A22B MoE" },
      { label: "语言数", value: "119" },
      { label: "AIME 2024", value: "85.7" },
      { label: "LiveCodeBench", value: "70.7" },
    ],
    summary:
      "Qwen 3 把 chat-optimized 与 reasoning 模型合二为一:同一个权重通过 chat template 切换 thinking / non-thinking;并新增「思考预算」机制,推理时按需分配 token 让任务延迟可控。",
    tier: "flagship",
  },

  {
    id: "qwen3-6",
    team: "qwen",
    title: "Qwen3.6 / Qwen3.6 Plus / Qwen3.6 Max",
    titleZh: "Qwen3.6:全尺寸刷新 + Agent 编码深度优化",
    date: "2026-04-15",
    contributions: [
      "全面对标 frontier 闭源模型",
      "agent 编码深度优化",
      "继续扩 Thinking Budget 能力",
    ],
    buildsOn: ["qwen3"],
    summary:
      "Qwen 在 2026 年 4 月的全尺寸刷新,与 Kimi K2.6、DeepSeek V4 形成「2026 中国开源三强」格局。",
    tier: "stub",
  },

  {
    id: "kimi-k1-5",
    team: "kimi",
    title: "Kimi k1.5: Scaling Reinforcement Learning with LLMs",
    titleZh: "Kimi k1.5:把 RL Scaling 到长上下文",
    date: "2025-01-22",
    arxiv: "2501.12599",
    github: "MoonshotAI/Kimi-k1.5",
    contributions: [
      "长上下文 RL(rollout 上下文 128K)",
      "Long2Short 蒸馏:长 CoT → 短 CoT",
      "多模态推理(text + image)",
      "在 short-CoT 设定下对齐 GPT-4o / Claude 3.5",
    ],
    buildsOn: [],
    metrics: [
      { label: "AIME 2024 (long-CoT)", value: "77.5" },
      { label: "MATH-500", value: "96.2" },
      { label: "Codeforces", value: "94 percentile" },
    ],
    summary:
      "Moonshot 与 R1 同日发布的推理模型技术报告。强调 RL 阶段允许 rollout 长达 128K,以及把 long-CoT 模型蒸馏回 short-CoT 模型的技术,在不延长推理时间的前提下迁移推理能力。",
    tier: "stub",
  },

  {
    id: "kimi-k2",
    team: "kimi",
    title: "Kimi K2: Open Agentic Intelligence",
    titleZh: "Kimi K2:开源 Agent 智能",
    date: "2025-07-28",
    arxiv: "2507.20534",
    github: "MoonshotAI/Kimi-K2",
    hf: "moonshotai/Kimi-K2-Instruct",
    contributions: [
      "MuonClip 优化器(Muon + QK-Clip,零 loss spike)",
      "1T 参数 MoE / 32B 激活",
      "15.5T tokens 预训练,大规模 agentic 数据合成",
      "Tau2-Bench 66.1 / SWE-Bench Verified 65.8",
    ],
    buildsOn: [],
    metrics: [
      { label: "总参数", value: "1T" },
      { label: "激活参数", value: "32B" },
      { label: "训练 tokens", value: "15.5T" },
      { label: "SWE-Bench Verified", value: "65.8" },
    ],
    summary:
      "Moonshot 以 MuonClip 优化器(在 Muon 基础上加 QK-Clip 解决训练不稳定)做底,15.5T tokens 零 loss spike 训完 1T MoE。后训练侧重大规模 agentic 数据合成,把 Kimi K2 推向开源 SWE 与 Tau-Bench 同尺寸第一。",
    tier: "flagship",
  },

  {
    id: "kimi-k2-6",
    team: "kimi",
    title: "Kimi K2.6",
    titleZh: "Kimi K2.6:更长 Agent 编码会话",
    date: "2026-04-18",
    contributions: [
      "更长自主编码会话",
      "多 agent 编排",
      "对标 Qwen3.6 / DeepSeek V4",
    ],
    buildsOn: ["kimi-k2"],
    summary: "Moonshot 在 2026 年 4 月对 K2 的迭代,强化 agentic 长会话稳定性。",
    tier: "stub",
  },

  {
    id: "glm-4-5",
    team: "glm",
    title: "GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models",
    titleZh: "GLM-4.5:Agent / Reasoning / Coding 三位一体",
    date: "2025-08-08",
    arxiv: "2508.06471",
    github: "zai-org/GLM-4.5",
    contributions: [
      "355B MoE / 32B 激活,Hybrid Reasoning",
      "23T tokens 多阶段预训练",
      "Expert Iteration + RL 后训练",
      "TAU-Bench 70.1 / AIME 24 91.0 / SWE-Bench V 64.2",
    ],
    buildsOn: [],
    metrics: [
      { label: "总参数", value: "355B / 106B (Air)" },
      { label: "激活参数", value: "32B / 12B" },
      { label: "TAU-Bench", value: "70.1" },
      { label: "SWE-Bench V", value: "64.2" },
    ],
    summary:
      "智谱给出的「ARC 三合一」基础模型:用同一权重在 Agentic、Reasoning、Coding 三类基准上同时做到开源前列;Air 版本压到 106B 总 / 12B 激活仍保持竞争力。",
    tier: "flagship",
  },

  {
    id: "minicpm-4",
    team: "minicpm",
    title: "MiniCPM4: Ultra-Efficient LLMs on End Devices",
    titleZh: "MiniCPM4:端侧极致高效的 LLM",
    date: "2025-06-09",
    arxiv: "2506.07900",
    github: "OpenBMB/MiniCPM",
    hf: "openbmb/MiniCPM4-8B",
    contributions: [
      "InfLLM v2:可训练稀疏注意力,长上下文加速",
      "UltraClean 数据过滤 + UltraChat v2 SFT",
      "BitCPM 三元 LLM + 推测采样",
      "8B 端侧速度显著超 Qwen3-8B",
    ],
    buildsOn: [],
    metrics: [
      { label: "尺寸", value: "0.5B / 8B" },
      { label: "训练 tokens", value: "8T" },
      { label: "长序列加速", value: "vs Qwen3-8B 显著" },
    ],
    summary:
      "面壁聚焦端侧部署:从架构(InfLLM v2 稀疏注意力)、数据(UltraClean / UltraChat v2)、算法(ModelTunnel v2 + chunk-wise rollout RL)到推理系统(CPM.cu)四个维度做系统性创新,在手机/笔记本 GPU 上把长序列推理拉到可用区间。",
    tier: "flagship",
  },

  {
    id: "yi",
    team: "yi",
    title: "Yi: Open Foundation Models by 01.AI",
    titleZh: "Yi:零一万物的开源基础模型",
    date: "2024-03-07",
    arxiv: "2403.04652",
    github: "01-ai/Yi",
    contributions: [
      "6B / 34B 双尺寸基模型 + 视觉版",
      "高质量数据清洗 + 长上下文",
      "Yi-34B 在 in-context learning 上表现突出",
    ],
    buildsOn: [],
    metrics: [
      { label: "尺寸", value: "6B / 34B" },
      { label: "训练 tokens", value: "3.1T" },
      { label: "MMLU(34B)", value: "76.3" },
    ],
    summary:
      "零一万物 2024 年初发布的双语开源基础模型,6B / 34B 两档,Yi-34B 在多项 benchmark 上接近 Llama2-70B,并展示了双语 ICL 上的「涌现」行为。",
    tier: "stub",
  },

  {
    id: "yi-lightning",
    team: "yi",
    title: "Yi-Lightning Technical Report",
    titleZh: "Yi-Lightning 技术报告",
    date: "2024-12-02",
    arxiv: "2412.01253",
    github: "01-ai/Yi",
    contributions: [
      "增强 MoE:细粒度 + 优化路由",
      "RAISE:四组件安全框架",
      "Chatbot Arena 第 6,中文 / 数学 / 代码 / Hard Prompts 进 Top 4",
    ],
    buildsOn: ["yi"],
    metrics: [
      { label: "Arena 总排名", value: "6" },
      { label: "Chinese", value: "Top 2-4" },
      { label: "Coding", value: "Top 2-4" },
    ],
    summary: "零一万物的旗舰 MoE 模型,继承 Yi 的双语能力,叠加更细的专家分工与 RAISE 安全框架。",
    tier: "stub",
  },

  {
    id: "baichuan2",
    team: "baichuan",
    title: "Baichuan 2: Open Large-scale Language Models",
    titleZh: "Baichuan 2:百川 7B / 13B 开源大模型",
    date: "2023-09-19",
    arxiv: "2309.10305",
    github: "baichuan-inc/Baichuan2",
    contributions: [
      "7B / 13B 双尺寸,2.6T tokens 预训练",
      "中英双语 + 法律 / 医疗垂直能力",
      "公开预训练全部 checkpoint,便于研究训练动力学",
    ],
    buildsOn: [],
    metrics: [
      { label: "尺寸", value: "7B / 13B" },
      { label: "训练 tokens", value: "2.6T" },
      { label: "MMLU(13B)", value: "59.2" },
    ],
    summary:
      "百川智能 2023 年 9 月的旗舰开源工作。除性能外,最大贡献是把训练全过程的 checkpoint 全部开放,首次让外部研究者能复现/分析中文大模型的训练动力学。",
    tier: "stub",
  },

  {
    id: "baichuan-omni",
    team: "baichuan",
    title: "Baichuan-Omni",
    titleZh: "Baichuan-Omni:全模态开源模型",
    date: "2024-10-01",
    contributions: ["多模态融合", "图文音视频统一"],
    buildsOn: ["baichuan2"],
    summary: "百川智能的开源全模态模型。",
    tier: "stub",
  },

  {
    id: "internlm2",
    team: "internlm",
    title: "InternLM2 Technical Report",
    titleZh: "InternLM2 技术报告",
    date: "2024-03-26",
    arxiv: "2403.17297",
    github: "InternLM/InternLM",
    contributions: [
      "1.8B / 7B / 20B 全尺寸开源",
      "4K → 32K → 200K 三阶段长上下文训练",
      "COOL RLHF:解决偏好冲突 + 防 reward hacking",
      "200K \"Needle-in-a-Haystack\" 接近满分",
    ],
    buildsOn: [],
    metrics: [
      { label: "尺寸", value: "1.8B / 7B / 20B" },
      { label: "上下文", value: "200K" },
      { label: "MMLU(20B)", value: "67.7" },
    ],
    summary:
      "上海 AI 实验室 InternLM2 是少数把「长上下文训练 + 后训练 RLHF」两条线都讲清楚的开源工作:三阶段长度课程让 200K 大海捞针接近完美;COOL RLHF 用条件 reward 解决多偏好冲突。",
    tier: "stub",
  },

  {
    id: "internlm-3",
    team: "internlm",
    title: "InternLM3",
    titleZh: "InternLM3:通用 + 推理双模式",
    date: "2025-01-15",
    github: "InternLM/InternLM",
    contributions: [
      "通用 + 推理双模式",
      "4T 高质量 tokens 训练",
      "数据效率显著提升",
    ],
    buildsOn: ["internlm2"],
    summary:
      "上海 AI 实验室发布的开源 LLM,强调高数据质量低 token 量训练,引入双模式以兼顾日常对话与推理任务。",
    tier: "stub",
  },

  {
    id: "hunyuan-large",
    team: "tencent",
    title:
      "Hunyuan-Large: An Open-Source MoE Model with 52 Billion Activated Parameters by Tencent",
    titleZh: "腾讯混元 Hunyuan-Large:389B / 52B 激活 MoE",
    date: "2024-11-04",
    arxiv: "2411.02265",
    github: "Tencent/Tencent-Hunyuan-Large",
    hf: "tencent/Tencent-Hunyuan-Large",
    contributions: [
      "389B 总参 / 52B 激活,256K 上下文",
      "混合专家路由 + KV-cache 压缩",
      "专家级别独立学习率",
      "MoE Scaling Laws 与学习率 schedule 系统研究",
    ],
    buildsOn: [],
    metrics: [
      { label: "总参数", value: "389B" },
      { label: "激活参数", value: "52B" },
      { label: "上下文", value: "256K" },
    ],
    summary:
      "腾讯首个对外开源的旗舰级 MoE。最大亮点不只是规模,而是详尽的工程实践:大规模合成数据、Mixed Expert Routing、KV-Cache 压缩、Expert-Specific LR,并系统研究 MoE Scaling Laws。",
    tier: "stub",
  },

  {
    id: "minimax-01",
    team: "minimax",
    title: "MiniMax-01: Scaling Foundation Models with Lightning Attention",
    titleZh: "MiniMax-01:用 Lightning Attention 扩展百万上下文",
    date: "2025-01-15",
    arxiv: "2501.08313",
    github: "MiniMax-AI/MiniMax-01",
    hf: "MiniMaxAI/MiniMax-Text-01",
    contributions: [
      "Lightning Attention 线性注意力 + MoE",
      "32 专家 / 456B 总参 / 45.9B 激活",
      "训练上下文 1M,推理外推 4M",
      "VL 版本(MiniMax-VL-01)同期开源",
    ],
    buildsOn: [],
    metrics: [
      { label: "总参数", value: "456B" },
      { label: "激活参数", value: "45.9B" },
      { label: "训练上下文", value: "1M" },
      { label: "推理上下文", value: "4M" },
    ],
    summary:
      "MiniMax 在 2025 年初的旗舰发布。把 Lightning Attention(线性注意力变体)与 MoE 组合,围绕「百万上下文」从零设计训练并行与推理系统;开源后成为线性注意力路线最具影响力的工业级实证。",
    tier: "flagship",
  },
];

export function paperById(id: string): Paper | undefined {
  return PAPERS.find((p) => p.id === id);
}

export function papersByTeam(team: string): Paper[] {
  return PAPERS.filter((p) => p.team === team);
}
