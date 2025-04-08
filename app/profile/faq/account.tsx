import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { User } from 'lucide-react-native';
import { FAQItem } from '@/components/FAQItem';
import { useThemeStore } from '@/store/theme-store';

export default function AccountFAQScreen() {
  const { colors } = useThemeStore();
  
  const faqs = [
    {
      question: "Comment créer un compte sur AfriTix ?",
      answer: "Pour créer un compte sur AfriTix, téléchargez notre application ou visitez notre site web, puis cliquez sur 'S'inscrire'. Vous pouvez vous inscrire avec votre adresse e-mail ou via vos comptes Google ou Facebook. Remplissez les informations demandées et validez votre inscription. Un e-mail de confirmation vous sera envoyé pour activer votre compte."
    },
    {
      question: "Comment modifier mes informations personnelles ?",
      answer: "Pour modifier vos informations personnelles, connectez-vous à votre compte, accédez à la section 'Profil' puis 'Informations personnelles'. Vous pourrez y modifier votre nom, prénom, numéro de téléphone, adresse et autres informations. N'oubliez pas de sauvegarder vos modifications."
    },
    {
      question: "J'ai oublié mon mot de passe, que faire ?",
      answer: "Si vous avez oublié votre mot de passe, cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez l'adresse e-mail associée à votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe. Suivez les instructions dans l'e-mail pour créer un nouveau mot de passe."
    },
    {
      question: "Comment supprimer mon compte ?",
      answer: "Pour supprimer votre compte, accédez à 'Profil' > 'Paramètres' > 'Compte et sécurité' > 'Supprimer mon compte'. Veuillez noter que cette action est irréversible et que toutes vos données, y compris l'historique de vos achats, seront définitivement supprimées. Si vous avez des billets actifs, nous vous recommandons d'attendre que vos événements soient passés avant de supprimer votre compte."
    },
    {
      question: "Comment changer mon adresse e-mail ?",
      answer: "Pour changer votre adresse e-mail, accédez à 'Profil' > 'Informations personnelles' > 'E-mail'. Entrez votre nouvelle adresse e-mail et confirmez-la. Un e-mail de vérification sera envoyé à votre nouvelle adresse. Cliquez sur le lien de confirmation dans cet e-mail pour valider le changement."
    },
    {
      question: "Comment activer l'authentification à deux facteurs ?",
      answer: "Pour renforcer la sécurité de votre compte, vous pouvez activer l'authentification à deux facteurs (2FA) en allant dans 'Profil' > 'Paramètres' > 'Compte et sécurité' > 'Authentification à deux facteurs'. Suivez les instructions pour configurer cette protection supplémentaire avec votre numéro de téléphone ou une application d'authentification."
    },
    {
      question: "Puis-je avoir plusieurs comptes avec la même adresse e-mail ?",
      answer: "Non, chaque compte AfriTix doit être associé à une adresse e-mail unique. Si vous souhaitez créer un nouveau compte, vous devrez utiliser une adresse e-mail différente."
    },
    {
      question: "Comment mettre à jour ma photo de profil ?",
      answer: "Pour mettre à jour votre photo de profil, accédez à 'Profil' et touchez votre photo actuelle ou l'icône de profil. Vous pourrez alors prendre une nouvelle photo avec votre appareil ou en choisir une dans votre galerie. Vous pourrez ajuster et recadrer l'image avant de la sauvegarder."
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'FAQ - Compte et profil',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <User size={32} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Compte et profil</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Tout ce que vous devez savoir sur la gestion de votre compte AfriTix
          </Text>
        </View>
        
        <View style={[styles.faqContainer, { backgroundColor: colors.card }]}>
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              isLast={index === faqs.length - 1}
            />
          ))}
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
  header: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  faqContainer: {
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
});