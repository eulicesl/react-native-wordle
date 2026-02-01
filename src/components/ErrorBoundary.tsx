import React, { Component, ErrorInfo, ReactNode } from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '../utils/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service in production
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😕</Text>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.message}>
            Something went wrong. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleRetry}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
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
    padding: 24,
    backgroundColor: '#121213',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#fff',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#818384',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.correct,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
});
