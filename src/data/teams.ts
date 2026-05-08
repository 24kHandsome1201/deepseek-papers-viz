export interface Team {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  accent: string;
  org: string;
}

export const TEAMS: Record<string, Team> = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    nameEn: "DeepSeek",
    color: "#4D6BFE",
    accent: "#7B8FFF",
    org: "深度求索 (幻方量化)",
  },
  qwen: {
    id: "qwen",
    name: "通义千问",
    nameEn: "Qwen",
    color: "#615CED",
    accent: "#8E89FF",
    org: "阿里巴巴",
  },
  kimi: {
    id: "kimi",
    name: "Kimi",
    nameEn: "Kimi / Moonshot",
    color: "#1F1F1F",
    accent: "#F2C94C",
    org: "月之暗面",
  },
  glm: {
    id: "glm",
    name: "智谱 GLM",
    nameEn: "Zhipu GLM",
    color: "#0E8FFD",
    accent: "#5DB7FF",
    org: "智谱 AI",
  },
  minicpm: {
    id: "minicpm",
    name: "面壁 MiniCPM",
    nameEn: "ModelBest",
    color: "#F2994A",
    accent: "#FFB46B",
    org: "面壁智能",
  },
  yi: {
    id: "yi",
    name: "零一 Yi",
    nameEn: "01.AI",
    color: "#27AE60",
    accent: "#5DD992",
    org: "零一万物",
  },
  baichuan: {
    id: "baichuan",
    name: "百川",
    nameEn: "Baichuan",
    color: "#EB5757",
    accent: "#FF8585",
    org: "百川智能",
  },
  internlm: {
    id: "internlm",
    name: "书生·浦语",
    nameEn: "InternLM",
    color: "#9B51E0",
    accent: "#C58CFF",
    org: "上海 AI 实验室",
  },
};
