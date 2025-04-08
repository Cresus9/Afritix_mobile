import { create } from 'zustand';
import { Category } from '@/types';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { categories as mockCategories } from '@/mocks/categories';

interface CategoriesState {
  categories: Category[];
  allCategories: Category[]; // Flat list of all categories including subcategories
  isLoading: boolean;
  error: string | null;
  selectedParentCategory: string | null;
  fetchCategories: () => Promise<void>;
  selectParentCategory: (categoryId: string | null) => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: mockCategories, // Initialize with mock data to prevent empty state
  allCategories: mockCategories, // Initialize with mock data
  isLoading: false,
  error: null,
  selectedParentCategory: null,
  
  selectParentCategory: (categoryId: string | null) => {
    set({ selectedParentCategory: categoryId });
  },
  
  fetchCategories: async () => {
    // If categories are already loaded, don't fetch again
    if (get().categories.length > 0 && get().categories !== mockCategories) {
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching categories from Supabase');
      
      // First try to fetch from the categories table
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        console.error('Error fetching from categories table:', categoriesError);
        throw categoriesError;
      }
      
      if (categoriesData && categoriesData.length > 0) {
        console.log('Categories found in Supabase:', categoriesData.length);
        
        // Process categories into a hierarchical structure
        const allCategories: Category[] = categoriesData.map(item => ({
          id: item.id,
          name: item.name,
          icon: item.icon || 'tag',
          parent_id: item.parent_id,
          children: []
        }));
        
        // Create a map for quick lookup
        const categoryMap = new Map<string, Category>();
        allCategories.forEach(category => {
          categoryMap.set(category.id, category);
        });
        
        // Organize into parent-child hierarchy
        const rootCategories: Category[] = [];
        
        allCategories.forEach(category => {
          if (!category.parent_id) {
            // This is a root category
            rootCategories.push(category);
          } else {
            // This is a child category
            const parent = categoryMap.get(category.parent_id);
            if (parent) {
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(category);
            } else {
              // If parent doesn't exist, treat as root
              rootCategories.push(category);
            }
          }
        });
        
        console.log('Processed categories hierarchy:', rootCategories.length, 'root categories');
        set({ 
          categories: rootCategories, 
          allCategories: allCategories,
          isLoading: false 
        });
        return;
      }
      
      // If no categories table or no data, fall back to extracting from events
      console.log('No categories found in dedicated table, extracting from events');
      
      // Fetch all events to extract unique categories
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('category, subcategory');
      
      if (eventsError) {
        console.error('Error fetching categories from events:', eventsError);
        throw eventsError;
      }
      
      if (!eventsData || eventsData.length === 0) {
        console.log('No events data returned, using mock categories');
        set({ 
          categories: mockCategories, 
          allCategories: mockCategories,
          isLoading: false 
        });
        return;
      }
      
      // Extract all categories and subcategories from events
      const categoryMap = new Map<string, Category>();
      const subcategoryMap = new Map<string, {name: string, parentName: string}>();
      
      // First pass: collect all categories and subcategories
      eventsData.forEach(item => {
        if (item.category) {
          if (!categoryMap.has(item.category)) {
            categoryMap.set(item.category, {
              id: item.category,
              name: item.category,
              icon: getIconForCategory(item.category),
              children: []
            });
          }
          
          if (item.subcategory) {
            const subcategoryKey = `${item.category}:${item.subcategory}`;
            if (!subcategoryMap.has(subcategoryKey)) {
              subcategoryMap.set(subcategoryKey, {
                name: item.subcategory,
                parentName: item.category
              });
            }
          }
        }
      });
      
      // Second pass: organize subcategories under their parents
      subcategoryMap.forEach((subcategory, key) => {
        const parentCategory = categoryMap.get(subcategory.parentName);
        if (parentCategory) {
          if (!parentCategory.children) {
            parentCategory.children = [];
          }
          
          parentCategory.children.push({
            id: key,
            name: subcategory.name,
            icon: 'tag',
            parent_id: subcategory.parentName
          });
        }
      });
      
      const categories = Array.from(categoryMap.values());
      const allCategories = [...categories];
      
      // Add all subcategories to the flat list
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          allCategories.push(...category.children);
        }
      });
      
      console.log('Extracted categories:', categories.length);
      
      // If no categories found, use mock data
      if (categories.length === 0) {
        console.log('No categories extracted, using mock data');
        set({ 
          categories: mockCategories, 
          allCategories: mockCategories,
          isLoading: false 
        });
        return;
      }
      
      set({ 
        categories, 
        allCategories,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error type:', error);
      }
      
      // Fallback to mock data on error
      console.log('Using mock categories data due to error');
      set({ 
        categories: mockCategories, 
        allCategories: mockCategories,
        error: handleSupabaseError(error), 
        isLoading: false 
      });
    }
  }
}));

// Helper function to assign appropriate icons based on category name
function getIconForCategory(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('music') || name.includes('concert')) return 'music';
  if (name.includes('tech') || name.includes('technology')) return 'cpu';
  if (name.includes('fashion') || name.includes('clothing')) return 'shirt';
  if (name.includes('film') || name.includes('cinema') || name.includes('movie')) return 'clapperboard';
  if (name.includes('education') || name.includes('workshop') || name.includes('course')) return 'book-open';
  if (name.includes('sport') || name.includes('athletic')) return 'trophy';
  if (name.includes('food') || name.includes('culinary') || name.includes('gastronomy')) return 'utensils';
  if (name.includes('business') || name.includes('professional') || name.includes('career')) return 'briefcase';
  if (name.includes('art') || name.includes('exhibition')) return 'palette';
  if (name.includes('comedy') || name.includes('stand-up')) return 'laugh';
  if (name.includes('festival') || name.includes('celebration') || name.includes('party')) return 'party-popper';
  
  // Default icon
  return 'tag';
}