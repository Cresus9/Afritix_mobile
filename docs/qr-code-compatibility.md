# QR Code Compatibility Guide for AfriTix Mobile App



## Current Implementation

The web app currently generates QR codes using the following method in `utils/ticketService.ts`:

```typescript
export const generateQRData = (ticketId: string): string => {
  try {
    // Create a payload with ticket ID and timestamp
    const payload = {
      id: ticketId,
      timestamp: Date.now()
    };
    
    // Encrypt the payload
    return AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
  } catch (error) {
    console.error('Error generating QR data:', error);
    throw new Error('Failed to generate QR code');
  }
};
```

And decodes them using:

```typescript
export const decodeQRData = (encryptedData: string): { id: string; timestamp: number } => {
  try {
    // Decrypt the data
    const bytes = AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Invalid QR code format');
    }

    // Parse the decrypted JSON
    const payload = JSON.parse(decrypted);
    
    if (!payload.id || !payload.timestamp) {
      throw new Error('Invalid ticket data format');
    }

    // Check if the ticket has expired (24 hour validity)
    const now = Date.now();
    if (now - payload.timestamp > 24 * 60 * 60 * 1000) {
      throw new Error('Ticket QR code has expired');
    }

    return {
      id: payload.id,
      timestamp: payload.timestamp
    };
  } catch (error) {
    console.error('Error decoding QR data:', error);
    throw new Error('Invalid QR code');
  }
};
```

## Mobile App Implementation

To ensure compatibility, the mobile app must use the same encryption/decryption method and payload structure.

### Required Dependencies

```bash
npm install crypto-js
```

### Mobile App QR Code Scanner Implementation


Refer to the repository README for a full example of the scanner component.

## Troubleshooting

If you're getting "invalid format" errors when scanning QR codes:

1. **Check Secret Key** – ensure the key is identical in web and mobile apps.
2. **Verify CryptoJS Version** – use the same version across platforms.
3. **Debug Raw Data** – log the raw QR code data to see what's scanned.
4. **Test with Known Data** – generate a test QR code with known values.
5. **Check for Whitespace** – ensure no extra whitespace in the scanned data.
6. **Verify Camera Focus** – make sure the camera is properly focusing on the code.

## Security Considerations

- Keep the `SECRET_KEY` secure and consistent across platforms.
- Consider server-side validation for all tickets.
- Implement rate limiting to prevent brute force attacks.
