import { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import ErrorBoundary from '@/components/ErrorBoundary'; // Import ErrorBoundary
import { useThemeStore } from '@/store/theme-store';
import { supabase } from '@/lib/supabase';
import { initializeGlobalScope } from '@/lib/global';
import debug from '@/lib/debug';
import Constants from 'expo-constants';

// Set up global error handler
const originalConsoleError = console.error;
console.error = (...args) => {
  debug.error('Console Error', args);
  originalConsoleError(...args);
};

// Set up global promise rejection handler
let hasShownGlobalError = false;
if (typeof global !== 'undefined') {
  (global as any).ErrorUtils?.setGlobalHandler((error: Error, isFatal: boolean) => {
    debug.error(`Global Error (${isFatal ? 'Fatal' : 'Non-fatal'})`, error);
    // Only show the alert for non-fatal errors and only once
    if (!isFatal && !hasShownGlobalError) {
      hasShownGlobalError = true;
      Alert.alert(
        'Application Error',
        `An error occurred: ${error.message}\n\nPlease restart the app.`
      );
    }
    // For fatal errors, just log and let the app crash/reload
  });
}

debug.log('APP STARTING - _layout.tsx');

// Polyfill for crypto.randomUUID if needed
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  console.log('Polyfilling crypto.randomUUID in _layout');
  // @ts-ignore
  if (!globalThis.crypto) {
    // @ts-ignore
    globalThis.crypto = {};
  }
  // @ts-ignore
  if (!globalThis.crypto.randomUUID) {
    // @ts-ignore
    globalThis.crypto.randomUUID = () => {
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      return `${timestamp}-${randomPart}`;
    };
  }
}

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(error => {
  debug.error('Error preventing splash screen auto-hide', error);
});

function ErrorFallback({ error }: { error: Error }) {
  debug.error('Rendering ErrorFallback', error);
  
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Text style={styles.errorDetail}>{error.stack}</Text>
    </View>
  );
}

function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

// Add configuration check
const verifySupabaseConfig = () => {
  const extra = Constants.expoConfig?.extra;
  const supabaseUrl = extra?.SUPABASE_URL;
  const supabaseAnonKey = extra?.SUPABASE_ANON_KEY;

  debug.log('Supabase Configuration:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length,
    keyLength: supabaseAnonKey?.length
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check your environment variables.');
  }
};

