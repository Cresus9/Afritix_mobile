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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    setValidationError(null);
  }, []);
  
  const validateForm = () => {
    setValidationError(null);
    
    if (!name) {
      setValidationError('Veuillez entrer votre nom');
      return false;
    }
    
    if (!email) {
      setValidationError('Veuillez entrer votre email');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Veuillez entrer un email valide');
      return false;
    }
    
    if (!password) {
      setValidationError('Veuillez créer un mot de passe');
      return false;
    }
    
    if (password.length < 8) {
      setValidationError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    if (!confirmPassword) {
      setValidationError('Veuillez confirmer votre mot de passe');
      return false;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };
  
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Attempting registration with:', email);
      await register(name, email, password);
      
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        router.replace('/');
      }
    } catch (error) {
      console.error('Registration error in component:', error);
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
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Inscrivez-vous pour commencer</Text>
          </View>
          
          <View style={styles.form}>
            {(error || validationError) && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={colors.error} style={styles.errorIcon} />
                <Text style={styles.errorText}>{error || validationError}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={[
                  styles.input,
                  validationError && name === '' && styles.inputError
                ]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) clearError();
                  if (validationError) setValidationError(null);
                }}
                placeholder="Entrez votre nom complet"
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  validationError && email === '' && styles.inputError
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                  if (validationError) setValidationError(null);
                }}
                placeholder="Entrez votre email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={[
                  styles.input,
                  validationError && password === '' && styles.inputError
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                  if (validationError) setValidationError(null);
                }}
                placeholder="Créez un mot de passe"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                editable={!isSubmitting}
              />
              <Text style={styles.passwordHint}>
                Le mot de passe doit contenir au moins 8 caractères
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={[
                  styles.input,
                  validationError && confirmPassword === '' && styles.inputError
                ]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) clearError();
                  if (validationError) setValidationError(null);
                }}
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                editable={!isSubmitting}
              />
            </View>
            
            <Button
              title="Créer un compte"
              onPress={handleRegister}
              loading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting}
              fullWidth
              style={styles.registerButton}
            />
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Vous avez déjà un compte?</Text>
              <TouchableOpacity 
                onPress={() => router.push('/auth/login')}
                disabled={isSubmitting}
              >
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 16,
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
  passwordHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});