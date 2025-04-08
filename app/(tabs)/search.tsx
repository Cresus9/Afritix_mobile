import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { X, Filter } from 'lucide-react-native';
import { useEventsStore } from '@/store/events-store';
import { useCategoriesStore } from '@/store/categories-store';
import { useThemeStore } from '@/store/theme-store';
import { EventCard } from '@/components/EventCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryList } from '@/components/CategoryList';
import { EmptyState } from '@/components/EmptyState';
import { LoadingIndicator } from '@/components/LoadingIndicator';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const { colors, theme } = useThemeStore();
  const { 
    events, 
    filteredEvents, 
    isLoading, 
    searchQuery,
    selectedCategory,
    searchEvents,
    filterByCategory,
    clearFilters
  } = useEventsStore();
  
  const { 
    categories, 
    isLoading: categoriesLoading, 
    fetchCategories,
    selectedParentCategory
  } = useCategoriesStore();
  
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  useEffect(() => {
    // Fetch categories and events when component mounts
    fetchCategories();
    if (events.length === 0) {
      useEventsStore.getState().fetchEvents();
    }
  }, []);
  
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    searchEvents(query);
  };
  
  const handleSelectCategory = (category: string | null) => {
    console.log('Selected category:', category);
    filterByCategory(category);
  };
  
  const renderItem = ({ item }) => (
    <EventCard event={item} style={styles.eventCard} />
  );
  
  const renderEmptyComponent = () => {
    if (isLoading) {
      return <LoadingIndicator message="Recherche d'événements..." />;
    }
    
    return (
      <EmptyState
        title="Aucun événement trouvé"
        message="Essayez de modifier vos critères de recherche"
        icon="Search"
      />
    );
  };
  
  // Determine what filter info to display
  const getFilterInfo = () => {
    if (selectedCategory) {
      return `Catégorie: ${selectedCategory}`;
    }
    
    if (selectedParentCategory) {
      const parentCategory = categories.find(c => c.id === selectedParentCategory);
      if (parentCategory) {
        return `Catégorie: ${parentCategory.name}`;
      }
    }
    
    return '';
  };
  
  const filterInfo = getFilterInfo();
  const showFilterInfo = !!(filterInfo || localSearchQuery);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Recherche',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text
      }} />
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={localSearchQuery}
          onChangeText={handleSearch}
          placeholder="Rechercher des événements, lieux..."
          autoFocus={false}
        />
      </View>
      
      <CategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        isLoading={categoriesLoading}
        enhanced={false}
      />
      
      {showFilterInfo && (
        <View style={[styles.filterInfo, { backgroundColor: colors.cardLight }]}>
          <View style={styles.filterInfoContent}>
            <Filter size={16} color={colors.textSecondary} />
            <Text style={[styles.filterInfoText, { color: colors.text }]}>
              {filterInfo}
              {filterInfo && localSearchQuery ? ' | ' : ''}
              {localSearchQuery ? `Recherche: "${localSearchQuery}"` : ''}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearFilters}
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent, 
          { backgroundColor: colors.background },
          filteredEvents.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmptyComponent}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        ListFooterComponent={
          isLoading && filteredEvents.length > 0 ? (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.footerLoader} 
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventCard: {
    marginBottom: 16,
  },
  footerLoader: {
    marginVertical: 16,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterInfoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
});