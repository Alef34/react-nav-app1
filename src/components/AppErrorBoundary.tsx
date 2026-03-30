import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      message: "",
    };
  }

  public static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unknown runtime error",
    };
  }

  public componentDidCatch(error: unknown): void {
    console.error("Unhandled React error:", error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100svh",
            backgroundColor: "#fee2e2",
            color: "#7f1d1d",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Runtime error</h1>
          <p>App crashed while rendering. Open browser console for details.</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
