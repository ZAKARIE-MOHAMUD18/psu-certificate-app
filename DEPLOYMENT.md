# PSU Certificate System - Deployment Guide

## Backend Deployment (Render)

### 1. Create Render Account
- Go to [render.com](https://render.com) and sign up
- Connect your GitHub account

### 2. Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `psu-certificate-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 app:app`

### 3. Add Environment Variables
```
FLASK_ENV=production
DATABASE_URL=sqlite:////opt/render/project/src/data/database.sqlite
FLASK_SECRET_KEY=<generate-random-key>
JWT_SECRET_KEY=<generate-random-key>
CORS_ORIGINS=https://your-netlify-app.netlify.app
```

### 4. Add Persistent Disk
- Go to your service → Settings → Disks
- Add disk: Mount Path `/opt/render/project/src/data`, Size: 1GB

---

## Frontend Deployment (Netlify)

### 1. Create Netlify Account
- Go to [netlify.com](https://netlify.com) and sign up
- Connect your GitHub account

### 2. Deploy Frontend
1. Click "Add new site" → "Import an existing project"
2. Choose GitHub and select your repository
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### 3. Add Environment Variables
- Go to Site settings → Environment variables
- Add:
```
VITE_API_URL=https://your-render-backend.onrender.com
```

### 4. Update Backend CORS
- Update your Render backend environment variable:
```
CORS_ORIGINS=https://your-netlify-app.netlify.app
```

---

## Quick Deploy Commands

### Backend (Render)
```bash
# Your backend will auto-deploy when you push to main branch
git add backend/
git commit -m "Deploy backend"
git push origin main
```

### Frontend (Netlify)
```bash
# Your frontend will auto-deploy when you push to main branch
git add frontend/
git commit -m "Deploy frontend"
git push origin main
```

---

## URLs After Deployment
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-name.onrender.com`
- **Admin Login**: `https://your-app-name.netlify.app/admin/login`

## Test Deployment
1. Visit your frontend URL
2. Try certificate verification with ID: `PSU-XXXX`
3. Login as admin: `admin` / `admin123`
4. Issue a new certificate
5. Download PDF and verify QR code