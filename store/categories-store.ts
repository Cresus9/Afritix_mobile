import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { processCategories } from './store-utils';
import Constants from 'expo-constants';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  parent_id?: string;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
}

interface CategoriesState {
  categories: Category[];
  rootCategories: Category[];
  allCategories: Category[];
  selectedParentCategory: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  selectParentCategory: (categoryId: string | null) => void;
}

// Helper function to assign appropriate icons based on category name
function getIconForCategory(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('music') || name.includes('concert')) return 'music';
  if (name.includes('cinema') || name.includes('film')) return 'clapperboard';
  if (name.includes('sport')) return 'trophy';
  if (name.includes('festival')) return 'party-popper';
  if (name.includes('art') || name.includes('culture')) return 'palette';
  if (name.includes('food') || name.includes('drink')) return 'utensils';
  if (name.includes('business')) return 'briefcase';
  if (name.includes('workshop')) return 'book-open';
  
  // Default icon
  return 'tag';
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  rootCategories: [],
  allCategories: [],
  selectedParentCategory: null,
  isLoading: false,
  error: null,

  selectParentCategory: (categoryId: string | null) => {
    set({ selectedParentCategory: categoryId });
  },

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      const defaultCategories = [
        {
          id: '1',
          name: 'Concerts',
          description: 'Live performances from top artists',
          icon: 'music',
          subcategories: ['Afrobeats', 'Jazz', 'Traditional']
        },
        {
          id: '2',
          name: 'Sport',
          description: 'Major sporting events',
          icon: 'trophy',
          subcategories: ['Football', 'Athletics', 'Boxing']
        },
        {
          id: '3',
          name: 'Festivals',
          description: 'Cultural celebrations and festivals',
          icon: 'party-popper',
          subcategories: ['Cultural', 'Food', 'Art', 'Music']
        },
        {
          id: '4',
          name: 'Cinema',
          description: 'Movie premieres and film festivals',
          icon: 'clapperboard',
          subcategories: ['Premieres', 'Film Festivals', 'Screenings']
        }
      ];
      
      if (!data || data.length === 0) {
        const { rootCategories, allCategories } = processCategories(defaultCategories);
        
        set({ 
          categories: defaultCategories,
          rootCategories,
          allCategories,
          isLoading: false,
          error: null
        });
        return;
      }
      
      // Transform the data to match our Category interface and process hierarchy
      const transformedCategories = data.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        icon: getIconForCategory(category.name),
        parent_id: category.parent_id,
        created_at: category.created_at,
        updated_at: category.updated_at
      }));
      
      // If no categories match our expected ones, use defaults
      if (transformedCategories.length === 0) {
        const { rootCategories, allCategories } = processCategories(defaultCategories);
        set({ 
          categories: defaultCategories,
          rootCategories,
          allCategories,
          isLoading: false,
          error: null
        });
        return;
      }
      
      const { rootCategories, allCategories } = processCategories(transformedCategories);
      
      set({ 
        categories: transformedCategories,
        rootCategories,
        allCategories,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      console.error('Error in fetchCategories:', errorMessage);
      
      // Set error state but use default categories
      const defaultCategories = [
        {
          id: '1',
          name: 'Concerts',
          description: 'Live performances from top artists',
          icon: 'music',
          subcategories: ['Afrobeats', 'Jazz', 'Traditional']
        },
        {
          id: '2',
          name: 'Sport',
          description: 'Major sporting events',
          icon: 'trophy',
          subcategories: ['Football', 'Athletics', 'Boxing']
        },
        {
          id: '3',
          name: 'Festivals',
          description: 'Cultural celebrations and festivals',
          icon: 'party-popper',
          subcategories: ['Cultural', 'Food', 'Art', 'Music']
        },
        {
          id: '4',
          name: 'Cinema',
          description: 'Movie premieres and film festivals',
          icon: 'clapperboard',
          subcategories: ['Premieres', 'Film Festivals', 'Screenings']
        }
      ];
      
      const { rootCategories, allCategories } = processCategories(defaultCategories);
      
      set({ 
        error: errorMessage,
        isLoading: false,
        categories: defaultCategories,
        rootCategories,
        allCategories
      });
    }
  }
}));

console.log('EXPO EXTRA:', Constants.expoConfig?.extra);