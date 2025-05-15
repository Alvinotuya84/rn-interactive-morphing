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
      text: {
        primary: "#000000",
        secondary: "#666666",
        inverse: "#FFFFFF",
      },
    },
    typography: {
      size: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 30,
      },
      weight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
    },
  }

  return { theme }
} 