import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  // `astro dev`/`astro preview` bind to Vite's dev server, not the standalone Node server
  // (that reads HOST/PORT env vars at runtime instead — see Dockerfile). Node's dns.lookup('localhost')
  // on this machine resolves ::1 (IPv6) before 127.0.0.1, and Vite's default `server.host: 'localhost'`
  // only binds the single first-resolved address — so the dev server was reachable at
  // http://[::1]:4321 but not http://127.0.0.1:4321, which silently fails for anything that
  // resolves/prefers IPv4. `host: true` binds all interfaces (both families) so it works either way.
  server: {
    host: true,
  },
  env: {
    schema: {
      // access: 'secret' makes Astro read these at request time via process.env
      // instead of baking them into the build (see astro:env docs) — required
      // here because K8s/ops-tech injects these via ConfigMap/Secret at
      // container start, after the Docker image has already been built.
      STRAPI_URL: envField.string({ context: 'server', access: 'secret' }),
      STRAPI_API_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      GTM_ID: envField.string({ context: 'server', access: 'secret' }),
      APP_URL: envField.string({ context: 'server', access: 'secret' }),
    },
  },
});
