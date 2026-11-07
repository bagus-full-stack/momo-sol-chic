/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // GitHub Pages sous /repo : définir NEXT_PUBLIC_BASE_PATH (vide avec domaine personnalisé)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
