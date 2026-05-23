/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 TAILWIND CONFIG — DESIGN SYSTEM GLOBAL
 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
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
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px',
			},
		},
		extend: {
			/* ─────────────────────────────────────────────
			   COLORS — 100% Semantic via CSS Variables
			   ───────────────────────────────────────────── */
			colors: {
				// Core Surfaces
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",

				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				surface: {
					DEFAULT: "hsl(var(--surface))",
					foreground: "hsl(var(--surface-foreground))",
				},

				// Brand
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},

				// Neutral
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},

				// Semantic Status
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				success: {
					DEFAULT: "hsl(var(--success))",
					foreground: "hsl(var(--success-foreground))",
				},
				warning: {
					DEFAULT: "hsl(var(--warning))",
					foreground: "hsl(var(--warning-foreground))",
				},
				info: {
					DEFAULT: "hsl(var(--info))",
					foreground: "hsl(var(--info-foreground))",
				},

				// Chrome
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",

				// Charts
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
			},

			/* ─────────────────────────────────────────────
			   TYPOGRAPHY
			   ───────────────────────────────────────────── */
			fontFamily: {
				sans:    ['Inter', 'system-ui', 'sans-serif'],
				display: ['Inter', 'system-ui', 'sans-serif'],
				mono:    ['JetBrains Mono', 'Consolas', 'monospace'],
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
			},

			/* ─────────────────────────────────────────────
			   SHADOWS (via CSS variables for dark-awareness)
			   ───────────────────────────────────────────── */
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'card': 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)',
				'premium-sm': 'var(--shadow-premium-sm)',
				'premium-md': 'var(--shadow-premium-md)',
				'premium-lg': 'var(--shadow-premium-lg)',
			},

			/* ─────────────────────────────────────────────
			   BORDER RADIUS
			   ───────────────────────────────────────────── */
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				'xl': '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},

			/* ─────────────────────────────────────────────
			   ANIMATIONS
			   ───────────────────────────────────────────── */
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
	plugins: [
		tailwindAnimate,
	],
} satisfies Config;
