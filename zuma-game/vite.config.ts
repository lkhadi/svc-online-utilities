import { defineConfig } from 'vite';
import Phaser from 'phaser';

export default defineConfig({
  plugins: [
    {
      name: 'phaser-externals',
      resolveId(id) {
        if (id === 'phaser') {
          return { id, external: true };
        }
      },
      load(id) {
        if (id === 'phaser') {
          return 'export default Phaser;';
        }
      }
    }
  ],
  resolve: {
    alias: {
      phaser: 'phaser'
    }
  },
  build: {
    rollupOptions: {
      external: ['phaser']
    }
  }
});
