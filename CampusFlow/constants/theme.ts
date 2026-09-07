/**
 * Navy + Teal + Mint Theme Palette
 * 
 * Background   #F4F8F7 (Very-light greenish-white)
 * Primary      #123C4A (Deep Navy / Dark Slate Teal)
 * Secondary    #1D7A78 (Dark Teal - buttons & main actions)
 * Accent       #55C6A9 (Mint - active icons, accents & badges)
 * Cards        #FFFFFF (Pure White)
 * Text         #102A35 (Deep Navy Charcoal text)
 */

import { Platform } from 'react-native';

export const Theme = {
  background: '#F4F8F7',
  primary: '#123C4A',
  secondary: '#1D7A78',
  accent: '#55C6A9',
  cards: '#FFFFFF',
  text: '#102A35',
  textMuted: '#527986',
  textLight: '#7B9AA5',
  border: '#DCE8E5',
  cardShadow: 'rgba(18, 60, 74, 0.05)',
  
  // Tint states
  tintTeal: '#1D7A78',
  tintMint: '#55C6A9',
  tintNavy: '#123C4A',

  // Status highlights tailored to the palette
  pending: '#E07A28',
  pendingBg: '#FFF5EC',
  inProgress: '#1D7A78',
  inProgressBg: '#E8F5F4',
  resolved: '#2EA885',
  resolvedBg: '#E8F8F4',
  danger: '#D94848',
  dangerBg: '#FDF0F0',
};

const tintColorLight = '#1D7A78';
const tintColorDark = '#55C6A9';

export const Colors = {
  light: {
    text: '#102A35',
    background: '#F4F8F7',
    tint: tintColorLight,
    icon: '#527986',
    tabIconDefault: '#7B9AA5',
    tabIconSelected: '#1D7A78',
    card: '#FFFFFF',
    border: '#DCE8E5',
    accent: '#55C6A9',
  },
  dark: {
    text: '#F4F8F7',
    background: '#102A35',
    tint: tintColorDark,
    icon: '#55C6A9',
    tabIconDefault: '#527986',
    tabIconSelected: '#55C6A9',
    card: '#123C4A',
    border: '#1D7A78',
    accent: '#55C6A9',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
