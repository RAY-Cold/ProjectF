# Quick Start Guide - Fortify DeFi UI

## Prerequisites

Make sure you have these installed:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

Check if you have them:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## Step-by-Step Setup

### 1. Open Terminal/Command Prompt

- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

### 2. Navigate to Your Project Folder

```bash
# Navigate to where you want the project
cd Desktop/D

# Or if you're already in the project folder, you're good!
```

### 3. Install Dependencies

This downloads all the required packages (Next.js, React, Tailwind, etc.):

```bash
npm install
```

**This will take 2-5 minutes** - you'll see a lot of text scrolling. Wait for it to finish.

### 4. Start the Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X seconds
```

### 5. Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

**That's it!** Your app should be running! 🎉

---

## Troubleshooting

### Error: "npm: command not found"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installing

### Error: "Cannot find module"
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

### Port 3000 already in use
- Close other apps using port 3000, OR
- Run on a different port: `npm run dev -- -p 3001`

### Build errors
```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

---

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint
```

---

## What You Should See

When you open `http://localhost:3000`, you should see:
- ✅ Dark-themed DeFi interface
- ✅ "Fortify DeFi" header with navigation
- ✅ Dashboard with risk score, metrics, and charts
- ✅ Wallet connect button (works even without real wallet in demo mode)

---

## Next Steps

1. **Connect Wallet** (optional) - Click "Connect Wallet" to see wallet integration
2. **Explore Pages** - Click through Dashboard, Vaults, Insurance, Governance, Risk Analytics, Docs
3. **Try Demo Mode** - Toggle "Demo Mode" in header to see admin controls
4. **Test Features**:
   - View vaults and filter them
   - Purchase insurance coverage
   - Submit a claim
   - Vote on governance proposals

---

## Need Help?

- Check the browser console (F12) for any errors
- Make sure all dependencies installed correctly
- Verify Node.js version is 18+

