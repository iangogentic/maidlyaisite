#!/bin/bash

# Development server cleanup and restart script
# Use this when experiencing webpack module loading issues

echo "🧹 Cleaning Next.js cache and restarting development server..."

# Kill any existing Next.js processes
echo "Stopping existing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

# Clean Next.js cache
echo "Cleaning Next.js build cache..."
rm -rf .next

# Clean node modules cache
echo "Cleaning node_modules cache..."
rm -rf node_modules/.cache

# Clean npm cache (optional, for severe issues)
# echo "Cleaning npm cache..."
# npm cache clean --force

# Restart development server
echo "Starting development server..."
npm run dev

echo "✅ Development server restarted with clean cache"
