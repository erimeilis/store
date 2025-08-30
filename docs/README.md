# Documentation

This directory contains detailed documentation for the Store CRUD application.

## 📖 Available Guides

### **[Development Guide](DEVELOPMENT.md)**
Complete development setup, database commands, testing, and troubleshooting.

### **[API Reference](API.md)**  
Full API documentation with examples for all endpoints, authentication, and error handling.

### **[Deployment Guide](DEPLOYMENT_GUIDE.md)**
Step-by-step deployment instructions for all environments with migration and seeding procedures.

### **[Environment Setup](ENVIRONMENTS.md)**
Detailed explanation of the three-environment setup (Local SQLite, D1 Preview, D1 Production).

### **[Token Security](TOKEN_SECURITY.md)**
Authentication system documentation including token types, permissions, and security features.

## 🎯 Quick References

**Start Development:**
```bash
npm run dev:fullstack          # Local development
npm run dev:fullstack:remote   # Remote D1 development
```

**Database Operations:**
```bash
npm run db:seed                # Add 205 test items
npm run db:studio              # Visual database browser
```

**Deployment:**
```bash
npm run deploy:fullstack       # Deploy everything to production
```

**API Testing:**
```bash
curl -H "Authorization: Bearer 35890e45a5122de41a406cdaa290e711404c1292205b6ad4a10514228df378ce" \
     http://localhost:8787/api/items
```

## 📋 Architecture Summary

- **Backend**: Hono + Prisma + Cloudflare D1/R2/KV
- **Frontend**: React SSR + TailwindCSS + DaisyUI  
- **Database**: 205 realistic items across 10+ categories
- **Authentication**: Google OAuth + Bearer tokens
- **Deployment**: Cloudflare Workers