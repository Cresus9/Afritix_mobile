import { ExpoConfig, ConfigContext } from 'expo/config';

// Add ReadableStream polyfill
if (typeof ReadableStream === 'undefined') {
  const { ReadableStream } = require('node:stream/web');
  global.ReadableStream = ReadableStream;
}

// Environment variables
const ENV = {
  development: {
    SUPABASE_URL: process.env.SUPABASE_URL_DEV || 'https://uwmlagvsivxqocklxbbo.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY_DEV || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWxhZ3ZzaXZ4cW9ja2x4YmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg2NzY4MDAsImV4cCI6MjAxNDI1MjgwMH0.PxsT2Ly4KI4kz0JsmezKhs-w4ZXlxR6KuXGqbYBh8Yw',
    API_URL: process.env.API_URL_DEV || 'https://api-dev.afritix.com',
    ENABLE_DEBUG: 'true',
  },
  staging: {
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://uwmlagvsivxqocklxbbo.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    API_URL: process.env.API_URL_STAGING || 'https://api-staging.afritix.com',
    ENABLE_DEBUG: 'true',
  },
  production: {
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://uwmlagvsivxqocklxbbo.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    API_URL: process.env.API_URL_PROD || 'https://api.afritix.com',
    ENABLE_DEBUG: 'false',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // Get the environment from the process or use development as default
  const APP_ENV = (process.env.APP_ENV || 'development') as keyof typeof ENV;
  const envConfig = ENV[APP_ENV] || ENV.development;

  return {
    ...config,
    name: APP_ENV === 'production' ? 'AfriTix' : `AfriTix (${APP_ENV})`,
    slug: 'afritix',
    version: '1.0.4',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'afritix',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.afritix.ticketing',
      buildNumber: '2',
      infoPlist: {
        NSCameraUsageDescription: 'Cette application utilise la caméra pour scanner les codes QR des billets.',
        NSPhotoLibraryUsageDescription: 'Cette application nécessite l\'accès à votre galerie pour télécharger votre photo de profil.',
        NSLocationWhenInUseUsageDescription: 'Cette application utilise votre localisation pour vous montrer les événements à proximité.',
        NSUserNotificationUsageDescription: 'Nous utilisons les notifications pour vous tenir informé des événements et de vos billets.',
        UIBackgroundModes: ['remote-notification'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.afritix.ticketing',
      versionCode: 8,
      permissions: [
        'INTERNET',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'NOTIFICATIONS',
      ],
      googleServicesFile: './google-service-account.json',
      config: {
        googleMobileAdsAppId: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy'
      },
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.afritix.ticketing'
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-image-picker',
        {
          photosPermission: 'L\'application accède à vos photos pour mettre à jour votre photo de profil.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Permettre à AfriTix d\'utiliser votre position.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#ffffff',
          sounds: ['./assets/sounds/notification.wav'],
          androidMode: 'default',
          androidCollapsedTitle: 'AfriTix',
          iosDisplayInForeground: true,
        },
      ],
      // Temporarily disabled expo-updates to fix module loading issues
      // 'expo-updates',
    ],
    notification: {
      icon: './assets/images/notification-icon.png',
      color: '#000000',
      androidMode: 'default',
      androidCollapsedTitle: 'AfriTix',
      iosDisplayInForeground: true,
    },
    extra: {
      ...envConfig,
      eas: {
        projectId: "7308a961-ec12-4c2b-8b55-32e6a1a62db0"
      },
    },
    updates: {
      enabled: false, // Temporarily disable updates
      fallbackToCacheTimeout: 0,
    },
  };
};