import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import '@/lib/global'; // Import our global polyfills first
import Constants from 'expo-constants';

// Get environment variables from app.config.ts
const extra = Constants.expoConfig?.extra;
const supabaseUrl = extra?.SUPABASE_URL;
const supabaseAnonKey = extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
});

// Set up app state change listener for auth state
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default supabase;

// Initialize database schema if needed
export const initializeDatabase = async () => {
  try {
    console.log('Checking if database tables exist...');

    // Check if events table exists
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);

    if (eventsError) {
      console.error('Error checking events table:', eventsError);
      console.log('Events table may not exist or you may not have access');
    } else {
      console.log('Events table exists with data:', eventsData);
    }

    // Check if event_categories table exists
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('event_categories')
      .select('id')
      .limit(1);

    if (categoriesError) {
      console.log(
        'Event categories table may not exist, checking if we need to create it'
      );

      // Check if we have permission to create tables (usually not in client-side code)
      // This is just a check, not actual table creation
      const { data: checkPermission, error: permissionError } =
        await supabase.rpc('check_table_exists', {
          table_name: 'event_categories',
        });

      if (permissionError) {
        console.log(
          'No permission to check or create tables:',
          permissionError.message
        );
      } else if (!checkPermission) {
        console.log(
          'Event categories table does not exist, but we cannot create it from client-side'
        );
      }
    } else {
      console.log('Event categories table exists with data:', categoriesData);
    }

    // Check if profiles table exists
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.error('Error checking profiles table:', profilesError);
      console.log('Profiles table may not exist or you may not have access');
    } else {
      console.log('Profiles table exists with data:', profilesData);
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