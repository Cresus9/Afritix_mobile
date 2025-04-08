import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/theme-store';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export function LoadingIndicator({ 
  message = 'Chargement...', 
  fullScreen = false,
  size = 'large'
}: LoadingIndicatorProps) {
  const { colors } = useThemeStore();
  
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={size} color={colors.primary} />
        {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});