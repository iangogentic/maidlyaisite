import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  
  // Webpack optimizations to prevent module loading issues
  webpack: (config, { isServer }) => {
    // Optimize recharts and other large libraries
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          lucideReact: {
            name: 'lucide-react',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            chunks: 'all',
            priority: 25,
          },
        },
      };
    }
    
    return config;
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
