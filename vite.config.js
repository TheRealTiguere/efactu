import { resolve } from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        commentCaMarche: resolve(__dirname, 'comment-ca-marche.html'),
        comparatif: resolve(__dirname, 'comparatif.html'),
        faq: resolve(__dirname, 'faq.html'),
        contact: resolve(__dirname, 'contact.html'),
        mentionsLegales: resolve(__dirname, 'mentions-legales.html'),
        politiqueConfidentialite: resolve(__dirname, 'politique-confidentialite.html'),
        guidesIndex: resolve(__dirname, 'guides/index.html'),
        guideReforme: resolve(__dirname, 'guides/guide-reforme.html'),
        guidePdp: resolve(__dirname, 'guides/guide-pdp.html'),
        admin: resolve(__dirname, 'admin.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
      },
    },
  },
});
