<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Messenger Inbox SaaS

A powerful SaaS tool to centralize your Facebook Page inboxes, send bulk messages, and supercharge your customer engagement.

## 🚀 Features

- **Unified Inbox**: Manage all Facebook page conversations in one place
- **Real-time Messaging**: Instant message delivery and updates
- **Broadcast System**: Send bulk messages with scheduling and templates
- **AI-Powered Replies**: Smart reply suggestions using Gemini AI
- **Multi-tenant Architecture**: Support for multiple users and pages
- **Admin Dashboard**: User management and analytics
- **Facebook Policy Compliance**: 24-hour window and message tag support

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account
- Facebook Developer account
- Google Cloud account (for Gemini AI)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd copy-of-messenger-inbox-saas
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FACEBOOK_APP_ID=your_facebook_app_id
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the database migrations from `schema.sql`
3. Deploy edge functions:
   ```bash
   supabase functions deploy
   ```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Configure Supabase**:
   - Update Supabase project settings with production URLs
   - Deploy edge functions to production

### Environment Variables for Production

Set these in your Vercel dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `FACEBOOK_APP_ID`
- `GEMINI_API_KEY`

## 📚 API Documentation

### Edge Functions

- `send-message`: Send messages via Facebook API
- `create-broadcast`: Create and schedule broadcasts
- `connect-page`: Connect new Facebook pages
- `disconnect-page`: Remove Facebook page connections

### Database Schema

Key tables:
- `users`: User accounts and profiles
- `pages`: Connected Facebook pages
- `conversations`: Message threads
- `messages`: Individual messages
- `broadcasts`: Bulk message campaigns

## 🔒 Security

- Page access tokens never sent to client
- All sensitive operations via Edge Functions
- Row Level Security (RLS) enabled
- User authentication required

## 📱 Facebook Integration

- Supports multiple page connections
- Real-time webhook processing
- Policy compliance (24-hour window)
- Message tagging system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
