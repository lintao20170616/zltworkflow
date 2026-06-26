import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, existsSync, readdirSync, mkdirSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 复制静态文件的函数
function copyPublicFiles() {
  const sourceDir = resolve(__dirname, 'client/public');
  const targetDir = resolve(__dirname, 'app/public');

  if (!existsSync(sourceDir)) {
    console.log('Source public directory not found:', sourceDir);
    return;
  }

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const files = readdirSync(sourceDir);
  files.forEach((file) => {
    const sourcePath = resolve(sourceDir, file);
    const targetPath = resolve(targetDir, file);
    try {
      copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${file}`);
    } catch (error) {
      console.error(`Error copying ${file}:`, error);
    }
  });
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-public-files',
      buildEnd() {
        copyPublicFiles();
      },
    },
  ],
  root: resolve(__dirname, 'client/spa/apps/default'),
  base: '/',
  build: {
    outDir: resolve(__dirname, 'app/public'),
    emptyOutDir: false,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/spa/apps/default/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:9080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/spa/apps/default/src'),
      '@spa': resolve(__dirname, 'client/spa'),
      '@app': resolve(__dirname, 'client/spa/apps/default'),
    },
  },
});
