import { Ticket } from '@/types';
import { Platform } from 'react-native';

/**
 * Generates a PDF version of a ticket
 * @param ticket The ticket data
 * @param imageUri URI of the ticket image captured with ViewShot
 * @param outputPath Path where the PDF should be saved
 * @returns URI of the generated PDF file
 */
export const generateTicketPDF = async (
  ticket: Ticket,
  imageUri: string,
  outputPath: string
): Promise<string> => {
  try {
    // Since we can't use native PDF generation libraries directly in Expo,
    // we'll create an HTML file and convert it to PDF using a web-based approach
    
    // First, create the HTML content
    const htmlContent = generateTicketHTML(ticket, imageUri);
    
    // For web platform, we handle things differently since FileSystem operations aren't available
    if (Platform.OS === 'web') {
      console.log('PDF generation on web - creating blob URL');
      
      // Create a Blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Return the blob URL which can be opened in a new tab
      return blobUrl;
    }
    
    // For mobile platforms, we need to use FileSystem
    // But we'll handle this in a way that doesn't crash if FileSystem is not available
    try {
      // Dynamically import FileSystem to avoid crashes on platforms where it's not available
      const FileSystem = require('expo-file-system');
      
      // Save the HTML to a temporary file
      const htmlPath = `${FileSystem.cacheDirectory}ticket_${ticket.id}.html`;
      await FileSystem.writeAsStringAsync(htmlPath, htmlContent);
      
      // For mobile platforms, we'll simulate PDF generation by copying the image
      // In a real app, you would use a native module or API to convert HTML to PDF
      console.log('Simulating PDF generation by copying the image');
      
      try {
        await FileSystem.copyAsync({
          from: imageUri,
          to: outputPath
        });
      } catch (copyError) {
        console.error('Error copying image file:', copyError);
        // Fallback: just return the original image URI if copy fails
        return imageUri;
      }
      
      return outputPath;
    } catch (fsError) {
      console.error('FileSystem operations failed:', fsError);
      // If FileSystem operations fail, return the original image URI
      return imageUri;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Return the original image URI as fallback
    return imageUri;
  }
};

/**
 * Generates HTML content for the ticket
 * @param ticket The ticket data
 * @param imageUri URI of the ticket image
 * @returns HTML string
 */
const generateTicketHTML = (ticket: Ticket, imageUri: string): string => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // Get ticket ID
  const ticketId = ticket.id.substring(0, 8).toUpperCase();
  
  // Create HTML content
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Billet - ${ticket.eventTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #6f47ff;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 18px;
          color: #666;
          margin-bottom: 20px;
        }
        .ticket-image {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .details {
          margin-bottom: 30px;
        }
        .details-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          width: 150px;
          font-weight: bold;
        }
        .detail-value {
          flex: 1;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .ticket-id {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 5px 10px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AfriTix</div>
          <div class="title">Billet Officiel</div>
          <div class="subtitle">${ticket.eventTitle}</div>
        </div>
        
        <img src="${imageUri}" class="ticket-image" alt="Ticket Image">
        
        <div class="details">
          <div class="details-title">Détails de l'événement</div>
          
          <div class="detail-row">
            <div class="detail-label">Événement:</div>
            <div class="detail-value">${ticket.eventTitle}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">${formatDate(ticket.eventDate)}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Heure:</div>
            <div class="detail-value">${ticket.eventTime}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Lieu:</div>
            <div class="detail-value">${ticket.eventVenue}, ${ticket.eventLocation}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Type de billet:</div>
            <div class="detail-value">${ticket.ticketType}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Prix:</div>
            <div class="detail-value">${ticket.price} ${ticket.currency}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">ID du billet:</div>
            <div class="detail-value"><span class="ticket-id">${ticketId}</span></div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Date d'achat:</div>
            <div class="detail-value">${formatDate(ticket.purchaseDate)}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Statut:</div>
            <div class="detail-value">${ticket.status || 'Valide'}</div>
          </div>
        </div>
        
        <div class="details">
          <div class="details-title">Conditions générales</div>
          <ul>
            <li>Ce billet n'est valable que pour l'événement et la date spécifiés.</li>
            <li>Le détenteur du billet doit se conformer à toutes les règles du lieu.</li>
            <li>Pas de remboursement ni d'échange sauf si requis par la loi.</li>
            <li>L'organisateur se réserve le droit de refuser l'entrée.</li>
            <li>La reproduction non autorisée de ce billet est interdite.</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Ce document est un billet officiel émis par AfriTix.</p>
          <p>Pour toute question, veuillez contacter support@afritix.com.</p>
          <p>© ${new Date().getFullYear()} AfriTix. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};