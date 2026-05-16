const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['msedge-tts'],
  },
  webpack: (config) => {
    // Replace the native bufferutil addon with a pure-JS shim so that webpack
    // can bundle ws without crashing on a .node binary it cannot handle.
    config.resolve.alias['bufferutil'] = path.resolve(
      __dirname,
      './src/lib/bufferutil-shim.js'
    );
    // utf-8-validate is also a native addon; set to false so webpack treats it
    // as an empty module (ws only uses it for validation, not required).
    config.resolve.alias['utf-8-validate'] = false;
    return config;
  },
};

module.exports = nextConfig;
