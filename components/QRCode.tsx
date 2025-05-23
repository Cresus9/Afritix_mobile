import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { colors } from '@/constants/colors';
import { generateQRData, verifyQRCodeData } from '@/utils/encryption';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  refreshInterval?: number; // Optional interval to refresh QR code in seconds
  showVerification?: boolean; // Whether to show verification status
}

export const QRCodeDisplay: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  color = colors.text,
  backgroundColor = colors.card,
  refreshInterval,
  showVerification = false
}) => {
  const [qrValue, setQrValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<number>(0);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [useSimpleFormat, setUseSimpleFormat] = useState<boolean>(Platform.OS === 'web');

  // Generate encrypted QR code data
  const generateQRCode = () => {
    try {
      setIsLoading(true);
      
      let encryptedData: string;
      
      // Use a simpler format for web or after multiple errors
      if (useSimpleFormat) {
        encryptedData = `${value}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        console.log('Using simple QR code format');
      } else {
        try {
          // Try to generate the encrypted QR code data
          encryptedData = generateQRData(value);
        } catch (encryptError) {
          console.error('Error in encryption, falling back to simple format:', encryptError);
          setErrorCount(prev => prev + 1);
          encryptedData = `${value}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          
          // If we've had multiple errors, switch to simple format permanently
          if (errorCount >= 1) {
            setUseSimpleFormat(true);
          }
        }
      }
      
      setQrValue(encryptedData);
      
      // For debugging - log the encrypted data length
      console.log(`QR Code generated (length: ${encryptedData.length})`);
      
      // Verify the QR code if needed
      if (showVerification) {
        try {
          const valid = verifyQRCodeData(encryptedData);
          setIsValid(valid);
        } catch (verifyError) {
          console.error('Error verifying QR code:', verifyError);
          setIsValid(false);
        }
      }
      
      setIsLoading(false);
      
      // Increment refresh count for debugging
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setErrorCount(prev => prev + 1);
      
      // After errors, use a simple fallback
      const fallbackValue = `${value}-${Date.now()}`;
      setQrValue(fallbackValue);
      setIsLoading(false);
      
      // If we've had multiple errors, switch to simple format permanently
      if (errorCount >= 1) {
        setUseSimpleFormat(true);
      }
    }
  };

  // Generate QR code on initial render
  useEffect(() => {
    generateQRCode();
  }, [value]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        generateQRCode();
        setRefreshTimer(refreshInterval);
      }, refreshInterval * 1000);
      
      // Set up countdown timer
      const countdownId = setInterval(() => {
        setRefreshTimer(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => {
        clearInterval(intervalId);
        clearInterval(countdownId);
      };
    }
  }, [refreshInterval, useSimpleFormat]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={color} />
        <Text style={styles.loadingText}>Generating secure QR code...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <QRCodeSVG
        value={qrValue}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
        // Set error correction level to high to improve scanning reliability
        ecl="H"
      />
      
      {refreshInterval && refreshInterval > 0 && (
        <Text style={styles.refreshText}>
          Refreshes in {refreshTimer}s {useSimpleFormat ? '(simple)' : '(secure)'} #{refreshCount}
        </Text>
      )}
      
      {showVerification && isValid !== null && (
        <View style={[
          styles.verificationBadge, 
          { backgroundColor: isValid ? '#4cd964' : '#ff3b30' }
        ]}>
          <Text style={styles.verificationText}>
            {isValid ? 'Valid QR Code' : 'Invalid QR Code'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    position: 'relative',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  refreshText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: -10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  verificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
