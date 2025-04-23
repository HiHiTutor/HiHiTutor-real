/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFDD00',
        secondary: '#3B82F6',
        success: '#10B981',
        danger: '#EF4444',
        'hihitutor': {
          yellow: {
            DEFAULT: '#FFDD00',
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#FFDD00',
            600: '#EAB308',
          },
          blue: {
            DEFAULT: '#3B82F6',
            50: '#EFF6FF',
            100: '#DBEAFE',
            500: '#3B82F6',
            600: '#2563EB',
          },
          green: {
            DEFAULT: '#10B981',
            50: '#ECFDF5',
            500: '#10B981',
            600: '#059669',
          }
        }
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(0,0,0,0.05)',
        'hover': '0 4px 6px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}; 