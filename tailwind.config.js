module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wordy-primary': 'var(--wordy-primary)',
        'wordy-secondary': 'var(--wordy-secondary)',
        'wordy-accent': 'var(--wordy-accent)',
        'wordy-background': 'var(--wordy-background)',
        'wordy-surface': 'var(--wordy-surface)',
        'wordy-text': 'var(--wordy-text)',
        'wordy-dark': 'var(--wordy-dark)',
      },
    },
  },
  plugins: [],
}