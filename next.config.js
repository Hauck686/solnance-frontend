const webpack = require('webpack')
const withTM = require('next-transpile-modules')([
  '@rainbow-me/rainbowkit',
  '@vanilla-extract/css',
  '@vanilla-extract/sprinkles'
])

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**'
      }
    ]
  },

  webpack: config => {
    // Polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      util: require.resolve('util'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser.js'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser.js'),
      fs: false,
      net: false,
      tls: false
    }

    // Provide globals
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js'
      })
    )

    return config
  }
}

module.exports = withTM(nextConfig)
