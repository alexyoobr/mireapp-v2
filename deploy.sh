#!/bin/sh
# Build the application first
npm run build

# Then deploy using wrangler
npx wrangler deploy
