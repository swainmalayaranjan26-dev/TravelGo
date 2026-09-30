# Deploying TravelGo to Vercel 🚀

Your TravelGo fullstack project is configured and ready for **Vercel Serverless & Edge deployment**.

---

## 📁 What was configured for Vercel

1. **Serverless API Entrypoint (`api/index.js`)**:
   - Bridges your Express backend directly to Vercel's serverless function runtime.
2. **Vercel Routing (`vercel.json`)**:
   - Routes `/api/*` requests to the serverless function.
   - Serves all frontend assets (`index.html`, `admin.html`, `admin-login.html`, `css/`, `js/`) via Vercel's Edge CDN.
3. **Serverless Database Initialization**:
   - Neon PostgreSQL schemas and data are initialized lazily upon incoming requests with connection pooling optimization.
4. **CORS Enabled**:
   - Headers allow frontend-backend communication across custom domains or preview URLs.
5. **Git & Deploy Hygiene (`.gitignore` & `.vercelignore`)**:
   - Excludes `node_modules/`, `.env`, and local logs from deployments.

---

## 🛠️ Deployment Steps

### Method 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   cd Travelgo
   git init
   git add .
   git commit -m "Deploy TravelGo to Vercel"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import Project into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - If your repository contains the `Travelgo` subfolder, set **Root Directory** to `Travelgo`. (If your repo root is already inside the project, leave it as `./`).

3. **Configure Environment Variables**:
   In the **Environment Variables** section on Vercel, add:
   - **`DATABASE_URL`**:
     ```text
     postgresql://neondb_owner:npg_eELJKN9HtWA3@ep-spring-violet-b3p59pyl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
   *(Or your custom Neon PostgreSQL pooled connection string)*

4. **Click Deploy**:
   - Vercel will build and assign you a live HTTPS domain (e.g., `https://travelgo-xyz.vercel.app`).

---

### Method 2: Deploy via Vercel CLI

If you have the Vercel CLI installed:

```bash
# 1. Navigate to the project directory
cd c:\Users\swain\OneDrive\Desktop\Travelgo\Travelgo

# 2. Login to Vercel
npx vercel login

# 3. Deploy preview
npx vercel

# 4. Deploy directly to production
npx vercel --prod
```

When prompted:
- **Set up and deploy?** -> `y`
- **Which scope?** -> Select your account
- **Link to existing project?** -> `n`
- **What's your project's name?** -> `travelgo`
- **In which directory is your code located?** -> `./`
- **Want to modify settings?** -> `n`

After the first deployment:
1. Go to your project on [vercel.com](https://vercel.com) -> **Settings** -> **Environment Variables**.
2. Add `DATABASE_URL` with your Neon connection string.
3. Redeploy or run `npx vercel --prod` to apply the environment variable.

---

## 🧪 Testing Your Live Deployment

Once deployed, you can verify your deployment:
- **Home Portal**: `https://<your-project>.vercel.app/`
- **Admin Login**: `https://<your-project>.vercel.app/admin-login.html`
- **Admin Dashboard**: `https://<your-project>.vercel.app/admin.html`
- **API Health Check**: `https://<your-project>.vercel.app/api/health`
