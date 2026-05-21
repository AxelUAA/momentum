# Momentum

Plataforma SaaS premium para la creación y gestión de invitaciones digitales de lujo.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Estilos**: Tailwind CSS v4 + Shadcn/ui
- **Base de Datos**: PostgreSQL (Supabase) + Prisma ORM
- **Autenticación**: NextAuth.js v5 + Google OAuth
- **Pagos**: Stripe (one-time + suscripciones, OXXO/SPEI/tarjeta)
- **Email**: Resend + React Email
- **Storage**: Supabase Storage (imágenes/PDFs)
- **Deploy**: Vercel

## Desarrollo local

```bash
npm install
npm run dev
```

Requiere `.env.local` configurado (ver `.env.example`).

## Templates disponibles

| Template | Tipo de evento |
|----------|---------------|
| Aurora | Bodas |
| Bloom | Quinceañeras (XV) |
| Confetti | Cumpleaños |
| Nube | Baby Shower |

---

© 2026 Momentum. Todos los derechos reservados.
