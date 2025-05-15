import { TextProps as RNTextProps, StyleProp, TextStyle } from "react-native"

export type TextPresets = "default" | "bold" | "heading" | "subheading" | "caption" | "label"
export type TextWeight = "regular" | "medium" | "semibold" | "bold"
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"

export interface ITextProps extends RNTextProps {
  /**
   * The weight of the text
   * @default "regular"
   */
  weight?: TextWeight

  /**
   * The size of the text
   * @default "md"
   */
  size?: TextSize

  /**
   * The color of the text
   */
  color?: string

  /**
   * Optional text to display if not using nested components
   */
  text?: string

  /**
   * An optional style override
   */
  style?: StyleProp<TextStyle>

  /**
   * One of the different types of text presets.
   * @default "default"
   */
  preset?: TextPresets

  /**
   * Whether to invert the text color (e.g. for dark backgrounds)
   * @default false
   */
  inverted?: boolean
} 