#!/bin/bash

# Temple MVP Deployment Script for Vercel

echo "🚀 Deploying Temple MVP to Vercel..."

# Step 1: Login to Vercel
echo "📝 Step 1: Login to Vercel"
echo "Please run: vercel login"
echo "Visit the URL shown in your browser to authenticate"
echo ""

# Step 2: Deploy the project
echo "🏗️ Step 2: Deploying to Vercel..."
cd app
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Vercel project dashboard"
echo "2. Add environment variables in Settings > Environment Variables:"
echo "   - DATABASE_URL (from Vercel Postgres)"
echo "   - RAZORPAY_KEY_ID"
echo "   - RAZORPAY_KEY_SECRET"
echo "   - NEXT_PUBLIC_RAZORPAY_KEY_ID"
echo "   - WHATSAPP_API_URL"
echo "   - WHATSAPP_API_KEY"
echo "   - WHATSAPP_PHONE_NUMBER"
echo "3. Set up Vercel Postgres database"
echo "4. Run database migrations if needed"
echo ""
echo "🌐 Your temple app will be live at: https://your-app-name.vercel.app"