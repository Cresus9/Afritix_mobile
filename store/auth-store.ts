import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, PaymentMethod, NotificationPreferences, UserSettings, SecuritySettings } from '@/types';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getMockPaymentMethodsForUser } from '@/mocks/payment-methods';

interface AuthState {
  user: User | null;
  paymentMethods: PaymentMethod[];
  notificationPreferences: NotificationPreferences | null;
  userSettings: UserSettings | null;
  securitySettings: SecuritySettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  fetchPaymentMethods: () => Promise<void>;
  fetchNotificationPreferences: () => Promise<void>;
  fetchUserSettings: () => Promise<void>;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

// Helper function to create default settings
const createDefaultSettings = (userId: string): UserSettings => {
  return {
    userId,
    language: 'fr',
    theme: 'light',
    currency: 'XOF',
  };
};

// Helper function to create default security settings
const createDefaultSecuritySettings = (userId: string): SecuritySettings => {
  return {
    userId,
    twoFactorEnabled: false,
    biometricEnabled: false,
    passwordVisibilityEnabled: false,
    securityNotificationsEnabled: true,
    lastPasswordChange: null,
    failedLoginAttempts: 0,
  };
};

// Helper function to validate setting values
const validateSettingValue = (value: any, type: string, defaultValue: any): any => {
  if (value === undefined || value === null || typeof value !== type) {
    return defaultValue;
  }
  return value;
};

// Helper function to validate theme setting
const validateThemeSetting = (theme: any): 'light' | 'dark' => {
  if (theme === 'dark') return 'dark';
  return 'light'; // Default to light for any invalid value
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      paymentMethods: [],
      notificationPreferences: null,
      userSettings: null,
      securitySettings: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        const timeout = setTimeout(() => {
          console.log('[LOGIN] Timeout - setting isLoading to false');
          set({ isLoading: false, error: 'La connexion a expiré. Veuillez réessayer.' });
        }, 10000); // 10 seconds

        try {
          console.log('[LOGIN] Start - email:', email);
          if (!email || !password) {
            console.log('[LOGIN] Missing email or password');
            throw new Error('Veuillez remplir tous les champs');
          }

          // First check if there's an existing session
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          if (existingSession) {
            console.log('[LOGIN] Existing session found, signing out first');
            await supabase.auth.signOut();
          }

          console.log('[LOGIN] Calling supabase.auth.signInWithPassword');
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('[LOGIN] Supabase login error:', JSON.stringify(error, null, 2));
            throw error;
          }

          if (!data.user) {
            console.log('[LOGIN] No user returned from Supabase');
            throw new Error('Aucun utilisateur trouvé avec ces identifiants');
          }

          // Verify the session was created
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.error('[LOGIN] No session created after successful login');
            throw new Error('Erreur de création de session');
          }

          console.log('[LOGIN] Session verified:', {
            userId: session.user.id,
            expiresAt: session.expires_at,
            accessToken: session.access_token ? 'present' : 'missing',
            refreshToken: session.refresh_token ? 'present' : 'missing'
          });

