# Deployment Guide - Fortify DeFi UI

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier available)

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/fortify-defi-ui.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Environment Variables** (if needed)
   - In Vercel project settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_USE_MOCK_API=true
     NEXT_PUBLIC_API_URL=https://your-api-url.com/api
     ```

4. **Your app will be live at**: `https://your-project.vercel.app`

---

## Option 2: Netlify

### Steps

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `.next` folder, OR
   - Connect GitHub repo for continuous deployment

3. **Build settings** (if using GitHub)
   - Build command: `npm run build`
   - Publish directory: `.next`

---

## Option 3: Self-Hosted (VPS/Docker)

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Build
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   # Production
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Update next.config.js**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     output: 'standalone', // Add this for Docker
   }
   module.exports = nextConfig
   ```

3. **Build and run**
   ```bash
   docker build -t fortify-defi-ui .
   docker run -p 3000:3000 fortify-defi-ui
   ```

---

## Option 4: Traditional VPS (PM2)

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js and dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and setup**
   ```bash
   git clone https://github.com/yourusername/fortify-defi-ui.git
   cd fortify-defi-ui
   npm install
   npm run build
   ```

4. **Install PM2**
   ```bash
   npm install -g pm2
   ```

5. **Start with PM2**
   ```bash
   pm2 start npm --name "fortify-defi" -- start
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx reverse proxy** (optional)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Pre-Deployment Checklist

- [ ] Test build locally: `npm run build && npm start`
- [ ] Verify all environment variables are set
- [ ] Check that mock API mode works (if using)
- [ ] Test wallet connection on target network
- [ ] Verify responsive design on mobile
- [ ] Check all pages load correctly
- [ ] Test demo mode functionality
- [ ] Review console for errors

---

## Environment Variables Reference

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_USE_MOCK_API=true

# Wallet Configuration (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

---

## Troubleshooting

### Build fails
- Check Node.js version (requires 18+)
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Wallet connection issues
- Ensure HTTPS in production (required for wallet connections)
- Check network configuration in wagmi config

### API errors
- Verify `NEXT_PUBLIC_USE_MOCK_API=true` is set for demo
- Check CORS settings if using real API

---

## Quick Deploy Commands

### Vercel CLI (Alternative)
```bash
npm i -g vercel
vercel
```

### Netlify CLI
```bash
npm i -g netlify-cli
netlify deploy --prod
```

