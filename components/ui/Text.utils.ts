import { StyleProp, TextStyle } from "react-native"
import { TextPresets, TextSize, TextWeight } from "./Text.props"

interface ITheme {
  colors: {
    text: {
      primary: string
      secondary: string
      inverse: string
    }
  }
  typography: {
    size: Record<TextSize, number>
    weight: Record<TextWeight, TextStyle["fontWeight"]>
  }
}

interface ITextStyleOptions {
  weight?: TextWeight
  size?: TextSize
  color?: string
  style?: StyleProp<TextStyle>
  preset?: TextPresets
  inverted?: boolean
}

const $presets: Record<TextPresets, TextStyle> = {
  default: {},
  bold: {
    fontWeight: "700",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
  },
  subheading: {
    fontSize: 20,
    fontWeight: "600",
  },
  caption: {
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
}

export function getTextStyle(theme: ITheme, options: ITextStyleOptions): StyleProp<TextStyle> {
  const { weight, size, color, style, preset = "default", inverted } = options

  const $baseStyle: TextStyle = {
    color: inverted ? theme.colors.text.inverse : theme.colors.text.primary,
  }

  const $presetStyle = $presets[preset] || {}

  const $weightStyle = weight ? { fontWeight: theme.typography.weight[weight] } : {}
  const $sizeStyle = size ? { fontSize: theme.typography.size[size] } : {}
  const $colorStyle = color ? { color } : {}

  return [
    $baseStyle,
    $presetStyle,
    $weightStyle,
    $sizeStyle,
    $colorStyle,
    style,
  ]
} 