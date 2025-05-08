import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';
import { useCategoriesStore } from './categories-store';
import { getIconForCategory } from './store-utils';

interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  filteredEvents: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  searchEvents: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  clearFilters: () => void;
  selectEvent: (event: Event | null) => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      featuredEvents: [],
      filteredEvents: [],
      selectedEvent: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,
      
      selectEvent: (event: Event | null) => {
        set({ selectedEvent: event });
      },
      
      fetchEvents: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Fetch events from Supabase
          const { data, error } = await supabase
            .from('events')
            .select(`
              id,
              title,
              description,
              date,
              time,
              location,
              image_url,
              price,
              currency,
              capacity,
              tickets_sold,
              status,
              featured,
              created_at,
              updated_at,
              avg_rating,
              review_count,
              venue_layout_id,
              coordinates,
              organizer_id,
              categories
            `)
            .eq('status', 'PUBLISHED')  // Only fetch published events
            .order('date', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Map Supabase data to Event type
            const events: Event[] = data.map(item => ({
              ...item,
              venue: item.location,
              image: item.image_url,
              category: item.categories?.[0] || '',
              subcategory: '',
              ticketsAvailable: item.capacity - item.tickets_sold,
              isFeatured: item.featured,
              availableTickets: item.capacity - item.tickets_sold
            }));
            
            // Filter featured events (only from published events)
            const featured = events.filter(event => event.featured);
            
            set({ 
              events, 
              featuredEvents: featured,
              filteredEvents: events,
              isLoading: false,
              error: null
            });
          } else {
            set({ 
              events: [], 
              featuredEvents: [],
              filteredEvents: [],
              error: 'No published events found',
              isLoading: false 
            });
          }
        } catch (error: any) {
          console.error('Error fetching events:', error);
          set({ 
            events: [], 
            featuredEvents: [],
            filteredEvents: [],
            error: error.message || 'Failed to fetch events',
            isLoading: false 
          });
        }
      },
      
      fetchEventById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('events')
            .select(`
              id,
              title,
              description,
              date,
              time,
              location,
              image_url,
              price,
              currency,
              capacity,
              tickets_sold,
              status,
              featured,
              created_at,
              updated_at,
              avg_rating,
              review_count,
              venue_layout_id,
              coordinates,
              organizer_id,
              categories
            `)
            .eq('id', id)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (!data) {
            set({ 
              error: 'Event not found', 
              isLoading: false,
              selectedEvent: null
            });
            return;
          }
          
          // Map Supabase data to Event type
          const event: Event = {
            ...data, // Copy all backend fields directly
            // Add frontend-specific fields
            venue: data.location, // Use location as venue
            image: data.image_url, // For backward compatibility
            category: data.categories?.[0] || '', // Use first category if available
            subcategory: '', // Default empty string
            ticketsAvailable: data.capacity - data.tickets_sold,
            isFeatured: data.featured,
            availableTickets: data.capacity - data.tickets_sold
          };
          
          set({ selectedEvent: event, isLoading: false });
          
        } catch (error: any) {
          console.error('Error fetching event by ID:', error);
          set({ 
            error: error.message || 'Failed to fetch event details', 
            isLoading: false,
            selectedEvent: null
          });
        }
      },
      
      searchEvents: (query: string) => {
        const { events, selectedCategory } = get();
        set({ searchQuery: query });
        
        if (!query && !selectedCategory) {
          set({ filteredEvents: events });
          return;
        }
        
        let filtered = events;
        
        // Apply search query filter
        if (query) {
          const lowercaseQuery = query.toLowerCase();
          filtered = filtered.filter(event => {
            const title = event.title?.toLowerCase() ?? '';
            const description = event.description?.toLowerCase() ?? '';
            const location = event.location?.toLowerCase() ?? '';
            const venue = event.venue?.toLowerCase() ?? '';
            
            return title.includes(lowercaseQuery) ||
                   description.includes(lowercaseQuery) ||
                   location.includes(lowercaseQuery) ||
                   venue.includes(lowercaseQuery);
          });
        }
        
        // Apply category filter if selected
        if (selectedCategory) {
          filtered = filtered.filter(event => 
            (event.category ?? '') === selectedCategory || 
            (event.subcategory ?? '') === selectedCategory
          );
        }
        
        set({ filteredEvents: filtered });
      },
      
      filterByCategory: (category: string | null) => {
        const { events, searchQuery } = get();
        set({ selectedCategory: category });
        
        if (!category && !searchQuery) {
          set({ filteredEvents: events });
          return;
        }
        
        let filtered = events;
        
        // Apply category filter
        if (category) {
          // Normalize category names and their aliases
          const categoryMap = {
            'concerts': ['concert', 'music', 'music-concerts'],
            'sport': ['sports', 'sporting', 'athletic'],
            'festivals': ['festival', 'fest', 'celebration'],
            'cinema': ['movie', 'film', 'screening']
          };
          
          const normalizedCategory = category.toLowerCase();
          const matchingCategory = Object.entries(categoryMap).find(([main, aliases]) => 
            main === normalizedCategory || aliases.some(alias => normalizedCategory === alias)
          );
          
          if (matchingCategory) {
            const [mainCategory, aliases] = matchingCategory;
            filtered = filtered.filter(event => {
              const eventCategory = (event.category || '').toLowerCase();
              const eventSubcategory = (event.subcategory || '').toLowerCase();
              
              // Check if the event's category or subcategory matches either the main category or any of its aliases
              return eventCategory === mainCategory ||
                     aliases.some(alias => eventCategory.includes(alias)) ||
                     eventSubcategory === mainCategory ||
                     aliases.some(alias => eventSubcategory.includes(alias));
            });
          } else {
            // If no mapping found, do a simple case-insensitive match
            filtered = filtered.filter(event => 
              (event.category || '').toLowerCase() === normalizedCategory || 
              (event.subcategory || '').toLowerCase() === normalizedCategory
            );
          }
        }
        
        // Apply search query filter if exists
        if (searchQuery) {
          const lowercaseQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(event => {
            const title = event.title?.toLowerCase() ?? '';
            const description = event.description?.toLowerCase() ?? '';
            const location = event.location?.toLowerCase() ?? '';
            const venue = event.venue?.toLowerCase() ?? '';
            
            return title.includes(lowercaseQuery) ||
                   description.includes(lowercaseQuery) ||
                   location.includes(lowercaseQuery) ||
                   venue.includes(lowercaseQuery);
          });
        }
        
        set({ filteredEvents: filtered });
      },
      
      clearFilters: () => {
        const { events } = get();
        set({ 
          searchQuery: '',
          selectedCategory: null,
          filteredEvents: events
        });
        
        // Also clear the parent category selection in the categories store
        useCategoriesStore.getState().selectParentCategory(null);
      }
    }),
    {
      name: 'afritix-events-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields to avoid issues
        selectedCategory: state.selectedCategory,
        searchQuery: state.searchQuery,
      }),
    }
  )
);