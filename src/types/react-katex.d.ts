declare module "react-katex" {
  import { ComponentType, ReactNode } from "react";

  export interface KatexProps {
    math?: string;
    children?: ReactNode;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: Record<string, unknown>;
    as?: string;
  }

  export const InlineMath: ComponentType<KatexProps>;
  export const BlockMath: ComponentType<KatexProps>;
}
