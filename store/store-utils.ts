import { Category } from '@/types';

// Shared utility functions for stores
export const getIconForCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('concert')) return 'music';
  if (name.includes('sport')) return 'trophy';
  if (name.includes('festival')) return 'party-popper';
  if (name.includes('cinema')) return 'clapperboard';
  
  // Default icon
  return 'tag';
};

// Helper function to process categories into a hierarchical structure
export const processCategories = (categoriesData: any[]): { rootCategories: Category[], allCategories: Category[] } => {
  const allCategories: Category[] = categoriesData.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    icon: item.icon || getIconForCategory(item.name),
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
  
  return { rootCategories, allCategories };
}; 