# 🚀 NOTELA Deployment Guide

## Option 1: Railway (Recommended for SQLite)

### Prerequisites
- GitHub account
- Git installed

### Steps:

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NOTELA app with SQLite + Prisma"
   ```

2. **Push to GitHub**
   - Create new repository on GitHub
   - Add remote and push:
   ```bash
   git remote add origin https://github.com/yourusername/notela.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your notela repository
   - Railway will auto-detect Next.js and deploy!

4. **Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add: `DATABASE_URL=file:./production.db`
   - Add: `NODE_ENV=production`

### ✅ Done! Your app will be live at `yourapp.railway.app`

---

## Option 2: Render

1. **Push to GitHub** (same as above)
2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Connect GitHub account
   - New → Web Service
   - Select your repository
   - Environment: Node
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

3. **Add Environment Variables**
   - `DATABASE_URL=file:./production.db`
   - `NODE_ENV=production`

4. **Enable Persistent Disk** (Important for SQLite!)
   - In Render dashboard, go to Environment
   - Add Disk: Mount Path = `/opt/render/project/src`
   - Size: 1GB (free tier)

---

## Option 3: DigitalOcean App Platform

1. **Push to GitHub** (same as above)
2. **Deploy to DigitalOcean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Apps → Create App
   - Connect GitHub repository
   - Configure:
     - Build Command: `pnpm install && pnpm build`
     - Run Command: `pnpm start`

3. **Environment Variables**
   - `DATABASE_URL=file:./production.db`
   - `NODE_ENV=production`

---

## Option 4: VPS (Most Control)

### Providers: DigitalOcean Droplet, Linode, Vultr ($5/month)

1. **Setup Server**
   ```bash
   # SSH into your server
   ssh root@your-server-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install pnpm
   npm install -g pnpm
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy App**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/notela.git
   cd notela
   
   # Install dependencies
   pnpm install
   
   # Set environment variables
   echo "DATABASE_URL=file:./production.db" > .env
   echo "NODE_ENV=production" >> .env
   
   # Build and start
   pnpm build
   pm2 start "pnpm start" --name notela
   pm2 startup
   pm2 save
   ```

3. **Setup Reverse Proxy (Nginx)**
   ```bash
   sudo apt install nginx
   # Configure nginx to proxy to localhost:3000
   ```

---

## 🔧 Database Notes

- **SQLite file location**: The database will be created automatically on first run
- **Persistence**: Make sure your hosting provider supports persistent storage
- **Backups**: Consider setting up automated database backups for production

## 🎯 Recommended: Start with Railway

Railway is the easiest for SQLite apps:
- Zero configuration
- Automatic HTTPS
- Built-in database persistence
- Great for indie projects
- $5/month for unlimited usage
