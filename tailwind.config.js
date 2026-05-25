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
        cream: {
          DEFAULT: '#FAF5EE',
          2: '#F2EBE0',
          3: '#E6DDD1',
          4: '#CEC4B6',
        },
        orange: {
          DEFAULT: '#E8841A',
          dark: '#C46A0C',
        },
        ink: {
          DEFAULT: '#1C1814',
          2: '#4A4238',
          3: '#8C8178',
          4: '#B8B0A6',
        },
      },
      fontFamily: {
        condensed: ['Barlow Condensed', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
