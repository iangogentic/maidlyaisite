# Maidly.ai - Premium AI-Powered Home Cleaning

A production-grade marketing and recruiting website for Maidly.ai, featuring an AI assistant that remembers your cleaning preferences.

![Maidly.ai](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### 🎨 **Modern Design System**
- **Brand Colors**: Teal-clean primary with warm, professional palette
- **Typography**: General Sans display + Inter body fonts with fluid scaling
- **Components**: shadcn/ui with custom Maidly.ai styling
- **Animations**: Framer Motion micro-interactions and page transitions
- **Responsive**: Mobile-first design that works on all devices

### 🤖 **AI Demo Experience**
- **Interactive Chat**: Real-time conversation with AI assistant
- **Memory Ribbon**: Visual display of learned preferences
- **KPI Cards**: Live metrics with Recharts visualizations
- **State Management**: Zustand for client-side demo state

### 📱 **Complete Site Structure**
- **Homepage**: Hero, features, testimonials, and CTAs
- **How It Works**: AI explanation and 3-step process
- **Pricing**: Beta program tiers and add-ons
- **Careers**: Internship tracks and company culture
- **Tech Stack**: Architecture details for developers
- **Blog**: MDX-powered technical articles
- **Legal**: Privacy policy and terms of service
- **AI Demo**: Interactive assistant experience

### ⚡ **Performance & SEO**
- **Bundle Size**: Homepage ~237KB (within performance budget)
- **Core Web Vitals**: Optimized for LCP < 2.5s, CLS < 0.02
- **SEO**: Complete metadata, OpenGraph, JSON-LD structured data
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Analytics**: Ready for PostHog/Umami integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MaidlyReal

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the site.

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Or export static files
npm run build && npm run export
```

## 🛠 Tech Stack

### **Core Framework**
- **Next.js 15.4.6** - App Router, Server Components, TypeScript
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.0** - Strict mode enabled for type safety

### **Styling & UI**
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Framer Motion 12.23** - Animation and micro-interactions
- **Lucide React** - Beautiful, customizable icons

### **Content & Data**
- **MDX** - Markdown with React components for blog
- **Zod** - Schema validation for API routes
- **Zustand** - Lightweight state management
- **Recharts** - Data visualization for KPI cards

### **Development & Quality**
- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting (ready to configure)
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing with Tailwind

## 📁 Project Structure

```
MaidlyReal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Marketing pages group
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── how-it-works/   # AI explanation
│   │   │   ├── pricing/        # Beta pricing
│   │   │   ├── careers/        # Internships
│   │   │   ├── tech/           # Tech stack
│   │   │   ├── blog/           # MDX blog
│   │   │   ├── privacy/        # Legal pages
│   │   │   └── terms/
│   │   ├── demo/               # AI demo experience
│   │   ├── api/                # API routes
│   │   │   ├── chat/           # AI chat simulation
│   │   │   └── feedback/       # Contact form
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── sitemap.ts          # SEO sitemap
│   │   └── robots.ts           # SEO robots.txt
│   ├── components/             # React components
│   │   ├── marketing/          # Marketing pages
│   │   ├── ai/                 # AI demo components
│   │   ├── charts/             # Data visualization
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utilities
│   │   ├── site.ts             # Site configuration
│   │   ├── seo.ts              # SEO helpers
│   │   ├── analytics.ts        # Analytics wrapper
│   │   ├── validators.ts       # Zod schemas
│   │   └── demo-store.ts       # Demo state management
│   ├── content/                # MDX content
│   │   ├── blog/               # Blog posts
│   │   └── legal/              # Legal documents
│   └── styles/                 # Additional styles
│       └── prose.css           # MDX content styling
├── public/                     # Static assets
│   ├── avatars/                # User avatars
│   ├── logos/                  # Brand assets
│   └── og/                     # OpenGraph images
├── tailwind.config.ts          # Tailwind configuration
├── next.config.ts              # Next.js configuration
└── package.json                # Dependencies
```

## 🎨 Design System

### **Colors**
```css
--brand: 198 90% 40%           /* Teal-clean primary */
--ink: 220 15% 15%             /* Near-black text */
--muted: 210 16% 96%           /* Light backgrounds */
--ring: 198 90% 40%            /* Focus rings */
```

### **Typography**
- **Display**: Plus Jakarta Sans (headings, hero text)
- **Body**: Inter Variable (paragraphs, UI text)
- **Fluid Scaling**: `clamp()` based responsive typography

### **Spacing**
- **Base Unit**: 8pt grid system
- **Container**: 1200px max-width
- **Sections**: 16-24 vertical padding

### **Components**
- **Buttons**: Rounded-md, focus rings, hover states
- **Cards**: Rounded-xl, subtle shadows, glass effects
- **Forms**: Consistent focus states, validation styling

## 🔧 Configuration

### **Environment Variables**
Create `.env.local` for local development:

```bash
# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Or Umami
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your_umami_id
NEXT_PUBLIC_UMAMI_URL=https://analytics.umami.is
```

### **Site Configuration**
Edit `src/lib/site.ts` to customize:
- Site metadata and URLs
- Navigation structure
- Social media links
- Analytics settings

### **Styling Customization**
- **Colors**: Update `src/app/globals.css` CSS variables
- **Fonts**: Modify font imports in `src/app/layout.tsx`
- **Components**: Extend `tailwind.config.ts` theme

## 📊 Performance Metrics

### **Bundle Analysis**
- **Homepage**: 237KB total (4.74KB page + 232KB shared)
- **Demo Page**: 246KB total (9.99KB page + 236KB shared)
- **Blog Pages**: 103KB total (164B page + 103KB shared)

### **Lighthouse Scores** (Target)
- **Performance**: 95+ (LCP < 2.5s, CLS < 0.02)
- **Accessibility**: 100 (WCAG AA compliant)
- **Best Practices**: 100
- **SEO**: 100 (complete metadata, structured data)

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Netlify**
```bash
# Build command
npm run build

# Publish directory
.next
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Static Export**
```bash
# Add to next.config.ts
output: 'export'

# Build static files
npm run build
```

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] All pages load without errors
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Navigation works correctly
- [ ] Forms submit successfully
- [ ] AI demo interactions work
- [ ] Dark mode toggle (if implemented)
- [ ] Accessibility with keyboard navigation

