import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { FileText, Share2 } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

export default function TermsScreen() {
  const { colors } = useThemeStore();
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Consultez les conditions d\'utilisation d\'AfriTix: https://afritix.com/terms',
        url: 'https://afritix.com/terms',
        title: 'Conditions d\'utilisation d\'AfriTix',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Conditions d\'utilisation',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerRight: () => (
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Share2 size={20} color={colors.primary} />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <FileText size={32} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Conditions d'utilisation
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Dernière mise à jour: 15 juin 2023
          </Text>
        </View>
        
        <View style={[styles.contentContainer, { backgroundColor: colors.card }]}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptation des conditions</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              En accédant à ou en utilisant AfriTix, vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              AfriTix se réserve le droit de modifier ces conditions à tout moment. Nous vous informerons de tout changement en publiant les nouvelles conditions sur cette page et en mettant à jour la date de "dernière mise à jour" ci-dessus.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description du service</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              AfriTix est une plateforme de billetterie en ligne qui permet aux utilisateurs d'acheter des billets pour divers événements, y compris mais sans s'y limiter, des concerts, des festivals, des événements sportifs, des conférences et des expositions.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous nous efforçons de fournir des informations précises sur les événements, mais nous ne pouvons pas garantir l'exactitude de toutes les informations. Les détails des événements sont fournis par les organisateurs, et AfriTix n'est pas responsable des changements apportés par les organisateurs après l'achat des billets.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Comptes utilisateurs</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Pour acheter des billets sur AfriTix, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de votre compte et mot de passe et de restreindre l'accès à votre ordinateur ou appareil mobile.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Vous acceptez d'assumer la responsabilité de toutes les activités qui se produisent sous votre compte ou mot de passe. Si vous pensez que quelqu'un a utilisé ou utilise votre compte sans votre autorisation, veuillez nous contacter immédiatement.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Achat de billets</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Lorsque vous achetez des billets sur AfriTix, vous acceptez de fournir des informations de paiement exactes et complètes. Nous nous réservons le droit d'annuler les transactions si nous soupçonnons une fraude.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Une fois l'achat effectué, vous recevrez une confirmation par e-mail avec vos billets électroniques. Il est de votre responsabilité de vérifier que les détails de votre billet sont corrects.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Politique de remboursement</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Les remboursements sont soumis à la politique de l'organisateur de l'événement. AfriTix n'est pas responsable de l'émission des remboursements pour les événements annulés ou reportés, sauf si spécifiquement indiqué.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Si un événement est annulé, les billets seront généralement remboursés automatiquement. Si un événement est reporté, les billets seront généralement valables pour la nouvelle date.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Propriété intellectuelle</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Tout le contenu présent sur AfriTix, y compris les textes, graphiques, logos, icônes, images, clips audio, téléchargements numériques et compilations de données, est la propriété d'AfriTix ou de ses fournisseurs de contenu et est protégé par les lois internationales sur le droit d'auteur.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Limitation de responsabilité</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              AfriTix ne sera pas responsable des dommages directs, indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser nos services.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous ne sommes pas responsables du contenu ou des actions des organisateurs d'événements ou des lieux. Toute réclamation concernant un événement doit être adressée directement à l'organisateur.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Loi applicable</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Ces conditions sont régies par les lois du pays où AfriTix est enregistré, sans égard aux principes de conflits de lois.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Contact</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Si vous avez des questions concernant ces Conditions d'utilisation, veuillez nous contacter à legal@afritix.com.
            </Text>
          </View>
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
  shareButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  contentContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
});