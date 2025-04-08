import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Info, 
  Share2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

export default function AboutScreen() {
  const { colors } = useThemeStore();
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Découvrez AfriTix, la plateforme de billetterie en ligne pour tous vos événements en Afrique: https://afritix.com',
        url: 'https://afritix.com',
        title: 'AfriTix - Plateforme de billetterie en ligne',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'À propos d\'AfriTix',
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
          <View style={[styles.iconContainer, { backgroundColor: '#2196F3' + '20' }]}>
            <Info size={32} color="#2196F3" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            À propos d'AfriTix
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            La billetterie en ligne pour l'Afrique
          </Text>
        </View>
        
        <View style={[styles.contentContainer, { backgroundColor: colors.card }]}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notre histoire</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Fondée en 2020, AfriTix est née d'une vision simple : rendre l'achat de billets pour des événements en Afrique aussi simple et accessible que possible.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Face aux défis logistiques et aux difficultés d'accès aux billets pour de nombreux événements sur le continent, nos fondateurs ont décidé de créer une solution technologique adaptée aux réalités africaines.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Aujourd'hui, AfriTix est devenue la plateforme de référence pour la billetterie en ligne en Afrique, connectant des millions d'utilisateurs à des milliers d'événements à travers le continent.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notre mission</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Notre mission est de démocratiser l'accès aux événements culturels, sportifs et professionnels en Afrique en offrant une plateforme de billetterie fiable, sécurisée et accessible à tous.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Nous nous engageons à soutenir les organisateurs d'événements locaux en leur fournissant les outils nécessaires pour promouvoir leurs événements et gérer efficacement la vente de billets.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nos valeurs</Text>
            <View style={styles.valuesContainer}>
              <View style={styles.valueItem}>
                <Text style={[styles.valueTitle, { color: colors.text }]}>Innovation</Text>
                <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>
                  Nous repoussons constamment les limites technologiques pour offrir des solutions adaptées au contexte africain.
                </Text>
              </View>
              
              <View style={styles.valueItem}>
                <Text style={[styles.valueTitle, { color: colors.text }]}>Accessibilité</Text>
                <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>
                  Nous concevons nos services pour qu'ils soient accessibles au plus grand nombre, quels que soient les moyens technologiques ou financiers.
                </Text>
              </View>
              
              <View style={styles.valueItem}>
                <Text style={[styles.valueTitle, { color: colors.text }]}>Intégrité</Text>
                <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>
                  Nous opérons avec transparence et honnêteté dans toutes nos interactions avec les utilisateurs et les partenaires.
                </Text>
              </View>
              
              <View style={styles.valueItem}>
                <Text style={[styles.valueTitle, { color: colors.text }]}>Impact local</Text>
                <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>
                  Nous nous engageons à soutenir les économies locales et à promouvoir la richesse culturelle africaine.
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notre équipe</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              AfriTix est composée d'une équipe diversifiée de professionnels passionnés par la technologie et la culture africaine. Basés dans plusieurs pays du continent, nos collaborateurs apportent une richesse de perspectives et d'expertises.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Notre équipe de direction comprend des entrepreneurs expérimentés dans les domaines de la technologie, des événements et des paiements mobiles en Afrique.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Présence</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Actuellement, AfriTix opère dans 12 pays africains, avec des bureaux principaux à Dakar, Lagos, Nairobi et Johannesburg. Notre ambition est d'étendre notre présence à l'ensemble du continent d'ici 2025.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nous contacter</Text>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://afritix.com')}
            >
              <Globe size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>www.afritix.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('mailto:info@afritix.com')}
            >
              <Mail size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>info@afritix.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('tel:+22100000000')}
            >
              <Phone size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>+221 00 000 000</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://maps.app.goo.gl/123')}
            >
              <MapPin size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Dakar, Sénégal - Siège social
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.socialSection}>
            <Text style={[styles.socialTitle, { color: colors.text }]}>Suivez-nous</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity 
                style={[styles.socialIcon, { backgroundColor: '#3b5998' }]}
                onPress={() => handleOpenLink('https://facebook.com/afritix')}
              >
                <Facebook size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialIcon, { backgroundColor: '#1DA1F2' }]}
                onPress={() => handleOpenLink('https://twitter.com/afritix')}
              >
                <Twitter size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialIcon, { backgroundColor: '#C13584' }]}
                onPress={() => handleOpenLink('https://instagram.com/afritix')}
              >
                <Instagram size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
    fontSize: 16,
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
  valuesContainer: {
    marginTop: 8,
  },
  valueItem: {
    marginBottom: 16,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 12,
  },
  socialSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});