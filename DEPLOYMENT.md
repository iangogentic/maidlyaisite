# Maidly.ai MVP Operations System - Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- [x] Node.js 18+ installed
- [x] PostgreSQL database (Neon recommended)
- [x] Stripe account for payments
- [x] DeepSeek API key for AI features
- [x] Domain name and SSL certificate

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Stripe Configuration (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Configuration (REQUIRED for AI features)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password_here

# Optional: Email/SMS Services (for production notifications)
SENDGRID_API_KEY=your_sendgrid_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Database Setup

1. **Create Neon Database**
   ```bash
   # The app will automatically create tables on first run
   # Ensure DATABASE_URL is set correctly
   ```

2. **Initialize Tables**
   ```bash
   # Tables are created automatically via database-neon.ts
   # No manual migration needed
   ```

### Stripe Configuration

1. **Create Stripe Account**
   - Sign up at https://stripe.com
   - Get your API keys from the dashboard
   - Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

2. **Webhook Events to Enable**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`

### Deployment Options

#### Option 1: Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Set Environment Variables**
   ```bash
   # In Vercel dashboard, add all environment variables
   # Or use Vercel CLI:
   vercel env add DATABASE_URL
   vercel env add STRIPE_SECRET_KEY
   # ... add all other variables
   ```

3. **Configure Domain**
   - Add your custom domain in Vercel dashboard
   - Update NEXT_PUBLIC_APP_URL to match

#### Option 2: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t maidly-ai .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your_db_url" \
     -e STRIPE_SECRET_KEY="your_stripe_key" \
     -e DEEPSEEK_API_KEY="your_deepseek_key" \
     maidly-ai
   ```

#### Option 3: Traditional VPS

1. **Install Dependencies**
   ```bash
   npm install --production
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "maidly-ai" -- start
   pm2 startup
   pm2 save
   ```

### Post-Deployment Configuration

#### 1. Admin Access
- Navigate to `/admin`
- Use the ADMIN_PASSWORD from your environment variables
- Verify career applications and customer data are accessible

#### 2. Test Booking Flow
- Go to `/booking`
- Complete a test booking with Stripe test cards
- Verify booking appears in admin dashboard
- Check crew dashboard at `/crew`

#### 3. Stripe Webhook Testing
```bash
# Use Stripe CLI to test webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

#### 4. Database Verification
- Check that all tables are created in your database
- Verify sample data appears correctly
- Test AI preference learning with service completion

### Monitoring & Maintenance

#### Health Checks
- Monitor `/api/bookings` endpoint
- Check database connection
- Verify Stripe webhook delivery
- Monitor AI API usage (DeepSeek)

#### Regular Tasks
- Review booking data weekly
- Monitor payment processing
- Check AI learning effectiveness
- Update crew briefings based on feedback

#### Scaling Considerations
- Database connection pooling (already configured)
- CDN for static assets (Vercel handles this)
- Rate limiting for API endpoints
- Background job processing for notifications

### Security Checklist

- [x] Environment variables secured
- [x] Database connections encrypted
- [x] Stripe webhook signature verification
- [x] Admin password protection
- [x] HTTPS enforced
- [x] Input validation on all forms
- [x] SQL injection prevention (parameterized queries)

### Troubleshooting

#### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check DATABASE_URL format
   # Ensure database allows connections from your deployment IP
   ```

2. **Stripe Webhook Failures**
   ```bash
   # Verify webhook URL is accessible
   # Check STRIPE_WEBHOOK_SECRET matches Stripe dashboard
   ```

3. **AI Features Not Working**
   ```bash
   # Verify DEEPSEEK_API_KEY is valid
   # Check API quota and usage limits
   ```

4. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Performance Optimization

#### Production Optimizations
- Enable Next.js production optimizations
- Use CDN for static assets
- Implement database query optimization
- Add Redis for session storage (optional)

#### Monitoring
- Set up error tracking (Sentry recommended)
- Monitor API response times
- Track booking conversion rates
- Monitor AI API costs

### Support & Maintenance

#### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update AI prompts based on performance
- Refine booking flow based on user feedback

#### Backup Strategy
- Database backups (Neon handles this automatically)
- Environment variable backup
- Code repository backup (GitHub)

### Success Metrics

Track these KPIs post-deployment:
- Booking completion rate
- Payment success rate
- Customer satisfaction scores
- AI learning effectiveness
- Crew efficiency improvements
- System uptime and performance

---

## 🎉 Congratulations!

Your Maidly.ai MVP Operations System is now live! The system includes:

✅ **Complete Booking Flow** - 5-step process with real-time pricing
✅ **Stripe Payment Integration** - Secure payment processing
✅ **AI-Powered Crew Briefings** - Smart job preparation
✅ **Customer Preference Learning** - AI that improves over time
✅ **Admin Dashboard** - Complete operations management
✅ **Crew Mobile Interface** - Job management on-the-go
✅ **Automated Notifications** - Email/SMS confirmations
✅ **Database Schema** - Production-ready data structure

The system is designed to scale and can handle real customers immediately. Monitor the metrics above and iterate based on user feedback!
