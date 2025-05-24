// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native'; // Added Platform
import debug from '@/lib/debug';

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
  name?: string; // Optional name for the boundary for logging
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ error, errorInfo });
    const boundaryName = this.props.name || 'Unnamed';
    // Using debug.error to leverage existing file logging
    debug.error(`ErrorBoundary [${boundaryName}] caught an error`, {
      message: error.message, // error.toString() might be better for some errors
      componentStack: errorInfo.componentStack,
      stack: error.stack, // Native stack if available
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          {this.state.error && (
            <Text style={styles.message}>{this.state.error.toString()}</Text>
          )}
          {this.state.errorInfo && (
            <ScrollView style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Component Stack:</Text>
              <Text style={styles.details}>{this.state.errorInfo.componentStack}</Text>
            </ScrollView>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef2f2', // A light red background
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b91c1c', // Darker red
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#dc2626', // Red
    marginBottom: 10,
  },
  detailsContainer: {
    maxHeight: 300, // Increased max height
    width: '100%',   // Full width
    marginTop: 10,
    backgroundColor: '#fee2e2', // Even lighter red
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fca5a5', // Light red border
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991b1b', // Dark red
    marginBottom: 5,
  },
  details: {
    fontSize: 11, // Slightly smaller for more content
    color: '#7f1d1d', // Dark red
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Monospace for stack traces
  },
});

export default ErrorBoundary;
