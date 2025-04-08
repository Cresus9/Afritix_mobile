import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  User, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  Settings, 
  LogOut, 
  ChevronRight,
  Ticket,
  Clock,
  Shield,
  Info,
  Lock
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshUser, isLoading, error, clearError } = useAuthStore();
  const { colors } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const loadUserData = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      setLocalError(null);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setLocalError('Impossible de charger les données utilisateur');
    } finally {
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
    
    // Clear any existing errors when component mounts
    clearError();
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);
  
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: async () => {
            try {
              await logout();
              router.replace('/');
            } catch (err) {
              console.error('Error during logout:', err);
              Alert.alert(
                "Erreur",
                "Impossible de vous déconnecter. Veuillez réessayer.",
                [{ text: "OK" }]
              );
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Profil',
          headerRight: () => <ThemeToggle />,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text
        }} />
        
        <View style={styles.notAuthenticatedContainer}>
          <Text style={[styles.notAuthenticatedText, { color: colors.text }]}>
            Connectez-vous pour accéder à votre profil
          </Text>
          <Button 
            title="Se connecter" 
            onPress={() => router.push('/auth/login')}
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  if (isLoading && !refreshing && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Profil',
          headerRight: () => <ThemeToggle />,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement du profil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Profil',
        headerRight: () => <ThemeToggle />,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text
      }} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadUserData}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {localError && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{localError}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.error + '30' }]}
              onPress={loadUserData}
            >
              <Text style={[styles.retryText, { color: colors.error }]}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.profileHeader, { backgroundColor: colors.card }]}
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.7}
        >
          <View style={styles.profileInfo}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
                defaultSource={require('@/assets/images/icon.png')}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            
            <View style={styles.nameContainer}>
              <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Utilisateur'}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'Email non disponible'}</Text>
            </View>
          </View>
          
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Compte</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/personal-info')}
            >
              <View style={styles.menuItemLeft}>
                <User size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Informations personnelles</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/payment-methods')}
            >
              <View style={styles.menuItemLeft}>
                <CreditCard size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Moyens de paiement</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/notifications')}
            >
              <View style={styles.menuItemLeft}>
                <Bell size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/account')}
            >
              <View style={styles.menuItemLeft}>
                <Lock size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Sécurité</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activité</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/tickets')}
            >
              <View style={styles.menuItemLeft}>
                <Ticket size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Mes billets</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/activity')}
            >
              <View style={styles.menuItemLeft}>
                <Clock size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Historique</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Préférences</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/settings')}
            >
              <View style={styles.menuItemLeft}>
                <Settings size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Paramètres</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/privacy')}
            >
              <View style={styles.menuItemLeft}>
                <Shield size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Confidentialité</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/help')}
            >
              <View style={styles.menuItemLeft}>
                <HelpCircle size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Aide</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/support')}
            >
              <View style={styles.menuItemLeft}>
                <Info size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Contacter le support</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/about')}
            >
              <View style={styles.menuItemLeft}>
                <Info size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>À propos</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.error + '20' }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Déconnexion</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthenticatedText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    width: '80%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  nameContainer: {
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  menuContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  versionText: {
    fontSize: 12,
  },
});