import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ticket } from '@/types';
import { useThemeStore } from '@/store/theme-store';

// Default fallback image for tickets without event images
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const router = useRouter();
  const { colors } = useThemeStore();
  const [imageLoadError, setImageLoadError] = React.useState(false);
  
  const handlePress = () => {
    router.push(`/ticket/${ticket.id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Get background color based on ticket type
  const getTicketTypeColor = () => {
    if (!ticket.ticketType) return colors.primary;
    
    const ticketTypeLower = ticket.ticketType.toLowerCase();
    
    switch (ticketTypeLower) {
      case 'vip':
        return '#B41E1E'; // Red for VIP
      case 'premium':
        return '#FF4081'; // Pink for Premium
      default:
        return '#6f47ff'; // Purple for Standard
    }
  };
  
  // Get status badge color and text
  const getStatusBadge = () => {
    if (!ticket.status) return { color: colors.success + '33', text: 'Valide' };
    
    switch (ticket.status) {
      case 'USED':
        return { color: colors.textMuted + '33', text: 'Utilisé' };
      case 'CANCELLED':
        return { color: colors.error + '33', text: 'Annulé' };
      case 'TRANSFERRED':
        return { color: colors.info + '33', text: 'Transféré' };
      case 'VALID':
      default:
        return { color: colors.success + '33', text: 'Valide' };
    }
  };
  
  // Get the event image URL with fallback
  const getEventImageUrl = () => {
    if (imageLoadError) return DEFAULT_EVENT_IMAGE;
    
    if (ticket.eventImage) {
      return ticket.eventImage;
    }
    
    return DEFAULT_EVENT_IMAGE;
  };
  
  // Handle image load error
  const handleImageLoadError = () => {
    console.log('Event image failed to load, using fallback image');
    setImageLoadError(true);
  };
  
  const statusBadge = getStatusBadge();
  const ticketId = ticket.id.substring(0, 8).toUpperCase();
  const ticketTypeColor = getTicketTypeColor();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Header with event image and overlay */}
      <View style={styles.header}>
        <Image 
          source={{ uri: getEventImageUrl() }} 
          style={styles.headerBackgroundImage}
          resizeMode="cover"
          onError={handleImageLoadError}
        />
        <LinearGradient
          colors={['rgba(180, 30, 30, 0.8)', 'rgba(180, 30, 30, 0.95)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.eventTitle} numberOfLines={1}>{ticket.eventTitle}</Text>
            <Text style={styles.eventDate}>{formatDate(ticket.eventDate)}</Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Ticket body */}
      <View style={styles.body}>
        <View style={styles.leftSection}>
          <View style={styles.ticketTypeContainer}>
            <Text style={styles.ticketTypeLabel}>Ticket Type</Text>
            <Text style={[styles.ticketType, { color: ticketTypeColor }]}>
              {ticket.ticketType}
            </Text>
          </View>
          
          <View style={styles.ticketIdContainer}>
            <View style={[styles.ticketIdBadge, { backgroundColor: `${ticketTypeColor}20` }]}>
              <Text style={[styles.ticketIdText, { color: ticketTypeColor }]}>
                #{ticketId}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.detailItem}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{formatDate(ticket.eventDate)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{ticket.eventTime}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{ticket.eventVenue}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
              <Text style={styles.statusText}>{statusBadge.text}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Decorative elements */}
      <View style={styles.leftCutout} />
      <View style={styles.rightCutout} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    width: '100%',
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  body: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  leftSection: {
    flex: 1,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  rightSection: {
    flex: 1.5,
    paddingLeft: 16,
  },
  ticketTypeContainer: {
    marginBottom: 16,
  },
  ticketTypeLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6f47ff',
  },
  ticketIdContainer: {
    alignItems: 'flex-start',
  },
  ticketIdBadge: {
    backgroundColor: 'rgba(111, 71, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ticketIdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6f47ff',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 8,
  },
  statusContainer: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121212',
  },
  leftCutout: {
    position: 'absolute',
    left: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    transform: [{ translateY: -12 }],
  },
  rightCutout: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    transform: [{ translateY: -12 }],
  },
});