/** @type {import('next').NextConfig} */
module.exports = {
  turbopack: {},
  // Evita warning de CORS no dev quando acessa via IP (ex: 192.168.x.x)
  allowedDevOrigins: [
    "*",
    "http://192.168.0.122:3000",
    "http://localhost:3000",
  ],
};
