-- Messenger Inbox SaaS Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_plan AS ENUM ('Free', 'Starter', 'Growth', 'Scale');
CREATE TYPE user_status AS ENUM ('Active', 'Suspended', 'Trial');
CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'read');
CREATE TYPE message_direction AS ENUM ('in', 'out');
CREATE TYPE window_state AS ENUM ('inside24h', 'outside24h');
CREATE TYPE broadcast_status AS ENUM ('Sent', 'Scheduled', 'Draft', 'Failed', 'In Progress', 'Cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE saas_users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    plan user_plan DEFAULT 'Free',
    message_usage BIGINT DEFAULT 0,
    message_quota BIGINT DEFAULT 1000,
    status user_status DEFAULT 'Trial',
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days')
);

-- Facebook Pages
CREATE TABLE pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id TEXT UNIQUE NOT NULL, -- Facebook Page ID
    name TEXT NOT NULL,
    avatar_url TEXT,
    page_access_token TEXT NOT NULL, -- Encrypted in production
    user_id UUID REFERENCES saas_users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles (Facebook users)
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    psid TEXT UNIQUE NOT NULL, -- Page-Scoped ID from Facebook
    name TEXT NOT NULL,
    avatar_url TEXT,
    email TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Conversations
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES saas_users(id) ON DELETE CASCADE NOT NULL,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    labels TEXT[] DEFAULT '{}',
    assigned_agent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    direction message_direction NOT NULL,
    text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    tag TEXT,
    window_state window_state NOT NULL,
    status message_status DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    api_response JSONB,
    user_id UUID REFERENCES saas_users(id) ON DELETE CASCADE NOT NULL
);

-- Broadcasts
CREATE TABLE broadcasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES saas_users(id) ON DELETE CASCADE NOT NULL,
    campaign_name TEXT NOT NULL,
    audience TEXT,
    status broadcast_status DEFAULT 'Draft',
    progress INTEGER DEFAULT 0,
    message TEXT NOT NULL,
    tag TEXT,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    time_spent TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    analytics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_conversations_page_id ON conversations(page_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_broadcasts_page_id ON broadcasts(page_id);
CREATE INDEX idx_broadcasts_user_id ON broadcasts(user_id);
CREATE INDEX idx_broadcasts_status ON broadcasts(status);

-- Create view for admin dashboard
CREATE VIEW saas_users_view AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.avatar_url,
    u.plan,
    u.message_usage,
    u.message_quota,
    COUNT(p.id) as connected_pages_count,
    ARRAY_AGG(
        CASE WHEN p.id IS NOT NULL THEN
            json_build_object(
                'id', p.id,
                'name', p.name,
                'avatar_url', p.avatar_url,
                'followers', 0 -- You can add this field later
            )
        END
    ) FILTER (WHERE p.id IS NOT NULL) as connected_pages,
    u.status,
    u.joined_date,
    u.last_active,
    u.trial_ends_at
FROM saas_users u
LEFT JOIN pages p ON u.id = p.user_id
GROUP BY u.id, u.name, u.email, u.avatar_url, u.plan, u.message_usage, u.message_quota, u.status, u.joined_date, u.last_active, u.trial_ends_at;

-- Row Level Security (RLS) Policies
ALTER TABLE saas_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON saas_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON saas_users
    FOR UPDATE USING (auth.uid() = id);

-- Pages policies
CREATE POLICY "Users can view own pages" ON pages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages" ON pages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages" ON pages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages" ON pages
    FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Broadcasts policies
CREATE POLICY "Users can view own broadcasts" ON broadcasts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own broadcasts" ON broadcasts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own broadcasts" ON broadcasts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own broadcasts" ON broadcasts
    FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies (read-only for now)
CREATE POLICY "Users can view user profiles" ON user_profiles
    FOR SELECT USING (true);

-- Functions for admin operations
CREATE OR REPLACE FUNCTION add_message_quota(user_id_in UUID, credits_to_add BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE saas_users 
    SET message_quota = message_quota + credits_to_add
    WHERE id = user_id_in;
END;
$$;

CREATE OR REPLACE FUNCTION change_user_plan(user_id_in UUID, new_plan user_plan)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE saas_users 
    SET plan = new_plan
    WHERE id = user_id_in;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broadcasts_updated_at BEFORE UPDATE ON broadcasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (you'll need to create this user in Supabase Auth first)
-- INSERT INTO saas_users (id, name, email, plan, message_quota, status) 
-- VALUES ('your-admin-user-id', 'Admin User', 'admin@admin.com', 'Scale', 10000000, 'Active');