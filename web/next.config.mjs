/** @type {import('next').NextConfig} */

const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
    basePath: prefix,
    assetPrefix: prefix,
    trailingSlash: true,
};
  
export default nextConfig;