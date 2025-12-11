'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { captureException } from '@/lib/monitoring/error-tracker'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🔍 [DEBUG] ErrorBoundary caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capture error in error tracking service
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorInfo: errorInfo.toString(),
    })
    
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      console.error('🔍 [DEBUG] ErrorBoundary rendering error fallback', {
        error: this.state.error,
        errorMessage: this.state.error?.message,
        errorStack: this.state.error?.stack,
        errorInfo: this.state.errorInfo
      })
      
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong with the analytics panel
          </h2>
          <details className="text-sm text-red-700">
            <summary className="cursor-pointer font-medium">
              Error Details (Click to expand)
            </summary>
            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
