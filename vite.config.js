import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/public/images': {
                target: 'http://localhost:3001',
                changeOrigin: true
            }
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                admin: 'admin.html',
                login: 'login.html'
            }
        }
    }
});
