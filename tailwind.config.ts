import type { Config } from "tailwindcss";

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
			fontFamily: {
				sans: ['"Baloo 2"', 'cursive', 'sans-serif'],
				baloo: ['"Baloo 2"', 'cursive', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				achievement: {
					DEFAULT: 'hsl(var(--achievement))',
					foreground: 'hsl(var(--achievement-foreground))'
				},
				level: {
					bg: 'hsl(var(--level-bg))',
					foreground: 'hsl(var(--level-foreground))'
				},
				gold: {
					400: 'hsl(43, 85%, 60%)',
					500: 'hsl(43, 85%, 55%)',
					600: 'hsl(43, 85%, 50%)',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'50%': { transform: 'scale(1.05)', opacity: '0.8' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.02)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'emoji-pop': {
					'0%': { transform: 'scale(0)', opacity: '0' },
					'50%': { transform: 'scale(1.2)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'celebrate': {
					'0%': { transform: 'scale(1) rotate(0deg)' },
					'25%': { transform: 'scale(1.1) rotate(-5deg)' },
					'50%': { transform: 'scale(1.15) rotate(5deg)' },
					'75%': { transform: 'scale(1.1) rotate(-3deg)' },
					'100%': { transform: 'scale(1) rotate(0deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'confetti-fall': {
					'0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 30px hsl(var(--primary) / 0.6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bounce-in': 'bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'emoji-pop': 'emoji-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'celebrate': 'celebrate 0.6s ease-in-out',
				'float': 'float 3s ease-in-out infinite',
				'confetti-fall': 'confetti-fall 3s linear forwards',
				'glow': 'glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