export default function RootLayout() {
  debug.log('RootLayout component rendering (NEW LOG)'); // Existing log, ensure it's there

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const { refreshUser, userSettings } = useAuthStore();
  const { theme, setTheme, colors } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Initialize global scope
  useEffect(() => {
    async function initialize() {
      debug.log('Starting initialization...');
      try {
        setIsLoading(true);
        
        // Verify Supabase configuration
        verifySupabaseConfig();
        
        const success = initializeGlobalScope();
        debug.log('Global scope initialization result:', { success });
        
        if (!success) {
          throw new Error('Failed to initialize global scope');
        }
        
        // Check initial auth state
        const { data: { session } } = await supabase.auth.getSession();
        debug.log('Initial auth state check:', {
          hasSession: !!session,
          userId: session?.user?.id,
          sessionExpiry: session?.expires_at
        });
        
        setIsInitialized(true);
      } catch (err) {
        debug.error('Initialization error', err);
        setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, []);
  
  // Initialize theme based on user settings or system preference
  useEffect(() => {
    if (!isInitialized) return;
    
    debug.log('Theme initialization effect running');
    try {
      if (userSettings?.theme) {
        debug.log('Setting theme from user settings:', { theme: userSettings.theme });
        setTheme(userSettings.theme);
      } else if (systemColorScheme) {
        debug.log('Setting theme from system:', { systemColorScheme });
        setTheme(systemColorScheme);
      }
    } catch (error) {
      debug.error('Error initializing theme', error);
      // Fallback to system theme
      if (systemColorScheme) {
        setTheme(systemColorScheme);
      }
    }
  }, [isInitialized, userSettings?.theme, systemColorScheme]);

  // Add navigation effect for auth state
  useEffect(() => {
    if (!isInitialized) return;

    debug.log('Setting up auth navigation effect');
    
    // Check initial session and navigate if needed
    supabase.auth.getSession().then(({ data: { session } }) => {
      debug.log('Initial session check for navigation:', {
        hasSession: !!session,
        userId: session?.user?.id,
        sessionExpiry: session?.expires_at
      });
      
      if (session) {
        debug.log('Navigating to tabs due to existing session');
        router.replace('/(tabs)');
      } else {
        debug.log('No session found, navigating to index');
        router.replace('/');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debug.log('Auth state change for navigation:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        sessionExpiry: session?.expires_at,
        accessToken: session?.access_token ? 'present' : 'missing'
      });

      if (event === 'SIGNED_IN' && session) {
        debug.log('Navigating to tabs after sign in');
        // Add a small delay to ensure session is fully established
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        debug.log('Navigating to index after sign out');
        router.replace('/');
      } else if (event === 'INITIAL_SESSION') {
        debug.log('Initial session event received');
        if (session) {
          debug.log('Initial session found, navigating to tabs');
          router.replace('/(tabs)');
        } else {
          debug.log('No initial session found, navigating to index');
          router.replace('/');
        }
      }
    });

    return () => {
      debug.log('Cleaning up auth navigation subscription');
      subscription.unsubscribe();
    };
  }, [isInitialized, router]);

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) return;
    
    debug.log('Auth initialization effect running');
    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        debug.log('Auth state changed:', { 
          event, 
          userId: session?.user?.id,
          hasSession: !!session,
          sessionExpiry: session?.expires_at,
          accessToken: session?.access_token ? 'present' : 'missing'
        });

        // Log the full session object for debugging
        console.log('Full session object:', JSON.stringify(session, null, 2));

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          debug.log('Sign in or token refresh detected, refreshing user data');
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          debug.log('Sign out detected, clearing user data');
          // Clear any local state if needed
        } else if (event === 'INITIAL_SESSION') {
          debug.log('Initial session check');
          if (session) {
            debug.log('Initial session found, refreshing user data');
            await refreshUser();
          } else {
            debug.log('No initial session found');
          }
        }
      });

      // Check initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        debug.log('Initial session check result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          sessionExpiry: session?.expires_at
        });
      });

      return () => {
        debug.log('Cleaning up auth subscription');
        subscription.unsubscribe();
      };
    } catch (error) {
      debug.error('Error initializing auth', error);
    }
  }, [isInitialized]);

  // Hide splash screen after initialization
  useEffect(() => {
    if (!isInitialized) return;
    
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
        debug.log('Splash screen hidden successfully');
      } catch (error) {
        debug.error('Error hiding splash screen', error);
      }
    };

    hideSplash();
  }, [isInitialized]);

  debug.log('[RootLayout] Evaluating render conditions:', { error, isInitialized, isLoading }); // New Log
  if (error) {
    debug.error('[RootLayout] Rendering ErrorFallback due to error state:', error); // New Log
    return <ErrorFallback error={error} />;
  }

  if (!isInitialized || isLoading) {
    debug.log('[RootLayout] Rendering LoadingFallback.'); // New Log
    return <LoadingFallback />;
  }

  debug.log('[RootLayout] Proceeding to render main app structure (SafeAreaProvider and Stack wrapped in ErrorBoundary).'); // Modified log
  return (
    <ErrorBoundary name="RootStack">
      <SafeAreaProvider>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AfriTix</Text>
            </View>
          ),
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            title: 'Login',
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            title: 'Register',
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="auth/forgot-password" 
          options={{ 
            title: 'Mot de passe oublié',
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: 'Event Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="ticket/[id]" 
          options={{ 
            title: 'Ticket Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="checkout/[id]" 
          options={{ 
            title: 'Checkout',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="profile/index" 
          options={{ 
            title: 'Profile',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/edit" 
          options={{ 
            title: 'Edit Profile',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/personal-info" 
          options={{ 
            title: 'Informations personnelles',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/payment-methods" 
          options={{ 
            title: 'Méthodes de paiement',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/notifications" 
          options={{ 
            title: 'Notifications',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/tickets" 
          options={{ 
            title: 'Mes billets',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/support" 
          options={{ 
            title: 'Support',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/help" 
          options={{ 
            title: 'Aide',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/about" 
          options={{ 
            title: 'À propos',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/privacy" 
          options={{ 
            title: 'Confidentialité',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/faq/account" 
          options={{ 
            title: 'FAQ - Compte',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/faq/tickets" 
          options={{ 
            title: 'FAQ - Billets',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/faq/payments" 
          options={{ 
            title: 'FAQ - Paiements',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/faq/events" 
          options={{ 
            title: 'FAQ - Événements',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/resources/index" 
          options={{ 
            title: 'Ressources',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/resources/terms" 
          options={{ 
            title: 'Conditions d\'utilisation',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/resources/privacy" 
          options={{ 
            title: 'Politique de confidentialité',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/resources/about" 
          options={{ 
            title: 'À propos',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/resources/guides" 
          options={{ 
            title: 'Guides d\'utilisation',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/support/[id]" 
          options={{ 
            title: 'Support Ticket',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/support/new" 
          options={{ 
            title: 'Nouveau ticket',
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff0000',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#000',
  },
});