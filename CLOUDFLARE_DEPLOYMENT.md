# Cloudflare Deployment Configuration

## Issue
The deployment was failing because Cloudflare was running `npx wrangler deploy` directly without building the React Router application first.

## Solution
The deployment command in Cloudflare Pages needs to be changed to run the build before deploying.

### Cloudflare Pages Build Configuration

In your Cloudflare Pages project settings, update the **Build command** to:

```
npm run deploy
```

Or alternatively:

```
npm run build && npx wrangler deploy
```

### What This Does

1. **`npm run build`** - Runs `react-router build` which:
   - Compiles the React application
   - Generates the server build with the `virtual:react-router/server-build` module
   - Creates the necessary files in `build/server/` and `build/client/`

2. **`npx wrangler deploy`** - Deploys the built application to Cloudflare Workers

### Why the Previous Configuration Failed

The `virtual:react-router/server-build` is a virtual module created by the React Router build process. When Wrangler tried to bundle `workers/app.ts` without running the build first, this module didn't exist yet, causing the error:

```
Could not resolve "virtual:react-router/server-build"
```

### Files Modified

1. **`package.json`** - Updated the `deploy` script to run build before deploy
2. **`wrangler.json`** - Removed the `build` configuration (it's ignored when using Vite anyway)

### Next Steps

1. Commit and push these changes to your repository
2. In Cloudflare Pages dashboard, go to your project settings
3. Update the **Build command** to: `npm run deploy`
4. Trigger a new deployment

The deployment should now succeed! 🚀
