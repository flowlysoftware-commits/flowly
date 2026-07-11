"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { createFlowLogger } from "./core/logger";

const logger = createFlowLogger("Boundary");

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class FlowEngineBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("Runtime disabled after render error.", { error, info });
    window.dispatchEvent(new CustomEvent("flow:runtime-error", { detail: { message: error.message } }));
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