          // Fetch user profile
          console.log('[LOGIN] Fetching user profile');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('[LOGIN] Profile fetch error:', JSON.stringify(profileError, null, 2));
            // Continue with basic user info
            const user = {
              id: data.user.id,
              name: data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              avatar: null,
            };
            console.log('[LOGIN] Setting user state with basic info');
            set({ user, isAuthenticated: true, isLoading: false });
            clearTimeout(timeout);
            return;
          }

          if (!profileData) {
            console.log('[LOGIN] Profile not found, creating new profile');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  user_id: data.user.id,
                  name: data.user.email?.split('@')[0] || 'User',
                  email: data.user.email,
                  updated_at: new Date().toISOString(),
                }
              ]);

            if (insertError) {
              console.error('[LOGIN] Profile creation error:', JSON.stringify(insertError, null, 2));
            }

            const user = {
              id: data.user.id,
              name: data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              avatar: null,
            };
            console.log('[LOGIN] Setting user state with new profile');
            set({ user, isAuthenticated: true, isLoading: false });
            clearTimeout(timeout);
            return;
          }

          const user = {
            id: data.user.id,
            name: profileData?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            avatar: profileData?.avatar_url,
            phone: profileData?.phone || null,
            location: profileData?.location || null,
            bio: profileData?.bio || null,
          };

          console.log('[LOGIN] Setting complete user state:', user);
          set({ user, isAuthenticated: true, isLoading: false });
          clearTimeout(timeout);

          // Fetch additional user data
          const authStore = get();
          console.log('[LOGIN] Fetching additional user data');
          await Promise.all([
            authStore.fetchPaymentMethods(),
            authStore.fetchNotificationPreferences(),
            authStore.fetchUserSettings()
          ]);
          console.log('[LOGIN] End - success');
        } catch (error) {
          console.error('[LOGIN] Login error:', error);
          let errorMessage = 'Une erreur inconnue est survenue';
          try {
            errorMessage = handleSupabaseError(error) || errorMessage;
          } catch (e) {
            // fallback to default error message
          }
          console.log('[LOGIN] Setting error state:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          clearTimeout(timeout);
          console.log('[LOGIN] End - error');
        } finally {
          console.log('[LOGIN] Finally block - ensuring loading state is false');
          set((state) => ({ ...state, isLoading: false }));
          clearTimeout(timeout);
        }
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Registration attempt with email:', email);
          
          if (!name || !email || !password) {
            throw new Error('Veuillez remplir tous les champs');
          }
          
          if (password.length < 8) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères');
          }
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              },
            },
          });
          
          if (error) {
            console.error('Registration auth error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          if (!data.user) {
            throw new Error('Échec de la création du compte');
          }
          
          console.log('Registration successful, user:', data.user?.id);
          
          // Wait for the session to be established before creating profile
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session fetch error:', JSON.stringify(sessionError, null, 2));
            throw sessionError;
          }
          
          if (!sessionData.session) {
            console.log('No active session found after registration');
            // Try to sign in to establish a session
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (signInError) {
              console.error('Auto sign-in error:', JSON.stringify(signInError, null, 2));
              throw signInError;
            }
          }
          
          console.log('Session established, creating profile');
          
          // Create a profile record in the profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                user_id: data.user.id,
                name: name,
                email: email,
                updated_at: new Date().toISOString(),
                settings: {
                  language: 'fr',
                  theme: 'light',
                  currency: 'XOF'
                }
              }
            ]);
          
          if (profileError) {
            console.error('Profile creation error:', JSON.stringify(profileError, null, 2));
            
            // If we get an RLS error, we need to handle it differently
            if (profileError.code === '42501') {
              console.log('RLS policy error, using upsert instead');
              
              // Try using upsert instead which might have different RLS policies
              const { error: upsertError } = await supabase
                .from('profiles')
                .upsert([
                  {
                    user_id: data.user.id,
                    name: name,
                    email: email,
                    updated_at: new Date().toISOString(),
                    settings: {
                      language: 'fr',
                      theme: 'light',
                      currency: 'XOF'
                    }
                  }
                ]);
              
              if (upsertError) {
                console.error('Profile upsert error:', JSON.stringify(upsertError, null, 2));
                // Continue anyway, as the user was created
              }
            }
          }
          
          // Create default notification preferences
          const { error: notifError } = await supabase
            .from('notification_preferences')
            .insert([
              {
                user_id: data.user.id,
                email: true,
                push: true,
                types: ['events', 'tickets', 'promotions']
              }
            ]);
          
          if (notifError) {
            console.error('Notification preferences creation error:', JSON.stringify(notifError, null, 2));
          }
          
          const user: User = {
            id: data.user.id,
            name: name,
            email: email,
            avatar: null,
          };
          
          // Create default user settings
          const defaultSettings: UserSettings = {
            userId: user.id,
            language: 'fr',
            theme: 'light',
            currency: 'XOF',
          };
          
          // Create default security settings
          const defaultSecuritySettings: SecuritySettings = createDefaultSecuritySettings(user.id);
          
          console.log('Setting user state after registration:', user.name);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            userSettings: defaultSettings,
            securitySettings: defaultSecuritySettings
          });
        } catch (error) {
          console.error('Registration error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            paymentMethods: [],
            notificationPreferences: null,
            userSettings: null,
            securitySettings: null
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      refreshUser: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Refreshing user data');
          
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session fetch error:', JSON.stringify(sessionError, null, 2));
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          
          if (!data.session) {
            console.log('No active session found');
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          
          console.log('Active session found for user:', data.session.user.id);
          
          // Fetch user profile data with all fields
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Profile fetch error during refresh:', JSON.stringify(profileError, null, 2));
            
            // Continue with basic user info
            const user: User = {
              id: data.session.user.id,
              name: data.session.user.email?.split('@')[0] || 'User',
              email: data.session.user.email || '',
              avatar: null,
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            return;
          }
          
          // If profile doesn't exist, create one
          if (!profileData) {
            console.log('Profile not found during refresh, creating new profile');
            
            // Try upsert instead of insert to handle RLS policies
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert([
                {
                  user_id: data.session.user.id,
                  name: data.session.user.email?.split('@')[0] || 'User',
                  email: data.session.user.email,
                  updated_at: new Date().toISOString(),
                  settings: {
                    language: 'fr',
                    theme: 'light',
                    currency: 'XOF'
                  }
                }
              ]);
            
            if (upsertError) {
              console.error('Profile creation error during refresh:', JSON.stringify(upsertError, null, 2));
            }
            
            const user: User = {
              id: data.session.user.id,
              name: data.session.user.email?.split('@')[0] || 'User',
              email: data.session.user.email || '',
              avatar: null,
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            return;
          }
          
          // Create user object with all profile fields
          const user: User = {
            id: data.session.user.id,
            name: profileData.name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || '',
            avatar: profileData.avatar_url,
            phone: profileData.phone || null,
            location: profileData.location || null,
            bio: profileData.bio || null,
          };
          
          console.log('User refreshed successfully:', user);
          set({ user, isAuthenticated: true, isLoading: false });
          
          // Fetch additional user data
          const authStore = get();
          await Promise.all([
            authStore.fetchPaymentMethods(),
            authStore.fetchNotificationPreferences(),
            authStore.fetchUserSettings()
          ]);
          
          // Initialize security settings if they don't exist
          if (!get().securitySettings) {
            set({ securitySettings: createDefaultSecuritySettings(user.id) });
          }
        } catch (error) {
          console.error('Error refreshing user:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      updateProfile: async (profileData) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Updating profile for user:', user.id);
          console.log('Profile data to update:', profileData);
          
          // Prepare the data for update
          const updateData = {
            user_id: user.id,
            name: profileData.name !== undefined ? profileData.name : user.name,
            phone: profileData.phone !== undefined ? profileData.phone : user.phone,
            location: profileData.location !== undefined ? profileData.location : user.location,
            bio: profileData.bio !== undefined ? profileData.bio : user.bio,
            avatar_url: profileData.avatar !== undefined ? profileData.avatar : user.avatar,
            email: user.email, // Include email to ensure it's not lost
            updated_at: new Date().toISOString(),
          };
          
          console.log('Prepared update data:', updateData);
          
          // Use upsert instead of update to handle potential RLS issues
          const { data, error } = await supabase
            .from('profiles')
            .upsert(updateData)
            .select()
            .single();
          
          if (error) {
            console.error('Profile update error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          console.log('Profile updated successfully:', data);
          
          // Update local user state with the returned data
          const updatedUser: User = {
            id: user.id,
            name: data.name,
            email: user.email,
            avatar: data.avatar_url,
            phone: data.phone,
            location: data.location,
            bio: data.bio,
          };
          
          set({ 
            user: updatedUser,
            isLoading: false 
          });
          
          return updatedUser;
        } catch (error) {
          console.error('Profile update error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      uploadAvatar: async (uri) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Uploading avatar for user:', user.id);
          
          // Create a unique filename
          const fileName = `avatar-${user.id}-${Date.now()}.jpg`;
          
          // Convert image to blob
          const response = await fetch(uri);
          const blob = await response.blob();
          
          // Upload to Supabase Storage
          const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            console.error('Avatar upload error:', JSON.stringify(uploadError, null, 2));
            throw uploadError;
          }
          
          console.log('Avatar uploaded successfully:', data?.path);
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          
          const avatarUrl = urlData.publicUrl;
          console.log('Avatar public URL:', avatarUrl);
          
          // Update profile with new avatar URL
          await get().updateProfile({ avatar: avatarUrl });
          
          set({ isLoading: false });
          return avatarUrl;
        } catch (error) {
          console.error('Avatar upload error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      fetchPaymentMethods: async () => {
        const { user, isAuthenticated } = get();
        if (!user || !isAuthenticated) return;
        
        try {
          console.log('Fetching payment methods for user:', user.id);
          
          // Always use mock data for now since the table doesn't exist
          console.log('Using mock payment methods data');
          const mockMethods = getMockPaymentMethodsForUser(user.id);
          set({ paymentMethods: mockMethods });
          
          /* Commented out the actual database fetch since the table doesn't exist
          // Try to fetch payment methods from Supabase
          try {
            const { data, error } = await supabase
              .from('payment_methods')
              .select('*')
              .eq('user_id', user.id);
            
            if (error) {
              console.error('Error fetching payment methods from database:', error.message);
              // Don't throw here, we'll use mock data instead
            } else if (data && data.length > 0) {
              console.log('Payment methods fetched successfully:', data.length);
              
              const paymentMethods: PaymentMethod[] = data.map(method => ({
                id: method.id,
                userId: method.user_id,
                type: method.type,
                provider: method.provider,
                last4: method.last4,
                expiryDate: method.expiry_date || 'N/A', // Ensure expiryDate is never undefined
                isDefault: method.is_default,
              }));
              
              set({ paymentMethods });
              return;
            } else {
              console.log('No payment methods found in database, using mock data');
            }
          } catch (dbError) {
            console.error('Exception during payment methods fetch:', dbError);
            // Continue to use mock data
          }
          */
          
        } catch (error) {
          console.error('Error in fetchPaymentMethods:', error);
          // Set empty array to avoid undefined errors
          set({ paymentMethods: [] });
        }
      },
      
      fetchNotificationPreferences: async () => {
        const { user, isAuthenticated } = get();
        if (!user || !isAuthenticated) return;
        
        try {
          console.log('Fetching notification preferences for user:', user.id);
          
          const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching notification preferences:', JSON.stringify(error, null, 2));
            
            // If the table doesn't exist, use default preferences
            if (error.code === '42P01') { // undefined_table
              console.log('notification_preferences table does not exist, using default preferences');
              
              const defaultPreferences: NotificationPreferences = {
                userId: user.id,
                email: true,
                push: true,
                types: ['events', 'tickets', 'promotions'],
              };
              
              set({ notificationPreferences: defaultPreferences });
            } else {
              throw error;
            }
          } else if (data) {
            console.log('Notification preferences found:', data);
            
            const preferences: NotificationPreferences = {
              userId: data.user_id,
              email: data.email,
              push: data.push,
              types: data.types || [],
            };
            
            set({ notificationPreferences: preferences });
          } else {
            console.log('No notification preferences found, creating default preferences');
            
            // Create default preferences if none exist
            const defaultPreferences: NotificationPreferences = {
              userId: user.id,
              email: true,
              push: true,
              types: ['events', 'tickets', 'promotions'],
            };
            
            try {
              // Use upsert instead of insert to handle RLS policies
              const { error: upsertError } = await supabase
                .from('notification_preferences')
                .upsert([{
                  user_id: user.id,
                  email: true,
                  push: true,
                  types: ['events', 'tickets', 'promotions'],
                }]);
              
              if (upsertError) {
                console.error('Error creating default notification preferences:', JSON.stringify(upsertError, null, 2));
                // Continue with default preferences anyway
              } else {
                console.log('Default notification preferences saved to database');
              }
            } catch (upsertError) {
              console.error('Exception during notification preferences creation:', upsertError);
            }
            
            set({ notificationPreferences: defaultPreferences });
          }
        } catch (error) {
          console.error('Error in fetchNotificationPreferences:', error);
          
          // Create default preferences in case of error
          const defaultPreferences: NotificationPreferences = {
            userId: user.id,
            email: true,
            push: true,
            types: ['events', 'tickets', 'promotions'],
          };
          
          set({ notificationPreferences: defaultPreferences });
        }
      },
      
      fetchUserSettings: async () => {
        const { user, isAuthenticated } = get();
        
        // Check if user is authenticated
        if (!user || !isAuthenticated) {
          console.log('fetchUserSettings: User not authenticated');
          return;
        }
        
        try {
          console.log('Fetching user settings for user:', user.id);
          
          // Verify Supabase session is active
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session verification error:', JSON.stringify(sessionError, null, 2));
            return;
          }
          
          if (!sessionData.session) {
            console.log('No active Supabase session found');
            return;
          }
          
          // Get settings directly from the profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('settings')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user settings:', JSON.stringify(error, null, 2));
            console.log('Error code:', error.code);
            console.log('Error message:', error.message);
            console.log('Error details:', error.details);
            
            // Don't throw, just return default settings
            const defaultSettings: UserSettings = createDefaultSettings(user.id);
            set({ userSettings: defaultSettings });
            return;
          }
          
          // Check if settings exist and are valid
          if (data && data.settings && typeof data.settings === 'object') {
            console.log('User settings found:', data.settings);
            
            // Validate settings object and use defaults for missing properties
            const settings: UserSettings = {
              userId: user.id,
              language: validateSettingValue(data.settings.language, 'string', 'fr'),
              theme: validateThemeSetting(data.settings.theme),
              currency: validateSettingValue(data.settings.currency, 'string', 'XOF'),
            };
            
            set({ userSettings: settings });
          } else {
            console.log('No valid user settings found, creating default settings');
            
            // Create default settings
            const defaultSettings: UserSettings = createDefaultSettings(user.id);
            
            // Try to update the profile with default settings
            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  settings: {
                    language: defaultSettings.language,
                    theme: defaultSettings.theme,
                    currency: defaultSettings.currency
                  },
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);
              
              if (updateError) {
                console.error('Error creating default user settings:', JSON.stringify(updateError, null, 2));
                // Continue with default settings anyway
              } else {
                console.log('Default settings saved to database');
              }
            } catch (updateError) {
              console.error('Exception during settings update:', updateError);
            }
            
            set({ userSettings: defaultSettings });
          }
          
          // Initialize security settings if they don't exist
          if (!get().securitySettings) {
            set({ securitySettings: createDefaultSecuritySettings(user.id) });
          }
        } catch (error) {
          console.error('Exception in fetchUserSettings:', error);
          
          // Create default settings in case of error
          const defaultSettings: UserSettings = createDefaultSettings(user?.id || 'unknown');
          set({ userSettings: defaultSettings });
        }
      },
      
      updateNotificationPreferences: async (preferences) => {
        const { user, notificationPreferences } = get();
        if (!user) throw new Error('User not authenticated');
        
        // If notificationPreferences is null, create default preferences
        const currentPreferences = notificationPreferences || {
          userId: user.id,
          email: true,
          push: true,
          types: ['events', 'tickets', 'promotions'],
        };
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Updating notification preferences:', preferences);
          console.log('Current preferences:', currentPreferences);
          
          // Ensure types is an array
          const updatedTypes = preferences.types || currentPreferences.types || [];
          
          // Prepare the update data
          const updatedPreferences = {
            user_id: user.id,
            email: preferences.email !== undefined ? preferences.email : currentPreferences.email,
            push: preferences.push !== undefined ? preferences.push : currentPreferences.push,
            types: updatedTypes,
          };
          
          console.log('Prepared update data:', updatedPreferences);
          
          // First check if a record already exists
          const { data: existingData, error: checkError } = await supabase
            .from('notification_preferences')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (checkError && checkError.code !== '42P01') { // Ignore table not found error
            console.error('Error checking existing notification preferences:', JSON.stringify(checkError, null, 2));
            throw checkError;
          }
          
          let updateResult;
          
          // If record exists, update it; otherwise insert a new one
          if (existingData) {
            console.log('Existing notification preferences found, updating...');
            updateResult = await supabase
              .from('notification_preferences')
              .update(updatedPreferences)
              .eq('user_id', user.id);
          } else {
            console.log('No existing notification preferences found, inserting...');
            updateResult = await supabase
              .from('notification_preferences')
              .insert([updatedPreferences]);
          }
          
          if (updateResult.error) {
            console.error('Error updating notification preferences in database:', JSON.stringify(updateResult.error, null, 2));
            
            // If table doesn't exist, just update local state
            if (updateResult.error.code === '42P01') { // undefined_table
              console.log('notification_preferences table does not exist, updating local state only');
            } else {
              throw updateResult.error;
            }
          } else {
            console.log('Notification preferences updated successfully in database');
          }
          
          // Update local state regardless of database success
          set({
            notificationPreferences: {
              userId: user.id,
              email: preferences.email !== undefined ? preferences.email : currentPreferences.email,
              push: preferences.push !== undefined ? preferences.push : currentPreferences.push,
              types: updatedTypes,
            },
            isLoading: false,
          });
          
          console.log('Notification preferences updated successfully in local state');
        } catch (error) {
          console.error('Error updating notification preferences:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      updateUserSettings: async (settings) => {
        const { user, userSettings } = get();
        if (!user) throw new Error('User not authenticated');
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Updating user settings:', settings);
          
          // Get current settings or create default ones
          const currentSettings = userSettings || createDefaultSettings(user.id);
          
          // Merge new settings with current ones
          const updatedSettings = {
            language: settings.language !== undefined ? settings.language : currentSettings.language,
            theme: settings.theme !== undefined ? settings.theme : currentSettings.theme,
            currency: settings.currency !== undefined ? settings.currency : currentSettings.currency,
          };
          
          console.log('Merged settings to save:', updatedSettings);
          
          // Update the settings in the profiles table
          const { error } = await supabase
            .from('profiles')
            .update({
              settings: updatedSettings,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Error updating user settings in database:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          // Update local state
          set({
            userSettings: {
              userId: user.id,
              ...updatedSettings,
            },
            isLoading: false,
          });
          
          console.log('User settings updated successfully');
        } catch (error) {
          console.error('Error updating user settings:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      updateSecuritySettings: async (settings) => {
        const { user, securitySettings } = get();
        if (!user) throw new Error('User not authenticated');
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Updating security settings:', settings);
          
          // Get current settings or create default ones
          const currentSettings = securitySettings || createDefaultSecuritySettings(user.id);
          
          // Merge new settings with current ones
          const updatedSettings: SecuritySettings = {
            userId: user.id,
            twoFactorEnabled: settings.twoFactorEnabled !== undefined ? settings.twoFactorEnabled : currentSettings.twoFactorEnabled,
            biometricEnabled: settings.biometricEnabled !== undefined ? settings.biometricEnabled : currentSettings.biometricEnabled,
            passwordVisibilityEnabled: settings.passwordVisibilityEnabled !== undefined ? settings.passwordVisibilityEnabled : currentSettings.passwordVisibilityEnabled,
            securityNotificationsEnabled: settings.securityNotificationsEnabled !== undefined ? settings.securityNotificationsEnabled : currentSettings.securityNotificationsEnabled,
            lastPasswordChange: settings.lastPasswordChange !== undefined ? settings.lastPasswordChange : currentSettings.lastPasswordChange,
            failedLoginAttempts: settings.failedLoginAttempts !== undefined ? settings.failedLoginAttempts : currentSettings.failedLoginAttempts,
          };
          
          console.log('Merged security settings to save:', updatedSettings);
          
          // In a real app, we would save these to the database
          // For now, we'll just update the local state
          
          // Update local state
          set({
            securitySettings: updatedSettings,
            isLoading: false,
          });
          
          console.log('Security settings updated successfully');
        } catch (error) {
          console.error('Error updating security settings:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      // New method for password reset
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Requesting password reset for email:', email);
          
          if (!email) {
            throw new Error('Veuillez entrer votre adresse email');
          }
          
          // Send password reset email via Supabase
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'afritix://reset-password-callback',
          });
          
          if (error) {
            console.error('Password reset request error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          console.log('Password reset email sent successfully');
          set({ isLoading: false });
        } catch (error) {
          console.error('Error sending password reset:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      // Method for changing password
      changePassword: async (currentPassword, newPassword) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Changing password for user:', user.id);
          
          if (!currentPassword || !newPassword) {
            throw new Error('Veuillez remplir tous les champs');
          }
          
          if (newPassword.length < 8) {
            throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères');
          }
          
          if (currentPassword === newPassword) {
            throw new Error("Le nouveau mot de passe doit être différent de l'ancien");
          }
          
          // First verify the current password by attempting to sign in
          const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
          });
          
          if (verifyError) {
            console.error('Current password verification failed:', JSON.stringify(verifyError, null, 2));
            throw new Error('Le mot de passe actuel est incorrect');
          }
          
          // Update the password
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          
          if (error) {
            console.error('Password update error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          console.log('Password changed successfully');
          
          // Update security settings to record the password change
          const { securitySettings } = get();
          const updatedSettings: SecuritySettings = {
            ...(securitySettings || createDefaultSecuritySettings(user.id)),
            lastPasswordChange: new Date().toISOString(),
          };
          
          set({
            securitySettings: updatedSettings,
            isLoading: false,
          });
          
          return;
        } catch (error) {
          console.error('Error changing password:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      // Method for deleting account
      deleteAccount: async (password) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Deleting account for user:', user.id);
          
          if (!password) {
            throw new Error('Veuillez entrer votre mot de passe pour confirmer');
          }
          
          // First verify the password by attempting to sign in
          const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password,
          });
          
          if (verifyError) {
            console.error('Password verification failed:', JSON.stringify(verifyError, null, 2));
            throw new Error('Le mot de passe est incorrect');
          }
          
          // Delete user data from profiles table
          const { error: profileDeleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('user_id', user.id);
          
          if (profileDeleteError) {
            console.error('Profile deletion error:', JSON.stringify(profileDeleteError, null, 2));
            // Continue with account deletion even if profile deletion fails
            console.log('Continuing with account deletion despite profile deletion error');
          }
          
          // Delete notification preferences
          try {
            const { error: notifDeleteError } = await supabase
              .from('notification_preferences')
              .delete()
              .eq('user_id', user.id);
            
            if (notifDeleteError && notifDeleteError.code !== '42P01') {
              console.error('Notification preferences deletion error:', JSON.stringify(notifDeleteError, null, 2));
            }
          } catch (error) {
            console.error('Error during notification preferences deletion:', error);
          }
          
          // Delete user's tickets
          try {
            const { error: ticketsDeleteError } = await supabase
              .from('tickets')
              .delete()
              .eq('user_id', user.id);
            
            if (ticketsDeleteError && ticketsDeleteError.code !== '42P01') {
              console.error('Tickets deletion error:', JSON.stringify(ticketsDeleteError, null, 2));
            }
          } catch (error) {
            console.error('Error during tickets deletion:', error);
          }
          
          // Delete user's support tickets
          try {
            const { error: supportTicketsDeleteError } = await supabase
              .from('support_tickets')
              .delete()
              .eq('user_id', user.id);
            
            if (supportTicketsDeleteError && supportTicketsDeleteError.code !== '42P01') {
              console.error('Support tickets deletion error:', JSON.stringify(supportTicketsDeleteError, null, 2));
            }
          } catch (error) {
            console.error('Error during support tickets deletion:', error);
          }
          
          // Delete user's avatar from storage
          if (user.avatar) {
            try {
              const avatarPath = user.avatar.split('/').pop();
              if (avatarPath) {
                const { error: avatarDeleteError } = await supabase.storage
                  .from('avatars')
                  .remove([avatarPath]);
                
                if (avatarDeleteError) {
                  console.error('Avatar deletion error:', JSON.stringify(avatarDeleteError, null, 2));
                }
              }
            } catch (error) {
              console.error('Error during avatar deletion:', error);
            }
          }
          
          // Mark the user as deleted in user metadata
          // This is a workaround since we can't fully delete the auth user from client-side
          const { error: updateError } = await supabase.auth.updateUser({
            data: { deleted: true, deleted_at: new Date().toISOString() }
          });
          
          if (updateError) {
            console.error('Error updating user data before deletion:', JSON.stringify(updateError, null, 2));
          }
          
          // Sign out the user
          await supabase.auth.signOut();
          
          console.log('Account deleted successfully');
          
          // Clear all local state
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            paymentMethods: [],
            notificationPreferences: null,
            userSettings: null,
            securitySettings: null
          });
          
          return;
        } catch (error) {
          console.error('Error deleting account:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'afritix-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);