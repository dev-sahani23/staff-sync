import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
                ink: "#111827",
                surface: "#FFFFFF",
                "surface-muted": "#F3F4F6",
                line: "#E5E7EB",
                positive: "#10B981",
                warning: "#F59E0B",
                critical: "#EF4444",
                "accent-soft": "#EFF6FF",
                border: "#E5E7EB",
                input: "#F3F4F6",
                ring: "#3B82F6",
                background: "#F3F4F6",
                foreground: "#111827",
                primary: {
                    DEFAULT: "#3B82F6",
                    hover: "#2563EB",
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#10B981",
                    hover: "#059669",
                    foreground: "#FFFFFF",
                },
                destructive: {
                    DEFAULT: "#EF4444",
                    hover: "#DC2626",
                    foreground: "#FFFFFF",
                },
                muted: {
                    DEFAULT: "#F3F4F6",
                    foreground: "#6B7280",
                },
                accent: {
                    DEFAULT: "#F59E0B",
                    hover: "#D97706",
                    foreground: "#FFFFFF",
                },
                popover: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#111827",
                },
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#111827",
                },
            },
            borderRadius: {
                lg: "8px",
                md: "6px",
                sm: "4px",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate],
} satisfies Config

export default config
