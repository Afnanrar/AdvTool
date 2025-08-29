# 🚀 Deployment Checklist

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Git repository created on GitHub
- [ ] Supabase account
- [ ] Vercel account
- [ ] Facebook Developer account
- [ ] Google Cloud account (for Gemini AI)

## 📋 Step-by-Step Deployment Guide

### 1. **Supabase Setup**

1. **Create Supabase Project**
   - [ ] Go to [supabase.com](https://supabase.com)
   - [ ] Create new project
   - [ ] Note down your Project URL and anon key

2. **Run Database Schema**
   - [ ] Go to SQL Editor in Supabase dashboard
   - [ ] Copy and paste contents from `schema.sql`
   - [ ] Execute the script

3. **Configure Authentication**
   - [ ] Go to Authentication > Settings
   - [ ] Set site URL to your production domain
   - [ ] Enable email confirmations (optional)

4. **Deploy Edge Functions**
   ```bash
   npx supabase login
   npx supabase functions deploy --project-ref your-project-ref
   ```

### 2. **Facebook App Setup**

1. **Create Facebook App**
   - [ ] Go to [developers.facebook.com](https://developers.facebook.com)
   - [ ] Create new app
   - [ ] Add Messenger product
   - [ ] Note down App ID

2. **Configure Webhook**
   - [ ] Set webhook URL to: `https://your-supabase-url.supabase.co/functions/v1/facebook-webhook`
   - [ ] Set verify token (any string you choose)
   - [ ] Subscribe to page events

### 3. **Environment Variables**

Create `.env.local` file with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
FACEBOOK_APP_ID=your-facebook-app-id
GEMINI_API_KEY=your-gemini-api-key
```

### 4. **Deploy to Vercel**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - [ ] Go to [vercel.com](https://vercel.com)
   - [ ] Import your GitHub repository
   - [ ] Add environment variables in project settings
   - [ ] Deploy

3. **Configure Environment Variables in Vercel**
   - [ ] `SUPABASE_URL`
   - [ ] `SUPABASE_ANON_KEY`
   - [ ] `FACEBOOK_APP_ID`
   - [ ] `GEMINI_API_KEY`

### 5. **Post-Deployment Setup**

1. **Update Supabase Settings**
   - [ ] Add your Vercel domain to allowed origins
   - [ ] Update site URL in auth settings

2. **Create Admin User**
   - [ ] Sign up through your deployed app
   - [ ] Get user ID from Supabase auth dashboard
   - [ ] Update the user in `saas_users` table to have admin email

3. **Test Facebook Integration**
   - [ ] Connect a test Facebook page
   - [ ] Send test messages
   - [ ] Verify webhook is working

## 🔧 Common Issues & Solutions

### Issue: Environment variables not working
**Solution**: Make sure to restart Vercel deployment after adding env vars

### Issue: Supabase functions not working
**Solution**: Ensure you've deployed functions and set SUPABASE_SERVICE_ROLE_KEY

### Issue: Facebook webhook verification failed
**Solution**: Check webhook URL and verify token match exactly

### Issue: CORS errors
**Solution**: Add your domain to Supabase allowed origins

## 🎯 Production Checklist

- [ ] SSL certificate enabled (automatic with Vercel)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Facebook webhook configured
- [ ] Admin user created
- [ ] Test all major features
- [ ] Monitor error logs

## 📱 Testing Your Deployment

1. **Authentication**
   - [ ] Sign up new user
   - [ ] Login existing user
   - [ ] Password reset (if enabled)

2. **Facebook Integration**
   - [ ] Connect Facebook page
   - [ ] Send messages
   - [ ] Receive messages
   - [ ] Disconnect page

3. **Broadcast System**
   - [ ] Create broadcast
   - [ ] Schedule broadcast
   - [ ] Cancel broadcast
   - [ ] View broadcast history

4. **Admin Features**
   - [ ] View user dashboard
   - [ ] Update user credits
   - [ ] Change user plans
   - [ ] User impersonation

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check browser console for errors
4. Review this checklist again

Your app should now be fully deployed and functional! 🎉
