# 🚀 Momentum — Setup & Development Guide

## Quick Start

### 1. **Clone & Install**
```bash
git clone <repo>
cd momentum
npm install
```

### 2. **Environment Setup**
```bash
# Copia el template de variables
cp .env.example .env.local

# Edita .env.local con tus credenciales:
# - NEXTAUTH_SECRET: genera con `openssl rand -base64 32`
# - Database URL (PostgreSQL)
# - Stripe keys (test vs prod)
# - Supabase credentials
# - Resend API key
```

### 3. **Database Setup**
```bash
# Crea la base de datos
createdb momentum

# Ejecuta migrations
npx prisma migrate dev

# Seed inicial (opcional)
npm run seed
```

### 4. **Run Development Server**
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

---

## 📋 Environment Variables

### **Required**
- `NEXTAUTH_SECRET`: JWT secret (min 32 caracteres)
- `NEXTAUTH_URL`: URL de la app (ej: http://localhost:3000)
- `DATABASE_URL`: PostgreSQL connection string

### **Payments (Stripe)**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: pk_test_* (público, safe)
- `STRIPE_SECRET_KEY`: sk_test_* (secreto)
- `STRIPE_WEBHOOK_SECRET`: whsec_* (webhook signing)

### **Storage (Supabase)**
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key (safe, public)

### **Email (Resend)**
- `RESEND_API_KEY`: Tu API key de Resend
- `NEXT_PUBLIC_EMAIL_FROM`: Email sender (noreply@domain.com)

### **OAuth (opcional)**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

---

## 📚 Scripts

```bash
npm run dev          # Dev server con hot reload
npm run build        # Build para producción
npm start            # Run production server
npm run lint         # Run ESLint
npm run seed         # Seed base de datos (Prisma)
```

---

## 🏗️ Project Structure

```
momentum/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── dashboard/         # Admin dashboard
│   ├── e/[slug]/          # Event invitation pages
│   ├── api/               # API routes
│   └── actions/           # Server actions
├── components/
│   ├── sections/          # Landing sections
│   ├── dashboard/         # Dashboard components
│   └── ui/                # Shadcn components
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── stripe.ts          # Stripe config
│   └── auth.ts            # NextAuth config
├── prisma/
│   └── schema.prisma      # Database schema
├── public/
│   ├── robots.txt         # SEO config
│   └── brand/             # Brand assets
└── types/                 # TypeScript types
```

---

## 🔑 Key Features

### Authentication
- NextAuth.js v5 (JWT strategy)
- Google OAuth integration
- Role-based access control (ADMIN, USER)

### Payments
- Stripe integration (checkout, webhooks)
- Multiple payment methods (card, SPEI, OXXO Pay)
- Webhook event handling

### Email
- Resend SDK for transactional emails
- React Email templates
- Payment confirmations, invitations

### Storage
- Supabase for image/media storage
- Browser-native image compression
- CDN delivery

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Verifica que PostgreSQL está corriendo
psql -U postgres -l

# Revisa DATABASE_URL en .env.local
# Format: postgresql://user:password@localhost:5432/momentum
```

### Stripe Webhook Not Triggering
```bash
# Durante desarrollo, usa Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Obtén webhook signing secret desde consola
```

### NextAuth Session Issues
```bash
# Regenera NEXTAUTH_SECRET (min 32 chars)
openssl rand -base64 32
```

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Next.js 16, Tailwind CSS v4 |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | NextAuth.js v5 (beta) |
| **Payments** | Stripe SDK |
| **Email** | Resend + React Email |
| **Storage** | Supabase |
| **UI** | Shadcn/ui, Lucide Icons |
| **Animations** | Motion (Framer Motion) |
| **Forms** | React Hook Form |

---

## 🔒 Security Checklist

- [ ] NEXTAUTH_SECRET es único y random (min 32 chars)
- [ ] STRIPE_SECRET_KEY nunca en variables públicas
- [ ] DATABASE_URL solo en .env.local (no en repo)
- [ ] Middleware protege /dashboard routes
- [ ] Webhook signatures verificadas
- [ ] CORS configured correctly
- [ ] Rate limiting en place

---

## 📈 Performance

- **Code splitting**: Dynamic imports en sections heavy
- **Image optimization**: next/image con remotePatterns
- **Font optimization**: Google Fonts con display: swap
- **Bundle**: Tailwind v4 production ready

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/name`
4. Open PR

---

## 📝 License

© 2026 Momentum. All rights reserved.
