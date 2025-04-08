import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Camera, X, MapPin, Phone, FileText, User, Mail } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { Button } from '@/components/Button';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, uploadAvatar, isLoading, error: storeError, clearError, refreshUser } = useAuthStore();
  const { colors } = useThemeStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const loadUserData = async () => {
      setRefreshing(true);
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error refreshing user data:', error);
      } finally {
        setRefreshing(false);
      }
    };
    
    loadUserData();
  }, []);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || null);
    }
  }, [user]);
  
  useEffect(() => {
    if (storeError) {
      setError(storeError);
      // Clear the store error after displaying it
      setTimeout(() => {
        clearError();
      }, 100);
    }
  }, [storeError]);
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }
    
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    
    setLocalLoading(true);
    setError(null);
    
    try {
      // Convert empty strings to null for database storage
      const updatedProfile = await updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        avatar
      });
      
      console.log('Profile updated successfully:', updatedProfile);
      
      Alert.alert('Succès', 'Profil mis à jour avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      setError(error.message || 'Une erreur s\'est produite');
    } finally {
      setLocalLoading(false);
    }
  };
  
  const handlePickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingAvatar(true);
        
        try {
          // Upload image to Supabase Storage using the store method
          const avatarUrl = await uploadAvatar(result.assets[0].uri);
          setAvatar(avatarUrl);
          Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
        } catch (error: any) {
          Alert.alert('Erreur', error.message || 'Échec du téléchargement de l\'image');
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur s\'est produite');
    }
  };
  
  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à l\'appareil photo');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingAvatar(true);
        
        try {
          // Upload image to Supabase Storage
          const avatarUrl = await uploadAvatar(result.assets[0].uri);
          setAvatar(avatarUrl);
          Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
        } catch (error: any) {
          Alert.alert('Erreur', error.message || 'Échec du téléchargement de l\'image');
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur s\'est produite');
    }
  };
  
  const handleRemoveAvatar = () => {
    Alert.alert(
      'Supprimer l\'avatar',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: async () => {
            setLocalLoading(true);
            try {
              await updateProfile({ avatar: null });
              setAvatar(null);
              Alert.alert('Succès', 'Photo de profil supprimée avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Échec de la suppression de l\'avatar');
            } finally {
              setLocalLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const showImageOptions = () => {
    Alert.alert(
      'Photo de profil',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choisir depuis la galerie',
          onPress: handlePickImage,
        },
        {
          text: avatar ? 'Supprimer la photo' : 'Annuler',
          onPress: avatar ? handleRemoveAvatar : undefined,
          style: avatar ? 'destructive' : 'cancel',
        },
      ]
    );
  };
  
  if (refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Modifier le profil',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des informations...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Modifier le profil',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false
      }} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}
            
            <View style={styles.avatarContainer}>
              <TouchableOpacity 
                onPress={showImageOptions}
                disabled={uploadingAvatar || isLoading || localLoading}
                style={styles.avatarWrapper}
              >
                {uploadingAvatar ? (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '50' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : avatar ? (
                  <View>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <View style={[styles.avatarOverlay, { backgroundColor: colors.primary + '30' }]}>
                      <Camera size={24} color={colors.white} />
                      <Text style={styles.changePhotoText}>Modifier</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                    <User size={40} color={colors.primary} />
                    <Text style={[styles.addPhotoText, { color: colors.primary }]}>
                      Ajouter une photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {avatar && (
                <TouchableOpacity 
                  style={[styles.removeAvatarButton, { backgroundColor: colors.error }]}
                  onPress={handleRemoveAvatar}
                  disabled={uploadingAvatar || isLoading || localLoading}
                >
                  <X size={16} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Nom complet</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Entrez votre nom complet"
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View style={[
                styles.inputWrapper, 
                styles.disabledInputWrapper, 
                { backgroundColor: colors.card + '80', borderColor: colors.border }
              ]}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInput, { color: colors.textSecondary }]}
                  value={email}
                  editable={false}
                  placeholder="Entrez votre email"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                L&apos;email ne peut pas être modifié
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Téléphone</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Phone size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Entrez votre numéro de téléphone"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Localisation</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MapPin size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Entrez votre ville"
                  placeholderTextColor={colors.textMuted}
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
              <View style={[
                styles.textareaWrapper, 
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}>
                <FileText size={20} color={colors.textSecondary} style={styles.textareaIcon} />
                <TextInput
                  style={[styles.textarea, { color: colors.text }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Parlez-nous de vous"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <Button
              title="Enregistrer les modifications"
              onPress={handleSave}
              loading={isLoading || localLoading}
              fullWidth
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    marginBottom: 32,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  changePhotoText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 0,
    right: '30%',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  disabledInputWrapper: {
    opacity: 0.8,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.7,
  },
  textareaWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
  },
  textareaIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  textarea: {
    flex: 1,
    fontSize: 16,
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    marginTop: 24,
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