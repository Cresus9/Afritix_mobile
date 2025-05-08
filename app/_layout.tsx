import { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { supabase } from '@/lib/supabase';
import { initializeGlobalScope } from '@/lib/global';
import debug from '@/lib/debug';

// Set up global error handler
const originalConsoleError = console.error;
console.error = (...args) => {
  debug.error('Console Error', args);
  originalConsoleError(...args);
};

// Set up global promise rejection handler
if (typeof global !== 'undefined') {
  (global as any).ErrorUtils?.setGlobalHandler((error: Error, isFatal: boolean) => {
    debug.error(`Global Error (${isFatal ? 'Fatal' : 'Non-fatal'})`, error);
    Alert.alert(
      'Application Error',
      `An error occurred: ${error.message}\n\nPlease restart the app.`
    );
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

export default function RootLayout() {
  debug.log('RootLayout component rendering');
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { refreshUser, userSettings } = useAuthStore();
  const { theme, setTheme, colors } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Initialize global scope
  useEffect(() => {
    async function initialize() {
      debug.log('Starting initialization...');
      try {
        setIsLoading(true);
        const success = initializeGlobalScope();
        debug.log('Global scope initialization result:', { success });
        
        if (!success) {
          throw new Error('Failed to initialize global scope');
        }
        
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

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) return;
    
    debug.log('Auth initialization effect running');
    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        debug.log('Auth state changed:', { event, userId: session?.user?.id });
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser();
        }
      });

      return () => {
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

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!isInitialized || isLoading) {
    return <LoadingFallback />;
  }

  return (
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
          name="profile/resources" 
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
          name=" profile/resources/privacy" 
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
      </Stack>
    </SafeAreaProvider>
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