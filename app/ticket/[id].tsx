import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Animated,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Share2,
  Download,
  Send,
  Info,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  ArrowLeft,
  Mail,
  X,
  RefreshCw,
  FileText
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { useThemeStore } from '@/store/theme-store';
import { useTicketsStore } from '@/store/tickets-store';
import { QRCodeDisplay } from '@/components/QRCode';
import { Button } from '@/components/Button';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { verifyQRCodeData } from '@/utils/encryption';
import { generateTicketPDF } from '@/utils/pdf-generator';

// Default fallback image for tickets without event images
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070';

// QR code refresh interval in seconds (30 seconds to match backend expectations)
const QR_REFRESH_INTERVAL = 30;

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeStore();
  const { selectedTicket, fetchTicketById, isLoading, transferTicket } = useTicketsStore();
  const [showValidationHistory, setShowValidationHistory] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isNewPurchase, setIsNewPurchase] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [qrRefreshEnabled, setQrRefreshEnabled] = useState(true);
  const [qrVerificationStatus, setQrVerificationStatus] = useState<boolean | null>(null);
  const [downloadType, setDownloadType] = useState<'image' | 'pdf'>('image');
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  
  // Refs for capturing ticket as image
  const ticketRef = useRef<ViewShot>(null);
  
  // Animation for the ticket
  const ticketAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (id) {
      fetchTicketById(id);
      
      // Check if this is a new purchase by comparing the purchase date with current date
      const checkIfNewPurchase = async () => {
        await fetchTicketById(id);
        const ticket = useTicketsStore.getState().selectedTicket;
        if (ticket) {
          const purchaseDate = new Date(ticket.purchaseDate);
          const now = new Date();
          // If purchased within the last 5 minutes, consider it a new purchase
          const isNew = (now.getTime() - purchaseDate.getTime()) < 5 * 60 * 1000;
          setIsNewPurchase(isNew);
        }
      };
      
      checkIfNewPurchase();
    }
    
    // Animate ticket entrance
    Animated.timing(ticketAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // If it's a new purchase, show a success message
    if (isNewPurchase) {
      setTimeout(() => {
        Alert.alert(
          'Achat réussi!',
          'Votre billet a été acheté avec succès. Vous pouvez le présenter à l\'entrée de l\'événement.',
          [{ text: 'OK' }]
        );
      }, 1000);
    }
  }, [id, isNewPurchase]);
  
  // Verify QR code when ticket is loaded
  useEffect(() => {
    const verifyQRCode = () => {
      if (selectedTicket?.qrCode) {
        try {
          const isValid = verifyQRCodeData(selectedTicket.qrCode);
          setQrVerificationStatus(isValid);
        } catch (error) {
          console.error('Error verifying QR code:', error);
          setQrVerificationStatus(false);
        }
      }
    };
    
    verifyQRCode();
  }, [selectedTicket]);
  
  const handleShare = async () => {
    if (!selectedTicket) return;
    
    try {
      await Share.share({
        title: `Billet pour ${selectedTicket.eventTitle}`,
        message: `Je vais à ${selectedTicket.eventTitle} le ${selectedTicket.eventDate} à ${selectedTicket.eventVenue}, ${selectedTicket.eventLocation}. Rejoins-moi!`,
        url: `https://afritix.com/tickets/${selectedTicket.id}`,
      });
    } catch (error) {
      console.error('Error sharing ticket:', error);
    }
  };
  
  const showDownloadOptions = () => {
    setDownloadModalVisible(true);
  };
  
  const handleDownload = async (type: 'image' | 'pdf') => {
    if (!selectedTicket || !ticketRef.current) return;
    
    setDownloadModalVisible(false);
    setIsDownloading(true);
    
    try {
      // Safely capture the ticket as an image
      let uri;
      try {
        if (ticketRef.current && typeof ticketRef.current.capture === 'function') {
          uri = await ticketRef.current.capture();
        } else {
          throw new Error("Capture method not available");
        }
      } catch (captureError) {
        console.error("Error capturing ticket:", captureError);
        throw new Error("Failed to capture ticket image");
      }
      
      if (!uri) {
        throw new Error("Failed to capture ticket image");
      }
      
      if (Platform.OS === 'web') {
        // Web platform handling
        if (type === 'image') {
          // For image, open the captured image in a new tab
          window.open(uri, '_blank');
        } else {
          // For PDF, generate HTML and open in new tab
          const pdfUri = await generateTicketPDF(selectedTicket, uri, '');
          window.open(pdfUri, '_blank');
        }
        
        setIsDownloading(false);
        return;
      }
      
      // Mobile platform handling
      try {
        // Dynamically import FileSystem to avoid crashes on platforms where it's not available
        const FileSystem = require('expo-file-system');
        
        // Create a directory for tickets if it doesn't exist
        const ticketsDir = `${FileSystem.documentDirectory}tickets/`;
        
        try {
          // Check if directory exists first
          const dirInfo = await FileSystem.getInfoAsync(ticketsDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(ticketsDir, { intermediates: true });
          }
        } catch (dirError) {
          console.log("Directory error, using document directory instead:", dirError);
          // Continue with document directory if there's an issue
        }
        
        // Generate a filename based on the event and ticket ID
        const eventName = selectedTicket.eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        if (type === 'image') {
          // Save as image
          const filename = `${eventName}_${selectedTicket.id.substring(0, 8)}.png`;
          const fileUri = `${FileSystem.documentDirectory}${filename}`;
          
          // Save the image to the file system
          await FileSystem.copyAsync({
            from: uri,
            to: fileUri
          });
          
          setIsDownloading(false);
          
          // Use React Native's built-in Share API
          await Share.share({
            title: `Billet pour ${selectedTicket.eventTitle}`,
            url: Platform.OS === 'ios' ? fileUri : uri,
            message: Platform.OS === 'android' ? `Billet pour ${selectedTicket.eventTitle}` : undefined,
          });
        } else {
          // Generate PDF
          const pdfFilename = `${eventName}_${selectedTicket.id.substring(0, 8)}.pdf`;
          const pdfFileUri = `${FileSystem.documentDirectory}${pdfFilename}`;
          
          // Generate PDF using the captured image and ticket data
          const pdfUri = await generateTicketPDF(selectedTicket, uri, pdfFileUri);
          
          setIsDownloading(false);
          
          // Share the PDF
          await Share.share({
            title: `Billet PDF pour ${selectedTicket.eventTitle}`,
            url: Platform.OS === 'ios' ? pdfUri : pdfUri,
            message: Platform.OS === 'android' ? `Billet PDF pour ${selectedTicket.eventTitle}` : undefined,
          });
        }
      } catch (fsError) {
        console.error("FileSystem error:", fsError);
        
        // Fallback for platforms without FileSystem
        setIsDownloading(false);
        
        // Just share the image directly
        await Share.share({
          title: `Billet pour ${selectedTicket.eventTitle}`,
          url: uri,
          message: `Billet pour ${selectedTicket.eventTitle}`,
        });
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      setIsDownloading(false);
      Alert.alert(
        'Erreur',
        'Une erreur s\'est produite lors du téléchargement du billet. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleTransfer = () => {
    setTransferModalVisible(true);
  };
  
  const closeTransferModal = () => {
    setTransferModalVisible(false);
    setRecipientEmail('');
    setEmailError('');
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleTransferSubmit = async () => {
    if (!selectedTicket) return;
    
    // Validate email
    if (!recipientEmail.trim()) {
      setEmailError('L\'adresse e-mail est requise');
      return;
    }
    
    if (!validateEmail(recipientEmail)) {
      setEmailError('Adresse e-mail invalide');
      return;
    }
    
    setEmailError('');
    setIsTransferring(true);
    
    try {
      // Call the transfer ticket function from the store
      await transferTicket(selectedTicket.id, recipientEmail);
      
      setIsTransferring(false);
      closeTransferModal();
      
      // Show success message
      Alert.alert(
        'Demande de transfert envoyée',
        `Une demande de transfert a été envoyée à ${recipientEmail}. Le destinataire devra accepter le transfert.`,
        [{ 
          text: 'OK',
          onPress: () => {
            // Navigate back to tickets list after successful transfer
            router.push('/tickets');
          }
        }]
      );
    } catch (error) {
      console.error('Error transferring ticket:', error);
      setIsTransferring(false);
      
      Alert.alert(
        'Erreur',
        'Une erreur s\'est produite lors du transfert du billet. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get background color based on ticket type
  const getTicketTypeColor = () => {
    if (!selectedTicket || !selectedTicket.ticketType) return colors.primary;
    
    const ticketTypeLower = selectedTicket.ticketType.toLowerCase();
    
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
    if (!selectedTicket || !selectedTicket.status) {
      return { color: colors.success + '33', text: 'Valide' };
    }
    
    switch (selectedTicket.status) {
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
    
    if (selectedTicket?.eventImage) {
      return selectedTicket.eventImage;
    }
    
    return DEFAULT_EVENT_IMAGE;
  };
  
  // Handle image load error
  const handleImageLoadError = () => {
    console.log('Event image failed to load, using fallback image');
    setImageLoadError(true);
  };
  
  // Toggle QR code refresh
  const toggleQrRefresh = () => {
    setQrRefreshEnabled(!qrRefreshEnabled);
  };
  
  if (isLoading || !selectedTicket) {
    return <LoadingIndicator fullScreen message="Chargement des détails du billet..." />;
  }
  
  const translateY = ticketAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  
  const opacity = ticketAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const statusBadge = getStatusBadge();
  const ticketId = selectedTicket.id.substring(0, 8).toUpperCase();
  const ticketTypeColor = getTicketTypeColor();
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'AfriTix',
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleShare}
              >
                <Share2 size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
          // Show a back button that goes to tickets list for new purchases
          headerLeft: () => isNewPurchase ? (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/tickets')}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ) : undefined
        }}
      />
      
      {isNewPurchase && (
        <View style={styles.successBanner}>
          <CheckCircle size={20} color={colors.background} />
          <Text style={styles.successText}>Achat réussi!</Text>
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateY }],
              opacity
            }
          ]}
        >
          <ViewShot 
            ref={ticketRef} 
            options={{ format: 'png', quality: 0.9 }}
            style={styles.ticketContainer}
          >
            {/* Redesigned Ticket with horizontal layout */}
            <View style={styles.ticketWrapper}>
              {/* Header with event image and overlay */}
              <View style={styles.ticketHeader}>
                <Image 
                  source={{ uri: getEventImageUrl() }} 
                  style={styles.headerBackgroundImage}
                  resizeMode="cover"
                  onError={handleImageLoadError}
                />
                <LinearGradient
                  colors={['rgba(180, 30, 30, 0.9)', 'rgba(180, 30, 30, 0.95)']}
                  style={styles.headerGradient}
                >
                  <View style={styles.headerContent}>
                    <Text style={styles.eventTitle}>{selectedTicket.eventTitle}</Text>
                    <Text style={styles.eventDate}>{formatDate(selectedTicket.eventDate)}</Text>
                  </View>
                </LinearGradient>
              </View>
              
              {/* Ticket body with horizontal layout */}
              <View style={styles.ticketBody}>
                {/* Ticket Type and ID Section */}
                <View style={styles.ticketTypeSection}>
                  <View style={styles.ticketTypeContainer}>
                    <Text style={styles.ticketTypeLabel}>Ticket Type</Text>
                    <Text style={[styles.ticketTypeValue, { color: ticketTypeColor }]}>
                      {selectedTicket.ticketType}
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
                
                {/* Ticket Details Section - Horizontal Layout */}
                <View style={styles.ticketDetailsSection}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Calendar size={20} color={colors.textSecondary} />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{formatDate(selectedTicket.eventDate)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Clock size={20} color={colors.textSecondary} />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{selectedTicket.eventTime}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <MapPin size={20} color={colors.textSecondary} />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Venue</Text>
                        <Text style={styles.detailValue}>{selectedTicket.eventVenue}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <User size={20} color={colors.textSecondary} />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Ticket Holder</Text>
                        <Text style={styles.detailValue}>Not Assigned</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {/* QR Code Section - Below the details */}
                <View style={styles.qrCodeSection}>
                  <View style={styles.qrCodeHeader}>
                    <Text style={styles.qrCodeTitle}>SCAN TO VERIFY</Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={toggleQrRefresh}
                    >
                      <RefreshCw size={16} color={qrRefreshEnabled ? colors.primary : colors.textSecondary} />
                      <Text style={[
                        styles.refreshButtonText, 
                        { color: qrRefreshEnabled ? colors.primary : colors.textSecondary }
                      ]}>
                        {qrRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <QRCodeDisplay 
                    value={selectedTicket.id} 
                    size={200} 
                    color="#000000"
                    backgroundColor="#FFFFFF"
                    refreshInterval={qrRefreshEnabled ? QR_REFRESH_INTERVAL : undefined}
                    showVerification={false}
                  />
                  
                  <View style={styles.securityBadge}>
                    <Shield size={14} color={colors.primary} />
                    <Text style={styles.securityText}>Secure Encrypted QR Code</Text>
                  </View>
                  
                  <Text style={styles.validText}>Valid for one-time entry</Text>
                </View>
              </View>
              
              {/* Ticket footer */}
              <View style={styles.ticketFooter}>
                <Text style={styles.ticketFooterText}>
                  This ticket is non-transferable and must be presented at entry
                </Text>
              </View>
              
              {/* Decorative elements */}
              <View style={styles.leftCutout} />
              <View style={styles.rightCutout} />
            </View>
          </ViewShot>
          
          {/* Additional sections */}
          {/* Validation history collapsible section */}
          <View style={styles.collapsibleSection}>
            <TouchableOpacity 
              style={styles.collapsibleHeader}
              onPress={() => setShowValidationHistory(!showValidationHistory)}
            >
              <Text style={styles.collapsibleTitle}>Historique de validation</Text>
              <Text style={styles.collapsibleToggle}>
                {showValidationHistory ? 'Masquer' : 'Afficher'}
              </Text>
            </TouchableOpacity>
            
            {showValidationHistory && (
              <View style={styles.validationHistory}>
                {selectedTicket.validationHistory && selectedTicket.validationHistory.length > 0 ? (
                  selectedTicket.validationHistory.map((item, index) => (
                    <View key={index} style={styles.validationItem}>
                      {item.success ? (
                        <CheckCircle size={16} color={colors.success} />
                      ) : (
                        <AlertCircle size={16} color={colors.error} />
                      )}
                      <Text style={styles.validationText}>{item.status}</Text>
                      <Text style={styles.validationDate}>{formatDateTime(item.timestamp)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noValidationText}>
                    Aucun historique de validation disponible
                  </Text>
                )}
              </View>
            )}
          </View>
          
          {/* Terms and conditions collapsible section */}
          <View style={styles.collapsibleSection}>
            <TouchableOpacity 
              style={styles.collapsibleHeader}
              onPress={() => setShowTerms(!showTerms)}
            >
              <Text style={styles.collapsibleTitle}>Conditions générales</Text>
              <Text style={styles.collapsibleToggle}>
                {showTerms ? 'Masquer' : 'Afficher'}
              </Text>
            </TouchableOpacity>
            
            {showTerms && (
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  • Ce billet n'est valable que pour l'événement et la date spécifiés.
                </Text>
                <Text style={styles.termsText}>
                  • Le détenteur du billet doit se conformer à toutes les règles du lieu.
                </Text>
                <Text style={styles.termsText}>
                  • Pas de remboursement ni d'échange sauf si requis par la loi.
                </Text>
                <Text style={styles.termsText}>
                  • L'organisateur se réserve le droit de refuser l'entrée.
                </Text>
                <Text style={styles.termsText}>
                  • La reproduction non autorisée de ce billet est interdite.
                </Text>
              </View>
            )}
          </View>
          
          {/* Important information */}
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Info size={20} color={colors.primary} />
              <Text style={styles.infoTitle}>Informations importantes</Text>
            </View>
            
            <Text style={styles.infoText}>
              • Veuillez arriver au moins 30 minutes avant le début de l'événement.
            </Text>
            <Text style={styles.infoText}>
              • Ayez votre code QR prêt à être scanné à l'entrée.
            </Text>
            <Text style={styles.infoText}>
              • Ce billet n'est ni remboursable ni transférable.
            </Text>
            <Text style={styles.infoText}>
              • Pour toute question, veuillez contacter support@afritix.com.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Télécharger le billet"
          onPress={showDownloadOptions}
          style={styles.downloadButton}
          icon={<Download size={20} color={colors.text} />}
          loading={isDownloading}
          disabled={isDownloading || selectedTicket.status === 'TRANSFERRED' || selectedTicket.status === 'CANCELLED'}
        />
        <Button
          title="Transférer le billet"
          onPress={handleTransfer}
          variant="outline"
          style={styles.transferButton}
          icon={<Send size={20} color={colors.primary} />}
          disabled={
            isTransferring || 
            selectedTicket.status === 'USED' || 
            selectedTicket.status === 'TRANSFERRED' || 
            selectedTicket.status === 'CANCELLED'
          }
        />
      </View>
      
      {/* Download Options Modal */}
      <Modal
        visible={downloadModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDownloadModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Format de téléchargement
              </Text>
              <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Choisissez le format dans lequel vous souhaitez télécharger votre billet.
            </Text>
            
            <View style={styles.downloadOptions}>
              <TouchableOpacity 
                style={[styles.downloadOption, { borderColor: colors.border }]}
                onPress={() => handleDownload('image')}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2070' }} 
                  style={styles.downloadOptionIcon}
                />
                <Text style={[styles.downloadOptionTitle, { color: colors.text }]}>Image</Text>
                <Text style={[styles.downloadOptionDescription, { color: colors.textSecondary }]}>
                  Format PNG facile à partager
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.downloadOption, { borderColor: colors.border }]}
                onPress={() => handleDownload('pdf')}
              >
                <FileText size={48} color={colors.primary} style={styles.downloadOptionIcon} />
                <Text style={[styles.downloadOptionTitle, { color: colors.text }]}>PDF</Text>
                <Text style={[styles.downloadOptionDescription, { color: colors.textSecondary }]}>
                  Document PDF officiel
                </Text>
              </TouchableOpacity>
            </View>
            
            <Button
              title="Annuler"
              onPress={() => setDownloadModalVisible(false)}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* Transfer Modal */}
      <Modal
        visible={transferModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeTransferModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Transférer le billet
              </Text>
              <TouchableOpacity onPress={closeTransferModal}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Entrez l'adresse e-mail de la personne à qui vous souhaitez transférer ce billet.
              Le destinataire recevra un e-mail avec les instructions pour accepter le transfert.
            </Text>
            
            <View style={styles.inputContainer}>
              <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text,
                    borderColor: emailError ? colors.error : colors.border
                  }
                ]}
                placeholder="Adresse e-mail du destinataire"
                placeholderTextColor={colors.textMuted}
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            
            <View style={styles.modalFooter}>
              <Button
                title="Annuler"
                onPress={closeTransferModal}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Transférer"
                onPress={handleTransferSubmit}
                style={styles.modalButton}
                loading={isTransferring}
                disabled={isTransferring}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  successBanner: {
    backgroundColor: '#4cd964',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  ticketContainer: {
    marginBottom: 16,
  },
  ticketWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  ticketHeader: {
    height: 120,
    position: 'relative',
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    justifyContent: 'center',
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDate: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.9,
  },
  ticketBody: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  ticketTypeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ticketTypeContainer: {
    flex: 1,
  },
  ticketTypeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  ticketTypeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ticketIdContainer: {
    alignItems: 'flex-end',
  },
  ticketIdBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ticketIdText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ticketDetailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  qrCodeSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  qrCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshButtonText: {
    fontSize: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#666666',
  },
  validText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  ticketFooter: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    alignItems: 'center',
  },
  ticketFooterText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  leftCutout: {
    position: 'absolute',
    left: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    transform: [{ translateY: -10 }],
  },
  rightCutout: {
    position: 'absolute',
    right: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    transform: [{ translateY: -10 }],
  },
  collapsibleSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  collapsibleToggle: {
    fontSize: 14,
    color: '#6f47ff',
  },
  validationHistory: {
    padding: 16,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  validationText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  validationDate: {
    fontSize: 12,
    color: '#666666',
  },
  noValidationText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  termsContainer: {
    padding: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  downloadButton: {
    flex: 1,
  },
  transferButton: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  downloadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  downloadOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  downloadOptionIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
    borderRadius: 8,
  },
  downloadOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  downloadOptionDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 8,
  },
});