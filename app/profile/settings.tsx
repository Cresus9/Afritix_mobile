import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Globe, Moon, Sun, DollarSign, Check, Shield, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { UserSettings } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userSettings, fetchUserSettings, updateUserSettings, isLoading, error, clearError } = useAuthStore();
  const { theme, setTheme, colors } = useThemeStore();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Default settings if none exist
  const [settings, setSettings] = useState<UserSettings>({
    userId: user?.id || '',
    language: 'fr',
    theme: 'light',
    currency: 'XOF'
  });
  
  useEffect(() => {
    const loadSettings = async () => {
      setIsRefreshing(true);
      try {
        await fetchUserSettings();
        setLocalError(null);
      } catch (err) {
        console.error('Error loading settings:', err);
        setLocalError('Impossible de charger vos paramètres');
      } finally {
        setIsRefreshing(false);
      }
    };
    
    loadSettings();
    
    // Clear any existing errors when component mounts
    clearError();
  }, []);
  
  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings);
      
      // Also update the theme in the theme store if it's different
      if (userSettings.theme !== theme) {
        setTheme(userSettings.theme);
      }
    }
  }, [userSettings]);
  
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);
  
  const handleUpdateLanguage = async (language: 'en' | 'fr') => {
    if (isLoading) return; // Prevent multiple simultaneous updates
    
    try {
      // Update local state immediately for responsive UI
      setSettings(prev => ({
        ...prev,
        language
      }));
      
      // Clear any previous errors
      setLocalError(null);
      
      // Update in database
      await updateUserSettings({ language });
    } catch (err) {
      console.error('Error updating language:', err);
      
      // Show error alert
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour la langue. Veuillez réessayer.",
        [{ text: "OK" }]
      );
      
      // Revert the change in UI
      setSettings(prev => ({
        ...prev,
        language: userSettings?.language || 'fr'
      }));
      
      // Set error message
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Une erreur s'est produite lors de la mise à jour de la langue");
      }
    }
  };
  
  const handleUpdateTheme = async (newTheme: 'light' | 'dark') => {
    if (isLoading) return; // Prevent multiple simultaneous updates
    
    try {
      // Update local state immediately for responsive UI
      setSettings(prev => ({
        ...prev,
        theme: newTheme
      }));
      
      // Update the theme in the theme store for immediate visual feedback
      setTheme(newTheme);
      
      // Clear any previous errors
      setLocalError(null);
      
      // Update in database
      await updateUserSettings({ theme: newTheme });
      
      // Show success message
      Alert.alert(
        'Thème mis à jour',
        'Le thème a été changé avec succès.'
      );
    } catch (err) {
      console.error('Error updating theme:', err);
      
      // Show error alert
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour le thème. Veuillez réessayer.",
        [{ text: "OK" }]
      );
      
      // Revert the change in UI
      const originalTheme = userSettings?.theme || 'light';
      setSettings(prev => ({
        ...prev,
        theme: originalTheme
      }));
      setTheme(originalTheme);
      
      // Set error message
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Une erreur s'est produite lors de la mise à jour du thème");
      }
    }
  };
  
  const handleUpdateCurrency = async (currency: 'XOF' | 'EUR' | 'USD') => {
    if (isLoading) return; // Prevent multiple simultaneous updates
    
    try {
      // Update local state immediately for responsive UI
      setSettings(prev => ({
        ...prev,
        currency
      }));
      
      // Clear any previous errors
      setLocalError(null);
      
      // Update in database
      await updateUserSettings({ currency });
    } catch (err) {
      console.error('Error updating currency:', err);
      
      // Show error alert
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour la devise. Veuillez réessayer.",
        [{ text: "OK" }]
      );
      
      // Revert the change in UI
      setSettings(prev => ({
        ...prev,
        currency: userSettings?.currency || 'XOF'
      }));
      
      // Set error message
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Une erreur s'est produite lors de la mise à jour de la devise");
      }
    }
  };
  
  const handleRetry = async () => {
    setLocalError(null);
    setIsRefreshing(true);
    try {
      await fetchUserSettings();
    } catch (err) {
      console.error('Error retrying settings fetch:', err);
      setLocalError('Impossible de charger vos paramètres');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const navigateToSecurity = () => {
    router.push('/profile/account');
  };
  
  if (isRefreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Paramètres',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false,
          headerTintColor: colors.text
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des paramètres...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Paramètres',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {localError && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{localError}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.error + '30' }]}
              onPress={handleRetry}
            >
              <Text style={[styles.retryText, { color: colors.error }]}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Langue</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateLanguage('fr')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Globe size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Français</Text>
            </View>
            {settings.language === 'fr' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateLanguage('en')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Globe size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>English</Text>
            </View>
            {settings.language === 'en' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thème</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateTheme('light')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Sun size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Clair</Text>
            </View>
            {theme === 'light' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateTheme('dark')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Moon size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Sombre</Text>
            </View>
            {theme === 'dark' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Devise</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateCurrency('XOF')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <DollarSign size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Franc CFA (XOF)</Text>
            </View>
            {settings.currency === 'XOF' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateCurrency('EUR')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <DollarSign size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Euro (EUR)</Text>
            </View>
            {settings.currency === 'EUR' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateCurrency('USD')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <DollarSign size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Dollar US (USD)</Text>
            </View>
            {settings.currency === 'USD' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sécurité</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={navigateToSecurity}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Shield size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Paramètres de sécurité</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingOverlayText, { color: colors.text }]}>
              Mise à jour...
            </Text>
          </View>
        )}
        
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>AfriTix v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  versionSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingOverlayText: {
    marginLeft: 10,
    fontSize: 14,
  },
});