import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color scheme utilities
export const colors = {
  primary: {
    purple: '#8C00FF',
    pink: '#FF3F7F',
    dark: '#450693',
  },
  neutral: {
    dark: '#423F3E',
    light: '#FFFFFF',
  }
} as const

// Helper function to get color classes
export function getColorClasses(color: keyof typeof colors.primary) {
  const colorMap = {
    purple: 'text-primary-purple bg-primary-purple border-primary-purple',
    pink: 'text-primary-pink bg-primary-pink border-primary-pink',
    dark: 'text-primary-dark bg-primary-dark border-primary-dark',
  }
  return colorMap[color]
}
