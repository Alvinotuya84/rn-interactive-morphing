import React from "react"
import { Text as RNText, StyleProp, TextStyle } from "react-native"
import { useAppTheme } from "../../theme/use-app-theme"
import { ITextProps } from "./Text.props"
import { getTextStyle } from "./Text.utils"

export const Text = React.forwardRef<RNText, ITextProps>((props, ref) => {
  const {
    weight,
    size,
    color,
    text,
    children,
    style: styleProp,
    preset,
    inverted,
    ...rest
  } = props

  const { theme } = useAppTheme()

  const content = text || children

  const styles: StyleProp<TextStyle> = getTextStyle(theme, {
    weight,
    size,
    color,
    style: styleProp,
    preset,
    inverted,
  })

  return (
    <RNText
      ref={ref}
      style={styles}
      suppressHighlighting={true} // Don't like the default highlight on press
      {...rest}
    >
      {content}
    </RNText>
  )
})

Text.displayName = "Text" 