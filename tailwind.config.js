module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wordy-primary': '#6366F1',
        'wordy-bg': '#1A202C',
        'wordy-secondary-bg': '#2D3748',
        'wordy-text': '#E2E8F0',
        'wordy-accent': '#4FD1C5',
        'wordy-dark': '#000000', // Add this line for 'wordy-dark'
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
