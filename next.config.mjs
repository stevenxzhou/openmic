/** @type {import('next').NextConfig} */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '/openmic';

const nextConfig = {
    basePath: prefix,
    assetPrefix: prefix,
    trailingSlash: true,
    env: {
        NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || packageJson.version,
        NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV,
    },
};

export default nextConfig;