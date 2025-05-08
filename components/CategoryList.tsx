import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/theme-store';
import { useCategoriesStore } from '@/store/categories-store';
import { getIcon } from '@/utils/icon-utils';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const CATEGORY_WIDTH = (width - 64) / 2;

interface CategoryListProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  enhanced?: boolean;
  isLoading?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
  enhanced = false,
  isLoading: externalLoading
}) => {
  const { colors } = useThemeStore();
  const { 
    categories, 
    isLoading: storeLoading,
    error,
    fetchCategories 
  } = useCategoriesStore();
  
  const isLoading = externalLoading !== undefined ? externalLoading : storeLoading;
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Background images for enhanced categories
  const getCategoryImage = (category: string) => {
    switch (category.toLowerCase()) {
      case 'music concerts':
      case 'music':
      case 'concerts':
        return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'festivals':
      case 'festival':
        return 'https://images.unsplash.com/photo-1537832816519-689ad163238b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'sport':
      case 'sports':
        return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'cinema':
      case 'film':
      case 'movies':
        return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'art & culture':
      case 'art':
      case 'culture':
        return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'food & drink':
      case 'food':
      case 'culinary':
        return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'business':
      case 'professional':
        return 'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'workshops':
      case 'workshop':
      case 'education':
        return 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'comedy':
      case 'stand-up':
        return 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'technology':
      case 'tech':
        return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      default:
        return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      </View>
    );
  }
  
  // Check if categories array exists and has items
  if (!categories || categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Aucune catégorie disponible
        </Text>
      </View>
    );
  }
  
  if (enhanced) {
    return (
      <View style={styles.enhancedContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Catégories</Text>
        <ScrollView
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.enhancedGrid}
        >
          <TouchableOpacity
            style={[
              styles.enhancedAllItem,
              !selectedCategory && { borderWidth: 2, borderColor: colors.secondary }
            ]}
            onPress={() => onSelectCategory(null)}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.enhancedAllGradient}
            >
              <Text 
                style={[
                  styles.enhancedAllText,
                  { color: !selectedCategory ? colors.white : colors.text }
                ]}
              >
                Tous les événements
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.enhancedCategoryItem,
                  isSelected && { borderWidth: 2, borderColor: colors.secondary }
                ]}
                onPress={() => onSelectCategory(category.name)}
              >
                <Image
                  source={{ uri: getCategoryImage(category.name) }}
                  style={styles.categoryImage}
                  onError={(error) => {
                    console.warn(`Failed to load image for category ${category.name}:`, error.nativeEvent.error);
                  }}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.enhancedGradient}
                >
                  <Text style={styles.enhancedCategoryText}>
                    {category.name}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: 20 }
      ]}
      style={[
        styles.scrollView,
        { marginVertical: 8 }
      ]}
      decelerationRate="normal"
      snapToAlignment="center"
      snapToInterval={120}
      scrollEventThrottle={16}
    >
      <TouchableOpacity
        style={[
          styles.categoryItem,
          {
            backgroundColor: !selectedCategory ? colors.primary : colors.card,
            minWidth: 100,
          },
          !selectedCategory && styles.selectedCategory
        ]}
        onPress={() => onSelectCategory(null)}
      >
        <Text 
          style={[
            styles.categoryText,
            { color: !selectedCategory ? colors.white : colors.text }
          ]}
          numberOfLines={1}
        >
          Tous
        </Text>
      </TouchableOpacity>

      {[
        { id: '1', name: 'Concerts', icon: 'music' },
        { id: '2', name: 'Sport', icon: 'trophy' },
        { id: '3', name: 'Festivals', icon: 'party-popper' },
        { id: '4', name: 'Cinema', icon: 'clapperboard' }
      ].map((category) => {
        const isSelected = selectedCategory === category.name;
        const Icon = getIcon(category.icon);
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                minWidth: 100,
              },
              isSelected && styles.selectedCategory
            ]}
            onPress={() => onSelectCategory(category.name)}
          >
            <Icon 
              size={20} 
              color={isSelected ? colors.white : colors.text} 
              style={styles.categoryIcon}
            />
            <Text 
              style={[
                styles.categoryText,
                { color: isSelected ? colors.white : colors.text }
              ]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: 14
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: 120,
  },
  selectedCategory: {
    elevation: 4,
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  enhancedContainer: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  enhancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  enhancedAllItem: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    overflow: 'hidden'
  },
  enhancedAllGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  enhancedAllText: {
    fontSize: 16,
    fontWeight: '600'
  },
  enhancedCategoryItem: {
    width: CATEGORY_WIDTH,
    height: CATEGORY_WIDTH,
    borderRadius: 12,
    overflow: 'hidden'
  },
  categoryImage: {
    width: '100%',
    height: '100%'
  },
  enhancedGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12
  },
  enhancedCategoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  }
});