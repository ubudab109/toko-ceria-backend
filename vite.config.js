import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            buildDirectory: 'build',
        }),
        tailwindcss(),
        {
            name: 'force-manifest-location',
            closeBundle() {
                const src = './public/build/.vite/manifest.json';
                const dest = './public/build/manifest.json';
                if (existsSync(src)) {
                    const content = readFileSync(src, 'utf8');
                    mkdirSync('./public/build', { recursive: true });
                    writeFileSync(dest, content);
                    console.log('✅ Manifest copied to public/build/manifest.json');
                } else {
                    console.warn('⚠️ Manifest not found at .vite');
                }
            },
        },
    ],
    build: {
        outDir: 'public/build',
        manifest: true,
        emptyOutDir: true,
        rollupOptions: {
            input: 'resources/js/app.tsx',
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
});
