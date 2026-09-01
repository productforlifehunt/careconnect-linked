import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { friendlyMessage, friendlyErrorTitle, friendlyRetryLabel } from "@/lib/friendly-error";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Full technical detail stays in the console for us, never on screen.
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive/60" />
          <h1 className="text-lg font-semibold text-foreground">{friendlyErrorTitle()}</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            {friendlyMessage(this.state.error)}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            {friendlyRetryLabel()}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
