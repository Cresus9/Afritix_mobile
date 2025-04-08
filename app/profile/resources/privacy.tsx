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
import { Shield, Share2 } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

export default function PrivacyPolicyScreen() {
  const { colors } = useThemeStore();
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Consultez la politique de confidentialité d\'AfriTix: https://afritix.com/privacy',
        url: 'https://afritix.com/privacy',
        title: 'Politique de confidentialité d\'AfriTix',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Politique de confidentialité',
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
          <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
            <Shield size={32} color="#4CAF50" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Politique de confidentialité
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Dernière mise à jour: 15 juin 2023
          </Text>
        </View>
        
        <View style={[styles.contentContainer, { backgroundColor: colors.card }]}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Introduction</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Chez AfriTix, nous prenons votre vie privée très au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles lorsque vous utilisez notre application mobile et notre site web.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              En utilisant AfriTix, vous consentez à la collecte et à l'utilisation de vos informations conformément à cette politique. Si vous n'acceptez pas cette politique, veuillez ne pas utiliser nos services.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Informations que nous collectons</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: 'bold' }}>Informations que vous nous fournissez :</Text> Lorsque vous créez un compte, nous collectons votre nom, adresse e-mail, numéro de téléphone et, dans certains cas, vos informations de paiement.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: 'bold' }}>Informations automatiquement collectées :</Text> Nous collectons automatiquement certaines informations lorsque vous utilisez notre application, comme votre adresse IP, type d'appareil, identifiants uniques de l'appareil, type de navigateur, langue préférée et autres statistiques.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: 'bold' }}>Informations de localisation :</Text> Avec votre consentement, nous pouvons collecter et traiter des informations sur votre localisation pour vous fournir des événements pertinents dans votre région.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Comment nous utilisons vos informations</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous utilisons les informations que nous collectons pour :
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Fournir, maintenir et améliorer nos services
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Traiter les transactions et envoyer des notifications relatives aux transactions
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Vous envoyer des communications marketing, promotionnelles et informatives
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Personnaliser votre expérience et vous fournir du contenu et des offres adaptés
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Détecter, prévenir et résoudre les problèmes techniques et de sécurité
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Partage de vos informations</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous pouvons partager vos informations personnelles avec :
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Les organisateurs d'événements pour lesquels vous achetez des billets
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Les prestataires de services qui nous aident à exploiter notre plateforme
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Les autorités légales lorsque nous sommes légalement tenus de le faire
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous ne vendons pas vos données personnelles à des tiers.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Sécurité des données</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous prenons la sécurité de vos informations personnelles très au sérieux et mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations contre tout accès, utilisation ou divulgation non autorisés.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Cependant, aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est 100% sécurisée. Bien que nous nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos informations personnelles, nous ne pouvons garantir leur sécurité absolue.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Vos droits</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Selon votre lieu de résidence, vous pouvez avoir certains droits concernant vos informations personnelles, notamment :
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Le droit d'accéder à vos informations personnelles
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Le droit de rectifier ou mettre à jour vos informations personnelles
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Le droit de supprimer vos informations personnelles
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Le droit de restreindre ou de vous opposer au traitement de vos informations
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
              • Le droit à la portabilité des données
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Pour exercer ces droits, veuillez nous contacter à privacy@afritix.com.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Modifications de cette politique</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page et en mettant à jour la date de "dernière mise à jour".
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous vous encourageons à consulter régulièrement cette politique pour rester informé de la façon dont nous protégeons vos informations.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Contact</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à privacy@afritix.com.
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
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 8,
  },
});