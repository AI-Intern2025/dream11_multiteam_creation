# Authentication Setup Guide

This guide will help you set up Google OAuth authentication with role-based access control using Auth.js and Neon PostgreSQL database.

## Prerequisites

1. **Google OAuth Application**
2. **Neon PostgreSQL Database**
3. **Environment Variables**

## Step 1: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. For OAuth 2.0 Client IDs:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`

## Step 2: Neon Database Setup

1. Create a [Neon](https://neon.tech/) account
2. Create a new database project
3. Copy the connection string
4. Run the SQL commands from `/database/setup.sql` in your Neon SQL Editor

**Note**: This setup uses JWT strategy for sessions, so only a simple users table is needed for role management.

## Step 3: Environment Variables

Update your `.env.local` file with the following values:

```env
# Auth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-strong-secret-key-here

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Neon Database Configuration
DATABASE_URL=your-neon-database-connection-string
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 4: Database Migration

1. Open your Neon database console
2. Run the SQL commands from `/database/setup.sql`
3. Update the admin email in the SQL script to your Google account email
4. Execute the script

## Step 5: Test Authentication

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign In" and authenticate with Google
4. The first user with the admin email will have admin privileges
5. Admin users can access `/admin` and manage other users

## Features

### User Roles
- **User**: Default role for all new signups
- **Admin**: Can access admin dashboard and manage users

### Protected Routes
- `/admin/*` - Admin only
- Middleware automatically redirects unauthorized users

### Admin Capabilities
- View all users
- Promote users to admin
- Demote admins to users
- Cannot demote themselves

## Troubleshooting

### Common Issues

1. **"Configuration" error**
   - Check your environment variables
   - Ensure Google OAuth is properly configured

2. **Database connection errors**
   - Verify your Neon connection string
   - Check if the database tables exist

3. **Redirect URI mismatch**
   - Ensure the redirect URI in Google Console matches your NEXTAUTH_URL

4. **Admin access denied**
   - Verify your email is set as admin in the database
   - Check if you're signed in with the correct Google account

### Development vs Production

**Development:**
- NEXTAUTH_URL: `http://localhost:3000`
- Google redirect URI: `http://localhost:3000/api/auth/callback/google`

**Production:**
- NEXTAUTH_URL: `https://yourdomain.com`
- Google redirect URI: `https://yourdomain.com/api/auth/callback/google`

## Security Notes

1. Keep your `NEXTAUTH_SECRET` secure and unique
2. Use HTTPS in production
3. Regularly rotate OAuth secrets
4. Monitor admin user activities
5. The database stores minimal user information (email, role, OAuth data)

## File Structure

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts    # Auth.js API route
│   ├── api/admin/users/route.ts           # User management API
│   ├── auth/signin/page.tsx               # Custom sign-in page
│   ├── auth/error/page.tsx                # Auth error page
│   ├── admin/page.tsx                     # Admin dashboard
│   └── unauthorized/page.tsx              # Access denied page
├── lib/auth.ts                            # Auth configuration
├── components/
│   ├── providers.tsx                      # Session provider
│   └── user-nav.tsx                       # User navigation
├── middleware.ts                          # Route protection
├── types/auth.d.ts                        # TypeScript definitions
└── database/setup.sql                     # Database schema
```
