# Render Deployment Guide

## Backend Deployment (Python Flask API)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub account
- Connect your GitHub repository

### 2. Deploy Backend Service
- Click "New +" → "Web Service"
- Connect to GitHub repository: `billewood/life_risk_estimator`
- Select branch: `main`
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `python api/mortality_api.py`

### 3. Environment Variables
- `ENVIRONMENT`: `production`
- `PORT`: (Render sets this automatically)

### 4. Get Backend URL
- After deployment, copy the service URL (e.g., `https://your-app-name.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Update Environment Variables
- Go to Vercel dashboard
- Select your project
- Go to Settings → Environment Variables
- Add: `BACKEND_URL` = `https://your-backend-url.onrender.com`

### 2. Redeploy
- Trigger a new deployment in Vercel
- The frontend will now connect to the Render backend

## Testing
- Frontend: `https://your-vercel-app.vercel.app`
- Backend: `https://your-backend-url.onrender.com/api/health`

## Cost
- **Render**: Free tier (512MB RAM, 0.1 CPU)
- **Vercel**: Free tier for frontend
- **Total**: $0/month
