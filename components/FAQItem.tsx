import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

interface FAQItemProps {
  question: string;
  answer: string;
  isLast?: boolean;
}

export function FAQItem({ question, answer, isLast = false }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useThemeStore();
  const [animation] = useState(new Animated.Value(0));
  
  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const bodyHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1000], // Large enough to accommodate any text
  });
  
  return (
    <View style={[
      styles.container, 
      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
    ]}>
      <TouchableOpacity 
        style={styles.questionContainer} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
        {expanded ? (
          <ChevronUp size={20} color={colors.primary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
      
      {expanded && (
        <Animated.View style={[styles.answerContainer, { maxHeight: bodyHeight }]}>
          <Text style={[styles.answer, { color: colors.textSecondary }]}>
            {answer}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  answerContainer: {
    marginTop: 12,
    overflow: 'hidden',
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
});