# CORS Fix Deployment Guide

## Problem
CORS error: "Access to fetch at 'https://debate-app-1.onrender.com/debates/open' from origin 'https://debate-app-1.vercel.app' has been blocked by CORS policy"

## Root Cause
Backend CORS configuration was set to allow only backend URL instead of frontend URL.

## Changes Made

### Backend Changes (backend_node/.env)
```env
# Changed from:
CORS_ORIGIN=https://debate-app-1.onrender.com
NODE_ENV=development

# Changed to:
CORS_ORIGIN=https://debate-app-1.vercel.app
NODE_ENV=production
```

### Backend CORS Configuration (server.js)
- Enhanced CORS configuration to handle multiple origins
- Added proper preflight request handling
- Included all necessary headers and methods
- Updated Socket.IO CORS settings

### Frontend Environment (frontend/.env.local)
```env
# Changed from:
NEXT_PUBLIC_API_URL=http://localhost:5000

# Changed to:
NEXT_PUBLIC_API_URL=https://debate-app-1.onrender.com
```

## Deployment Steps

### 1. Backend (Render)
1. Push these changes to your GitHub repository
2. Render will automatically redeploy your backend
3. Verify the CORS_ORIGIN environment variable is set to: `https://debate-app-1.vercel.app`

### 2. Frontend (Vercel)
1. Push the frontend changes to GitHub
2. Vercel will automatically redeploy
3. Alternatively, set environment variables directly in Vercel dashboard:
   - NEXT_PUBLIC_API_URL: `https://debate-app-1.onrender.com`

### 3. Verification
After deployment, test:
- Visit https://debate-app-1.vercel.app
- Try to access debates page
- Check browser console for CORS errors (should be resolved)

## Additional Notes
- The server.js now supports multiple origins for development and production
- Socket.IO CORS is properly configured
- Environment variables are properly set for production mode