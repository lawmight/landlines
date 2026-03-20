/**
 * Clerk appearance config: light/white theme for all Clerk components
 * (SignIn, SignUp, UserButton, etc.) regardless of app or system theme.
 * Uses direct color values per Clerk docs for broad browser support.
 */
export const clerkAppearance = {
  variables: {
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorMuted: "#f5f5f5",
    colorForeground: "#1a1a1a",
    colorInputForeground: "#1a1a1a",
    colorMutedForeground: "#6b7280",
    colorBorder: "#e5e7eb",
    colorNeutral: "#6b7280",
    colorModalBackdrop: "rgba(0, 0, 0, 0.5)",
    colorPrimary: "#8b5cf6",
    colorPrimaryForeground: "#ffffff",
    colorDanger: "#f43f5e",
    colorSuccess: "#10b981",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-body), 'DM Sans', sans-serif",
    fontFamilyButtons: "var(--font-body), 'DM Sans', sans-serif"
  }
} as const;
