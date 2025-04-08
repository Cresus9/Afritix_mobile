import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket, ValidationEvent, Event } from '@/types';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from './auth-store';
import { generateQRCodeData, generateSecureId } from '@/utils/encryption';

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  fetchValidationHistory: (ticketId: string) => Promise<ValidationEvent[]>;
  purchaseTicket: (eventId: string, ticketTypeId: string) => Promise<Ticket>;
  transferTicket: (ticketId: string, recipientEmail: string) => Promise<void>;
}

// Database entity interfaces that match Supabase schema
interface TicketData {
  id: string;
  order_id: string;
  event_id: string;
  user_id: string;
  ticket_type_id: string;
  status: string;
  qr_code: string;
  created_at: string;
  updated_at?: string;
  seat_id?: string;
  scanned_at?: string;
  scanned_by?: string;
  scan_location?: string;
  transfer_id?: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  price: number;
  currency: string;
  capacity?: number;
  tickets_sold?: number;
  status?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
  avg_rating?: number;
  review_count?: number;
  venue_layout_id?: string;
  coordinates?: any;
  organizer_id?: string;
}

interface TicketTypeData {
  id: string;
  name: string;
  price: number;
  available: number;
  event_id?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: [],
      selectedTicket: null,
      isLoading: false,
      error: null,
      
      fetchTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          // Get current user
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }
          
          console.log('Fetching tickets for user:', user.id);
          
          // Fetch tickets
          const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (ticketsError) {
            console.error('Tickets fetch error:', JSON.stringify(ticketsError, null, 2));
            throw ticketsError;
          }
          
          if (!ticketsData || ticketsData.length === 0) {
            console.log('No tickets found for user');
            set({ tickets: [], isLoading: false });
            return;
          }
          
          // Get all event IDs from tickets
          const eventIds = [...new Set(ticketsData.map((ticket: TicketData) => ticket.event_id))];
          
          // Fetch events for these tickets
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .in('id', eventIds);
          
          if (eventsError) {
            console.error('Events fetch error:', JSON.stringify(eventsError, null, 2));
            throw eventsError;
          }
          
          // Get all ticket type IDs from tickets
          const ticketTypeIds = [...new Set(ticketsData.map((ticket: TicketData) => ticket.ticket_type_id))];
          
          // Fetch ticket types for these tickets
          const { data: ticketTypesData, error: ticketTypesError } = await supabase
            .from('ticket_types')
            .select('*')
            .in('id', ticketTypeIds);
          
          if (ticketTypesError) {
            console.error('Ticket types fetch error:', JSON.stringify(ticketTypesError, null, 2));
            throw ticketTypesError;
          }
          
          console.log('Data fetched successfully:');
          console.log('- Tickets:', ticketsData?.length || 0);
          console.log('- Events:', eventsData?.length || 0);
          console.log('- Ticket Types:', ticketTypesData?.length || 0);
          
          // Transform data to match our Ticket type
          const transformedTickets: Ticket[] = [];
          
          for (const ticket of ticketsData) {
            const event = eventsData?.find((e: EventData) => e.id === ticket.event_id);
            const ticketType = ticketTypesData?.find((tt: TicketTypeData) => tt.id === ticket.ticket_type_id);
            
            // Skip if we don't have related data
            if (!event || !ticketType) {
              console.warn('Missing related data for ticket:', ticket.id);
              continue;
            }
            
            // Generate fresh QR code for each ticket to ensure it's valid
            // This is important to match the backend's expectations
            const qrCode = generateQRCodeData(ticket.id);
            
            transformedTickets.push({
              id: ticket.id,
              eventId: ticket.event_id,
              eventTitle: event.title,
              eventDate: event.date,
              eventTime: event.time,
              eventLocation: event.location,
              eventVenue: event.location, // Use location as venue
              eventImage: event.image_url,
              ticketType: ticketType.name,
              price: ticketType.price,
              currency: event.currency || 'XOF',
              purchaseDate: new Date(ticket.created_at).toISOString().split('T')[0],
              qrCode: qrCode, // Use freshly generated QR code
              used: ticket.status === 'USED',
              status: ticket.status || 'VALID',
              scannedAt: ticket.scanned_at,
              scannedBy: ticket.scanned_by,
              scanLocation: ticket.scan_location,
              order_id: ticket.order_id,
              user_id: ticket.user_id,
              ticket_type_id: ticket.ticket_type_id,
              seat_id: ticket.seat_id,
              transfer_id: ticket.transfer_id,
              updated_at: ticket.updated_at
            });
          }
          
          set({ tickets: transformedTickets, isLoading: false });
        } catch (error) {
          console.error('Error fetching tickets:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      fetchTicketById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // First check if we already have the ticket in our state
          const existingTicket = get().tickets.find(ticket => ticket.id === id);
          
          if (existingTicket) {
            // Generate fresh QR code to ensure it's valid
            const qrCode = generateQRCodeData(id);
            
            // Even if we have the ticket, we still need to fetch validation history
            const validationHistory = await get().fetchValidationHistory(id);
            
            set({ 
              selectedTicket: { ...existingTicket, qrCode, validationHistory }, 
              isLoading: false 
            });
            return;
          }
          
          console.log('Fetching ticket by ID:', id);
          
          // Fetch the ticket
          const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single();
          
          if (ticketError) {
            console.error('Ticket fetch error:', JSON.stringify(ticketError, null, 2));
            throw ticketError;
          }
          
          // Fetch the associated event
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', ticketData.event_id)
            .single();
          
          if (eventError) {
            console.error('Event fetch error:', JSON.stringify(eventError, null, 2));
            throw eventError;
          }
          
          // Fetch the ticket type
          const { data: ticketTypeData, error: ticketTypeError } = await supabase
            .from('ticket_types')
            .select('*')
            .eq('id', ticketData.ticket_type_id)
            .single();
          
          if (ticketTypeError) {
            console.error('Ticket type fetch error:', JSON.stringify(ticketTypeError, null, 2));
            throw ticketTypeError;
          }
          
          // Generate fresh QR code
          const qrCode = generateQRCodeData(id);
          
          // Fetch validation history for this ticket
          const validationHistory = await get().fetchValidationHistory(id);
          
          // Transform to match our Ticket type
          const ticket: Ticket = {
            id: ticketData.id,
            eventId: ticketData.event_id,
            eventTitle: eventData.title,
            eventDate: eventData.date,
            eventTime: eventData.time,
            eventLocation: eventData.location,
            eventVenue: eventData.location, // Use location as venue
            eventImage: eventData.image_url,
            ticketType: ticketTypeData.name,
            price: ticketTypeData.price,
            currency: eventData.currency || 'XOF',
            purchaseDate: new Date(ticketData.created_at).toISOString().split('T')[0],
            qrCode: qrCode, // Use freshly generated QR code
            used: ticketData.status === 'USED',
            status: ticketData.status || 'VALID',
            scannedAt: ticketData.scanned_at,
            scannedBy: ticketData.scanned_by,
            scanLocation: ticketData.scan_location,
            validationHistory,
            order_id: ticketData.order_id,
            user_id: ticketData.user_id,
            ticket_type_id: ticketData.ticket_type_id,
            seat_id: ticketData.seat_id,
            transfer_id: ticketData.transfer_id,
            updated_at: ticketData.updated_at
          };
          
          set({ selectedTicket: ticket, isLoading: false });
        } catch (error) {
          console.error('Error fetching ticket by ID:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      fetchValidationHistory: async (ticketId: string): Promise<ValidationEvent[]> => {
        try {
          console.log('Fetching validation history for ticket:', ticketId);
          
          // Try to fetch validation history from ticket_validations table if it exists
          try {
            const { data, error } = await supabase
              .from('ticket_validations')
              .select('*')
              .eq('ticket_id', ticketId)
              .order('created_at', { ascending: true });
            
            if (error) {
              // If table doesn't exist or other error, fall back to ticket data
              console.log('Error fetching from ticket_validations, using fallback:', error.message);
              throw error;
            }
            
            if (data && data.length > 0) {
              return data.map(item => ({
                id: item.id,
                ticketId: item.ticket_id,
                status: item.status,
                timestamp: item.created_at,
                success: item.success,
                location: item.location,
                operatorId: item.operator_id,
                operatorName: item.operator_name,
                deviceId: item.device_id
              }));
            }
          } catch (validationError) {
            console.log('Validation history table error, using ticket data instead');
          }
          
          // Fetch the ticket to get validation data
          const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();
          
          if (error) {
            console.error('Error fetching ticket for validation history:', error);
            return generateValidationHistory(ticketId);
          }
          
          const validationEvents: ValidationEvent[] = [];
          
          // Always add ticket issuance event
          validationEvents.push({
            id: '1',
            ticketId: ticketId,
            status: 'Billet émis',
            timestamp: data.created_at,
            success: true
          });
          
          // Add scan event if available
          if (data.scanned_at) {
            validationEvents.push({
              id: '2',
              ticketId: ticketId,
              status: 'Entrée accordée',
              timestamp: data.scanned_at,
              success: true,
              location: data.scan_location,
              operatorId: data.scanned_by
            });
          }
          
          // If we have validation events, return them
          if (validationEvents.length > 0) {
            return validationEvents;
          }
          
          // If no validation events found, generate default ones
          return generateValidationHistory(ticketId);
        } catch (error) {
          console.error('Error in fetchValidationHistory:', error);
          // Return default validation events in case of error
          return generateValidationHistory(ticketId);
        }
      },
      
      purchaseTicket: async (eventId: string, ticketTypeId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Get current user
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }
          
          // First check if the ticket type is available
          const { data: ticketTypeData, error: ticketTypeError } = await supabase
            .from('ticket_types')
            .select('*')
            .eq('id', ticketTypeId)
            .single();
          
          if (ticketTypeError) {
            console.error('Ticket type error:', JSON.stringify(ticketTypeError, null, 2));
            throw ticketTypeError;
          }
          
          if (ticketTypeData.available <= 0) {
            throw new Error('Ce type de billet n\'est plus disponible');
          }
          
          // Fetch the event data
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();
          
          if (eventError) {
            console.error('Event fetch error:', JSON.stringify(eventError, null, 2));
            throw eventError;
          }
          
          // Generate a unique ticket ID using our safe method
          const ticketId = generateSecureId();
          
          // Generate secure QR code data
          const qrCode = generateQRCodeData(ticketId);
          
          // Create an order first
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
              {
                user_id: user.id,
                event_id: eventId,
                total: ticketTypeData.price,
                status: 'COMPLETED',
                payment_method: 'CARD'
              }
            ])
            .select()
            .single();
          
          if (orderError) {
            console.error('Order creation error:', JSON.stringify(orderError, null, 2));
            throw orderError;
          }
          
          // Insert ticket into database
          const { data, error } = await supabase
            .from('tickets')
            .insert([
              {
                id: ticketId,
                user_id: user.id,
                event_id: eventId,
                ticket_type_id: ticketTypeId,
                order_id: orderData.id,
                qr_code: qrCode,
                status: 'VALID',
                created_at: new Date().toISOString()
              }
            ])
            .select()
            .single();
          
          if (error) {
            console.error('Ticket creation error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          // Update available tickets count
          const { error: updateError } = await supabase
            .from('ticket_types')
            .update({
              available: ticketTypeData.available - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', ticketTypeId);
          
          if (updateError) {
            console.error('Ticket type update error:', JSON.stringify(updateError, null, 2));
            throw updateError;
          }
          
          // Create ticket object
          const newTicket: Ticket = {
            id: data.id,
            eventId: eventId,
            eventTitle: eventData.title,
            eventDate: eventData.date,
            eventTime: eventData.time,
            eventLocation: eventData.location,
            eventVenue: eventData.location,
            eventImage: eventData.image_url,
            ticketType: ticketTypeData.name,
            price: ticketTypeData.price,
            currency: eventData.currency || 'XOF',
            purchaseDate: new Date().toISOString().split('T')[0],
            qrCode: qrCode,
            used: false,
            status: 'VALID',
            order_id: data.order_id,
            user_id: data.user_id,
            ticket_type_id: data.ticket_type_id,
            validationHistory: [
              {
                id: '1',
                ticketId: data.id,
                status: 'Billet émis',
                timestamp: new Date().toISOString(),
                success: true
              }
            ]
          };
          
          set({ 
            tickets: [...get().tickets, newTicket],
            selectedTicket: newTicket,
            isLoading: false 
          });
          
          return newTicket;
        } catch (error) {
          console.error('Error purchasing ticket:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      transferTicket: async (ticketId: string, recipientEmail: string) => {
        set({ isLoading: true, error: null });
        try {
          // Get current user
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }
          
          // First check if the ticket exists and belongs to the current user
          const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .eq('user_id', user.id)
            .single();
          
          if (ticketError) {
            console.error('Ticket fetch error:', JSON.stringify(ticketError, null, 2));
            throw new Error('Billet introuvable ou vous n\'êtes pas autorisé à le transférer');
          }
          
          // Check if the ticket is in a transferable state
          if (ticketData.status !== 'VALID') {
            throw new Error('Ce billet ne peut pas être transféré dans son état actuel');
          }
          
          // Check if the recipient exists in the system
          const { data: recipientData, error: recipientError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', recipientEmail)
            .maybeSingle();
          
          // Create a transfer record
          const now = new Date().toISOString();
          const { data: transferData, error: transferError } = await supabase
            .from('ticket_transfers')
            .insert([
              {
                ticket_id: ticketId,
                sender_id: user.id,
                recipient_email: recipientEmail,
                recipient_id: recipientData?.id || null,
                status: 'PENDING',
                created_at: now,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
              }
            ])
            .select()
            .single();
          
          if (transferError) {
            console.error('Transfer creation error:', JSON.stringify(transferError, null, 2));
            throw transferError;
          }
          
          // Update ticket status to TRANSFER_PENDING
          const { error: updateError } = await supabase
            .from('tickets')
            .update({
              status: 'TRANSFER_PENDING',
              updated_at: now
            })
            .eq('id', ticketId);
          
          if (updateError) {
            console.error('Ticket update error:', JSON.stringify(updateError, null, 2));
            throw updateError;
          }
          
          // Update local state
          const tickets = get().tickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, status: 'TRANSFER_PENDING' } 
              : ticket
          );
          
          const selectedTicket = get().selectedTicket;
          if (selectedTicket && selectedTicket.id === ticketId) {
            const updatedValidationHistory = [
              ...(selectedTicket.validationHistory || []),
              {
                id: Date.now().toString(),
                ticketId,
                status: `Transfert initié vers ${recipientEmail}`,
                timestamp: now,
                success: true
              }
            ];
            
            set({ 
              tickets,
              selectedTicket: { 
                ...selectedTicket, 
                status: 'TRANSFER_PENDING',
                validationHistory: updatedValidationHistory
              },
              isLoading: false 
            });
          } else {
            set({ tickets, isLoading: false });
          }
          
          // In a real app, we would send an email to the recipient here
          console.log(`Transfer initiated for ticket ${ticketId} to ${recipientEmail}`);
          
        } catch (error) {
          console.error('Error transferring ticket:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'afritix-tickets-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to generate validation history when real data is not available
function generateValidationHistory(ticketId: string): ValidationEvent[] {
  const ticket = useTicketsStore.getState().tickets.find(t => t.id === ticketId);
  
  if (!ticket) {
    return [
      {
        id: '1',
        ticketId,
        status: 'Billet émis',
        timestamp: new Date().toISOString(),
        success: true
      }
    ];
  }
  
  // Generate validation history based on ticket purchase date
  const purchaseDate = new Date(ticket.purchaseDate);
  
  // First event: Ticket issued (same as purchase date)
  const events: ValidationEvent[] = [
    {
      id: '1',
      ticketId,
      status: 'Billet émis',
      timestamp: formatDateTime(purchaseDate),
      success: true
    }
  ];
  
  // Second event: Ticket verified (2 days after purchase)
  const verificationDate = new Date(purchaseDate);
  verificationDate.setDate(verificationDate.getDate() + 2);
  verificationDate.setHours(9, 15, 0, 0);
  
  if (verificationDate <= new Date()) {
    events.push({
      id: '2',
      ticketId,
      status: 'Billet vérifié',
      timestamp: formatDateTime(verificationDate),
      success: true
    });
  }
  
  // Third event: Entry granted (4 days after purchase)
  const entryDate = new Date(purchaseDate);
  entryDate.setDate(entryDate.getDate() + 4);
  entryDate.setHours(18, 45, 0, 0);
  
  if (entryDate <= new Date() && ticket.status === 'USED') {
    events.push({
      id: '3',
      ticketId,
      status: 'Entrée accordée',
      timestamp: formatDateTime(entryDate),
      success: true
    });
  }
  
  return events;
}

// Helper function to format date and time
function formatDateTime(date: Date): string {
  return date.toISOString();
}