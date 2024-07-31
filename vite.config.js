import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		define: {
			'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
		},
		plugins: [react()],
		build: {
			chunkSizeWarningLimit: 2000,
		},
		server: {
			open: true,
		},
	};
});
