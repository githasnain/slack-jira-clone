/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'primary-purple': '#8C00FF',
        'primary-pink': '#FF3F7F',
        'primary-dark': '#450693',
        
        // Slack-inspired color palette
        'slack': {
          50: '#FFF0F5',
          100: '#FFD6E5',
          200: '#FFB3C9',
          300: '#FF8FB3',
          400: '#FF6B9D',
          500: '#FF3F7F',
          600: '#E6005C',
          700: '#CC0049',
          800: '#B3003D',
          900: '#990033',
        },
        
        // Purple variations
        'purple': {
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
          400: '#A855F7',
          500: '#8C00FF',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        
        // Status colors for tickets
        'status': {
          'todo': '#6B7280',
          'in-progress': '#3B82F6',
          'review': '#F59E0B',
          'done': '#10B981',
        },
        
        // Priority colors
        'priority': {
          'low': '#6B7280',
          'medium': '#3B82F6',
          'high': '#F59E0B',
          'urgent': '#EF4444',
        },
        
        // Dark mode colors
        'dark': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'slack': '0 4px 6px -1px rgba(255, 63, 127, 0.1), 0 2px 4px -1px rgba(255, 63, 127, 0.06)',
        'purple': '0 4px 6px -1px rgba(140, 0, 255, 0.1), 0 2px 4px -1px rgba(140, 0, 255, 0.06)',
      },
    },
  },
  plugins: [],
}
