"use client";

import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class FlowEngineBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[FlowEngine] Runtime disabled after render error.", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Never allow a Companion rendering problem to take down Flowly.
      return null;
    }

    return this.props.children;
  }
}
