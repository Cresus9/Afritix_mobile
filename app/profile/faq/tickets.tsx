import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ticket } from 'lucide-react-native';
import { FAQItem } from '@/components/FAQItem';
import { useThemeStore } from '@/store/theme-store';

export default function TicketsFAQScreen() {
  const { colors } = useThemeStore();
  
  const faqs = [
    {
      question: "Comment acheter des billets sur AfriTix ?",
      answer: "Pour acheter des billets, parcourez les événements disponibles, sélectionnez celui qui vous intéresse, choisissez le type et le nombre de billets, puis procédez au paiement. Vous pouvez payer par carte bancaire, mobile money ou autres méthodes disponibles dans votre région."
    },
    {
      question: "Où trouver mes billets après achat ?",
      answer: "Vos billets sont disponibles dans la section 'Mes billets' de l'application. Vous recevrez également un e-mail de confirmation avec vos billets en pièce jointe. Vous pouvez présenter vos billets électroniques directement depuis l'application ou les imprimer selon les exigences de l'événement."
    },
    {
      question: "Comment transférer un billet à quelqu'un d'autre ?",
      answer: "Pour transférer un billet, accédez à 'Mes billets', sélectionnez le billet à transférer, puis appuyez sur 'Transférer'. Entrez l'adresse e-mail ou le numéro de téléphone du destinataire. Le destinataire recevra une notification pour accepter le transfert. Une fois accepté, le billet sera visible dans son compte."
    },
    {
      question: "Puis-je obtenir un remboursement pour mes billets ?",
      answer: "Les politiques de remboursement varient selon les événements. Consultez les conditions spécifiques de l'événement avant d'acheter. En général, les remboursements sont possibles en cas d'annulation de l'événement. Pour les autres cas, contactez notre service client via la section 'Support' de l'application."
    },
    {
      question: "Comment scanner mon billet à l'entrée de l'événement ?",
      answer: "À l'entrée de l'événement, présentez le code QR de votre billet au personnel qui le scannera avec leur appareil. Assurez-vous que votre écran est bien visible et que la luminosité est suffisante. Vous pouvez également imprimer votre billet si vous préférez."
    },
    {
      question: "Que faire si j'ai perdu mon billet ?",
      answer: "Pas d'inquiétude ! Vos billets sont toujours disponibles dans votre compte AfriTix. Connectez-vous à l'application et accédez à la section 'Mes billets'. Si vous ne trouvez pas votre billet, contactez notre service client qui pourra vous aider à le récupérer."
    },
    {
      question: "Puis-je acheter des billets pour plusieurs personnes ?",
      answer: "Oui, vous pouvez acheter plusieurs billets en une seule transaction. Lors de l'achat, indiquez simplement le nombre de billets souhaité. Vous pouvez ensuite les garder tous sur votre compte ou les transférer individuellement à d'autres personnes."
    },
    {
      question: "Comment vérifier l'authenticité d'un billet ?",
      answer: "Tous les billets achetés via AfriTix sont authentiques et comportent un code QR unique. Si vous avez reçu un billet transféré, assurez-vous qu'il apparaît dans votre compte AfriTix. En cas de doute, contactez notre service client pour vérification."
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'FAQ - Billets et réservations',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ticket size={32} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Billets et réservations</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Tout ce que vous devez savoir sur l'achat et la gestion de vos billets
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