import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cp.boostseller.ai',
			},
		],
	},
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
