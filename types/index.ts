export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  price: number;
  currency: string;
  capacity: number;
  tickets_sold: number;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  avg_rating: number;
  review_count: number;
  venue_layout_id: string;
  coordinates: Record<string, any>;
  organizer_id: string;
  // Frontend-specific fields for backward compatibility
  venue?: string;
  image?: string;
  categories?: string[];
  category?: string;
  subcategory?: string;
  ticketsAvailable?: number;
  isFeatured?: boolean;
  availableTickets?: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventVenue: string;
  eventImage?: string;
  ticketType: string;
  price: number;
  currency: string;
  purchaseDate: string;
  qrCode: string;
  used: boolean;
  status?: string;
  scannedAt?: string;
  scannedBy?: string;
  scanLocation?: string;
  validationHistory?: ValidationEvent[];
  order_id?: string;
  user_id?: string;
  ticket_type_id?: string;
  seat_id?: string;
  transfer_id?: string;
  updated_at?: string;
  scanHistory?: any[];
}

export interface ValidationEvent {
  id: string;
  ticketId: string;
  status: string;
  timestamp: string;
  success: boolean;
  location?: string;
  operatorId?: string;
  operatorName?: string;
  deviceId?: string;
}

export interface TicketTransfer {
  id: string;
  ticketId: string;
  senderId: string;
  recipientEmail: string;
  recipientId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  updatedAt?: string;
  expiresAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  parent_id?: string;
  children?: Category[];
  subcategories?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  createdAt?: string;
  lastSignInAt?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserSettings {
  userId: string;
  language: string;
  theme: 'light' | 'dark';
  currency: string;
}

export interface SecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  passwordVisibilityEnabled: boolean;
  securityNotificationsEnabled: boolean;
  lastPasswordChange: string | null;
  failedLoginAttempts: number;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  types: string[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  provider: string;
  last4: string;
  expiryDate: string; // Required field, use 'N/A' for methods without expiry
  isDefault: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'USER' | 'SUPPORT';
  content: string; // This maps to the 'message' column in the database
  createdAt: string;
}

export interface NewsletterSubscription {
  email: string;
  createdAt: string;
  preferences?: {
    events?: boolean;
    promotions?: boolean;
    news?: boolean;
  };
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Date inconnue';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Date inconnue' : date.toLocaleDateString('fr-FR');
};