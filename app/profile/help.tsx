import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight,
  AlertCircle,
  User,
  Ticket,
  CreditCard,
  Calendar,
  Info,
  Shield,
  Book
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';

export default function HelpScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { colors } = useThemeStore();
  
  const handleContact = (method: 'chat' | 'call' | 'email') => {
    if (!isAuthenticated && method === 'chat') {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer un ticket de support.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    switch (method) {
      case 'chat':
        router.push('/profile/support/new');
        break;
      case 'call':
        Linking.openURL('tel:+22600000000');
        break;
      case 'email':
        Linking.openURL('mailto:support@afritix.com');
        break;
    }
  };
  
  const handleOpenFAQ = (category: string) => {
    switch (category) {
      case 'Compte':
        router.push('/profile/faq/account');
        break;
      case 'Billets':
        router.push('/profile/faq/tickets');
        break;
      case 'Paiements':
        router.push('/profile/faq/payments');
        break;
      case 'Événements':
        router.push('/profile/faq/events');
        break;
      default:
        Alert.alert('Fonctionnalité à venir', `La FAQ sur ${category} sera disponible prochainement.`);
    }
  };
  
  const handleViewTickets = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour voir vos tickets de support.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    router.push('/profile/support');
  };

  const handleOpenResource = (resource: string) => {
    switch (resource) {
      case 'terms':
        router.push('/profile/resources/terms');
        break;
      case 'privacy':
        router.push('/profile/resources/privacy');
        break;
      case 'about':
        router.push('/profile/resources/about');
        break;
      case 'guides':
        router.push('/profile/resources/guides');
        break;
      default:
        router.push('/profile/resources');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Centre d\'aide',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerSection, { backgroundColor: colors.card }]}>
          <HelpCircle size={40} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Comment pouvons-nous vous aider?</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Consultez notre FAQ ou contactez-nous directement
          </Text>
        </View>
        
        <View style={[styles.contactSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nous contacter</Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContact('chat')}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <MessageSquare size={24} color={colors.primary} />
              </View>
              <Text style={[styles.contactOptionText, { color: colors.text }]}>Ticket</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContact('call')}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: colors.success + '20' }]}>
                <Phone size={24} color={colors.success} />
              </View>
              <Text style={[styles.contactOptionText, { color: colors.text }]}>Appel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContact('email')}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: colors.warning + '20' }]}>
                <Mail size={24} color={colors.warning} />
              </View>
              <Text style={[styles.contactOptionText, { color: colors.text }]}>Email</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.supportTicketsButton, { backgroundColor: colors.cardLight }]}
            onPress={handleViewTickets}
          >
            <Text style={[styles.supportTicketsText, { color: colors.primary }]}>Voir mes tickets de support</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.faqSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Questions fréquentes</Text>
          
          <TouchableOpacity 
            style={[styles.faqItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenFAQ('Compte')}
          >
            <View style={styles.faqItemContent}>
              <User size={20} color={colors.textSecondary} />
              <Text style={[styles.faqItemText, { color: colors.text }]}>Compte et profil</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.faqItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenFAQ('Billets')}
          >
            <View style={styles.faqItemContent}>
              <Ticket size={20} color={colors.textSecondary} />
              <Text style={[styles.faqItemText, { color: colors.text }]}>Billets et réservations</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.faqItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenFAQ('Paiements')}
          >
            <View style={styles.faqItemContent}>
              <CreditCard size={20} color={colors.textSecondary} />
              <Text style={[styles.faqItemText, { color: colors.text }]}>Paiements et remboursements</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.faqItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenFAQ('Événements')}
          >
            <View style={styles.faqItemContent}>
              <Calendar size={20} color={colors.textSecondary} />
              <Text style={[styles.faqItemText, { color: colors.text }]}>Événements et organisateurs</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.resourcesSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ressources</Text>
          
          <TouchableOpacity 
            style={[styles.resourceItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenResource('terms')}
          >
            <View style={styles.resourceItemContent}>
              <FileText size={20} color={colors.textSecondary} />
              <Text style={[styles.resourceItemText, { color: colors.text }]}>Conditions d'utilisation</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.resourceItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenResource('privacy')}
          >
            <View style={styles.resourceItemContent}>
              <Shield size={20} color={colors.textSecondary} />
              <Text style={[styles.resourceItemText, { color: colors.text }]}>Politique de confidentialité</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.resourceItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenResource('guides')}
          >
            <View style={styles.resourceItemContent}>
              <Book size={20} color={colors.textSecondary} />
              <Text style={[styles.resourceItemText, { color: colors.text }]}>Guides d'utilisation</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.resourceItem, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenResource('about')}
          >
            <View style={styles.resourceItemContent}>
              <Info size={20} color={colors.textSecondary} />
              <Text style={[styles.resourceItemText, { color: colors.text }]}>À propos d'AfriTix</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.viewAllResourcesButton, { backgroundColor: colors.cardLight }]}
            onPress={() => router.push('/profile/resources')}
          >
            <Text style={[styles.viewAllResourcesText, { color: colors.primary }]}>Voir toutes les ressources</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.supportSection, { backgroundColor: colors.cardLight }]}>
          <AlertCircle size={20} color={colors.textSecondary} />
          <Text style={[styles.supportText, { color: colors.textSecondary }]}>
            Notre équipe de support est disponible 7j/7 de 8h à 20h.
            Temps de réponse moyen: moins de 24h.
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
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  contactSection: {
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contactOption: {
    alignItems: 'center',
    flex: 1,
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  supportTicketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  supportTicketsText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  faqSection: {
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  faqItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  resourcesSection: {
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resourceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  viewAllResourcesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  viewAllResourcesText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  supportSection: {
    flexDirection: 'row',
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 32,
  },
  supportText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});