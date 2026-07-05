const path = require('path');

module.exports = {
  style: {
    postcss: {
      config: {
        path: './postcss.config.js',
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
};
