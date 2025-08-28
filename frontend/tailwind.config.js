/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/view/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      'dim',    // Dark theme (default)
      'nord'    // Light theme
    ],
    darkTheme: 'dim',  // Use 'dim' as default dark theme
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
}
