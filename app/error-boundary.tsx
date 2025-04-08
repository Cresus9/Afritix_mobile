import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const IFRAME_ID = 'rork-web-preview';

const webTargetOrigins = [
  "http://localhost:3000",
  "https://rorkai.com",
  "https://rork.app",
];    

function sendErrorToIframeParent(error: any, errorInfo?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.debug('Sending error to parent:', {
      error,
      errorInfo,
      referrer: document.referrer
    });

    const errorMessage = {
      type: 'ERROR',
      error: {
        message: error?.message || error?.toString() || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      },
      iframeId: IFRAME_ID,
    };

    try {
      window.parent.postMessage(
        errorMessage,
        webTargetOrigins.includes(document.referrer) ? document.referrer : '*'
      );
    } catch (postMessageError) {
      console.error('Failed to send error to parent:', postMessageError);
    }
  }
}

// Log errors to a remote service in production
function logErrorToService(error: any, errorInfo?: any) {
  // In a real app, you would send this to a service like Sentry, LogRocket, etc.
  // For now, we'll just log to console in production
  if (__DEV__) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  } else {
    // This would be replaced with actual error logging service in production
    console.error('Production error:', error);
    
    // Example of what you might send to a service:
    // const errorData = {
    //   message: error?.message || String(error),
    //   stack: error?.stack,
    //   componentStack: errorInfo?.componentStack,
    //   timestamp: new Date().toISOString(),
    //   appVersion: Constants.expoConfig.version,
    //   platform: Platform.OS,
    // };
    // fetch('https://your-error-logging-service.com/log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // }).catch(e => console.error('Failed to log error:', e));
  }
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    event.preventDefault();
    const errorDetails = event.error ?? {
      message: event.message ?? 'Unknown error',
      filename: event.filename ?? 'Unknown file',
      lineno: event.lineno ?? 'Unknown line',
      colno: event.colno ?? 'Unknown column'
    };
    sendErrorToIframeParent(errorDetails);
    logErrorToService(errorDetails);
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    sendErrorToIframeParent(event.reason);
    logErrorToService(event.reason);
  }, true);

  const originalConsoleError = console.error;
  console.error = (...args) => {
    sendErrorToIframeParent(args.join(' '));
    originalConsoleError.apply(console, args);
  };
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    sendErrorToIframeParent(error, errorInfo);
    logErrorToService(error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Separate component for the error UI to use hooks
function ErrorFallback({ error }: { error: Error | null }) {
  const router = useRouter();
  const { colors } = useThemeStore();
  
  const handleReset = () => {
    router.replace('/');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <AlertTriangle size={64} color={colors.error} style={styles.icon} />
        <Text style={[styles.title, { color: colors.text }]}>Oups, quelque chose s'est mal passé</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {error?.message || "Une erreur inattendue s'est produite"}
        </Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleReset}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Retourner à l'accueil</Text>
          </TouchableOpacity>
        </View>
        
        {__DEV__ && (
          <View style={styles.devErrorContainer}>
            <Text style={[styles.devErrorTitle, { color: colors.error }]}>Détails de l'erreur (DEV uniquement):</Text>
            <Text style={[styles.devErrorText, { color: colors.textSecondary }]}>
              {error?.stack || "Pas de stack trace disponible"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: '80%',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  devErrorContainer: {
    marginTop: 40,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    width: '100%',
    maxWidth: 500,
    maxHeight: 300,
  },
  devErrorTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  devErrorText: {
    fontSize: 12,
  },
});

export default ErrorBoundary;