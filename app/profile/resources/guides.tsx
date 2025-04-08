import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Book, ChevronRight, Search } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

export default function GuidesScreen() {
  const { colors } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const guides = [
    {
      id: 'account-creation',
      title: 'Créer un compte',
      description: 'Comment créer et configurer votre compte AfriTix',
      category: 'Démarrage',
      image: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'buying-tickets',
      title: 'Acheter des billets',
      description: 'Guide étape par étape pour acheter des billets',
      category: 'Billetterie',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'ticket-transfer',
      title: 'Transférer des billets',
      description: 'Comment transférer vos billets à des amis ou à la famille',
      category: 'Billetterie',
      image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'payment-methods',
      title: 'Méthodes de paiement',
      description: 'Les différentes options de paiement disponibles',
      category: 'Paiements',
      image: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'refunds',
      title: 'Demander un remboursement',
      description: 'Procédure pour demander un remboursement',
      category: 'Paiements',
      image: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'event-search',
      title: 'Rechercher des événements',
      description: 'Astuces pour trouver les événements qui vous intéressent',
      category: 'Événements',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'mobile-tickets',
      title: 'Utiliser les billets mobiles',
      description: 'Comment accéder et utiliser vos billets mobiles',
      category: 'Billetterie',
      image: 'https://images.unsplash.com/photo-1551972251-12070d63502a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'notifications',
      title: 'Gérer les notifications',
      description: 'Personnaliser vos préférences de notification',
      category: 'Paramètres',
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'security',
      title: 'Sécurité du compte',
      description: 'Conseils pour sécuriser votre compte AfriTix',
      category: 'Sécurité',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'organizer-contact',
      title: 'Contacter un organisateur',
      description: 'Comment communiquer avec les organisateurs d\'événements',
      category: 'Événements',
      image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ];
  
  // Filter guides based on search query
  const filteredGuides = searchQuery 
    ? guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guides;
  
  // Group guides by category
  const groupedGuides = filteredGuides.reduce((acc, guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, typeof guides>);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Guides d\'utilisation',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text
      }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
            <Book size={32} color="#9C27B0" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Guides d'utilisation
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Apprenez à utiliser toutes les fonctionnalités d'AfriTix
          </Text>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <TouchableOpacity 
            style={styles.searchInputContainer}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.searchPlaceholder, 
                { color: searchQuery ? colors.text : colors.textSecondary }
              ]}
            >
              {searchQuery || 'Rechercher un guide...'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {Object.keys(groupedGuides).length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              Aucun guide ne correspond à votre recherche.
            </Text>
          </View>
        ) : (
          Object.entries(groupedGuides).map(([category, categoryGuides]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {category}
              </Text>
              
              {categoryGuides.map(guide => (
                <TouchableOpacity 
                  key={guide.id}
                  style={[styles.guideCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: guide.image }}
                    style={styles.guideImage}
                  />
                  <View style={styles.guideContent}>
                    <Text style={[styles.guideTitle, { color: colors.text }]}>
                      {guide.title}
                    </Text>
                    <Text 
                      style={[styles.guideDescription, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {guide.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
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
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  guideImage: {
    width: 80,
    height: 80,
  },
  guideContent: {
    flex: 1,
    padding: 12,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});