import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // `astro dev` binds to Vite's dev server. Node's dns.lookup('localhost') on this
  // machine resolves ::1 (IPv6) before 127.0.0.1, and Vite's default `server.host: 'localhost'`
  // only binds the single first-resolved address — so the dev server was reachable at
  // http://[::1]:4321 but not http://127.0.0.1:4321, which silently fails for anything that
  // resolves/prefers IPv4. `host: true` binds all interfaces (both families) so it works either way.
  server: {
    host: true,
  },
  env: {
    schema: {
      // access: 'secret' makes Astro read these at request time via process.env
      // instead of baking them into the build (see astro:env docs) — set these in the
      // Vercel project's Environment Variables settings for each environment.
      STRAPI_URL: envField.string({ context: 'server', access: 'secret' }),
      STRAPI_API_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      GTM_ID: envField.string({ context: 'server', access: 'secret' }),
      APP_URL: envField.string({ context: 'server', access: 'secret' }),
    },
  },
});
