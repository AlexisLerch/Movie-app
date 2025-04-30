/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#080405', // #030014
        secondary: '#FFFFFF', //#151312
        light: {
          100: '#FFFFFF', // #E4E1F5
          200: '#FFFFFF', // #A8B5DB
          300: '#FFFFF', // #9CA4AB
        },
        dark: {
          100: '#221f3d',
          200: '#000000' // #0f0d23
        },
        accent: '#AB8BFF',
      }
    },
  },
  plugins: [],
}