### **Performance Testing**
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Bundle analyzer
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

## 🔮 What to Build Next

### **Phase 1: Enhanced Interactivity**
- [ ] **Dark Mode Toggle**: Complete light/dark theme switching
- [ ] **Contact Forms**: Working contact and waitlist forms
- [ ] **Newsletter Signup**: Email capture with validation
- [ ] **Search Functionality**: Site-wide search for blog/content

### **Phase 2: Content Management**
- [ ] **CMS Integration**: Sanity or Contentful for blog management
- [ ] **Dynamic Testimonials**: Admin panel for testimonial management
- [ ] **Team Pages**: Staff profiles and bios
- [ ] **FAQ Section**: Expandable FAQ with search

### **Phase 3: Advanced Features**
- [ ] **Real AI Integration**: Connect to actual AI service
- [ ] **User Accounts**: Customer portal and preferences
- [ ] **Booking System**: Service scheduling and management
- [ ] **Payment Integration**: Stripe for service payments

### **Phase 4: Analytics & Optimization**
- [ ] **A/B Testing**: Conversion optimization
- [ ] **Advanced Analytics**: User behavior tracking
- [ ] **Performance Monitoring**: Real user metrics
- [ ] **SEO Optimization**: Technical SEO improvements

### **Phase 5: Mobile App**
- [ ] **React Native App**: Mobile companion app
- [ ] **Push Notifications**: Service reminders
- [ ] **Offline Support**: PWA capabilities
- [ ] **Native Features**: Camera, location, etc.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved by Maidly.ai.

## 🆘 Support

For technical support or questions:
- **Email**: dev@maidly.ai
- **Documentation**: [Internal Wiki]
- **Slack**: #maidly-dev channel

---

**Built with ❤️ in Dallas, TX**

*Maidly.ai - Your home, remembered.*