/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import tailwindForms from "@tailwindcss/forms";
import tailwindTypography from "@tailwindcss/typography";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",

				// Corporate Blue Theme
				primary: {
					DEFAULT: '#0056b3', // Strong Blue
					dark: '#003d80',
					light: '#e6f0fa',
					foreground: '#ffffff',
				},
				secondary: {
					DEFAULT: '#00a0e9', // Sky Blue/Accent
					foreground: '#ffffff',
				},
				accent: {
					DEFAULT: '#00a0e9',
					foreground: '#ffffff',
				},

				// Surface & Backgrounds
				surface: {
					DEFAULT: '#f8f9fa', // Light Gray
					card: '#ffffff',
				},

				// Text
				text: {
					main: '#333333',
					muted: '#666666',
				},

				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			fontFamily: {
				sans: ['"Open Sans"', 'Inter', 'system-ui', 'sans-serif'],
			},
			boxShadow: {
				'soft': '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
				'card': '0 10px 20px rgba(0, 0, 0, 0.08)',
				'card-hover': '0 20px 30px rgba(0, 0, 0, 0.12)',
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				'xl': '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
				'large': '8px',
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
				// Keeping subtle animations if needed, but tone them down for corporate look
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [
		tailwindAnimate,
		tailwindForms,
		tailwindTypography,
	],
} satisfies Config;
