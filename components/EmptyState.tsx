import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, AlertCircle, TicketX, Calendar, User } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: ReactNode | string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  message, 
  icon, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  const { colors } = useThemeStore();
  
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    const iconSize = 64;
    const iconColor = colors.textSecondary;
    
    switch (icon) {
      case 'Search':
        return <Search size={iconSize} color={iconColor} />;
      case 'Alert':
        return <AlertCircle size={iconSize} color={iconColor} />;
      case 'Ticket':
        return <TicketX size={iconSize} color={iconColor} />;
      case 'Calendar':
        return <Calendar size={iconSize} color={iconColor} />;
      case 'User':
        return <User size={iconSize} color={iconColor} />;
      default:
        return <AlertCircle size={iconSize} color={iconColor} />;
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        
        {actionLabel && onAction && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]} 
            onPress={onAction}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});