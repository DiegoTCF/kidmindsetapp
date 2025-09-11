import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RLSErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('[RLS Check] Error boundary caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[RLS Check] Error boundary details:', error, errorInfo);
    
    // Check if this is a permission/RLS related error
    if (error.message?.includes('permission') || 
        error.message?.includes('RLS') ||
        error.message?.includes('policy') ||
        error.message?.includes('PGRST116')) {
      console.log('[RLS Check] RLS-related error detected - this might be expected behavior');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data Access Issue</AlertTitle>
          <AlertDescription>
            There was an issue accessing some data. This might be due to security permissions.
            {this.state.error?.message?.includes('permission') && (
              <span className="block mt-2 text-sm text-muted-foreground">
                Security policies are working correctly - unauthorized access prevented.
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}