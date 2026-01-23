# Setup Guide

## Prerequisites
- Node.js v18 or later
- npm or yarn

## Local Development

1. Navigate to the `web` directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.dev.vars` file in the `web` directory for your local environment variables:
   ```ini
   QWEN_API_KEY=your_actual_api_key_here
   QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   This will start both the frontend (Vite) and the backend (Wrangler Functions) locally.

## Deployment to Cloudflare Pages

1. **GitHub Integration (Recommended)**:
   - Push this repository to GitHub.
   - Go to Cloudflare Dashboard > Pages.
   - Connect your GitHub repository.
   - **Build settings**:
     - Framework preset: Vite
     - Build command: `npm run build`
     - Build output directory: `dist`
     - **Root directory**: `web` (Important!)
   - **Environment variables**:
     - Add `QWEN_API_KEY` and `QWEN_BASE_URL` in the Settings > Environment variables section.

2. **CLI Deployment**:
   ```bash
   cd web
   npm run deploy
   ```
