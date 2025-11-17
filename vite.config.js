import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    // build: {
    //     manifest: true,
    //     outDir: 'public/dist',
    //     rollupOptions: {
    //         input: 'resources/js/app.tsx',
    //     },
    // },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
    server: {
        port: 3001, // Change this to your desired port
        // You can also add other server options here, e.g., host: true
    },
});
