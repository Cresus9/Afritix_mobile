import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { FAQItem } from '@/components/FAQItem';
import { useThemeStore } from '@/store/theme-store';

export default function EventsFAQScreen() {
  const { colors } = useThemeStore();
  
  const faqs = [
    {
      question: "Comment trouver des événements près de chez moi ?",
      answer: "Pour trouver des événements à proximité, utilisez la fonction de recherche et activez la géolocalisation. Vous pouvez filtrer les résultats par distance, date, catégorie ou prix. Vous pouvez également explorer la section 'À proximité' sur la page d'accueil pour découvrir les événements populaires dans votre région."
    },
    {
      question: "Comment être informé des nouveaux événements ?",
      answer: "Pour recevoir des notifications sur les nouveaux événements, activez les notifications dans les paramètres de l'application. Vous pouvez également suivre vos artistes, lieux ou organisateurs préférés pour être informé de leurs prochains événements. Abonnez-vous à notre newsletter pour recevoir des recommandations personnalisées."
    },
    {
      question: "Comment devenir organisateur d'événements sur AfriTix ?",
      answer: "Pour devenir organisateur, créez un compte professionnel en allant dans 'Profil' > 'Devenir organisateur'. Remplissez le formulaire avec les informations requises et soumettez votre demande. Notre équipe examinera votre candidature et vous contactera dans un délai de 48 heures ouvrables."
    },
    {
      question: "Un événement a été annulé, que se passe-t-il ?",
      answer: "En cas d'annulation d'un événement, vous serez notifié par e-mail et via l'application. Le remboursement sera généralement traité automatiquement sur votre méthode de paiement d'origine. Si vous n'avez pas reçu de remboursement dans les 10 jours ouvrables, contactez notre service client."
    },
    {
      question: "Comment signaler un problème avec un événement ?",
      answer: "Pour signaler un problème, accédez à la page de l'événement, faites défiler jusqu'en bas et appuyez sur 'Signaler un problème'. Vous pouvez également contacter notre service client via la section 'Support' de l'application. Fournissez autant de détails que possible pour nous aider à résoudre le problème rapidement."
    },
    {
      question: "Comment ajouter un événement à mon calendrier ?",
      answer: "Sur la page de l'événement, appuyez sur le bouton 'Ajouter au calendrier'. Vous pourrez choisir d'ajouter l'événement à votre calendrier Google, Apple ou autre. L'événement sera ajouté avec toutes les informations pertinentes, y compris le lieu, la date et l'heure."
    },
    {
      question: "Puis-je créer un événement privé ?",
      answer: "Oui, les organisateurs peuvent créer des événements privés. Lors de la création de l'événement, sélectionnez 'Événement privé' dans les paramètres de visibilité. Vous pourrez ensuite inviter des participants spécifiques par e-mail ou générer un code d'invitation unique."
    },
    {
      question: "Comment contacter un organisateur d'événement ?",
      answer: "Pour contacter un organisateur, accédez à la page de l'événement et appuyez sur 'Contacter l'organisateur' en bas de page. Vous pouvez également trouver les coordonnées de l'organisateur dans la section 'À propos de l'organisateur' si celui-ci a choisi de les rendre publiques."
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'FAQ - Événements et organisateurs',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Calendar size={32} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Événements et organisateurs</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Tout ce que vous devez savoir sur les événements et leur organisation
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
    marginBottom: 16,
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
    marginBottom: 24,
  },
});