import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { 
  Music, 
  Cpu, 
  Shirt, 
  Clapperboard, 
  BookOpen, 
  Trophy, 
  Utensils, 
  Briefcase,
  Palette,
  Laugh,
  PartyPopper,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/theme-store';
import { useCategoriesStore } from '@/store/categories-store';
import { Category } from '@/types';

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
    allCategories,
    isLoading: storeLoading, 
    selectedParentCategory,
    selectParentCategory
  } = useCategoriesStore();
  
  const isLoading = externalLoading !== undefined ? externalLoading : storeLoading;
  
  // State to track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
    
    // Also select this as the parent category
    selectParentCategory(categoryId);
  };
  
  const getIcon = (iconName: string, isSelected: boolean) => {
    const color = isSelected ? colors.white : colors.textSecondary;
    const size = 20;
    
    switch (iconName) {
      case 'music':
        return <Music size={size} color={color} />;
      case 'cpu':
        return <Cpu size={size} color={color} />;
      case 'shirt':
        return <Shirt size={size} color={color} />;
      case 'clapperboard':
        return <Clapperboard size={size} color={color} />;
      case 'book-open':
        return <BookOpen size={size} color={color} />;
      case 'trophy':
        return <Trophy size={size} color={color} />;
      case 'utensils':
        return <Utensils size={size} color={color} />;
      case 'briefcase':
        return <Briefcase size={size} color={color} />;
      case 'palette':
        return <Palette size={size} color={color} />;
      case 'laugh':
        return <Laugh size={size} color={color} />;
      case 'party-popper':
        return <PartyPopper size={size} color={color} />;
      default:
        return <Tag size={size} color={color} />;
    }
  };
  
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
            onPress={() => {
              onSelectCategory(null);
              selectParentCategory(null);
              setExpandedCategories(new Set());
            }}
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
            const isExpanded = expandedCategories.has(category.id);
            const hasChildren = category.children && category.children.length > 0;
            
            return (
              <View key={category.id} style={styles.categoryWithChildren}>
                <TouchableOpacity
                  style={[
                    styles.enhancedCategoryItem,
                    isSelected && { borderWidth: 2, borderColor: colors.secondary }
                  ]}
                  onPress={() => {
                    if (hasChildren) {
                      toggleCategoryExpansion(category.id);
                    } else {
                      onSelectCategory(category.name);
                    }
                  }}
                >
                  <Image
                    source={{ uri: getCategoryImage(category.name) }}
                    style={styles.categoryImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.categoryGradient}
                  >
                    <View style={styles.categoryContent}>
                      {getIcon(category.icon, isSelected)}
                      <Text 
                        style={[
                          styles.enhancedCategoryText,
                          { color: colors.white }
                        ]}
                      >
                        {category.name}
                      </Text>
                      {hasChildren && (
                        isExpanded ? 
                          <ChevronUp size={16} color={colors.white} /> : 
                          <ChevronDown size={16} color={colors.white} />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Subcategories */}
                {isExpanded && hasChildren && (
                  <View style={styles.subcategoriesContainer}>
                    {category.children.map(subcategory => {
                      const isSubcategorySelected = selectedCategory === subcategory.name;
                      
                      return (
                        <TouchableOpacity
                          key={subcategory.id}
                          style={[
                            styles.subcategoryItem,
                            { backgroundColor: isSubcategorySelected ? colors.primary : colors.cardLight },
                          ]}
                          onPress={() => onSelectCategory(subcategory.name)}
                        >
                          {getIcon(subcategory.icon, isSubcategorySelected)}
                          <Text 
                            style={[
                              styles.subcategoryText,
                              { color: isSubcategorySelected ? colors.white : colors.textSecondary }
                            ]}
                          >
                            {subcategory.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
  
  // Horizontal scrolling version (non-enhanced)
  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Catégories</Text>
      </View>
      
      {/* Main categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            { backgroundColor: colors.cardLight },
            !selectedCategory && !selectedParentCategory && { backgroundColor: colors.primary }
          ]}
          onPress={() => {
            onSelectCategory(null);
            selectParentCategory(null);
          }}
        >
          <Text 
            style={[
              styles.categoryText,
              { color: !selectedCategory && !selectedParentCategory ? colors.white : colors.textSecondary }
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => {
          const isSelected = selectedParentCategory === category.id;
          const hasChildren = category.children && category.children.length > 0;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                { backgroundColor: isSelected ? colors.primary : colors.cardLight }
              ]}
              onPress={() => {
                if (hasChildren) {
                  toggleCategoryExpansion(category.id);
                  onSelectCategory(null); // Clear specific category selection
                } else {
                  onSelectCategory(category.name);
                  selectParentCategory(null);
                }
              }}
            >
              {getIcon(category.icon, isSelected)}
              <Text 
                style={[
                  styles.categoryText,
                  { color: isSelected ? colors.white : colors.textSecondary }
                ]}
              >
                {category.name}
              </Text>
              {hasChildren && (
                isSelected ? 
                  <ChevronUp size={16} color={isSelected ? colors.white : colors.textSecondary} /> : 
                  <ChevronDown size={16} color={isSelected ? colors.white : colors.textSecondary} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Subcategories */}
      {selectedParentCategory && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.container, styles.subcategoriesScroll]}
        >
          {categories.find(c => c.id === selectedParentCategory)?.children?.map((subcategory) => {
            const isSelected = selectedCategory === subcategory.name;
            
            return (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.subcategoryItem,
                  { backgroundColor: isSelected ? colors.primary : colors.cardLight }
                ]}
                onPress={() => onSelectCategory(subcategory.name)}
              >
                {getIcon(subcategory.icon, isSelected)}
                <Text 
                  style={[
                    styles.subcategoryText,
                    { color: isSelected ? colors.white : colors.textSecondary }
                  ]}
                >
                  {subcategory.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingBottom: 8,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subcategoriesScroll: {
    paddingTop: 0,
    paddingBottom: 4,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  subcategoryText: {
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 13,
  },
  // Enhanced styles
  enhancedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enhancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  enhancedAllItem: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  enhancedAllGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedAllText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryWithChildren: {
    width: CATEGORY_WIDTH,
    marginBottom: 16,
  },
  enhancedCategoryItem: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  categoryContent: {
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  enhancedCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
    textAlign: 'center',
  },
  subcategoriesContainer: {
    marginTop: 8,
    width: '100%',
  },
});