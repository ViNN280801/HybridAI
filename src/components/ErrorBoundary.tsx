// HybridAI/src/components/ErrorBoundary.tsx

/**
 * @file ErrorBoundary component to catch JavaScript errors in component tree
 * @module components/ErrorBoundary
 * @see {@link https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary React Error Boundaries}
 */

import { Component, ReactNode } from "react";

/**
 * @interface ErrorBoundaryProps
 * @property {ReactNode} children - Child components to render
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * @interface ErrorBoundaryState
 * @property {boolean} hasError - Indicates if error was caught
 * @property {string} errorMessage - Captured error message
 */
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

/**
 * @class ErrorBoundary
 * @extends {Component<ErrorBoundaryProps, ErrorBoundaryState>}
 *
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /**
   * @memberof ErrorBoundary
   * @type {ErrorBoundaryState}
   */
  state: ErrorBoundaryState = { hasError: false, errorMessage: "" };

  /**
   * @static
   * @method getDerivedStateFromError
   * @param {Error} error - The caught error object
   * @returns {ErrorBoundaryState} Updated state with error details
   *
   * @description
   * Updates state to display fallback UI when error is caught
   *
   * @see {@link https://react.dev/reference/react/Component#static-getderivedstatefromerror React Documentation}
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (error.message.includes("User rejected the request")) {
      return { hasError: false };
    }
    return { hasError: true, errorMessage: error.message };
  }

  /**
   * @method componentDidCatch
   * @param {Error} error - The caught error object
   * @returns {void}
   *
   * @description
   * Handles side effects when error is caught (logging, error reporting)
   *
   * @see {@link https://react.dev/reference/react/Component#componentdidcatch React Documentation}
   */
  componentDidCatch(error: Error) {
    if (!error.message.includes("User rejected the request")) {
      console.error("Uncaught error:", error);
    }
  }

  /**
   * @method render
   * @returns {ReactNode} Renders children or fallback UI
   *
   * @description
   * Renders child components normally or fallback UI when error occurs
   */
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Application Error</h1>
          <p>{this.state.errorMessage}</p>
          <p>Please refresh the page or contact support</p>
        </div>
      );
    }
    return this.props.children;
  }
}
