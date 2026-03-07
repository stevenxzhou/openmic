/** @type {import('next').NextConfig} */

const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '/openmic';

const nextConfig = {
    basePath: prefix,
    assetPrefix: prefix,
};

export default nextConfig;