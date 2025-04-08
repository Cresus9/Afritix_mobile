import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  ChevronRight, 
  Lock, 
  AlertTriangle,
  LogOut,
  Trash2,
  Info,
  Bell,
  Eye,
  EyeOff,
  X
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout, updateSecuritySettings, securitySettings, changePassword, deleteAccount } = useAuthStore();
  const { colors } = useThemeStore();
  const [securityNotificationsEnabled, setSecurityNotificationsEnabled] = useState(
    securitySettings?.securityNotificationsEnabled || false
  );
  
  // Password change modal state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Account deletion modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
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
          onPress: () => {
            logout();
            router.push('/');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };
  
  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };
  
  const handleToggleSecurityNotifications = async (value: boolean) => {
    setSecurityNotificationsEnabled(value);
    try {
      await updateSecuritySettings({ securityNotificationsEnabled: value });
    } catch (error) {
      console.error('Error updating security notifications settings:', error);
      setSecurityNotificationsEnabled(!value); // Revert on error
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres de sécurité.');
    }
  };
  
  const validatePasswordForm = () => {
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Veuillez entrer votre mot de passe actuel');
      return false;
    }
    
    if (!newPassword) {
      setPasswordError('Veuillez entrer un nouveau mot de passe');
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (currentPassword === newPassword) {
      setPasswordError('Le nouveau mot de passe doit être différent de l\'ancien');
      return false;
    }
    
    return true;
  };
  
  const handleSubmitPasswordChange = async () => {
    if (!validatePasswordForm()) return;
    
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès');
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitAccountDeletion = async () => {
    setDeleteError('');
    
    if (!deletePassword) {
      setDeleteError('Veuillez entrer votre mot de passe pour confirmer');
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteModalVisible(false);
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setDeleteError(error.message || 'Une erreur est survenue lors de la suppression du compte');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Compte et sécurité',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sécurité</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={handleChangePassword}
          >
            <Lock size={20} color={colors.textSecondary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Changer le mot de passe</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.menuItem}>
            <Bell size={20} color={colors.textSecondary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications de sécurité</Text>
            <Switch
              value={securityNotificationsEnabled}
              onValueChange={handleToggleSecurityNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={securityNotificationsEnabled ? colors.primary : colors.textMuted}
            />
          </View>
        </View>
        
        <View style={[styles.infoSection, { backgroundColor: colors.cardLight }]}>
          <Info size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Votre compte a été créé le {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR')}. 
            Dernière connexion le {new Date(user?.lastSignInAt || Date.now()).toLocaleDateString('fr-FR')}.
          </Text>
        </View>
        
        <View style={styles.dangerSection}>
          <Text style={[styles.dangerSectionTitle, { color: colors.error }]}>Zone de danger</Text>
          
          <TouchableOpacity 
            style={[styles.dangerButton, { backgroundColor: colors.card }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.warning} />
            <Text style={[styles.dangerButtonText, { color: colors.warning }]}>
              Déconnexion
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dangerButton, { backgroundColor: colors.card }]}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={20} color={colors.error} />
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
              Supprimer mon compte
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.warningContainer, { backgroundColor: colors.error + '10' }]}>
            <AlertTriangle size={16} color={colors.error} />
            <Text style={[styles.warningText, { color: colors.error }]}>
              La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Password Change Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Changer le mot de passe</Text>
              <TouchableOpacity 
                onPress={() => setPasswordModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mot de passe actuel</Text>
              <View style={[styles.passwordInputWrapper, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Entrez votre mot de passe actuel"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? 
                    <EyeOff size={20} color={colors.textSecondary} /> : 
                    <Eye size={20} color={colors.textSecondary} />
                  }
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nouveau mot de passe</Text>
              <View style={[styles.passwordInputWrapper, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Entrez votre nouveau mot de passe"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? 
                    <EyeOff size={20} color={colors.textSecondary} /> : 
                    <Eye size={20} color={colors.textSecondary} />
                  }
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirmer le mot de passe</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Confirmez votre nouveau mot de passe"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            
            {passwordError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text>
            ) : null}
            
            <View style={styles.passwordRequirements}>
              <Text style={[styles.requirementTitle, { color: colors.textSecondary }]}>Le mot de passe doit :</Text>
              <Text style={[styles.requirementText, { color: colors.textSecondary }]}>• Contenir au moins 8 caractères</Text>
              <Text style={[styles.requirementText, { color: colors.textSecondary }]}>• Être différent de l'ancien mot de passe</Text>
            </View>
            
            <Button
              title="Changer le mot de passe"
              onPress={handleSubmitPasswordChange}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Account Deletion Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.error }]}>Supprimer le compte</Text>
              <TouchableOpacity 
                onPress={() => setDeleteModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.warningContainer, { backgroundColor: colors.error + '10', marginBottom: 20 }]}>
              <AlertTriangle size={16} color={colors.error} />
              <Text style={[styles.warningText, { color: colors.error }]}>
                Cette action est irréversible. Toutes vos données, y compris votre profil, vos billets et vos préférences, seront définitivement supprimées.
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Entrez votre mot de passe pour confirmer</Text>
              <View style={[styles.passwordInputWrapper, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  secureTextEntry={!showDeletePassword}
                  placeholder="Votre mot de passe"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity onPress={() => setShowDeletePassword(!showDeletePassword)}>
                  {showDeletePassword ? 
                    <EyeOff size={20} color={colors.textSecondary} /> : 
                    <Eye size={20} color={colors.textSecondary} />
                  }
                </TouchableOpacity>
              </View>
            </View>
            
            {deleteError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{deleteError}</Text>
            ) : null}
            
            <View style={styles.deleteButtonsContainer}>
              <Button
                title="Annuler"
                onPress={() => setDeleteModalVisible(false)}
                style={[styles.cancelButton, { backgroundColor: colors.cardLight }]}
                textStyle={{ color: colors.text }}
              />
              <Button
                title="Supprimer définitivement"
                onPress={handleSubmitAccountDeletion}
                loading={isDeleting}
                disabled={isDeleting}
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  infoSection: {
    flexDirection: 'row',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  dangerSection: {
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 32,
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    flex: 1,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  passwordRequirements: {
    marginBottom: 20,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  deleteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 2,
    marginLeft: 8,
  },
});