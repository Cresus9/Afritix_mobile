import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  ChevronRight, 
  FileText, 
  Shield, 
  Info, 
  BookOpen
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

export default function ResourcesScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  
  const resources = [
    {
      id: 'terms',
      title: "Conditions d'utilisation",
      icon: <FileText size={20} color={colors.textSecondary} />,
      route: '/profile/resources/terms',
    },
    {
      id: 'privacy',
      title: 'Politique de confidentialité',
      icon: <Shield size={20} color={colors.textSecondary} />,
      route: '/profile/resources/privacy',
    },
    {
      id: 'about',
      title: "À propos d'AfriTix",
      icon: <Info size={20} color={colors.textSecondary} />,
      route: '/profile/resources/about',
    },
    {
      id: 'guides',
      title: "Guides d'utilisation",
      icon: <BookOpen size={20} color={colors.textSecondary} />,
      route: '/profile/resources/guides',
    }
  ];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Ressources',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {resources.map((resource, index) => (
            <TouchableOpacity 
              key={resource.id}
              style={[
                styles.menuItem, 
                { 
                  borderBottomColor: colors.border,
                  borderBottomWidth: index < resources.length - 1 ? 1 : 0
                }
              ]}
              onPress={() => router.push(resource.route)}
            >
              {resource.icon}
              <Text style={[styles.menuItemText, { color: colors.text }]}>{resource.title}</Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
});