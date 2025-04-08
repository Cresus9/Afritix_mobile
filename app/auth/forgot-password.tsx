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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, AlertCircle, ArrowLeft, Mail } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset error in component:', error);
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </Text>
          </View>
          
          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={colors.error} style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {isSuccess ? (
              <View style={styles.successContainer}>
                <Mail size={48} color={colors.success} style={styles.successIcon} />
                <Text style={styles.successTitle}>Email envoyé</Text>
                <Text style={styles.successText}>
                  Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                </Text>
                <Button
                  title="Retour à la connexion"
                  onPress={() => router.replace('/auth/login')}
                  style={styles.backButton}
                />
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      error && email === '' && styles.inputError
                    ]}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) clearError();
                    }}
                    placeholder="Entrez votre email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                </View>
                
                <Button
                  title="Réinitialiser le mot de passe"
                  onPress={handleResetPassword}
                  loading={isLoading || isSubmitting}
                  disabled={isLoading || isSubmitting}
                  fullWidth
                  style={styles.resetButton}
                />
                
                <TouchableOpacity 
                  style={styles.backToLogin}
                  onPress={() => router.back()}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={16} color={colors.primary} style={styles.backIcon} />
                  <Text style={styles.backToLoginText}>Retour à la connexion</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  resetButton: {
    marginBottom: 24,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    marginRight: 8,
  },
  backToLoginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 16,
  },
});