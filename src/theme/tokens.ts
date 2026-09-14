/**
 * Design Tokens - Core design system values
 * Inspired by miHoYo/HoYoverse's UI design philosophy
 */

/**
 * Base Spacing Scale
 * Consistent spacing using 4px base unit
 * Following miHoYo's generous whitespace approach
 */
export const spacing = {
  xs: 4,    // Very tight spacing, icon padding
  sm: 8,    // Compact element spacing
  md: 16,   // Standard element spacing (baseline)
  lg: 24,   // Section spacing
  xl: 32,   // Major section breaks
  xxl: 48,  // Page-level spacing
} as const;

/**
 * Typography Scale
 * Font sizes and line heights for clear text hierarchy
 */
export const typography = {
  fontFamily: {
    primary: '汉仪文黑-85W',
    fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  fontSize: {
    caption: 11,      // Metadata, timestamps
    xs: 12,          // Secondary text, labels
    sm: 14,          // Standard body text
    md: 16,          // Prominent body text
    lg: 18,          // Sub-section headers
    xl: 20,          // Section headers
    xxl: 24,         // Main headers
    display: 32,     // Page titles, hero text
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,      // Headers
    snug: 1.3,       // Sub-headers
    normal: 1.5,     // Body text
    relaxed: 1.75,   // Comfortable reading
  },
} as const;

/**
 * Border Radius Scale
 * miHoYo's "soft look" with generous rounding
 */
export const borderRadius = {
  none: 0,
  sm: 4,    // Subtle rounding
  md: 8,    // Small elements, badges, buttons
  lg: 12,   // Cards, panels (most common)
  xl: 16,   // Modals, dialogs
  xxl: 24,  // Extra emphasis
  full: 9999,
} as const;

/**
 * Elevation & Shadow System
 * Subtle shadows for depth without overwhelming
 * Following miHoYo's layered approach
 */
export const elevation = {
  0: 'none',
  1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',  // Cards resting
  2: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',   // Raised cards
  3: '0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.08)', // Modals
  4: '0 16px 24px rgba(0, 0, 0, 0.18), 0 8px 12px rgba(0, 0, 0, 0.1)', // Important overlays
} as const;

// Legacy shadow exports for compatibility
export const shadows = {
  sm: elevation[1],
  md: elevation[2],
  lg: elevation[3],
  xl: elevation[4],
} as const;

/**
 * Transition Durations
 * Smooth, purposeful animations
 */
export const transitions = {
  fast: '150ms',      // Hover states, tooltips
  normal: '250ms',    // Standard transitions (default)
  slow: '350ms',      // Modals, page transitions
  springy: '400ms',   // Playful emphasis
} as const;

/**
 * Easing Functions
 * Natural motion curves
 */
export const easing = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',            // Exiting elements
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',           // Entering elements
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',       // Position/size changes
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',     // Springy, playful
} as const;

/**
 * Rarity Color Definitions
 * Universal rarity colors used across all games
 * Gradients for premium feel (miHoYo signature)
 */
export const rarityColors = {
  three: {
    main: '#35598c',
    light: '#4d80c8',
    dark: '#1f3a5f',
    gradient: 'linear-gradient(135deg, #434e7e 0%, #4d80c8 100%)',
  },
  four: {
    main: '#644393',
    light: '#9061d2',
    dark: '#4e4976',
    gradient: 'linear-gradient(135deg, #4e4976 0%, #9061d2 100%)',
  },
  five: {
    main: '#93794e',
    light: '#d2ad70',
    dark: '#986359',
    gradient: 'linear-gradient(135deg, #986359 0%, #d2ad70 100%)',
  },
} as const;

/**
 * Semantic Colors
 * Purpose-based colors for UI feedback
 */
export const semanticColors = {
  success: {
    main: '#8cb94b',
    light: '#a8d372',
    dark: '#6d9a2f',
  },
  warning: {
    main: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
  },
  error: {
    main: '#d27878',
    light: '#e89999',
    dark: '#b55555',
  },
  info: {
    main: '#60a5fa',
    light: '#93c5fd',
    dark: '#3b82f6',
  },
} as const;

/**
 * Neutral Color Palette
 * Slightly warm grays for softer appearance
 */
export const neutralColors = {
  white: '#ffffff',
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  black: '#000000',
} as const;

/**
 * Z-Index Scale
 * Layering hierarchy
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

