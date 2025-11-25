# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Temple Management System for Sri Raghavendra Brindavana Sannidhi - a Next.js 15 application for managing donations, pooja bookings, astrology consultations, and parihara services. Features Razorpay payments, WhatsApp notifications via Twilio, and PDF certificate generation.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run dev:3010         # Dev server on port 3010

# Build & Production
npm run build            # Build (runs prisma generate + next build)
npm run start            # Start production server

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations in development
npm run db:seed          # Seed database

# Linting
npm run lint             # ESLint
```

## Architecture

### Directory Structure
- `app/` - Next.js App Router (pages and API routes)
- `lib/` - Core integrations (Prisma, Razorpay, WhatsApp, certificates)
- `features/` - Feature modules (donations, pooja-bookings, parihara-pooja, astrology, admin, payments)
- `shared/` - Shared components, contexts, UI primitives
- `prisma/` - Database schema and migrations
- `types/` - Centralized type definitions and Zod validation schemas
- `archive/` - Archived legacy code (not compiled)

### Payment API Architecture (`app/api/payments/`)
The main payment endpoint uses a handler pattern:
```
route.ts                      # Entry point (~110 lines)
├── handlers/
│   ├── donation.handler.ts   # Donation processing + notifications
│   ├── pooja.handler.ts      # Pooja booking + DB + notifications
│   ├── parihara.handler.ts   # Parihara pooja booking
│   └── astrology.handler.ts  # Astrology consultation
├── services/
│   ├── user.service.ts       # User creation/lookup
│   └── receipt.service.ts    # Receipt number generation
├── validators/
│   └── razorpay.validator.ts # HMAC signature verification
└── types.ts                  # Shared handler types
```

### Key Integrations (in `lib/`)
- `prisma.ts` - Database client singleton
- `razorpay-service.ts` - Payment processing
- `whatsapp-production.ts` - Twilio WhatsApp with rate limiting (50/sec, 200/min)
- `whatsapp-templates.ts` - V1/V3 template definitions
- `certificate-service.ts` - Puppeteer PDF generation

### Type System (`types/`)
- `schemas/` - Zod validation schemas for runtime validation
  - `common.ts` - Phone, email, amount, name validators
  - `payments.ts` - Payment request/response schemas
- `services/` - Service-specific types (WhatsApp, email, Razorpay)
- `api/` - API request/response types

### Database (PostgreSQL via Prisma)
Core models: User, Donation, PoojaService, PoojaBooking, ReceiptSequence, BookingSequence, DailySequence, AuditLog

### Payment Flow
1. Frontend: Razorpay checkout
2. Backend: Verify HMAC-SHA256 signature → Create DB records
3. Post-payment: Generate certificate → Send WhatsApp → Send email

### WhatsApp Pattern
Templates don't support media attachments. Use two-message pattern:
1. Template message (approved, 3-5 variables)
2. Follow-up message with PDF attachment

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 3.4, Lucide icons
- **Backend**: Next.js API routes, Prisma 5.10, PostgreSQL
- **Validation**: Zod 4.x for runtime schema validation
- **Payments**: Razorpay
- **Communications**: Twilio (WhatsApp), SendGrid (email)
- **PDF**: Puppeteer-core with Sparticuz Chromium (serverless-compatible)

## Design System

**Colors**: temple-maroon (#8B0000), temple-gold (#DAA520), temple-cream (#FFF8DC), temple-orange (#FF8C42)

**Fonts**: Cinzel (headings), Inter (body), Noto Sans Devanagari (Hindi/Sanskrit)

## Environment Variables

Key variables needed (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - Payment gateway
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` - WhatsApp
- `TWILIO_TEMPLATE_*` - WhatsApp template SIDs (V1 and V3 variants)
- `NEXT_PUBLIC_BASE_URL` - Application URL
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin auth

## i18n

Multi-language support via `shared/contexts/LanguageContext.tsx`:
- English, Hindi, Kannada
