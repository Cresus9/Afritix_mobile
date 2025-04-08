import { ExpoConfig, ConfigContext } from 'expo/config';

// Environment variables
const ENV = {
  development: {
    SUPABASE_URL: 'https://uwmlagvsivxqocklxbbo.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWxhZ3ZzaXZ4cW9ja2x4YmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNzMwMjYsImV4cCI6MjA1MTg0OTAyNn0.ylTM28oYPVjotPmEn9TSZGPy4EQW2pbWgNLRqWYduLc',
    API_URL: 'https://api-dev.afritix.com',
    ENABLE_DEBUG: 'true',
  },
  staging: {
    SUPABASE_URL: 'https://uwmlagvsivxqocklxbbo.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWxhZ3ZzaXZ4cW9ja2x4YmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNzMwMjYsImV4cCI6MjA1MTg0OTAyNn0.ylTM28oYPVjotPmEn9TSZGPy4EQW2pbWgNLRqWYduLc',
    API_URL: 'https://api-staging.afritix.com',
    ENABLE_DEBUG: 'true',
  },
  production: {
    SUPABASE_URL: 'https://uwmlagvsivxqocklxbbo.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWxhZ3ZzaXZ4cW9ja2x4YmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNzMwMjYsImV4cCI6MjA1MTg0OTAyNn0.ylTM28oYPVjotPmEn9TSZGPy4EQW2pbWgNLRqWYduLc',
    API_URL: 'https://api.afritix.com',
    ENABLE_DEBUG: 'false',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // Get the environment from the process or use development as default
  const APP_ENV = process.env.APP_ENV || 'development';
  const envConfig = ENV[APP_ENV] || ENV.development;

  return {
    ...config,
    name: APP_ENV === 'production' ? 'AfriTix' : `AfriTix (${APP_ENV})`,
    slug: 'afritix',
    version: '1.0.0',
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
      buildNumber: '1',
      infoPlist: {
        NSCameraUsageDescription: 'Cette application utilise la caméra pour scanner les codes QR des billets.',
        NSPhotoLibraryUsageDescription: 'Cette application nécessite l\'accès à votre galerie pour télécharger votre photo de profil.',
        NSLocationWhenInUseUsageDescription: 'Cette application utilise votre localisation pour vous montrer les événements à proximité.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.afritix.ticketing',
      versionCode: 1,
      permissions: [
        'INTERNET',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
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
      'expo-updates',
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    extra: {
      ...envConfig,
      eas: {
        projectId: '7308a961-ec12-4c2b-8b55-32e6a1a62db0',
      },
    },
    updates: {
      url: 'https://u.expo.dev/7308a961-ec12-4c2b-8b55-32e6a1a62db0',
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  };
};