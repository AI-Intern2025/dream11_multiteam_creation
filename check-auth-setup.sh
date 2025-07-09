#!/bin/bash

echo "🔍 Checking Auth.js Setup..."
echo ""

# Check if required dependencies are installed
echo "📦 Checking dependencies..."
if npm list next-auth >/dev/null 2>&1; then
    echo "✅ next-auth installed"
else
    echo "❌ next-auth not installed"
fi

if npm list @auth/pg-adapter >/dev/null 2>&1; then
    echo "✅ @auth/pg-adapter installed"
else
    echo "❌ @auth/pg-adapter not installed"
fi

if npm list pg >/dev/null 2>&1; then
    echo "✅ pg installed"
else
    echo "❌ pg not installed"
fi

echo ""

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -f .env.local ]; then
    echo "✅ .env.local file exists"
    
    if grep -q "NEXTAUTH_URL" .env.local; then
        echo "✅ NEXTAUTH_URL configured"
    else
        echo "❌ NEXTAUTH_URL missing"
    fi
    
    if grep -q "NEXTAUTH_SECRET" .env.local; then
        echo "✅ NEXTAUTH_SECRET configured"
    else
        echo "❌ NEXTAUTH_SECRET missing"
    fi
    
    if grep -q "GOOGLE_CLIENT_ID" .env.local; then
        echo "✅ GOOGLE_CLIENT_ID configured"
    else
        echo "❌ GOOGLE_CLIENT_ID missing"
    fi
    
    if grep -q "DATABASE_URL" .env.local; then
        echo "✅ DATABASE_URL configured"
    else
        echo "❌ DATABASE_URL missing"
    fi
else
    echo "❌ .env.local file not found"
fi

echo ""

# Check required files
echo "📁 Checking required files..."
files=(
    "lib/auth.ts"
    "app/api/auth/[...nextauth]/route.ts"
    "components/providers.tsx"
    "middleware.ts"
    "types/auth.d.ts"
    "database/setup.sql"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "🚀 Next steps:"
echo "1. Set up Google OAuth in Google Cloud Console"
echo "2. Create a Neon PostgreSQL database"
echo "3. Run the SQL script in database/setup.sql"
echo "4. Update .env.local with your actual values"
echo "5. Start the development server: npm run dev"
echo ""
echo "📖 For detailed instructions, see AUTH_SETUP.md"
