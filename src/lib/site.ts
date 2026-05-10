export const SITE_TITLE = "中国开源大模型论文知识图谱";

export const SITE_DESCRIPTION =
  "可交互的中国开源大模型论文知识图谱，覆盖 DeepSeek、Qwen、Kimi、GLM、MiniCPM 等团队，含论文脉络、技术继承与交互演示。";

export function getReferenceDate() {
  return new Date();
}

export function toReferenceDate(value: string) {
  return new Date(value);
}
