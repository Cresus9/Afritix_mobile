import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Platform,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronRight, 
  Search, 
  MapPin, 
  Calendar, 
  Ticket, 
  CreditCard, 
  Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEventsStore } from '@/store/events-store';
import { EventCard } from '@/components/EventCard';
import { CategoryList } from '@/components/CategoryList';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { FeaturedEventSlider } from '@/components/FeaturedEventSlider';
import { Button } from '@/components/Button';
import { SearchBar } from '@/components/SearchBar';
import { SubscriptionBlock } from '@/components/SubscriptionBlock';
import { useNewsletterStore } from '@/store/newsletter-store';
import { useThemeStore } from '@/store/theme-store';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { colors } = useThemeStore();
  const { 
    events, 
    featuredEvents, 
    filteredEvents,
    isLoading, 
    fetchEvents,
    selectedCategory,
    filterByCategory,
    searchEvents
  } = useEventsStore();
  
  const { subscribeToNewsletter } = useNewsletterStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (events.length === 0) {
      fetchEvents();
    }
  }, []);
  
  const handleSearch = () => {
    searchEvents(searchQuery);
    router.push('/search');
  };

  const handleSubscribe = (email: string) => {
    // Use the newsletter store to handle subscription
    subscribeToNewsletter(email);
  };
  
  if (isLoading && events.length === 0) {
    return <LoadingIndicator fullScreen message="Loading events..." />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar barStyle={colors.theme === 'dark' ? "light-content" : "dark-content"} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher par artiste, événement ou lieu"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
              <Search size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                !selectedCategory && styles.categoryButtonActive,
                { borderColor: colors.border }
              ]}
              onPress={() => filterByCategory(null)}
            >
              <Text style={[
                styles.categoryButtonText,
                !selectedCategory && styles.categoryButtonTextActive,
                { color: !selectedCategory ? '#FFFFFF' : colors.text }
              ]}>
                Tous
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Music Concerts' && styles.categoryButtonActive,
                { borderColor: colors.border }
              ]}
              onPress={() => filterByCategory('Music Concerts')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Music Concerts' && styles.categoryButtonTextActive,
                { color: selectedCategory === 'Music Concerts' ? '#FFFFFF' : colors.text }
              ]}>
                Concerts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Sport' && styles.categoryButtonActive,
                { borderColor: colors.border }
              ]}
              onPress={() => filterByCategory('Sport')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Sport' && styles.categoryButtonTextActive,
                { color: selectedCategory === 'Sport' ? '#FFFFFF' : colors.text }
              ]}>
                Sports
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Festivals' && styles.categoryButtonActive,
                { borderColor: colors.border }
              ]}
              onPress={() => filterByCategory('Festivals')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Festivals' && styles.categoryButtonTextActive,
                { color: selectedCategory === 'Festivals' ? '#FFFFFF' : colors.text }
              ]}>
                Festivals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Cinema' && styles.categoryButtonActive,
                { borderColor: colors.border }
              ]}
              onPress={() => filterByCategory('Cinema')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Cinema' && styles.categoryButtonTextActive,
                { color: selectedCategory === 'Cinema' ? '#FFFFFF' : colors.text }
              ]}>
                Cinéma
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Featured Events Slider */}
        <View style={styles.sliderSection}>
          <FeaturedEventSlider events={featuredEvents} />
        </View>
        
        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedCategory ? selectedCategory : 'Événements à venir'}
            </Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.viewAllText}>Voir tout</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventsGrid}>
            {filteredEvents.slice(0, 4).map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                variant="grid"
                style={styles.gridCard}
              />
            ))}
          </View>
          
          <Button
            title="Explorer plus d'événements"
            onPress={() => router.push('/search')}
            variant="outline"
            style={styles.exploreButton}
          />
        </View>
        
        {/* Benefits Section */}
        <View style={[styles.benefitsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.benefitsSectionTitle, { color: colors.text }]}>Pourquoi choisir AfriTix</Text>
          
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconContainer, { backgroundColor: colors.cardLight }]}>
                <Ticket size={24} color={colors.primary} />
              </View>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>Réservation facile</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Réservez des billets en quelques secondes avec notre processus simple
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconContainer, { backgroundColor: colors.cardLight }]}>
                <CreditCard size={24} color={colors.primary} />
              </View>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>Paiements sécurisés</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Options de paiement multiples avec traitement sécurisé
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconContainer, { backgroundColor: colors.cardLight }]}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>Événements exclusifs</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Accès aux meilleurs événements au Burkina Faso
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIconContainer, { backgroundColor: colors.cardLight }]}>
                <Shield size={24} color={colors.primary} />
              </View>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>Entrée garantie</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Billets numériques avec codes QR pour une entrée sans problème
              </Text>
            </View>
          </View>
        </View>
        
        {/* Newsletter Section - Using SubscriptionBlock */}
        <View style={styles.newsletterSection}>
          <SubscriptionBlock onSubscribe={handleSubscribe} />
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>© 2023 AfriTix. Tous droits réservés.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  searchIconContainer: {
    padding: 8,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#6f47ff',
    borderColor: '#6f47ff',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  sliderSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6f47ff',
    marginRight: 4,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridCard: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  exploreButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  benefitsSection: {
    paddingVertical: 32,
    marginBottom: 32,
  },
  benefitsSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  benefitItem: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  newsletterSection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});