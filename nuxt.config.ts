export default defineNuxtConfig({
  srcDir: 'app/',
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: "Pokédex — Gotta Catch 'Em All",
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A modern Pokédex built with Nuxt 3 and PokéAPI' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap',
        },
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      pokeApiBase: 'https://pokeapi.co/api/v2',
    },
  },
  typescript: {
    strict: true,
  },
})