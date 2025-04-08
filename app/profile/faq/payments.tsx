import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import { FAQItem } from '@/components/FAQItem';
import { useThemeStore } from '@/store/theme-store';

export default function PaymentsFAQScreen() {
  const { colors } = useThemeStore();
  
  const faqs = [
    {
      question: "Quels modes de paiement sont acceptés sur AfriTix ?",
      answer: "AfriTix accepte plusieurs modes de paiement : cartes bancaires (Visa, Mastercard), Mobile Money (Orange Money, MTN Mobile Money, Moov Money), transferts bancaires et paiements via PayPal. Les options disponibles peuvent varier selon votre pays."
    },
    {
      question: "Comment ajouter une nouvelle méthode de paiement ?",
      answer: "Pour ajouter une méthode de paiement, accédez à 'Profil' > 'Méthodes de paiement' > 'Ajouter une méthode de paiement'. Suivez les instructions pour saisir les informations nécessaires. Vos données de paiement sont sécurisées et cryptées."
    },
    {
      question: "Mes informations de paiement sont-elles sécurisées ?",
      answer: "Oui, AfriTix utilise des technologies de cryptage avancées pour protéger vos informations de paiement. Nous ne stockons pas les détails complets de votre carte bancaire. Toutes les transactions sont sécurisées et conformes aux normes PCI DSS."
    },
    {
      question: "Comment obtenir un remboursement ?",
      answer: "Pour demander un remboursement, accédez à 'Mes billets', sélectionnez le billet concerné, puis 'Demander un remboursement'. Les remboursements sont traités selon la politique de l'événement. En cas d'annulation par l'organisateur, le remboursement est généralement automatique."
    },
    {
      question: "Combien de temps faut-il pour recevoir un remboursement ?",
      answer: "Les remboursements sont généralement traités dans un délai de 5 à 10 jours ouvrables. Le délai exact dépend de votre banque ou de votre fournisseur de paiement. Les remboursements sont effectués sur la méthode de paiement utilisée lors de l'achat."
    },
    {
      question: "Pourquoi ma transaction a-t-elle été refusée ?",
      answer: "Une transaction peut être refusée pour plusieurs raisons : fonds insuffisants, limites de transaction dépassées, informations incorrectes, ou restrictions géographiques. Vérifiez les informations saisies et contactez votre banque si le problème persiste."
    },
    {
      question: "Y a-t-il des frais supplémentaires lors de l'achat de billets ?",
      answer: "Des frais de service peuvent s'appliquer lors de l'achat de billets. Ces frais sont clairement indiqués avant la finalisation de votre achat. Ils peuvent varier selon l'événement, le type de billet et la méthode de paiement utilisée."
    },
    {
      question: "Comment modifier ma méthode de paiement par défaut ?",
      answer: "Pour modifier votre méthode de paiement par défaut, accédez à 'Profil' > 'Méthodes de paiement'. Sélectionnez la méthode que vous souhaitez définir comme défaut et appuyez sur 'Définir comme défaut'. Cette méthode sera utilisée automatiquement pour vos futurs achats."
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'FAQ - Paiements et remboursements',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <CreditCard size={32} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Paiements et remboursements</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Tout ce que vous devez savoir sur les paiements et remboursements sur AfriTix
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