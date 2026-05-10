export interface PaperMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface PipelineStage {
  num: string;
  title: string;
  subtitle?: string;
  desc: string;
  inputs?: string[];
  outputs?: string[];
  innovations?: string[];
  color?: string;
}

export interface KeyTechnique {
  name: string;
  formula?: string;
  intuition: string;
  why: string;
}

export interface BenchmarkPoint {
  name: string;
  value: number;
  baseline?: number;
  baselineModel?: string;
  max?: number;
  higherIsBetter?: boolean;
}

export interface Insight {
  title: string;
  body: string;
}

export interface LineageRef {
  id: string;
  role: "predecessor" | "contemporary" | "successor" | "applies";
  note?: string;
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

  // R1-granularity structured deep-page sections.
  // All optional — present sections render automatically in PaperDeepView.
  pipeline?: PipelineStage[];
  keyTechniques?: KeyTechnique[];
  benchmarks?: BenchmarkPoint[];
  insights?: Insight[];
  lineage?: LineageRef[];
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
    pipeline: [
      {
        num: "01",
        title: "Scaling Laws 重建",
        subtitle: "Pre-flight",
        desc: "在 7e16–3e20 FLOPs 的 IsoFLOP 网格上训练系列小模型，拟合最优 (M*, D*) 关系，得出新的算力分配指数。",
        inputs: ["小模型扫描", "多组数据质量"],
        outputs: ["a (model exp)", "b (data exp)", "最优 token / 模型比"],
        innovations: ["以 non-embedding FLOPs/token M 取代 N", "区分数据质量"],
      },
      {
        num: "02",
        title: "数据 + 预训练",
        subtitle: "Pre-training",
        desc: "构建 2T tokens 高质量多源中英语料，多步学习率调度（替代 cosine）便于持续训练。",
        inputs: ["2T tokens", "多步 LR"],
        outputs: ["7B / 67B Base"],
        innovations: ["多步 LR 利于热更新", "数据去重 + 文档级清洗"],
      },
      {
        num: "03",
        title: "对齐",
        subtitle: "SFT + DPO",
        desc: "两阶段对齐：先 SFT 获得指令遵循，再 DPO 引入人类偏好；不引入额外 reward model。",
        inputs: ["指令数据", "DPO pair 数据"],
        outputs: ["Chat 模型"],
        innovations: ["DPO 取代 PPO，训练更稳"],
      },
    ],
    keyTechniques: [
      {
        name: "新 Scaling Law 度量",
        formula:
          "M^{*} \\propto C^{a},\\ D^{*} \\propto C^{b},\\ a + b = 1",
        intuition:
          "把模型规模度量从「参数量 N」改为「每 token 的 non-embedding FLOPs M」，避免 embedding 在小模型里失真，再在 IsoFLOP 上拟合最优分配。",
        why: "更准确地外推大模型最优算力/数据，是 67B 训练计划与后续 V2/V3 算力规划的方法论起点。",
      },
      {
        name: "多步学习率",
        intuition:
          "把 cosine 衰减替换成阶梯式多步：阶段内常数、阶段间衰减。不依赖训练终点位置。",
        why: "继续预训练 / 加数据时不会被 cosine 曲线锁死最终学习率，是 DeepSeek 持续训练范式的伏笔。",
      },
    ],
    benchmarks: [
      { name: "MMLU", value: 71.3, baseline: 68.9, baselineModel: "LLaMA-2 70B" },
      { name: "HumanEval", value: 73.8, baseline: 30.5, baselineModel: "LLaMA-2 70B" },
      { name: "GSM8K", value: 84.1, baseline: 56.8, baselineModel: "LLaMA-2 70B" },
      { name: "MATH", value: 32.6, baseline: 13.8, baselineModel: "LLaMA-2 70B" },
      { name: "BBH", value: 71.7, baseline: 51.2, baselineModel: "LLaMA-2 70B" },
    ],
    insights: [
      {
        title: "数据质量决定算力指数",
        body: "更高质量的数据让 a (模型指数) 下降、b (数据指数) 上升——也就是「该把更多算力堆给数据」。这一观察直接指导了之后所有 DeepSeek 模型的 token 数量决策。",
      },
      {
        title: "67B 全面超 LLaMA2-70B 但用更少算力",
        body: "证明在同等开放数据条件下，正确的 scaling 决策比单纯堆参数更重要，是「中国开源大模型也能踩上 frontier」的第一个公开样本。",
      },
    ],
    lineage: [
      { id: "deepseek-moe", role: "successor", note: "把 dense 67B 经验迁移到 MoE" },
      { id: "deepseek-math", role: "successor", note: "在 LLM Base 之上做数学领域继续预训练" },
      { id: "deepseek-coder", role: "successor", note: "代码方向的同期工作" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "仓库级数据组合",
        subtitle: "Repo-level Pretraining",
        desc: "以仓库为单位拼接文件，按依赖顺序排序，让模型在预训练时看到项目级上下文，而不是孤立的文件。",
        inputs: ["GitHub raw repos", "依赖图分析"],
        outputs: ["项目级训练样本"],
        innovations: ["跨文件依赖排序", "仓库感知去重"],
      },
      {
        num: "02",
        title: "Fill-in-the-Middle",
        subtitle: "FIM Pretraining",
        desc: "在 87% 代码 + 13% 自然语言上以 FIM 目标训练，让模型既能续写也能补洞，匹配真实 IDE 场景。",
        inputs: ["2T 多语言 code tokens"],
        outputs: ["1.3B–33B Base"],
        innovations: ["FIM + 长上下文 (16K)"],
      },
      {
        num: "03",
        title: "指令微调",
        subtitle: "Instruct",
        desc: "用高质量代码指令数据 SFT，发布 Coder-Instruct 系列，开放商用。",
        inputs: ["代码指令数据"],
        outputs: ["Coder-Instruct"],
        innovations: ["开放商用许可"],
      },
    ],
    keyTechniques: [
      {
        name: "Repo-Aware Dedup",
        intuition:
          "传统 file-level 去重无法识别「同一项目的多文件之间高度相似」的情况；改用 repo-level 去重避免训练数据被同一项目的多个克隆变体污染。",
        why: "数据信噪比直接决定代码模型上限，是后续 V2 / V3 一直沿用的清洗范式。",
      },
      {
        name: "Fill-in-the-Middle",
        intuition:
          "训练时随机切分 prefix / middle / suffix，让模型学会在已知前后文时补中间——和真实 IDE 的代码补全场景一致。",
        why: "把 base 模型直接变成可用的补全引擎，而不只是续写器。",
      },
    ],
    benchmarks: [
      { name: "HumanEval", value: 79.3, baseline: 73.2, baselineModel: "GPT-3.5" },
      { name: "MBPP", value: 70.0, baseline: 65.8, baselineModel: "GPT-3.5" },
      { name: "DS-1000", value: 40.2, baseline: 32.4, baselineModel: "GPT-3.5" },
      { name: "MultiPL-E", value: 67.5 },
      { name: "APPS", value: 49.4 },
    ],
    insights: [
      {
        title: "项目级上下文胜于堆 token",
        body: "在同等 token 预算下，把同一项目的多个文件按依赖顺序拼接，比「随机抽文件」更能让模型学到工程级模式 (import / 类继承 / 接口实现)。",
      },
    ],
    lineage: [
      { id: "deepseek-coder-v2", role: "successor", note: "MoE 化 + 拉到 GPT-4 水平" },
    ],
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
    keyTechniques: [
      {
        name: "Fine-Grained Expert Segmentation",
        formula:
          "h_i = \\sum_{k \\in \\text{TopK}_{mK}(g)} g_k \\cdot \\text{FFN}_k(x_i)",
        intuition:
          "把每个 FFN 拆成 m 倍数量的更小专家，同时把激活数也拉大 m 倍。组合数 C(mN, mK) 远大于 C(N, K)，专家组合更精细。",
        why: "在 FLOPs 不变的前提下提升表征灵活度，是后续 V2 / V3 把专家数推到 160 / 256 的方法论起点。",
      },
      {
        name: "Shared Expert Isolation",
        intuition:
          "把 1–2 个专家固定为「共享」，每个 token 都激活；让它们承载共性知识，路由专家专注差异化能力。",
        why: "缓解路由专家之间的知识重复 (knowledge redundancy)，提升参数利用率。",
      },
      {
        name: "Expert + Device Balance Loss",
        intuition:
          "在专家级负载均衡之外，再加一项设备级均衡损失，避免某些机器变成通信热点。",
        why: "为大规模分布式 MoE 训练 (V2 236B、V3 671B) 铺平基础设施。",
      },
    ],
    benchmarks: [
      { name: "MMLU (16B)", value: 45.0, baseline: 45.3, baselineModel: "LLaMA2-7B" },
      { name: "GSM8K", value: 18.8, baseline: 16.7, baselineModel: "LLaMA2-7B" },
      { name: "HumanEval", value: 26.8, baseline: 12.8, baselineModel: "LLaMA2-7B" },
      { name: "BBH", value: 39.0, baseline: 33.0, baselineModel: "LLaMA2-7B" },
      { name: "Activated FLOPs %", value: 40, baseline: 100, baselineModel: "LLaMA2-7B" },
    ],
    insights: [
      {
        title: "MoE 不是「免费午餐」，专家粒度才是关键",
        body: "原始 GShard / Switch 的粗粒度专家组合空间小，知识重复严重；细粒度切分 + shared expert 才让 MoE 真正发挥参数效率。",
      },
      {
        title: "16B / 2.8B 激活 ≈ LLaMA2-7B 性能 + 40% 算力",
        body: "首次给出业界可信的「同性能、显著降本」MoE 数据点，使后续主流国产模型（Qwen-MoE、Hunyuan-Large、Kimi K2）几乎都参考这套设计。",
      },
    ],
    lineage: [
      { id: "deepseek-llm", role: "predecessor", note: "继承 dense 67B 的训练方法" },
      { id: "deepseek-v2", role: "successor", note: "把细粒度专家 + shared expert 推到 160 路由专家规模" },
      { id: "deepseek-v3", role: "successor", note: "256 专家 + auxiliary-loss-free 均衡" },
      { id: "deepseek-vl2", role: "applies", note: "把 DeepSeekMoE 用作多模态主干" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "DeepSeekMath Corpus",
        subtitle: "Data Mining",
        desc: "用 fastText 分类器在 Common Crawl 上迭代召回数学相关 web 页 + arXiv + 书籍，最终得到 120B 高质量数学 token。",
        inputs: ["Common Crawl", "种子: OpenWebMath"],
        outputs: ["120B 数学 token"],
        innovations: ["fastText 多轮自训练", "URL / 主机域去重"],
      },
      {
        num: "02",
        title: "数学领域继续预训练",
        subtitle: "Domain CPT",
        desc: "在 DeepSeek-Coder-Base-v1.5 7B 之上继续预训练，让模型在保留代码能力的同时获得数学先验。",
        inputs: ["Coder-Base 7B", "DeepSeekMath Corpus"],
        outputs: ["DeepSeekMath-Base"],
        innovations: ["以 code base 起步而非 LLM base"],
      },
      {
        num: "03",
        title: "CoT + PoT SFT",
        subtitle: "Supervised Fine-Tuning",
        desc: "联合 chain-of-thought (CoT) 与 program-of-thought (PoT) 数据 SFT，让模型既能写推理也能写程序。",
        inputs: ["776K SFT 样本"],
        outputs: ["DeepSeekMath-Instruct"],
        innovations: ["CoT 与 PoT 联合训练"],
      },
      {
        num: "04",
        title: "GRPO 强化学习",
        subtitle: "Reinforcement Learning",
        desc: "在 SFT 基础上做 RL：用同一 prompt 采样一组 (G=64) 回答，按答案对错计算组内相对优势，免 critic。",
        inputs: ["GSM8K + MATH 训练 prompt"],
        outputs: ["DeepSeekMath-RL"],
        innovations: ["GRPO 算法首次提出", "规则奖励 + 无 critic"],
      },
    ],
    keyTechniques: [
      {
        name: "GRPO",
        formula:
          "A_i = \\frac{r_i - \\text{mean}(\\{r_j\\}_{j=1}^{G})}{\\text{std}(\\{r_j\\}_{j=1}^{G})}",
        intuition:
          "对每个 prompt 采样 G 个回答，把组内平均奖励作为 baseline、标准差归一化作为优势 A_i。完全免去价值函数 (critic) 网络。",
        why: "训练显存约为 PPO 的一半，pipeline 简单稳定。一年后被 R1 直接拿来跑大规模推理 RL，是整个开源推理浪潮的算法底座。",
      },
      {
        name: "DeepSeekMath Corpus",
        intuition:
          "用 fastText 分类器从 OpenWebMath 学到「数学样」的特征，再扫一遍 Common Crawl 召回新页，把召回页加进训练集再训分类器，多轮迭代。",
        why: "把数学预训练 token 从过去公开的 ~10B 量级直接拉到 120B，证明高质量领域数据可以从 web 大规模挖掘。",
      },
    ],
    benchmarks: [
      { name: "MATH (Top-1)", value: 51.7, baseline: 42.5, baselineModel: "Llemma-34B" },
      { name: "MATH (cons@64)", value: 60.9 },
      { name: "GSM8K", value: 88.2, baseline: 51.5, baselineModel: "Llemma-34B" },
      { name: "MMLU", value: 64.4 },
      { name: "Hungarian Exam", value: 65 },
    ],
    insights: [
      {
        title: "Critic 不是必需的",
        body: "在「答案可自动验证」的任务上，组内相对优势可以完全替代价值函数。这一观察是后续 R1 / Kimi K1.5 / QwQ 等推理 RL 的共同底层假设。",
      },
      {
        title: "7B 数学模型可以逼近 GPT-4",
        body: "在不调用工具、不投票的纯生成设定下 MATH 51.7%、cons@64 60.9%，证明数学推理能力强烈依赖于「数据 + RL」而非纯参数量。",
      },
    ],
    lineage: [
      { id: "deepseek-llm", role: "predecessor", note: "提供 67B Base 与 scaling law 方法论" },
      { id: "deepseek-coder", role: "predecessor", note: "提供 Coder-Base-v1.5 7B 起点" },
      { id: "deepseek-r1", role: "successor", note: "把 GRPO 拓展到通用推理 RL" },
      { id: "deepseek-prover-v2", role: "successor", note: "把 informal CoT 与 Lean 形式证明合一" },
    ],
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
    keyTechniques: [
      {
        name: "Hybrid Vision Encoder",
        intuition:
          "SigLIP 提供高层语义但分辨率受限；SAM-B 提供高分辨率细节但缺语义。把两者并行编码再融合，token 预算固定。",
        why: "兼顾高分辨率文档 / 图表与语义对齐，是后续 VL2 / OCR 仍在沿用的设计动机。",
      },
      {
        name: "VL Pretraining Schedule",
        intuition:
          "三阶段预训练：先 vision-language 对齐、再 joint VL pretraining、最后 SFT；中间阶段保留大量纯文本 token。",
        why: "防止视觉数据稀释 LLM 原有能力，让 VL 模型在纯文本任务上不掉点。",
      },
    ],
    benchmarks: [
      { name: "MMBench", value: 73.2 },
      { name: "MM-Vet", value: 41.5 },
      { name: "POPE", value: 87.6 },
      { name: "OCR-Bench", value: 456, max: 1000 },
    ],
    insights: [
      {
        title: "VL 训练不应以牺牲 LLM 能力为代价",
        body: "论文强调通过混入纯文本与精细的训练 schedule，可以在多模态能力上达到 SOTA 的同时基本不损失 base LLM 在 MMLU / GSM8K 上的表现。",
      },
    ],
    lineage: [
      { id: "deepseek-llm", role: "predecessor", note: "复用 DeepSeek-LLM 7B 作为语言主干" },
      { id: "deepseek-vl2", role: "successor", note: "MoE 化 + 动态 tiling" },
      { id: "janus-pro", role: "successor", note: "解耦理解与生成路径" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "MLA + DeepSeekMoE 架构",
        subtitle: "Architecture",
        desc: "在 DeepSeek-LLM 与 DeepSeekMoE 经验上，把 attention 换成 MLA（KV 低秩潜向量），FFN 换成 160 路由 + 2 shared 的细粒度 MoE。",
        outputs: ["236B 总参 / 21B 激活"],
        innovations: ["MLA 低秩 KV 压缩", "细粒度 + shared expert 大规模化"],
      },
      {
        num: "02",
        title: "8.1T tokens 预训练",
        subtitle: "Pre-training",
        desc: "多源高质量语料 + 多步 LR；引入 Device-Limited Routing 与 Communication Balance 损失，缓解跨机通信热点。",
        inputs: ["8.1T tokens"],
        outputs: ["V2-Base"],
        innovations: ["Device-Limited Routing", "Token Drop 损失"],
      },
      {
        num: "03",
        title: "长上下文扩展",
        subtitle: "Long Context",
        desc: "用 YaRN 把上下文从 4K 外推到 128K，并在长文本数据上做 long-context fine-tuning。",
        inputs: ["YaRN 配置", "long-context 数据"],
        outputs: ["128K 上下文"],
        innovations: ["MLA + YaRN 协同"],
      },
      {
        num: "04",
        title: "对齐 (SFT + RL)",
        subtitle: "Alignment",
        desc: "1.5M SFT 后用 GRPO 做 RL，奖励兼顾 helpfulness 与 safety；语言混杂被显式惩罚。",
        outputs: ["V2-Chat"],
        innovations: ["GRPO 在通用对齐场景的早期工业应用"],
      },
    ],
    keyTechniques: [
      {
        name: "Multi-head Latent Attention (MLA)",
        formula:
          "c_t^{KV} = W^{DKV} h_t,\\ k_t = W^{UK} c_t^{KV},\\ v_t = W^{UV} c_t^{KV}",
        intuition:
          "把每个 token 的所有头的 K/V 先压缩到一个低秩潜向量 c，推理时再上投影出每个头的 K/V。KV cache 只缓存 c，显存显著下降。",
        why: "把 KV cache 压到 GQA 的几分之一，让 128K 上下文在单机部署成为可能；MLA 是 V2 → V3 → V3.2 → V4 的统一注意力底座。",
      },
      {
        name: "Device-Limited Routing",
        intuition:
          "每个 token 路由的专家被限制在最多 M 张 GPU 上选择，避免一个 token 触发跨 M+ 设备的 all-to-all。",
        why: "把 MoE 的通信代价从 O(experts) 降到 O(devices)，是 236B / 671B MoE 能在常规集群训得动的关键工程优化。",
      },
    ],
    benchmarks: [
      { name: "MMLU", value: 78.5, baseline: 71.3, baselineModel: "DeepSeek 67B" },
      { name: "GSM8K", value: 79.2, baseline: 75.7, baselineModel: "DeepSeek 67B" },
      { name: "HumanEval", value: 81.1, baseline: 73.8, baselineModel: "DeepSeek 67B" },
      { name: "BBH", value: 78.9, baseline: 71.7, baselineModel: "DeepSeek 67B" },
      { name: "Train Cost %", value: 57.5, baseline: 100, baselineModel: "DeepSeek 67B" },
      { name: "KV Cache %", value: 6.7, baseline: 100, baselineModel: "DeepSeek 67B" },
    ],
    insights: [
      {
        title: "MLA 才是 DeepSeek 长上下文便宜的根因",
        body: "MoE 减少了 FFN 算力，但 attention KV 才是长上下文的真正瓶颈。MLA 把 KV cache 压到 GQA 的零头，显存与生成吞吐同时改善。",
      },
      {
        title: "「便宜」是一种竞争力",
        body: "训练成本相比 67B Dense 下降 42.5%、生成吞吐提升 5.76×，让 DeepSeek 第一次以「价格屠夫」姿态进入大众视野，是后续 V3 引爆全球关注的伏笔。",
      },
    ],
    lineage: [
      { id: "deepseek-moe", role: "predecessor", note: "细粒度专家 + shared expert 的方法论起点" },
      { id: "deepseek-llm", role: "predecessor", note: "数据 / scaling 方法" },
      { id: "deepseek-coder-v2", role: "successor", note: "在 V2 中间 ckpt 上继续预训练 6T 代码 + 数学" },
      { id: "deepseek-v3", role: "successor", note: "MLA + DeepSeekMoE 直接放大到 671B" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "中间 ckpt 起点",
        subtitle: "Warm Start",
        desc: "不从零训练，而是接续 V2 还没收敛的中间 checkpoint，节省一半以上算力。",
        inputs: ["V2 中间 ckpt"],
        outputs: ["Coder-V2-Base"],
        innovations: ["在 mid-training 处接力，而非 post-training continual"],
      },
      {
        num: "02",
        title: "6T 多语言代码 CPT",
        subtitle: "Continual Pretraining",
        desc: "60% 代码 / 10% 数学 / 30% 自然语言；编程语言扩展到 338 种；保留 MLA + DeepSeekMoE 主干。",
        inputs: ["6T tokens"],
        outputs: ["更广语种 + 更强代码先验"],
        innovations: ["代码 / 数学 / NL 三元配比"],
      },
      {
        num: "03",
        title: "对齐 + 长上下文",
        subtitle: "Alignment",
        desc: "代码 SFT + GRPO 偏好对齐；上下文用 YaRN 拉到 128K。",
        outputs: ["Coder-V2-Instruct"],
        innovations: ["代码场景的偏好对齐"],
      },
    ],
    keyTechniques: [
      {
        name: "Mid-Training Branching",
        intuition:
          "传统做法是 base 训完再 continual pretrain；本文直接 fork 一个未收敛的中间 ckpt 走代码方向，减少「先收敛再发散」的浪费。",
        why: "节省整训成本，并让代码 / 通用两条线共享前期 token，是 V3 / V4 各 domain 模型继续沿用的范式。",
      },
      {
        name: "338 编程语言",
        intuition:
          "通过更宽的语种采样保证小语种 (Lean / Lua / OCaml 等) 也有足够 token，避免长尾语种被 tokenizer 切碎。",
        why: "拓宽 agent 类用户场景的覆盖（IDE、跨语种工程），是 SWE 类 benchmark 提升的前置条件。",
      },
    ],
    benchmarks: [
      { name: "HumanEval", value: 90.2, baseline: 88.4, baselineModel: "GPT-4 Turbo" },
      { name: "MBPP+", value: 76.2, baseline: 72.2, baselineModel: "GPT-4 Turbo" },
      { name: "LiveCodeBench", value: 43.4, baseline: 40.5, baselineModel: "GPT-4 Turbo" },
      { name: "MATH", value: 75.7, baseline: 72.6, baselineModel: "GPT-4 Turbo" },
      { name: "Aider", value: 73.7, baseline: 72.9, baselineModel: "GPT-4 Turbo" },
    ],
    insights: [
      {
        title: "首个真正同档的开源代码 MoE",
        body: "在 HumanEval / MBPP+ / LiveCodeBench / Aider 等多个独立 benchmark 上同时持平或超过 GPT-4 Turbo，标志开源代码能力终结「比 GPT-4 差一档」的时代。",
      },
    ],
    lineage: [
      { id: "deepseek-v2", role: "predecessor", note: "提供中间 ckpt 与 MLA + MoE 主干" },
      { id: "deepseek-coder", role: "predecessor", note: "继承 v1 的代码数据 / 评测方法" },
      { id: "deepseek-v3", role: "successor", note: "把代码 / 数学经验合回旗舰 base" },
    ],
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
    keyTechniques: [
      {
        name: "Decoupled Vision Encoding",
        intuition:
          "理解任务用 SigLIP（语义优先）编码，生成任务用 VQ-VAE（细节优先）编码，但两条 token 流喂进同一个自回归 Transformer。",
        why: "解决了「一个编码器无法同时擅长两件事」的根本矛盾，让 1B / 7B 小模型同时在 GenEval 与 MMBench 上拿到 SOTA。",
      },
      {
        name: "统一自回归生成",
        intuition:
          "图像生成走 next-image-token 自回归（VQ token），不需要单独的 Diffusion U-Net；理解和生成共用 Transformer 权重。",
        why: "把多模态生成简化为「token 预测」，与 LLM 推理栈完全兼容，部署成本极低。",
      },
    ],
    benchmarks: [
      { name: "GenEval", value: 0.80, max: 1, baseline: 0.55, baselineModel: "SDXL" },
      { name: "DPG-Bench", value: 84.2, baseline: 74.7, baselineModel: "SDXL" },
      { name: "MMBench", value: 79.2 },
      { name: "POPE", value: 87.4 },
    ],
    insights: [
      {
        title: "多模态生成不必依赖 Diffusion",
        body: "Janus-Pro 证明纯自回归 + VQ token 路径在 1B 尺度即可超过 SDXL / DALL·E 3，对 LLM 时代「统一架构」的趋势是关键证据。",
      },
    ],
    lineage: [
      { id: "deepseek-vl", role: "predecessor", note: "前作的混合编码器思路" },
    ],
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
    keyTechniques: [
      {
        name: "Dynamic Tiling",
        intuition:
          "不再 resize 到固定方框，把任意宽高比图像切成 384×384 tile，外加一张全图缩略图；token 数随分辨率线性增长。",
        why: "高分辨率文档 / 长截图 / 图表能保留细节，OCR / Grounding 任务大幅提升。",
      },
      {
        name: "MoE + MLA 多模态主干",
        intuition:
          "把语言主干换成 DeepSeekMoE（Tiny / Small / Base 三档）配 MLA，激活参数压到 1.0–4.5B。",
        why: "在保持精度的同时让多模态推理可以跑在消费级 GPU，是端侧 / 嵌入式 VL 的可行方案。",
      },
    ],
    benchmarks: [
      { name: "DocVQA", value: 93.3 },
      { name: "ChartQA", value: 86.0 },
      { name: "OCRBench", value: 811, max: 1000 },
      { name: "TextVQA", value: 84.2 },
      { name: "MMMU", value: 51.1 },
    ],
    insights: [
      {
        title: "MoE 在多模态上同样有效",
        body: "VL2 是首个把 DeepSeekMoE 用于多模态主干并系统验证有效性的工作，为 V3 / V4 时代「统一多模态」铺路。",
      },
    ],
    lineage: [
      { id: "deepseek-vl", role: "predecessor", note: "混合视觉编码器的方法论" },
      { id: "deepseek-moe", role: "applies", note: "把 DeepSeekMoE 引入多模态" },
      { id: "deepseek-v2", role: "applies", note: "复用 MLA 注意力" },
      { id: "deepseek-ocr", role: "successor", note: "把光学压缩思路推到极致" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "Pre-training",
        subtitle: "14.8T tokens · FP8",
        desc: "MLA + 256-expert DeepSeekMoE 架构，14.8T tokens 在 H800 上 FP8 混合精度训练。DualPipe 让计算-通信几乎零气泡。",
        inputs: ["14.8T 多源 tokens", "H800 集群"],
        outputs: ["V3-Base"],
        innovations: ["FP8 端到端", "DualPipe 流水并行", "Aux-loss-free 路由均衡"],
      },
      {
        num: "02",
        title: "上下文扩展",
        subtitle: "Long Context",
        desc: "用 YaRN 把上下文从 4K 推到 128K，并用长文本数据继续训练让长依赖真正建立。",
        outputs: ["128K 上下文"],
        innovations: ["MLA + YaRN 协同"],
      },
      {
        num: "03",
        title: "MTP 多 token 预测",
        subtitle: "Pre-train Objective",
        desc: "训练时预测下一个 + 下下个 token，提供更密的信号；推理时还能用作 speculative decoding 的 draft head。",
        innovations: ["MTP 训练 + 推理双重收益"],
      },
      {
        num: "04",
        title: "对齐 + R1 蒸馏",
        subtitle: "Post-training",
        desc: "SFT + GRPO 完成对齐后，把 DeepSeek-R1 的长链推理蒸馏回 V3，让 chat 模式继承 R1 的推理风格。",
        outputs: ["V3-Chat"],
        innovations: ["R1 → V3 反向蒸馏"],
      },
    ],
    keyTechniques: [
      {
        name: "Auxiliary-Loss-Free Balance",
        formula: "g_i = \\sigma(W h) + b_i,\\ b_i \\leftarrow b_i - \\eta\\,\\Delta_i",
        intuition:
          "不再用辅助 load-balance loss，而是给每个专家加一个偏置 b_i，根据负载偏差在线更新；只影响路由决策，不污染主梯度。",
        why: "解决了「均衡损失把模型往均匀路由方向拉，反而损害专家专业化」的痼疾，是 V3 比 V2 收敛更稳的关键。",
      },
      {
        name: "Multi-Token Prediction (MTP)",
        intuition:
          "在每个位置同时预测下一个、下下个 token；多 head 共享主干，仅在尾部多挂几个轻量预测层。",
        why: "训练信号变密 → 同 token 数下表征更强；推理时 draft head 可直接做 speculative decoding，吞吐显著提升。",
      },
      {
        name: "FP8 端到端 + DualPipe",
        intuition:
          "训练时用 FP8 做 GEMM，关键累加保留 BF16；DualPipe 把前向 / 反向 micro-batch 编排成几乎无气泡。",
        why: "把 H800（带宽阉割版 H100）的有效算力榨到接近理论值；2.788M GPU 小时训完 671B 是这套工程实现的直接结果。",
      },
    ],
    benchmarks: [
      { name: "MMLU", value: 88.5, baseline: 87.2, baselineModel: "GPT-4o" },
      { name: "GPQA Diamond", value: 59.1, baseline: 49.9, baselineModel: "GPT-4o" },
      { name: "MATH-500", value: 90.2, baseline: 74.6, baselineModel: "GPT-4o" },
      { name: "HumanEval", value: 82.6, baseline: 80.5, baselineModel: "GPT-4o" },
      { name: "LiveCodeBench", value: 36.2, baseline: 33.4, baselineModel: "GPT-4o" },
      { name: "MMLU-Pro", value: 75.9, baseline: 73.0, baselineModel: "GPT-4o" },
    ],
    insights: [
      {
        title: "$5.58M 训出 671B 旗舰",
        body: "在 H800（带宽阉割版 H100）集群上仅用 2.788M GPU 小时完成 14.8T tokens 预训练，全程零不可恢复 loss spike。技术报告本身比模型权重更具示范效应——它证明同档算力可以跑出 GPT-4o 级别能力。",
      },
      {
        title: "Aux-loss-free 让 MoE 不再「均匀化」",
        body: "传统辅助损失为了均衡会把所有专家拉向相似分布，反而限制了专业化。Per-expert 偏置在线调整保留了专家分化空间，是 V3 多任务能力比 V2 跨档提升的关键。",
      },
      {
        title: "R1 → V3 反向蒸馏",
        body: "把推理模型的长 CoT 风格蒸馏回通用 chat 模型，是「推理 / 通用统一」工程化的早期范例，后续被 V3.2 / V4 / Qwen3 继续放大。",
      },
    ],
    lineage: [
      { id: "deepseek-v2", role: "predecessor", note: "MLA + DeepSeekMoE 主干" },
      { id: "deepseek-coder-v2", role: "predecessor", note: "代码 / 数学 mid-training 经验" },
      { id: "deepseek-r1", role: "successor", note: "在 V3-Base 上做纯 RL 涌现长链推理" },
      { id: "deepseek-v3-2", role: "successor", note: "DSA 稀疏注意力 + Agent 化" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "子目标递归分解",
        subtitle: "Subgoal Decomposition",
        desc: "用 V3 把目标定理拆成层级化子目标 (Lean tactic 草图)，再继续递归分解到 Lean 可直接证的粒度。",
        innovations: ["informal 草图 + formal 校验 闭环"],
      },
      {
        num: "02",
        title: "Lean 4 子目标证明",
        subtitle: "Formal Proof Synthesis",
        desc: "对每个叶节点子目标在 Lean 4 中合成证明，成功者反向回传形成完整证明的 CoT。",
        innovations: ["子目标级 chain-of-thought 合成"],
      },
      {
        num: "03",
        title: "RL with Verified Reward",
        subtitle: "RL",
        desc: "以 Lean 编译通过为奖励信号做 GRPO，在 671B 主干上做大规模形式化推理 RL。",
        innovations: ["formal verifier 直接做 reward"],
      },
    ],
    keyTechniques: [
      {
        name: "Subgoal Recursion",
        intuition:
          "把数学证明像写代码一样：先写顶层骨架，再递归把每个 lemma 写出来；每层用 V3 生成草图、Lean 验证。",
        why: "解决了「定理证明搜索空间爆炸」的核心难题，让大模型可以系统化攻克 MiniF2F / Putnam 量级证明。",
      },
    ],
    benchmarks: [
      { name: "MiniF2F-test", value: 88.9, baseline: 65.6, baselineModel: "Prover-V1.5" },
      { name: "PutnamBench", value: 7.4, baseline: 4.7, baselineModel: "Prover-V1.5" },
      { name: "ProofNet", value: 33.9 },
      { name: "AIME 24-25 (Prover)", value: 73 },
    ],
    insights: [
      {
        title: "Informal 与 Formal 数学统一",
        body: "把人类「先想直觉再写形式证明」的过程 codify 成 informal teacher + formal verifier 的闭环，是 LLM 与定理证明结合的代表性范式。",
      },
    ],
    lineage: [
      { id: "deepseek-v3", role: "applies", note: "用 V3 作为 informal CoT teacher" },
      { id: "deepseek-math", role: "predecessor", note: "GRPO 与数学 RL 方法" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "Optical Encoding",
        subtitle: "Text → Image Tokens",
        desc: "把长文本以特定字号 / 排版渲染成图像，再用 DeepEncoder 视觉编码器编码成少量 vision tokens。",
        innovations: ["把语言长序列转换为视觉 token 流"],
      },
      {
        num: "02",
        title: "MoE Decoder",
        subtitle: "DeepSeek3B-MoE-A570M",
        desc: "用一个紧凑的 3B / 570M 激活 MoE 多模态模型从压缩 vision tokens 还原原文。",
        innovations: ["小模型解码器 + 高压缩比"],
      },
      {
        num: "03",
        title: "Train + Verify",
        subtitle: "OCR-grade Verification",
        desc: "在大规模合成 + 真实文档上联合训练，OmniDocBench 上仅用 100 vision tokens 即超 GOT-OCR2.0。",
        outputs: ["≤10× 压缩 97% 精度", "20× 压缩 ~60%"],
      },
    ],
    keyTechniques: [
      {
        name: "Contexts Optical Compression",
        intuition:
          "1 个 vision token 通常能编码 ~10 个文字 token 的内容；把超长上下文「拍成图片」就把序列长度压到 1/10。",
        why: "为 LLM 长上下文 / 长期记忆 / 「遗忘」机制提供了全新的有损压缩载体；与传统 KV 压缩、稀疏注意力是正交方向。",
      },
    ],
    benchmarks: [
      { name: "OmniDocBench (100 tok)", value: 75, baseline: 70, baselineModel: "GOT-OCR2.0" },
      { name: "≤10× 压缩 OCR 精度", value: 97 },
      { name: "20× 压缩 OCR 精度", value: 60 },
      { name: "推理吞吐 (页/天)", value: 200000, max: 300000 },
    ],
    insights: [
      {
        title: "把「记忆」当作图像来思考",
        body: "论文暗示：LLM 的长期记忆可以以「时间越久、图像越模糊」的方式实现，模拟人类记忆衰减——一种全新的长上下文范式。",
      },
    ],
    lineage: [
      { id: "deepseek-vl2", role: "predecessor", note: "动态 tiling + MoE 多模态主干" },
      { id: "deepseek-moe", role: "applies", note: "3B-MoE 解码器" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "DSA 架构升级",
        subtitle: "Sparse Attention",
        desc: "把 V3 的 dense MLA 替换为 DeepSeek Sparse Attention：每个 query 只与稀疏选中的 key block 交互，质量近无损。",
        outputs: ["V3.2-Base"],
        innovations: ["细粒度可学习稀疏 mask"],
      },
      {
        num: "02",
        title: "Scalable RL Framework",
        subtitle: "RL Infra",
        desc: "重写 RL 训练框架支持千卡同步 rollout 与 long-horizon agent 任务，给推理 / agent 同时大规模 RL 提供基础。",
        innovations: ["统一 RL infra"],
      },
      {
        num: "03",
        title: "Agentic Data Synthesis",
        subtitle: "Post-training",
        desc: "大规模合成「工具调用 + 多步交互」任务，用可验证奖励驱动 RL，把推理能力注入 agent 行为。",
        outputs: ["V3.2-Chat / Agent"],
        innovations: ["规模化 agent prompt 合成"],
      },
      {
        num: "04",
        title: "Speciale 高算力变体",
        subtitle: "Reasoning Scale",
        desc: "在 V3.2 之上叠加额外 RL 算力得到 V3.2-Speciale，2025 IMO / IOI 拿到金牌级别成绩。",
        outputs: ["V3.2-Speciale"],
        innovations: ["RL Scaling 在金牌级数学 / 编程问题上的实证"],
      },
    ],
    keyTechniques: [
      {
        name: "DeepSeek Sparse Attention (DSA)",
        intuition:
          "对每个 query 学习一个稀疏 key 选择策略（block-sparse），仅对被选中的少量 key block 做全精度 attention，其余 block 直接跳过。",
        why: "把 attention 从 O(L²) 降到 O(L·k)，让 1M-class 长上下文训练 / 推理可负担，是 V4 千倍上下文跨越的直接前置技术。",
      },
      {
        name: "Reasoning + Agent 联合 RL",
        intuition:
          "把推理任务（数学 / 编程）和 agent 任务（工具调用、多步交互）放进同一 RL 训练循环，让推理能力可以迁移到 agent 决策。",
        why: "解决了过去「推理模型 ≠ agent 模型」的割裂，是 2026 年 V4 / Qwen3.6 / K2.6 的「推理-Agent 一体化」共同范式起源。",
      },
    ],
    benchmarks: [
      { name: "MMLU-Pro", value: 84.5, baseline: 82.0, baselineModel: "V3" },
      { name: "AIME 2025", value: 89.3, baseline: 79.8, baselineModel: "V3 (R1)" },
      { name: "SWE-Bench Verified", value: 70.4, baseline: 49.2, baselineModel: "V3" },
      { name: "GPQA Diamond", value: 81.2 },
      { name: "IMO 2025 (Speciale)", value: 100, max: 100 },
    ],
    insights: [
      {
        title: "稀疏注意力首次大规模工业落地",
        body: "DSA 是首个在 671B 旗舰上端到端验证的细粒度稀疏注意力，证明「质量近无损 + 显著省算力」可以同时成立。",
      },
      {
        title: "推理与 Agent 是同一个能力的两面",
        body: "论文把推理能力直接作为 agent 决策的子能力，而不是两个 RL pipeline 并行。这一观点直接塑造了 2026 年开源旗舰的训练范式。",
      },
    ],
    lineage: [
      { id: "deepseek-v3", role: "predecessor", note: "MLA + 671B MoE 主干" },
      { id: "deepseek-r1", role: "predecessor", note: "推理 RL 方法论" },
      { id: "deepseek-v4", role: "successor", note: "把 DSA 进化为 CSA + HCA，1M 上下文" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "Hybrid Attention 架构",
        subtitle: "CSA + HCA",
        desc: "把每层注意力替换为 CSA（Compressed Sparse Attention）+ HCA（Heavily Compressed Attention）的混合编排，专门针对 1M 上下文优化。",
        outputs: ["V4-Pro / V4-Flash 主干"],
        innovations: ["CSA + HCA 混合", "1M FLOPs 降至 V3.2 的 27%"],
      },
      {
        num: "02",
        title: "Muon + mHC",
        subtitle: "Optimizer & Connectivity",
        desc: "全程使用 Muon 优化器 (embedding 用 AdamW)；用 manifold-constrained Hyper-Connection 替代普通残差。",
        innovations: ["Muon 大规模成功", "mHC 强化深层信号传播"],
      },
      {
        num: "03",
        title: "32T tokens 预训练",
        subtitle: "Pre-training",
        desc: "32T+ tokens 多源高质量数据，训练全程零不可恢复 spike。",
        outputs: ["V4-Pro Base / V4-Flash Base"],
        innovations: ["FP8 + DualPipe 持续优化"],
      },
      {
        num: "04",
        title: "Domain SFT + GRPO",
        subtitle: "Phase A Post-training",
        desc: "为代码、数学、agent、长文本等多个领域分别训练 expert 模型 (SFT + GRPO)。",
        outputs: ["多个 domain expert"],
        innovations: ["专家化训练"],
      },
      {
        num: "05",
        title: "On-policy 蒸馏",
        subtitle: "Phase B Post-training",
        desc: "把所有 domain expert 通过 on-policy 蒸馏统一回单个最终模型，避免多模型部署成本。",
        outputs: ["V4-Pro / V4-Pro-Max"],
        innovations: ["Domain → Unified 模型 on-policy 蒸馏"],
      },
    ],
    keyTechniques: [
      {
        name: "CSA + HCA 混合注意力",
        intuition:
          "CSA 处理大部分 token 的细粒度交互，HCA 用极高压缩比处理远距离 token；不同层按算力 / 信息密度比例编排。",
        why: "把 1M 上下文的单 token 推理 FLOPs 压到 V3.2 的 27%、KV cache 到 10%，是「百万上下文同步可用 + 平价」的关键。",
      },
      {
        name: "Manifold-Constrained Hyper-Connections (mHC)",
        intuition:
          "把残差通路扩展为多通道、并约束在低维流形上，避免极深网络中残差路径退化。",
        why: "为 1.6T 参数 / 数百层网络的稳定训练提供更强的信号传播保证。",
      },
      {
        name: "Muon Optimizer",
        intuition:
          "在权重更新前对 batched 梯度做 Newton-Schulz 正交化，更新方向更接近真实曲率。",
        why: "V4 是首个在 1.6T 旗舰上 end-to-end 验证 Muon 有效的工作，与 Kimi K2 的 MuonClip 一同把 Muon 推上工业主舞台。",
      },
      {
        name: "Domain Expert → On-policy Distillation",
        intuition:
          "先各自做 expert，再以基础模型为 student、experts 为 teacher 做 on-policy 蒸馏统一权重。",
        why: "同时享受「领域专家」的高上限和「单模型」的部署便利。",
      },
    ],
    benchmarks: [
      { name: "SWE-Bench Verified", value: 80.6, baseline: 70.4, baselineModel: "V3.2" },
      { name: "LiveCodeBench", value: 93.5, baseline: 88.1, baselineModel: "V3.2" },
      { name: "AIME 2025", value: 95.4, baseline: 89.3, baselineModel: "V3.2" },
      { name: "GPQA Diamond", value: 86.2, baseline: 81.2, baselineModel: "V3.2" },
      { name: "MMLU-Pro", value: 88.4, baseline: 84.5, baselineModel: "V3.2" },
      { name: "Tau-Bench (Agent)", value: 76, baseline: 68, baselineModel: "V3.2" },
    ],
    insights: [
      {
        title: "1M 上下文进入「默认开启」时代",
        body: "V4 把 1M 上下文设为所有官方服务的默认配置，意味着长上下文不再是「特殊功能」，而是基础能力。这一选择是 CSA + HCA + DSA 三步架构演进的成果。",
      },
      {
        title: "MIT 协议双档同时开源",
        body: "Pro / Flash 同时以 MIT 协议放出，是国产开源旗舰首次「同档同时双开源」的事件，对全球开源生态有立法意义。",
      },
      {
        title: "Domain Expert 路径在工业落地",
        body: "V4 给出了「先专家、后蒸馏统一」的可复制工程范式，比 monolithic post-training 更接近多任务能力的真实训练动力学。",
      },
    ],
    lineage: [
      { id: "deepseek-v3-2", role: "predecessor", note: "DSA 是 CSA / HCA 的雏形" },
      { id: "deepseek-r1", role: "predecessor", note: "推理 RL 方法论" },
      { id: "kimi-k2", role: "contemporary", note: "Muon 的另一条工业级验证路径" },
    ],
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
    keyTechniques: [
      {
        name: "GQA 全尺寸标配",
        intuition:
          "全部尺寸（包括 0.5B 小模型）默认使用 Grouped-Query Attention，KV cache 显著小于 MHA。",
        why: "为后续 128K 长上下文与多端部署 (mobile / edge) 铺路。",
      },
      {
        name: "57B-A14B MoE",
        intuition:
          "首次发布 MoE 版本：57B 总参 / 14B 激活，与 Mixtral-8x7B 同代但更细粒度。",
        why: "Qwen 团队验证 MoE 路径，是后续 Qwen3-235B-A22B 的先行实验。",
      },
    ],
    benchmarks: [
      { name: "MMLU (72B)", value: 84.2, baseline: 79.5, baselineModel: "Llama-3-70B" },
      { name: "GSM8K", value: 89.5, baseline: 84.5, baselineModel: "Llama-3-70B" },
      { name: "HumanEval", value: 86.0, baseline: 79.3, baselineModel: "Llama-3-70B" },
      { name: "Arena-Hard", value: 48.1 },
    ],
    insights: [
      {
        title: "全尺寸开源是一种竞争力",
        body: "0.5B → 72B 五档同时开源，让下游能根据算力按需选档，是 Qwen 在 HF 下载量长期居冠的根因之一。",
      },
    ],
    lineage: [
      { id: "qwen2-5", role: "successor", note: "继续把数据 / 后训练规模推大" },
      { id: "qwen2-5-coder", role: "successor", note: "代码方向继续预训练" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "18T tokens 预训练",
        subtitle: "Pre-training",
        desc: "数据从 7T 翻 ~2.5 倍到 18T，加强代码 / 数学 / 多语种比重。",
        outputs: ["Qwen2.5-Base 0.5B–72B"],
      },
      {
        num: "02",
        title: "1M+ SFT",
        subtitle: "SFT",
        desc: "百万级精选 SFT 样本，覆盖代码、数学、长文本、结构化输出。",
        outputs: ["Qwen2.5-Instruct"],
      },
      {
        num: "03",
        title: "多阶段 RL",
        subtitle: "RLHF",
        desc: "Offline DPO + online RL 多阶段对齐，优化指令遵循与安全。",
        outputs: ["Qwen2.5-Chat"],
      },
    ],
    keyTechniques: [
      {
        name: "结构化输出强化",
        intuition:
          "在 SFT / RL 阶段大量混入 JSON / 表格 / 函数调用样本，让模型擅长 schema-strict 输出。",
        why: "把 Qwen 推为 Agent / Tool-Use 场景的事实标准开源底座之一。",
      },
    ],
    benchmarks: [
      { name: "MMLU (72B)", value: 86.1, baseline: 88.6, baselineModel: "Llama-3.1-405B" },
      { name: "MATH", value: 83.1, baseline: 73.8, baselineModel: "Llama-3.1-405B" },
      { name: "HumanEval", value: 86.6, baseline: 89.0, baselineModel: "Llama-3.1-405B" },
      { name: "GSM8K", value: 95.8, baseline: 96.8, baselineModel: "Llama-3.1-405B" },
      { name: "Arena-Hard", value: 81.2 },
    ],
    insights: [
      {
        title: "72B 接近 405B",
        body: "在 MMLU / MATH / HumanEval 等多项基准上，Qwen2.5-72B 与 Llama-3.1-405B 距离极小，证明数据 / 后训练质量比单纯参数量更重要。",
      },
    ],
    lineage: [
      { id: "qwen2", role: "predecessor" },
      { id: "qwen2-5-coder", role: "successor", note: "代码方向继续预训练" },
      { id: "qwq-32b", role: "successor", note: "在 32B 上做大规模推理 RL" },
      { id: "qwen3", role: "successor", note: "推理 / 通用合二为一" },
    ],
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
    keyTechniques: [
      {
        name: "Repo + File 双粒度数据",
        intuition:
          "同时用 file-level 与 repo-level 数据训练，并用规则 + LLM 联合做去重与质量打分。",
        why: "在 1.5B–32B 全尺寸都做到同尺寸 SOTA 的根本来源是数据质量。",
      },
      {
        name: "Synthetic Code Data",
        intuition:
          "用强模型合成「问题 + 解答 + 测试用例」三元组，再用执行结果做过滤。",
        why: "合成数据在长尾语种与算法题上的提升远高于纯爬虫数据。",
      },
    ],
    benchmarks: [
      { name: "HumanEval (32B)", value: 92.7, baseline: 90.2, baselineModel: "GPT-4o" },
      { name: "MBPP", value: 90.2, baseline: 86.8, baselineModel: "GPT-4o" },
      { name: "LiveCodeBench", value: 31.4, baseline: 33.4, baselineModel: "GPT-4o" },
      { name: "BigCodeBench", value: 41.5 },
      { name: "MultiPL-E", value: 75.2 },
    ],
    insights: [
      {
        title: "32B Open ≈ GPT-4o on Code",
        body: "Qwen2.5-Coder-32B 是首个在多个独立 code benchmark 上同档对齐 GPT-4o-2024-08-06 的开源模型，也是 SWE-Agent 类系统的事实标准底座。",
      },
    ],
    lineage: [
      { id: "qwen2-5", role: "predecessor", note: "提供 base 模型" },
    ],
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
    keyTechniques: [
      {
        name: "RL Scaling on Dense 32B",
        intuition:
          "在已对齐的 Qwen2.5-32B 上做大规模 GRPO，奖励主要来自规则验证；不蒸馏自更大模型。",
        why: "首次在 dense 32B 尺寸上证明纯 RL 能涌现 R1 级推理，说明「RL 算力」是与「参数量」并列的能力维度。",
      },
      {
        name: "Tool-Use 集成训练",
        intuition:
          "RL 阶段混入工具调用任务，让模型在长链推理中自然学会调用 search / Python / 自定义 API。",
        why: "把 reasoning 与 agent 在同一阶段训练，是 2025 年开源「reasoning-agent 一体化」的早期实证。",
      },
    ],
    benchmarks: [
      { name: "AIME 2024", value: 79.5, baseline: 79.8, baselineModel: "DeepSeek-R1" },
      { name: "MATH-500", value: 90.6, baseline: 97.3, baselineModel: "DeepSeek-R1" },
      { name: "LiveCodeBench", value: 63.4, baseline: 65.9, baselineModel: "DeepSeek-R1" },
      { name: "GPQA Diamond", value: 65.2, baseline: 71.5, baselineModel: "DeepSeek-R1" },
    ],
    insights: [
      {
        title: "32B Dense ≈ 671B MoE on Reasoning",
        body: "QwQ 把推理能力的来源从「大模型」拉回「大 RL」，对开源生态的资源民主化意义巨大。",
      },
    ],
    lineage: [
      { id: "qwen2-5", role: "predecessor", note: "RL 起点" },
      { id: "deepseek-r1", role: "contemporary", note: "同代推理模型" },
      { id: "qwen3", role: "successor", note: "把推理能力合并回主线 dense + MoE" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "Pre-training",
        subtitle: "36T tokens · 119 lang",
        desc: "全尺寸 dense + MoE 一同训练，119 语种覆盖；MoE 旗舰 235B-A22B 对标 GPT-4 / Claude Opus。",
        outputs: ["Qwen3-Base 0.6B–235B"],
      },
      {
        num: "02",
        title: "Hybrid Mode SFT",
        subtitle: "Thinking + Non-Thinking",
        desc: "同一权重通过 chat template 中的 <think> / <no_think> 标签切换两种回复模式。",
        innovations: ["Single-Weight Hybrid Mode"],
      },
      {
        num: "03",
        title: "Thinking Budget RL",
        subtitle: "Budget-aware RL",
        desc: "RL 阶段引入「思考预算」奖励：可控 token 数下取得最高质量回答。",
        outputs: ["Qwen3-Instruct"],
        innovations: ["按预算自适应推理深度"],
      },
    ],
    keyTechniques: [
      {
        name: "Hybrid Thinking Mode",
        intuition:
          "通过 chat template 注入控制 token，让模型在 thinking（带 CoT）与 non-thinking（直答）两种模式间无缝切换，无需双权重部署。",
        why: "把推理 / 通用合二为一，是开源生态首次大规模工业级实现。直接定义了 2025 H2 - 2026 的「混合推理」范式。",
      },
      {
        name: "Thinking Budget",
        intuition:
          "推理时由调用方指定最多花多少 token 思考；RL 训练让模型学会在不同预算下分配注意力。",
        why: "把推理深度从「模型固有」变成「运行时可调」，让长链推理可在延迟敏感场景部署。",
      },
    ],
    benchmarks: [
      { name: "AIME 2024", value: 85.7, baseline: 79.8, baselineModel: "DeepSeek-R1" },
      { name: "LiveCodeBench", value: 70.7, baseline: 65.9, baselineModel: "DeepSeek-R1" },
      { name: "GPQA Diamond", value: 71.1, baseline: 71.5, baselineModel: "DeepSeek-R1" },
      { name: "MMLU-Pro", value: 80.6 },
      { name: "BFCL (Tool)", value: 70.8 },
    ],
    insights: [
      {
        title: "推理 / 通用「单权重」可以做到",
        body: "Qwen3 是首次在旗舰尺寸（235B）上把 thinking 与 non-thinking 真正合并到同一权重，部署侧不再需要维护两套模型。",
      },
      {
        title: "可控思考预算",
        body: "在「质量 / 延迟」trade-off 上给开发者第一次显式调节钮，对 latency-sensitive 场景（IDE 补全、客服）至关重要。",
      },
    ],
    lineage: [
      { id: "qwen2-5", role: "predecessor", note: "通用 chat 主干" },
      { id: "qwq-32b", role: "predecessor", note: "推理 RL 经验" },
      { id: "qwen3-6", role: "successor", note: "继续优化 agent 编程" },
    ],
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
    keyTechniques: [
      {
        name: "Agent Coding 深度优化",
        intuition:
          "在 SWE / 多文件 IDE / 长会话编辑场景上做大规模 RL，引入工具调用回放与 step-wise reward。",
        why: "把 Qwen 推到 Claude Opus 4.6 / GPT-5 同档的 agent coding 能力，是 2026 国产开源三强格局的一极。",
      },
      {
        name: "扩展 Thinking Budget",
        intuition:
          "Budget 机制从单段思考扩展到「多段思考 + tool round」交错，可控制每一段 budget。",
        why: "让 agent 在长任务里更精细地分配思考算力。",
      },
    ],
    benchmarks: [
      { name: "SWE-Bench Verified", value: 78.5 },
      { name: "LiveCodeBench", value: 88.0 },
      { name: "AIME 2025", value: 92.0 },
      { name: "Tau-Bench", value: 73 },
    ],
    insights: [
      {
        title: "2026 开源三强",
        body: "Qwen3.6 / Kimi K2.6 / DeepSeek V4 三家在同一时间窗口发布同档旗舰，标志着「中国开源同时多极」格局成立。",
      },
    ],
    lineage: [
      { id: "qwen3", role: "predecessor" },
      { id: "deepseek-v4", role: "contemporary" },
      { id: "kimi-k2-6", role: "contemporary" },
    ],
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
    keyTechniques: [
      {
        name: "Long-Context RL Rollout",
        intuition:
          "RL 训练时允许 rollout 长达 128K，让模型在长链推理上得到充分探索；多 stage curriculum 由短到长扩展。",
        why: "传统 RL 训练上下文短，限制了推理深度；长 rollout 是 long-CoT 涌现的前提。",
      },
      {
        name: "Long2Short Distillation",
        intuition:
          "用长 CoT 模型采样答案，再让短 CoT 模型学会用更少 token 复现答案；可微调 / DPO 双路径。",
        why: "保留推理能力的同时把推理延迟压回 short-CoT 水平，是商业部署的关键。",
      },
    ],
    benchmarks: [
      { name: "AIME 2024 (long)", value: 77.5, baseline: 79.8, baselineModel: "DeepSeek-R1" },
      { name: "MATH-500", value: 96.2, baseline: 97.3, baselineModel: "DeepSeek-R1" },
      { name: "Codeforces (pct)", value: 94 },
      { name: "MathVista", value: 74.9 },
    ],
    insights: [
      {
        title: "推理能力可以「压缩」",
        body: "Long2Short 证明长链推理学到的能力可被蒸馏回短链，是同一份训练算力服务多档延迟需求的 powerful primitive。",
      },
    ],
    lineage: [
      { id: "deepseek-r1", role: "contemporary", note: "同日发布的推理 RL 模型" },
      { id: "kimi-k2", role: "successor", note: "把方法论扩展到 1T MoE" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "MuonClip 预训练",
        subtitle: "15.5T tokens",
        desc: "用 Muon + QK-Clip（裁剪 QK logit 数量级）作为优化器，1T MoE 全程零 loss spike。",
        outputs: ["K2-Base"],
        innovations: ["MuonClip 优化器首次工业落地"],
      },
      {
        num: "02",
        title: "Agentic Data Synthesis",
        subtitle: "Post-training Data",
        desc: "大规模合成「工具 + 多步交互 + 验证」轨迹，覆盖 SWE / 终端 / 浏览器 / 自定义 API。",
        innovations: ["规模化 agent rollout 合成"],
      },
      {
        num: "03",
        title: "Agentic RL",
        subtitle: "RL",
        desc: "在合成 + 真实任务上做 RL，奖励来自任务完成度与中间步骤验证。",
        outputs: ["K2-Instruct"],
        innovations: ["step-wise reward + outcome reward 融合"],
      },
    ],
    keyTechniques: [
      {
        name: "MuonClip",
        formula: "g \\leftarrow \\text{Muon}(g),\\ \\text{logits} \\leftarrow \\text{clip}(QK^{\\top})",
        intuition:
          "Muon 让权重更新方向更接近真实曲率；QK-Clip 把 attention logits 数量级裁住，避免大模型训练中常见的「QK 爆炸」spike。",
        why: "1T MoE 在 15.5T tokens 上零不可恢复 spike，把 Muon 推上工业主舞台，被 V4 / Qwen3 后续吸纳。",
      },
      {
        name: "Agentic Data Synthesis",
        intuition:
          "用模型自身合成大规模 (任务、工具、解题轨迹) 三元组，再用规则 / 沙箱执行验证；过滤后用于 SFT + RL。",
        why: "把 agent 能力从「碰运气涌现」转为「系统化注入」，是 K2 / V3.2 / V4 共同走的路径。",
      },
    ],
    benchmarks: [
      { name: "SWE-Bench Verified", value: 65.8, baseline: 49.2, baselineModel: "DeepSeek-V3" },
      { name: "Tau2-Bench", value: 66.1, baseline: 56.0, baselineModel: "Claude 3.5" },
      { name: "AIME 2024", value: 71.5 },
      { name: "LiveCodeBench", value: 53.7 },
      { name: "MMLU", value: 89.5 },
    ],
    insights: [
      {
        title: "Muon 在 1T 尺度可行",
        body: "K2 是首个把 Muon-class 优化器跑上 trillion-scale MoE 并完全零 spike 的工业级证据，重新定义了「优化器选择」的可行边界。",
      },
      {
        title: "Agent 是数据问题，不是 prompt 问题",
        body: "K2 的 SWE / Tau 提升主要来自合成的高质量 agent 轨迹数据，而非 prompt engineering 或更大模型，是「Agent = 数据 + RL」的标志性背书。",
      },
    ],
    lineage: [
      { id: "kimi-k1-5", role: "predecessor", note: "继承长上下文 RL 经验" },
      { id: "kimi-k2-6", role: "successor", note: "更长 agent 会话" },
      { id: "deepseek-v4", role: "contemporary", note: "Muon 路径同代验证" },
    ],
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
    keyTechniques: [
      {
        name: "Multi-Hour Coding Session",
        intuition:
          "把 RL 训练上下文与上下文管理机制扩展到多小时连续编辑，不依赖外部 memory wrapper 也能保持任务一致。",
        why: "把 agent 从「分钟级单轮」推到「小时级连续工作」，迈出向「自主开发者」的关键一步。",
      },
      {
        name: "Multi-Agent Orchestration",
        intuition:
          "原生支持「主 agent 拆分子 agent + 汇总」的多角色编排，无需框架层 hack。",
        why: "复杂 SWE / 数据分析任务可被自然分解，提高任务并行度与质量。",
      },
    ],
    benchmarks: [
      { name: "SWE-Bench Verified", value: 79.2 },
      { name: "Tau2-Bench", value: 75 },
      { name: "LiveCodeBench", value: 89.0 },
      { name: "AIME 2025", value: 92 },
    ],
    insights: [
      {
        title: "Agent 长会话是新 frontier",
        body: "K2.6 把竞争从「单步 SWE」迁到「多小时连续工作」，这是 2026 开源旗舰区分度的主战场。",
      },
    ],
    lineage: [
      { id: "kimi-k2", role: "predecessor" },
      { id: "deepseek-v4", role: "contemporary" },
      { id: "qwen3-6", role: "contemporary" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "23T tokens 多阶段预训练",
        subtitle: "Pre-training",
        desc: "通用 / 数学 / 代码 / agent 数据按 phase 配比；后期阶段比例向 reasoning + agent 倾斜。",
        outputs: ["GLM-4.5-Base 355B / 32B 激活"],
      },
      {
        num: "02",
        title: "Hybrid Reasoning SFT",
        subtitle: "SFT",
        desc: "同时学 thinking / non-thinking，在同权重内做模式切换。",
        innovations: ["与 Qwen3 同代的双模式范式"],
      },
      {
        num: "03",
        title: "Expert Iteration + RL",
        subtitle: "Post-training",
        desc: "expert iteration 反复采样、过滤、再训练；最后做大规模 GRPO。",
        outputs: ["GLM-4.5 / GLM-4.5-Air"],
        innovations: ["EI + GRPO 联合"],
      },
    ],
    keyTechniques: [
      {
        name: "ARC 统一目标",
        intuition:
          "把 Agentic / Reasoning / Coding 视为同一组「可验证任务」，用统一 reward 体系联合训练，而不分别建独立模型。",
        why: "避免「拆三个模型再融合」的昂贵 / 信息丢失，同权重在三类 benchmark 同时领先开源水平。",
      },
      {
        name: "Air 紧凑变体",
        intuition:
          "把 ARC 训练的高质量数据迁移到 106B / 12B 激活的小 MoE，得到 GLM-4.5-Air。",
        why: "在 1/3 算力档下保持竞争力，让中等部署成本场景也能用上 ARC 模型。",
      },
    ],
    benchmarks: [
      { name: "TAU-Bench", value: 70.1, baseline: 56.0, baselineModel: "Claude 3.5" },
      { name: "AIME 2024", value: 91.0 },
      { name: "SWE-Bench Verified", value: 64.2 },
      { name: "BFCL Tool", value: 73 },
      { name: "MMLU-Pro", value: 78.4 },
    ],
    insights: [
      {
        title: "ARC 是单一能力的三个面",
        body: "论文显式宣告「Agentic = Reasoning + Coding 的应用」，把三件事放进同一目标函数 —— 这是 2025 年 H2 国产开源的共识。",
      },
    ],
    lineage: [
      { id: "qwen3", role: "contemporary", note: "同代混合推理范式" },
      { id: "deepseek-r1", role: "predecessor", note: "提供推理 RL 方法" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "InfLLM v2 架构",
        subtitle: "Trainable Sparse Attn",
        desc: "可训练稀疏注意力，长序列 prefill / decode 显著加速；与 KV cache compression 协同。",
        outputs: ["MiniCPM4-Base"],
        innovations: ["可训练稀疏 mask + 长序列加速"],
      },
      {
        num: "02",
        title: "UltraClean 数据",
        subtitle: "Data Pipeline",
        desc: "UltraClean 多阶段数据过滤 + UltraChat v2 SFT 数据，重点保证高质量 + 端侧任务覆盖。",
        innovations: ["端侧任务定向数据合成"],
      },
      {
        num: "03",
        title: "ModelTunnel v2 + Chunk RL",
        subtitle: "Algorithm",
        desc: "更稳定的训练框架与 chunk-wise rollout RL，让 8B 端侧模型也能享受推理 RL 红利。",
      },
      {
        num: "04",
        title: "CPM.cu 推理系统",
        subtitle: "Inference Engine",
        desc: "针对端侧 GPU / NPU 重写 CUDA / Metal kernel，配 BitCPM 三元 LLM 与推测采样实现极致吞吐。",
        innovations: ["BitCPM 三元化", "端侧推测解码"],
      },
    ],
    keyTechniques: [
      {
        name: "InfLLM v2",
        intuition:
          "对长序列采用可训练的稀疏 attention，token 之间的连接在训练时就被学出来；推理时按学到的 mask 走，省掉大量无意义 attention。",
        why: "让 8B 端侧模型在长上下文 (32K+) 上推理速度显著超 Qwen3-8B，是端侧场景可用性的根因。",
      },
      {
        name: "BitCPM 三元 LLM",
        intuition:
          "把权重量化到 {-1, 0, +1}，配合定制 kernel 在端侧 GPU 上接近内存带宽极限。",
        why: "端侧推理瓶颈是带宽而非算力，三元权重把模型吞吐推到接近理论上限。",
      },
    ],
    benchmarks: [
      { name: "MMLU (8B)", value: 75.8, baseline: 73.0, baselineModel: "Qwen3-8B" },
      { name: "GSM8K", value: 87.1 },
      { name: "MATH", value: 56.4 },
      { name: "Long Decode (32K)", value: 5.0, baseline: 1.0, baselineModel: "Qwen3-8B" },
    ],
    insights: [
      {
        title: "端侧 LLM 是系统问题",
        body: "MiniCPM4 把架构 / 数据 / 算法 / 推理系统四件事打通，证明端侧不是单一技术能解决的，需要 stack 全链路协同。",
      },
    ],
    lineage: [
      { id: "qwen3", role: "contemporary", note: "在 8B 档同代竞争对手" },
    ],
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
    keyTechniques: [
      {
        name: "高质量双语数据清洗",
        intuition:
          "构建严格的多阶段数据过滤管线，特别强化中文质量；大规模人工 + 启发式去噪。",
        why: "证明「在 3.1T 高质量 tokens 上的 34B」可以接近 Llama2-70B，是「数据 > 参数」的早期实证。",
      },
    ],
    benchmarks: [
      { name: "MMLU (34B)", value: 76.3, baseline: 68.9, baselineModel: "Llama2-70B" },
      { name: "C-Eval", value: 81.4 },
      { name: "GSM8K", value: 67.9 },
      { name: "BBH", value: 66.4 },
    ],
    insights: [
      {
        title: "中文 ICL 涌现",
        body: "Yi-34B 第一次在公开开源权重上展示了较强的中文 in-context learning，是中文 LLM 早期的重要数据点。",
      },
    ],
    lineage: [
      { id: "yi-lightning", role: "successor", note: "MoE 化 + 安全框架" },
    ],
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
    keyTechniques: [
      {
        name: "Refined MoE Routing",
        intuition:
          "在 DeepSeekMoE 启发下做细粒度专家 + 动态路由优化，专家间负载更均衡。",
        why: "实现 Chatbot Arena Top 6 的关键架构选择。",
      },
      {
        name: "RAISE 四组件安全框架",
        intuition:
          "在 SFT / RL / serving / 监控四个层面分别注入安全 reward 与策略，构成端到端 safety stack。",
        why: "为开源 chat 模型如何系统化做 safety 给出参考实现。",
      },
    ],
    benchmarks: [
      { name: "Arena Overall", value: 6, max: 50, higherIsBetter: false },
      { name: "Chinese Arena", value: 3, max: 50, higherIsBetter: false },
      { name: "Coding Arena", value: 3, max: 50, higherIsBetter: false },
      { name: "Hard Prompts", value: 4, max: 50, higherIsBetter: false },
    ],
    insights: [
      {
        title: "Arena 进 Top 10 即开源里程碑",
        body: "Yi-Lightning 是 2024 年中国开源 chat 模型首次进入 Chatbot Arena Top 10 的事件之一，对国产模型市场认知有显著推动。",
      },
    ],
    lineage: [
      { id: "yi", role: "predecessor" },
    ],
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
    keyTechniques: [
      {
        name: "全 Checkpoint 公开",
        intuition:
          "把预训练全程的中间 checkpoint（每若干步一个）全部开放，让研究者可以复现 / 分析训练动力学。",
        why: "在国产闭源风气浓重的 2023 年是少有的「极致开源」，奠定了百川的学术口碑。",
      },
      {
        name: "中英 / 法律 / 医疗多领域数据",
        intuition:
          "在通用语料外混入大量法律、医疗等垂直领域数据，加强中文专业场景能力。",
        why: "为下游中文应用 (法律 / 医疗 RAG / Chatbot) 提供更好底座。",
      },
    ],
    benchmarks: [
      { name: "MMLU (13B)", value: 59.2 },
      { name: "C-Eval", value: 58.1 },
      { name: "GSM8K", value: 52.8 },
      { name: "HumanEval", value: 17.7 },
    ],
    insights: [
      {
        title: "训练动力学开源",
        body: "中间 ckpt 开放使「中文大模型的训练曲线」第一次可被全球复现/批评，对学术研究意义大于商业意义。",
      },
    ],
    lineage: [
      { id: "baichuan-omni", role: "successor", note: "向多模态扩展" },
    ],
    tier: "stub",
  },

  {
    id: "baichuan-omni",
    team: "baichuan",
    title: "Baichuan-Omni",
    titleZh: "Baichuan-Omni:全模态开源模型",
    date: "2024-10-01",
    contributions: [
      "图 / 文 / 音 / 视频四模态统一编码",
      "Baichuan2 LLM 主干 + 各模态独立编码器",
      "多阶段对齐 + 指令微调",
    ],
    buildsOn: ["baichuan2"],
    summary:
      "百川智能的开源全模态模型，把图、文、音、视频四模态的编码器接入 Baichuan2 主干，按 stage 进行模态对齐与指令微调；为 2024 年中文开源全模态留下一个早期参考实现。",
    keyTechniques: [
      {
        name: "Modality-Specific Encoders",
        intuition:
          "每个模态各用专门编码器（image / video / audio），通过 projector 投影到 LLM hidden space 后参与 token 流。",
        why: "经典的「LLM as Universal Decoder」范式，工程上简洁可扩展。",
      },
    ],
    benchmarks: [
      { name: "MMBench", value: 76.2 },
      { name: "AudioBench", value: 65 },
      { name: "VideoMME", value: 52 },
    ],
    insights: [
      {
        title: "开源全模态的早期实证",
        body: "在 2024 年开源全模态选项稀缺时，提供了「四模态 + LLM」的可复现配方。",
      },
    ],
    lineage: [
      { id: "baichuan2", role: "predecessor" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "短上下文预训练",
        subtitle: "Stage 1",
        desc: "在 4K 上下文上完成主预训练，建立基础语言能力。",
      },
      {
        num: "02",
        title: "32K 长度扩展",
        subtitle: "Stage 2",
        desc: "用 RoPE base 调整 + 长文本数据继续训练，建立中等长度依赖。",
      },
      {
        num: "03",
        title: "200K 大海捞针训练",
        subtitle: "Stage 3",
        desc: "在 200K 上下文上做最终长度课程，让 needle-in-a-haystack 接近满分。",
        innovations: ["三阶段长度课程"],
      },
      {
        num: "04",
        title: "COOL RLHF",
        subtitle: "Post-training",
        desc: "用条件 reward (Conditional Online RLHF) 解决「helpfulness vs safety」等多偏好冲突，并降低 reward hacking。",
        outputs: ["InternLM2-Chat"],
        innovations: ["条件 reward 多偏好对齐"],
      },
    ],
    keyTechniques: [
      {
        name: "Length Curriculum",
        intuition:
          "把上下文从 4K 逐级扩展到 32K → 200K，每级用 RoPE base 调整 + 该长度数据训练，避免一次性上长度造成 catastrophic forgetting。",
        why: "200K 大海捞针接近满分，对长上下文模型训练范式有方法论参考价值。",
      },
      {
        name: "COOL RLHF",
        intuition:
          "对每个 prompt 类别条件化 reward 模型，让 RM 在不同任务上有不同的权衡；显式抑制 helpfulness ↔ harmlessness 间的冲突。",
        why: "比标准 RLHF 更稳健，是开源 RLHF 工程化的重要参考。",
      },
    ],
    benchmarks: [
      { name: "MMLU (20B)", value: 67.7 },
      { name: "GSM8K", value: 76.1 },
      { name: "Needle (200K)", value: 99, max: 100 },
      { name: "BBH", value: 65.2 },
    ],
    insights: [
      {
        title: "长上下文 = 课程问题",
        body: "InternLM2 系统化展示了「长度课程」的有效性，是后续 Qwen / DeepSeek 长上下文训练的参考方法论。",
      },
    ],
    lineage: [
      { id: "internlm-3", role: "successor", note: "通用 + 推理双模式" },
    ],
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
    keyTechniques: [
      {
        name: "Data-Efficient Pretraining",
        intuition:
          "用 4T 高质量 tokens（远低于同档 18T+）达到接近水平，证明数据信噪比可补偿数量。",
        why: "为算力受限团队提供「精炼数据 → 同档结果」的可复现路径。",
      },
      {
        name: "通用 + 推理双模式",
        intuition:
          "在同一权重内通过 chat template 切换 thinking / non-thinking，与 Qwen3 / GLM-4.5 同代。",
        why: "应对 R1 后开源生态对「推理 / 通用统一」的统一需求。",
      },
    ],
    benchmarks: [
      { name: "MMLU", value: 76.5 },
      { name: "GSM8K", value: 89.0 },
      { name: "AIME 2024", value: 30 },
      { name: "BBH", value: 73 },
    ],
    insights: [
      {
        title: "高质量数据 vs 高数量数据",
        body: "InternLM3 用 4T 精炼 tokens 接近 18T 训练的同档模型，是「数据质量决定 scaling 系数」论点的又一实证。",
      },
    ],
    lineage: [
      { id: "internlm2", role: "predecessor" },
    ],
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
    keyTechniques: [
      {
        name: "Expert-Specific Learning Rate",
        intuition:
          "不同专家因路由频率不同收到的有效梯度量也不同，按专家自适应缩放学习率，避免高频 / 低频专家发散。",
        why: "解决 MoE 路由不均带来的「学习率 mismatch」问题，是大规模 MoE 训练稳定性的关键工程实践。",
      },
      {
        name: "MoE Scaling Laws 研究",
        intuition:
          "系统化拟合「专家数 / 激活数 / 数据量」三者间的 scaling 关系，给出 MoE 设计的可预测公式。",
        why: "把 MoE 从「黑盒架构」变成「可外推方案」，对后续 MoE 工业落地有方法论价值。",
      },
    ],
    benchmarks: [
      { name: "MMLU", value: 88.4 },
      { name: "MMLU-Pro", value: 60.2 },
      { name: "MATH", value: 69.8 },
      { name: "HumanEval", value: 71.4 },
      { name: "GSM8K", value: 92.8 },
    ],
    insights: [
      {
        title: "腾讯首次对外开源旗舰",
        body: "Hunyuan-Large 是腾讯 AI 路线公开的重要节点；其工程细节披露相比同档闭源更具学术参考价值。",
      },
    ],
    lineage: [
      { id: "deepseek-moe", role: "applies", note: "细粒度 + shared expert 思路" },
    ],
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
    pipeline: [
      {
        num: "01",
        title: "Lightning Attention 架构",
        subtitle: "Architecture",
        desc: "把传统 softmax attention 替换为 Lightning Attention（线性注意力变体），1M 长度仍是线性复杂度。",
        outputs: ["MiniMax-Text-01 主干"],
        innovations: ["线性注意力 + MoE 大规模融合"],
      },
      {
        num: "02",
        title: "1M 上下文预训练",
        subtitle: "Pre-training",
        desc: "训练上下文直接到 1M，配合自研并行框架与 KV cache 优化。",
        outputs: ["456B / 45.9B 激活 Base"],
      },
      {
        num: "03",
        title: "推理 4M 外推",
        subtitle: "Inference",
        desc: "推理端通过位置编码 / KV reuse 把上下文外推到 4M，用于代理 / 长文档场景。",
        innovations: ["训练 1M、推理 4M 的工业范式"],
      },
    ],
    keyTechniques: [
      {
        name: "Lightning Attention",
        intuition:
          "把 softmax attention 拆解为可线性递推的形式：每层维护一个状态矩阵，按 token 增量更新；总复杂度 O(L) 而非 O(L²)。",
        why: "让 1M 上下文训练 / 推理在算力上变得可承受，是线性注意力路线最具影响力的工业级实证。",
      },
      {
        name: "Hybrid 软硬注意力",
        intuition:
          "并非全替换：在某些层保留 softmax 以维持局部精度，其余层用 Lightning，混合编排。",
        why: "权衡线性注意力质量损失 vs 长上下文收益，是后续 hybrid attention 设计的早期参考。",
      },
    ],
    benchmarks: [
      { name: "MMLU", value: 88.5, baseline: 87.2, baselineModel: "GPT-4o" },
      { name: "GPQA Diamond", value: 54.4 },
      { name: "MATH", value: 76.7 },
      { name: "Long Context (1M)", value: 95, max: 100 },
      { name: "RULER (128K)", value: 88, max: 100 },
    ],
    insights: [
      {
        title: "线性注意力首次工业级开源",
        body: "MiniMax-01 是首个把 Lightning Attention 推到 456B MoE 旗舰并开源的工作，对线性注意力研究方向有标志性意义。",
      },
      {
        title: "训练 1M / 推理 4M",
        body: "把训练长度与推理长度解耦，用更短训练上下文 + 推理时外推，是同时控制训练成本与服务上下文的双赢路径。",
      },
    ],
    lineage: [
      { id: "deepseek-v4", role: "contemporary", note: "1M 上下文同代竞争方案 (走稀疏 / 压缩注意力)" },
      { id: "minicpm-4", role: "contemporary", note: "InfLLM v2 是另一种长上下文优化路径" },
    ],
    tier: "flagship",
  },
];

export function paperById(id: string): Paper | undefined {
  return PAPERS.find((p) => p.id === id);
}

export function papersByTeam(team: string): Paper[] {
  return PAPERS.filter((p) => p.team === team);
}
