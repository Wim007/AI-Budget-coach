/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genereert een minimale standalone-map met server.js — vereist voor de Docker-productie-image
  output: 'standalone',
};

export default nextConfig;
