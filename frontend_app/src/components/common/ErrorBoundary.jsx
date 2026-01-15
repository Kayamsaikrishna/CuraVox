import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Error</h1>
            <p className="text-gray-700 mb-6">
              We encountered an error while loading the application. Our team has been notified.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
              <p className="text-sm text-gray-600 font-mono">{this.state.error?.toString()}</p>
            </div>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Application
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Attempt to reset the application state
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Cache & Reload
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;