/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4CAF50',    // Verde principal - representa sostenibilidad
        'primary-dark': '#2E7D32', // Verde oscuro
        'primary-light': '#A5D6A7', // Verde claro
        'secondary': '#1976D2',  // Azul - representa agua limpia/aire
        'secondary-dark': '#0D47A1', // Azul oscuro
        'secondary-light': '#90CAF9', // Azul claro
        'accent': '#FF9800',     // Naranja - representa energía solar/renovable
        'neutral-dark': '#333333', // Gris oscuro para texto
        'neutral-light': '#F5F5F5', // Gris claro para fondos
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/images/background-acerca2.webp')",
        'main-bg': "url('/src/assets/images/Earth-vangogh.webp')",
        'acerca-bg': "url('/src/assets/images/background-acerca2.webp')",
        'equipo-bg': "url('/src/assets/images/background-collab.webp')",
        'cuenta-bg': "url('/src/assets/images/background-registro.webp')",
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
