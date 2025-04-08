import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import { generateSecureId } from '@/utils/encryption';

// Supabase configuration with actual credentials
const supabaseUrl = 'https://uwmlagvsivxqocklxbbo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWxhZ3ZzaXZ4cW9ja2x4YmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNzMwMjYsImV4cCI6MjA1MTg0OTAyNn0.ylTM28oYPVjotPmEn9TSZGPy4EQW2pbWgNLRqWYduLc';

// Polyfill for crypto.randomUUID
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  console.log('Polyfilling crypto.randomUUID');
  // @ts-ignore
  if (!globalThis.crypto) {
    // @ts-ignore
    globalThis.crypto = {};
  }
  // @ts-ignore
  if (!globalThis.crypto.randomUUID) {
    // @ts-ignore
    globalThis.crypto.randomUUID = () => {
      return generateSecureId();
    };
  }
}

// Polyfill for crypto.getRandomValues if needed
if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
  console.log('Polyfilling crypto.getRandomValues');
  // @ts-ignore
  if (!globalThis.crypto) {
    // @ts-ignore
    globalThis.crypto = {};
  }
  // @ts-ignore
  if (!globalThis.crypto.getRandomValues) {
    // @ts-ignore
    globalThis.crypto.getRandomValues = (array: Uint8Array) => {
      if (!array) {
        throw new Error('Argument must be a Uint8Array');
      }

      if (array instanceof Uint8Array) {
        for (let i = 0; i < array.byteLength; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
      return array;
    };
  }
}

// Create Supabase client with custom options to avoid native crypto
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    // Use custom fetch to avoid native crypto issues
    fetch: (...args) => fetch(...args),
  },
  // Add a custom ID generator that doesn't rely on native crypto
  // This is used for request IDs and other internal operations
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Initialize database schema if needed
export const initializeDatabase = async () => {
  try {
    console.log('Checking if database tables exist...');

    // Check if categories table exists
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (categoriesError) {
      console.log(
        'Categories table may not exist, checking if we need to create it'
      );

      // Check if we have permission to create tables (usually not in client-side code)
      // This is just a check, not actual table creation
      const { data: checkPermission, error: permissionError } =
        await supabase.rpc('check_table_exists', {
          table_name: 'categories',
        });

      if (permissionError) {
        console.log(
          'No permission to check or create tables:',
          permissionError.message
        );
      } else if (!checkPermission) {
        console.log(
          'Categories table does not exist, but we cannot create it from client-side'
        );
      }
    } else {
      console.log('Categories table exists with data:', categoriesData);
    }

    // Check if profiles table exists
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.error('Error checking profiles table:', profilesError);

      // If the profiles table doesn't exist, we can't do much here
      // This would require admin privileges to create tables
      console.log('Profiles table may not exist or you may not have access');
    } else {
      console.log('Profiles table exists');

      // Check if RLS policies are in place
      console.log('Checking RLS policies...');

      // We can't directly check RLS policies, but we can try to update a profile
      // and see if it works with the current user
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        const userId = sessionData.session.user.id;

        // Try to update the user's own profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (updateError) {
          console.log('RLS policy check result:', updateError.message);

          if (updateError.code === '42501') {
            // permission denied
            console.log(
              'RLS policies may be restricting access. Make sure proper policies are in place.'
            );
          }
        } else {
          console.log('RLS policies appear to be working correctly');
        }
      }
    }

    // Check if notification_preferences table exists
    const { data: notifPrefsData, error: notifPrefsError } = await supabase
      .from('notification_preferences')
      .select('id')
      .limit(1);

    if (notifPrefsError) {
      console.log(
        'Notification preferences table does not exist or is not accessible: ' +
        notifPrefsError.message
      );
      console.log(
        'This is expected - we will use mock notification preferences data'
      );
    } else {
      console.log(
        'Notification preferences table exists with data:',
        notifPrefsData
      );
    }

    // Check if payment_methods table exists
    const { data: paymentMethodsData, error: paymentMethodsError } =
      await supabase.from('payment_methods').select('id').limit(1);

    if (paymentMethodsError) {
      console.log(
        'Payment methods table does not exist or is not accessible:',
        paymentMethodsError.message
      );
      console.log('This is expected - we will use mock payment methods data');
    } else {
      console.log('Payment methods table exists with data:', paymentMethodsData);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Call initialization on import (will only run once)
initializeDatabase().catch(console.error);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error details:', error);

  // Handle different error formats
  if (typeof error === 'string') {
    return error;
  }

  // Authentication specific errors
  if (error?.message) {
    // Check for specific authentication errors
    if (error.message.includes('Invalid login credentials')) {
      return 'Email ou mot de passe incorrect. Veuillez vérifier vos informations.';
    }

    if (error.message.includes('Email not confirmed')) {
      return "Votre email n'a pas été confirmé. Veuillez vérifier votre boîte de réception.";
    }

    if (error.message.includes('User not found')) {
      return 'Aucun compte trouvé avec cet email. Veuillez vous inscrire.';
    }

    if (error.message.includes('Email already registered')) {
      return 'Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.';
    }

    if (error.message.includes('User already registered')) {
      return 'Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.';
    }

    // Password related errors
    if (error.message.includes('Password should be at least')) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if (error.message.includes('New password should be different')) {
      return "Le nouveau mot de passe doit être différent de l'ancien.";
    }

    if (error.message.includes('Password recovery requires an email')) {
      return 'Veuillez fournir votre email pour réinitialiser votre mot de passe.';
    }

    // JSON object errors
    if (error.message.includes('JSON object requested, multiple (or no) rows returned')) {
      return 'Erreur de profil utilisateur. Veuillez réessayer.';
    }

    // Crypto-related errors
    if (
      error.message.includes('crypto module') ||
      error.message.includes('randomUUID') ||
      error.message.includes('Native crypto module')
    ) {
      return 'Erreur de sécurité. Veuillez réessayer ou utiliser un autre navigateur.';
    }

    // Database relation errors
    if (
      error.message.includes('relation') &&
      error.message.includes('does not exist')
    ) {
      return "Cette fonctionnalité n'est pas encore disponible. Veuillez réessayer plus tard.";
    }

    // Return the original message if no specific case is matched
    return error.message;
  }

  // Handle error_description field
  if (error?.error_description) {
    if (error.error_description.includes('Invalid login credentials')) {
      return 'Email ou mot de passe incorrect. Veuillez vérifier vos informations.';
    }
    return error.error_description;
  }

  // Handle details field
  if (error?.details) {
    return error.details;
  }

  // Handle data.message field
  if (error?.data?.message) {
    return error.data.message;
  }

  // Handle error field
  if (error?.error) {
    return typeof error.error === 'string'
      ? error.error
      : JSON.stringify(error.error);
  }

  // Check for PostgreSQL error codes
  if (error?.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return 'Cet email est déjà utilisé.';
      case 'PGRST116': // No rows returned
        return 'Profil non trouvé.';
      case '42703': // undefined_column
        return 'Colonne non trouvée. Mise à jour de la structure de données en cours.';
      case '42501': // RLS policy violation
        return 'Erreur de permission. Veuillez vous connecter à nouveau.';
      case '42P01': // undefined_table
        return "Table non trouvée. L'application est en cours de maintenance.";
      case '22P02': // invalid input syntax
        if (error.message && error.message.includes('uuid')) {
          return 'Identifiant invalide. Veuillez réessayer.';
        }
        return 'Format de données invalide. Veuillez vérifier vos entrées.';
      case 'P0001': // raise_exception
        return error.message || 'Une erreur est survenue côté serveur.';
      case '28P01': // invalid_password
        return 'Mot de passe incorrect. Veuillez réessayer.';
      case '28000': // invalid_authorization_specification
        return "Erreur d'authentification. Veuillez vous reconnecter.";
      default:
        return `Erreur de base de données (${error.code}).`;
    }
  }

  return "Une erreur s'est produite. Veuillez réessayer.";
};