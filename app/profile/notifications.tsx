import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Mail, Smartphone, Ticket, Calendar, Tag, Info, User } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { NotificationPreferences } from '@/types';

export default function NotificationsScreen() {
  const { user, notificationPreferences, fetchNotificationPreferences, updateNotificationPreferences, isLoading, error, clearError } = useAuthStore();
  const { colors } = useThemeStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Default preferences if none exist
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: user?.id || '',
    email: true,
    push: true,
    types: ['events', 'tickets', 'promotions']
  });
  
  useEffect(() => {
    const loadPreferences = async () => {
      setIsRefreshing(true);
      try {
        await fetchNotificationPreferences();
        setLocalError(null);
      } catch (err) {
        console.error('Error loading notification preferences:', err);
        setLocalError('Impossible de charger vos préférences de notification');
      } finally {
        setIsRefreshing(false);
      }
    };
    
    loadPreferences();
    
    // Clear any existing errors when component mounts
    clearError();
  }, []);
  
  useEffect(() => {
    if (notificationPreferences) {
      setPreferences(notificationPreferences);
    }
  }, [notificationPreferences]);
  
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);
  
  const handleToggleChannel = async (channel: 'email' | 'push', value: boolean) => {
    if (isLoading) return; // Prevent multiple simultaneous updates
    
    try {
      // Update local state immediately for responsive UI
      setPreferences(prev => ({
        ...prev,
        [channel]: value
      }));
      
      // Clear any previous errors
      setLocalError(null);
      
      // Update in database
      await updateNotificationPreferences({
        [channel]: value
      });
    } catch (err) {
      console.error(`Error toggling ${channel}:`, err);
      
      // Show error alert
      Alert.alert(
        "Erreur",
        `Impossible de mettre à jour les préférences de notification. Veuillez réessayer.`,
        [{ text: "OK" }]
      );
      
      // Revert the change in UI
      setPreferences(prev => ({
        ...prev,
        [channel]: !value
      }));
      
      // Set error message
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Une erreur s'est produite lors de la mise à jour des préférences");
      }
    }
  };
  
  const handleToggleType = async (type: string) => {
    if (isLoading) return; // Prevent multiple simultaneous updates
    
    try {
      // Check if type is already in the array
      const isTypeIncluded = preferences.types.includes(type);
      
      // Create a new array with the type toggled
      const updatedTypes = isTypeIncluded
        ? preferences.types.filter(t => t !== type)
        : [...preferences.types, type];
      
      // Update local state immediately for responsive UI
      setPreferences(prev => ({
        ...prev,
        types: updatedTypes
      }));
      
      // Clear any previous errors
      setLocalError(null);
      
      // Update in database
      await updateNotificationPreferences({
        types: updatedTypes
      });
    } catch (err) {
      console.error(`Error toggling notification type ${type}:`, err);
      
      // Show error alert
      Alert.alert(
        "Erreur",
        `Impossible de mettre à jour les préférences de notification. Veuillez réessayer.`,
        [{ text: "OK" }]
      );
      
      // Revert the change in UI by fetching the current state again
      try {
        await fetchNotificationPreferences();
      } catch (fetchErr) {
        console.error('Error refreshing notification preferences:', fetchErr);
      }
      
      // Set error message
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Une erreur s'est produite lors de la mise à jour des préférences");
      }
    }
  };
  
  const isTypeEnabled = (type: string) => {
    return preferences.types.includes(type);
  };
  
  const handleRetry = async () => {
    setLocalError(null);
    setIsRefreshing(true);
    try {
      await fetchNotificationPreferences();
    } catch (err) {
      console.error('Error retrying notification preferences fetch:', err);
      setLocalError('Impossible de charger vos préférences de notification');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (isRefreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Notifications',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des préférences...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Notifications',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false
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
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Canaux de notification</Text>
          
          <View style={[styles.optionItem, { borderBottomColor: colors.border }]}>
            <View style={styles.optionInfo}>
              <Mail size={20} color={colors.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Email</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Recevez des notifications par email
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.email}
              onValueChange={(value) => handleToggleChannel('email', value)}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={preferences.email ? colors.primary : colors.textMuted}
              disabled={isLoading}
            />
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Smartphone size={20} color={colors.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Notifications push</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Recevez des notifications sur votre appareil
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.push}
              onValueChange={(value) => handleToggleChannel('push', value)}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={preferences.push ? colors.primary : colors.textMuted}
              disabled={isLoading}
            />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Types de notifications</Text>
          
          <TouchableOpacity 
            style={[styles.typeItem, { borderBottomColor: colors.border }]}
            onPress={() => handleToggleType('events')}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={styles.typeInfo}>
              <Calendar size={20} color={colors.textSecondary} />
              <Text style={[styles.typeTitle, { color: colors.text }]}>Événements</Text>
            </View>
            <View style={[
              styles.checkbox,
              { 
                borderColor: isTypeEnabled('events') ? colors.primary : colors.border,
                backgroundColor: isTypeEnabled('events') ? colors.primary + '10' : 'transparent'
              }
            ]}>
              {isTypeEnabled('events') && (
                <View style={[styles.checkboxInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeItem, { borderBottomColor: colors.border }]}
            onPress={() => handleToggleType('tickets')}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={styles.typeInfo}>
              <Ticket size={20} color={colors.textSecondary} />
              <Text style={[styles.typeTitle, { color: colors.text }]}>Billets</Text>
            </View>
            <View style={[
              styles.checkbox,
              { 
                borderColor: isTypeEnabled('tickets') ? colors.primary : colors.border,
                backgroundColor: isTypeEnabled('tickets') ? colors.primary + '10' : 'transparent'
              }
            ]}>
              {isTypeEnabled('tickets') && (
                <View style={[styles.checkboxInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeItem, { borderBottomColor: colors.border }]}
            onPress={() => handleToggleType('promotions')}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={styles.typeInfo}>
              <Tag size={20} color={colors.textSecondary} />
              <Text style={[styles.typeTitle, { color: colors.text }]}>Promotions</Text>
            </View>
            <View style={[
              styles.checkbox,
              { 
                borderColor: isTypeEnabled('promotions') ? colors.primary : colors.border,
                backgroundColor: isTypeEnabled('promotions') ? colors.primary + '10' : 'transparent'
              }
            ]}>
              {isTypeEnabled('promotions') && (
                <View style={[styles.checkboxInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.typeItem}
            onPress={() => handleToggleType('account')}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={styles.typeInfo}>
              <User size={20} color={colors.textSecondary} />
              <Text style={[styles.typeTitle, { color: colors.text }]}>Compte</Text>
            </View>
            <View style={[
              styles.checkbox,
              { 
                borderColor: isTypeEnabled('account') ? colors.primary : colors.border,
                backgroundColor: isTypeEnabled('account') ? colors.primary + '10' : 'transparent'
              }
            ]}>
              {isTypeEnabled('account') && (
                <View style={[styles.checkboxInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.infoSection, { backgroundColor: colors.cardLight }]}>
          <Info size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Vous pouvez modifier vos préférences de notification à tout moment.
            Les notifications importantes concernant votre compte seront toujours envoyées.
          </Text>
        </View>
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingOverlayText, { color: colors.text }]}>
              Mise à jour...
            </Text>
          </View>
        )}
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoSection: {
    flexDirection: 'row',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
    marginBottom: 20,
  },
  loadingOverlayText: {
    marginLeft: 10,
    fontSize: 14,
  },
});