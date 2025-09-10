import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // ---> أضف هذا السطر هنا <---
      base: './', 
      
      plugins: [react()],

      define: {
        // لقد قمنا بحذف السطر الخاص بـ STABILITY_API_KEY
        // وأضفنا السطر الصحيح لـ CLIPDROP_API_KEY
         'process.env.API_KEY': JSON.stringify(env.API_KEY),
        'process.env.CLIPDROP_API_KEY': JSON.stringify(env.CLIPDROP_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});