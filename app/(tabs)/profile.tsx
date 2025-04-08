import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  LogOut, 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  HelpCircle,
  ChevronRight
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshUser, isLoading, error } = useAuthStore();
  const { colors } = useThemeStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
  const loadUserData = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);
  
  const handleLogout = () => {
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
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };

  const handleNavigate = (route: string) => {
    router.push(route);
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <EmptyState
          title="Connectez-vous à votre compte"
          message="Connectez-vous pour accéder à votre profil, vos billets et plus encore"
          actionLabel="Se connecter"
          onAction={() => router.push('/auth/login')}
          icon={<User size={48} color={colors.textSecondary} />}
        />
      </SafeAreaView>
    );
  }
  
  if (isLoading && !refreshing && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadUserData}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
        </View>
        
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}
        
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          {user?.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar}
              defaultSource={require('@/assets/images/icon.png')}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarPlaceholderText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Utilisateur'}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'Email non disponible'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.cardLight }]}
            onPress={() => handleNavigate('/profile/edit')}
          >
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Modifier</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Compte</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={() => handleNavigate('/profile/personal-info')}
          >
            <User size={20} color={colors.textSecondary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Informations personnelles</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={() => handleNavigate('/profile/payment-methods')}
          >
            <CreditCard size={20} color={colors.textSecondary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Méthodes de paiement</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={() => handleNavigate('/profile/notifications')}
          >
            <Bell size={20} color={colors.textSecondary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={() => handleNavigate('/profile/help')}
          >
            <HelpCircle size={20} color={colors.textSecondary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Centre d&apos;aide</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={() => handleNavigate('/profile/settings')}
          >
            <Settings size={20} color={colors.textSecondary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Paramètres</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.logoutContainer}>
          <Button
            title="Déconnexion"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            style={[styles.logoutButton, { borderColor: colors.error }]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
  },
  errorText: {
    fontSize: 14,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderColor: '#FF3B30',
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
});