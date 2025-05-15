export const useAppTheme = () => {
  const theme = {
    iconSize: {
      xs: 12,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 40,
    },
    colors: {
      fill: {
        primary: "#000000",
        secondary: "#666666",
        tertiary: "#999999",
        inverse: "#FFFFFF",
      },
    },
  }

  return { theme }
} 