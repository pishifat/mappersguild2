import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        port: 8080,
        strictPort: true,
        watch: {
            usePolling: true,
            interval: 1000,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3000/',
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        outDir: 'dist/public',
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function', 'abs-percent', 'function-units'],
            },
        },
    },
    resolve: {
        alias: [
            { find: '@components', replacement: '/src/components' },
            { find: '@pages', replacement: '/src/pages' },
            { find: '@store', replacement: '/src/store' },
            { find: '@interfaces', replacement: '/interfaces' },
        ],
    },
});
