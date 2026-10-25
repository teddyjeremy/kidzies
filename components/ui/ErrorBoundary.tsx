"use client";

import { Component, type ReactNode } from "react";

interface Props { fallback: ReactNode; children: ReactNode }
interface State { failed: boolean }

/** Keeps a failing 3D scene from taking the whole page down. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
