import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const Loading = () => null;

export const PAPER_DEMOS: Record<string, ComponentType> = {
  "deepseek-llm": dynamic(
    () => import("@/components/papers/demos/ScalingLawsDemo"),
    { loading: Loading }
  ),
  "deepseek-moe": dynamic(
    () => import("@/components/papers/demos/MoERoutingDemo"),
    { loading: Loading }
  ),
  "deepseek-math": dynamic(
    () => import("@/components/papers/demos/GRPOOriginDemo"),
    { loading: Loading }
  ),
  "deepseek-v2": dynamic(() => import("@/components/papers/demos/MLADemo"), {
    loading: Loading,
  }),
  "deepseek-coder-v2": dynamic(
    () => import("@/components/papers/demos/CoderV2Demo"),
    { loading: Loading }
  ),
  "deepseek-v3": dynamic(() => import("@/components/papers/demos/V3Demo"), {
    loading: Loading,
  }),
  "deepseek-v3-2": dynamic(() => import("@/components/papers/demos/DSADemo"), {
    loading: Loading,
  }),
  "deepseek-v4": dynamic(() => import("@/components/papers/demos/V4Demo"), {
    loading: Loading,
  }),
  // Other open-source teams
  "qwen3": dynamic(
    () => import("@/components/papers/demos/Qwen3ThinkingBudgetDemo"),
    { loading: Loading }
  ),
  "kimi-k2": dynamic(
    () => import("@/components/papers/demos/MuonClipDemo"),
    { loading: Loading }
  ),
  "glm-4-5": dynamic(
    () => import("@/components/papers/demos/GLMArcRadarDemo"),
    { loading: Loading }
  ),
  "minicpm-4": dynamic(
    () => import("@/components/papers/demos/InfLLMv2Demo"),
    { loading: Loading }
  ),
  "deepseek-ocr": dynamic(
    () => import("@/components/papers/demos/OpticalCompressionDemo"),
    { loading: Loading }
  ),
  "janus-pro": dynamic(
    () => import("@/components/papers/demos/JanusDecoupledDemo"),
    { loading: Loading }
  ),
};

export function hasDemo(id: string): boolean {
  return id in PAPER_DEMOS;
}
