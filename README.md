# Fortify DeFi UI

Production-grade, hackathon demo-ready web app UI for Fortify DeFi protocol.

## Features

- **Dashboard**: Risk-aware portfolio overview with smart recommendations
- **Vaults**: Insured and uninsured yield vaults with dynamic risk pricing
- **Insurance**: Coverage purchase and claims workflow
- **Governance**: DAO voting for claims and parameter proposals
- **Risk Analytics**: Comprehensive risk score breakdowns and visualizations
- **Demo Mode**: Admin controls for simulating events and fast-forwarding claims

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- wagmi + viem (wallet integration)
- Framer Motion (animations)
- Recharts (data visualization)
- Zustand (state management)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Quick Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/fortify-defi-ui.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js - just click "Deploy"
   - Your app will be live in ~2 minutes!

3. **Set Environment Variables** (in Vercel project settings)
   - `NEXT_PUBLIC_USE_MOCK_API=true` (for demo mode)
   - `NEXT_PUBLIC_API_URL=your-api-url` (if using real API)

**That's it!** Your app will be live at `https://your-project.vercel.app`

For other deployment options (Netlify, Docker, VPS), see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Environment Variables

- `NEXT_PUBLIC_USE_MOCK_API=true` - Toggle mock API mode (default: true for demo)

## Demo Mode

Toggle Demo Mode in the header to enable:
- Simulate loss events
- Fast-forward claim statuses
- View pre-filled sample data
- Access admin controls

