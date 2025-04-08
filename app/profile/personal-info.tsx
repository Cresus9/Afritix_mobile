import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, User, Mail, Phone, MapPin, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, refreshUser, isLoading, error } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  
  const loadUserData = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing user data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données utilisateur');
    } finally {
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Informations personnelles',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des informations...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Informations personnelles',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <ScrollView 
        style={styles.content} 
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
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.infoItem}
            onPress={handleEditProfile}
          >
            <View style={styles.infoHeader}>
              <User size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Nom complet</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoValue}>{user?.name || 'Non défini'}</Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Mail size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoValue}>{user?.email || 'Non défini'}</Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.infoItem}
            onPress={handleEditProfile}
          >
            <View style={styles.infoHeader}>
              <Phone size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Téléphone</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoValue}>{user?.phone || 'Non défini'}</Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.infoItem}
            onPress={handleEditProfile}
          >
            <View style={styles.infoHeader}>
              <MapPin size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Localisation</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoValue}>{user?.location || 'Non défini'}</Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.infoItem, styles.lastInfoItem]}
            onPress={handleEditProfile}
          >
            <View style={styles.infoHeader}>
              <FileText size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Bio</Text>
            </View>
            <View style={styles.infoContent}>
              <Text 
                style={styles.infoValue} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {user?.bio || 'Non défini'}
              </Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={() => Alert.alert(
              'Supprimer le compte',
              'Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.',
              [
                {
                  text: 'Annuler',
                  style: 'cancel',
                },
                {
                  text: 'Supprimer',
                  onPress: () => Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.'),
                  style: 'destructive',
                },
              ]
            )}
          >
            <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  infoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastInfoItem: {
    borderBottomWidth: 0,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  dangerSection: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  dangerButton: {
    backgroundColor: colors.error + '20',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});