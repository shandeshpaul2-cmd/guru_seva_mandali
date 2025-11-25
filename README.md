# 🕉️ Temple Management System - Next.js Application

## Project Structure

```
app/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   ├── donate/             # Donation module pages
│   ├── book-pooja/         # Booking module pages
│   ├── admin/              # Admin dashboard pages
│   └── api/                # API routes
│
├── components/              # Reusable components
│   ├── ui/                 # Base UI components
│   ├── donation/           # Donation-specific components
│   ├── booking/            # Booking-specific components
│   ├── admin/              # Admin components
│   └── shared/             # Shared components
│
├── lib/                     # Utilities and integrations
│   ├── db.ts               # Database client
│   ├── auth.ts             # Authentication utilities
│   ├── razorpay.ts         # Razorpay integration
│   ├── whatsapp.ts         # WhatsApp integration
│   ├── pdf-generator.ts    # Certificate PDF generation
│   └── utils.ts            # General utilities
│
├── types/                   # TypeScript type definitions
│   ├── donation.ts
│   ├── booking.ts
│   ├── user.ts
│   └── admin.ts
│
├── prisma/                  # Database schema
│   └── schema.prisma
│
├── public/                  # Static assets
│   ├── images/
│   ├── certificates/
│   └── icons/
│
├── .env.local.example       # Environment variables template
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your actual credentials
```

### 3. Set up Database
```bash
# Run Prisma migrations
npx prisma migrate dev
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Temple Design System

### Colors
- **Temple Maroon**: `#8B0000` - Primary brand color
- **Temple Gold**: `#DAA520` - Accent color
- **Temple Cream**: `#FFF8DC` - Background color
- **Temple Orange**: `#FF8C42` - Secondary accent

### Typography
- **Headings**: Cinzel (elegant, temple-appropriate)
- **Body**: Inter (clean, readable)
- **Devanagari**: Noto Sans Devanagari (for Hindi/Sanskrit)

### Components
All components follow temple-themed design with:
- Smooth animations
- Mobile-first approach
- Accessibility features
- Touch-friendly interface

## Key Features

### Donation Module
- Quick 3-minute donation flow
- Instant receipt generation
- PDF certificate creation
- WhatsApp delivery
- Multiple payment options

### Pooja Booking Module
- 11 pre-defined poojas
- Nakshatra selection (27 options)
- Date/time preferences
- Admin confirmation workflow
- Booking status tracking

### Admin Dashboard
- Unified donation & booking management
- Real-time statistics
- User management
- Reports and analytics

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js
- **Payments**: Razorpay
- **PDF**: Puppeteer
- **Notifications**: WhatsApp Business API

## Development Roadmap

✅ Phase 1: Foundation & Setup
🔄 Phase 2: Donation Module
⏳ Phase 3: Booking Module
⏳ Phase 4: Integration & Admin
⏳ Phase 5: Testing & Polish
⏳ Phase 6: Deployment

---

**Shri Moola Ramo Vijayathe** 🙏
