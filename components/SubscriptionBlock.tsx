import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Mail, ArrowRight } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

interface SubscriptionBlockProps {
  onSubscribe: (email: string) => void;
}

export function SubscriptionBlock({ onSubscribe }: SubscriptionBlockProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useThemeStore();
  
  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubscribe(email);
      setEmail('');
      setIsSubmitting(false);
      Alert.alert('Succès', 'Vous êtes maintenant inscrit à notre newsletter!');
    }, 1000);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.iconContainer}>
        <Mail size={32} color={colors.primary} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        Restez informé
      </Text>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Inscrivez-vous à notre newsletter pour recevoir les dernières nouvelles sur les événements à venir
      </Text>
      
      <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Votre adresse email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSubscribe}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.buttonText}>...</Text>
          ) : (
            <ArrowRight size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 50,
    width: '100%',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});