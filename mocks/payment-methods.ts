import { PaymentMethod } from '@/types';

// Generate mock payment methods for a user
export const getMockPaymentMethodsForUser = (userId: string): PaymentMethod[] => {
  return [
    {
      id: 'pm_1',
      userId: userId,
      type: 'card',
      provider: 'visa',
      last4: '4242',
      expiryDate: '12/25', // Added required expiryDate field
      isDefault: true,
    },
    {
      id: 'pm_2',
      userId: userId,
      type: 'card',
      provider: 'mastercard',
      last4: '5555',
      expiryDate: '10/24', // Added required expiryDate field
      isDefault: false,
    },
    {
      id: 'pm_3',
      userId: userId,
      type: 'mobile_money',
      provider: 'orange_money',
      last4: '7890',
      expiryDate: 'N/A', // Use 'N/A' for payment methods without expiry
      isDefault: false,
    },
    {
      id: 'pm_4',
      userId: userId,
      type: 'mobile_money',
      provider: 'mtn_mobile_money',
      last4: '1234',
      expiryDate: 'N/A', // Use 'N/A' for payment methods without expiry
      isDefault: false,
    }
  ];
};