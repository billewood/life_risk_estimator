# Deployment Strategy

## Current Production Setup

**Frontend**: Vercel (billewood.com)  
**Backend**: Render (life-risk-estimator.onrender.com)  
**Domain**: Porkbun (billewood.com)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                 │
│                          │                                   │
│                          ▼                                   │
│              billewood.com (Vercel)                          │
│                    Next.js Frontend                          │
│                          │                                   │
│                          ▼                                   │
│              /api/calculate (Next.js API Route)              │
│                          │                                   │
│                          ▼                                   │
│     life-risk-estimator.onrender.com (Render)               │
│                 Python Flask Backend                         │
│              /api/calculate-risk endpoint                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Vercel (Frontend)
```bash
BACKEND_URL=https://life-risk-estimator.onrender.com
```

### Render (Backend)
```bash
FLASK_ENV=production
PORT=5001
```

---

## Deployment Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes, commit, and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push -u origin feature/your-feature
   ```

3. **Create a Pull Request** on GitHub:
   - Go to: https://github.com/billewood/life_risk_estimator
   - Click "Compare & pull request"
   - Set base to `main`
   - Vercel automatically creates a preview deployment

4. **Test the preview** (Vercel comments with preview URL on the PR)

5. **Merge to main** when ready:
   - Click "Merge pull request" on GitHub
   - Vercel automatically redeploys billewood.com
   - Render automatically redeploys the backend (if backend files changed)

---

## Service Details

### Vercel (Frontend)
- **Dashboard**: https://vercel.com/dashboard
- **Domain**: billewood.com
- **Auto-deploys**: On push to `main` branch
- **Preview deploys**: On pull requests

### Render (Backend)
- **Dashboard**: https://dashboard.render.com
- **URL**: https://life-risk-estimator.onrender.com
- **Health check**: https://life-risk-estimator.onrender.com/api/health
- **Auto-deploys**: On push to `main` branch (backend directory)

### Porkbun (Domain)
- **Dashboard**: https://porkbun.com/account/domainsSpe498
- **DNS**: A record pointing to Vercel

---

## Testing Endpoints

### Backend Health Check
```bash
curl https://life-risk-estimator.onrender.com/api/health
```

### Full Calculation Test
```bash
curl -X POST https://life-risk-estimator.onrender.com/api/calculate-risk \
  -H "Content-Type: application/json" \
  -d '{"age": 45, "sex": "male", "race": "white", "risk_factors": {}}'
```

---

## Cost

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Free/Hobby | $0/month |
| Render | Free tier | $0/month |
| Porkbun | Domain | ~$10/year |

**Note**: Render free tier may spin down after inactivity. First request after idle period may take 30-60 seconds.

---

## Troubleshooting

### "Python backend not running" error
- Check Render dashboard for deployment status
- Test health endpoint: `curl https://life-risk-estimator.onrender.com/api/health`
- Check Render logs for errors

### Preview deployment not appearing
- Ensure PR is created on GitHub
- Check Vercel dashboard → Deployments tab
- Vercel should comment on the PR with preview URL

### Domain not working
- Check DNS propagation: https://dnschecker.org
- Verify Vercel domain settings
- Check Porkbun DNS records

---

## Security Notes

- No sensitive user data is stored
- All calculations use public health data
- HTTPS everywhere
- Environment variables protected in Vercel/Render dashboards
