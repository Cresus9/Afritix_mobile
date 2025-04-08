export const colors = {
  primary: '#6f47ff',
  primaryLight: '#9a7dff',
  secondary: '#ff8c33',
  secondaryLight: '#ffb073',
  background: '#121212',
  card: '#1e1e1e',
  cardLight: '#2a2a2a',
  cardDark: '#181818', // Added cardDark color
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  border: '#333333',
  notification: '#ff4757',
  success: '#4cd964',
  error: '#ff3b30',
  warning: '#ffcc00',
  info: '#5ac8fa',
  white: '#ffffff',
  black: '#000000',
  gray: '#808080',
  lightGray: '#d3d3d3',
  darkGray: '#404040',
  transparent: 'transparent',
};

// Define theme color palettes
export const themes = {
  light: {
    primary: '#6f47ff',
    primaryLight: '#9a7dff',
    secondary: '#ff8c33',
    secondaryLight: '#ffb073',
    background: '#f5f5f5',
    card: '#ffffff',
    cardLight: '#f0f0f0',
    cardDark: '#e5e5e5', // Added cardDark color for light theme
    text: '#121212',
    textSecondary: '#555555',
    textMuted: '#999999',
    border: '#e0e0e0',
    notification: '#ff4757',
    success: '#4cd964',
    error: '#ff3b30',
    warning: '#ffcc00',
    info: '#5ac8fa',
    white: '#ffffff',
    black: '#000000',
    gray: '#808080',
    lightGray: '#d3d3d3',
    darkGray: '#404040',
    transparent: 'transparent',
  },
  dark: {
    primary: '#6f47ff',
    primaryLight: '#9a7dff',
    secondary: '#ff8c33',
    secondaryLight: '#ffb073',
    background: '#121212',
    card: '#1e1e1e',
    cardLight: '#2a2a2a',
    cardDark: '#181818', // Added cardDark color for dark theme
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',
    border: '#333333',
    notification: '#ff4757',
    success: '#4cd964',
    error: '#ff3b30',
    warning: '#ffcc00',
    info: '#5ac8fa',
    white: '#ffffff',
    black: '#000000',
    gray: '#808080',
    lightGray: '#d3d3d3',
    darkGray: '#404040',
    transparent: 'transparent',
  }
};

// Helper function to get colors based on theme
export const getColors = (theme: 'light' | 'dark') => {
  return themes[theme];
};