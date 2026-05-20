# Estado de Momentum — abril 2026

## ✅ Lo que está funcionando

### Phase 1 — Auth (estable)
- Auth.js v5 con Google OAuth
- PrismaAdapter para persistir users/sessions/accounts
- JWT strategy con refresh de role desde DB
- Middleware protegiendo `/dashboard/*` con role check
- Página `/login` y `/403` listas
- Patrón `requireAdmin()` y `requireUser()` documentados

### Phase 2 — Events CRUD (estable)
- Modelo Event con campos completos (slug, fecha, ubicación, tier, status, paymentStatus)
- Wizard multi-step para crear evento (Step1BasicInfo → Step6Review)
- Edit, duplicate (corregido en audit), archive, delete
- Cascade delete con limpieza de imágenes en Supabase
- Slug único validado
- Status workflow (DRAFT/PAID/INTAKE_COMPLETE/BUILDING/REVIEW/CHANGES_REQUESTED/ACTIVE/COMPLETED/ARCHIVED)
- Tier system (EXPRESS/ESSENTIAL/COMPLETE/LUXURY)

### Phase 3 — Guests + RSVP (estable)
- CRUD de invitados con uniqueToken
- Importación CSV
- Tipos de invitado (FAMILY_BRIDE/GROOM/FRIEND/WORK/OTHER) y InvitedBy
- RSVP con estatus (PENDING/CONFIRMED/DECLINED/MAYBE), restricciones dietéticas, mensajes
- Tracking de InvitationView (analytics básicos)
- Generador de mensajes de WhatsApp con template variables

### Phase 4 — Templates + Storage (estable)
- Template Aurora completo (HeroCountdown, StoryTimeline, Venues, Gallery, DressCode, RSVP, Map, GiftRegistry)
- Supabase Storage para cover, gallery, dress-code, timeline
- Compresión de imágenes en cliente (browser-image-compression)
- Validación de URLs y `next/image` configurado
- Página pública `/e/[slug]` y `/e/[slug]/[guestToken]`

### Phase 5 — Stripe (recién cerrada, validada en prod)
- One-time payments (tarjeta + OXXO + SPEI configurados)
- Suscripciones (Organizador Plus 5 eventos / Pro 20 eventos)
- Webhook handler hardened (transacción, idempotencia, todos los event types necesarios)
- Customer portal (acceso configurado, falta activar cancelación)
- Gating en página pública por paymentStatus + activeUntil
- Badge de pago en lista de eventos
- Página de billing con historial de pagos
- ensureStripeCustomer helper para que SPEI funcione

## 🟡 Deuda técnica pendiente

### Del audit reciente
- **Tema/colores inconsistente**: `--color-brand` ya está fijado, pero el dark mode necesita pasada general (prompt de Cursor entregado)
- **`PaymentStatus` enum mappings invertidos** en schema (UNPAID @map("PENDING"), PAID @map("SUCCEEDED")) — funciona vía Prisma pero confunde queries SQL directas
- **`stripeCheckoutId @unique`** rompe reintentos de checkout
- **`requireAdmin` en todo `events.ts`** — decisión pendiente: ¿app es solo para agencias internas, o cualquier usuario crea eventos?

### Customer Portal de Stripe
- Toggle de cancelación habilitado en config pero no validado end-to-end
- Faltan páginas legales (Terms / Privacy) que Stripe requiere para activar el portal en producción real

### Git
- `git push` sigue trabado por OneDrive interfiriendo con `.git/`
- Workaround actual: deploy directo con `npx vercel --prod`
- Pendiente: mover proyecto a `C:\dev\momentum` (fuera de OneDrive)

## ❌ Lo que falta para que sea un producto vendible

### Producto core (alta prioridad)

1. **Notificaciones por email**
   - Email de confirmación cuando alguien hace RSVP
   - Email de recordatorio al organizador con lista de no-confirmados
   - Email de pago exitoso al cliente
   - Email de pago pendiente OXXO/SPEI con la ficha
   - Stack sugerido: Resend (gratis hasta 3k/mes) + React Email para templates

2. **Más templates**
   - Solo tienes Aurora. Para vender en serio necesitas 3-5 estilos distintos
   - Idealmente uno por tipo de evento (boda elegante, XV moderna, infantil, corporativo)
   - Cada template = 2-3 días de diseño y desarrollo

3. **Páginas legales**
   - Términos y Condiciones
   - Aviso de Privacidad (LFPDPPP México)
   - Política de Cookies
   - Política de Reembolso
   - Sin esto no puedes activar Stripe en modo LIVE

4. **Onboarding del organizador**
   - Tour guiado al primer login
   - Checklist de "qué hacer primero"
   - Templates de eventos preconfigurados para arrancar rápido

5. **Manejo de errores end-user**
   - Páginas 404, 500 personalizadas con branding
   - Error boundaries en client components
   - Toast feedback consistente

### Marketing y conversión (media prioridad)

6. **Landing page real**
   - Actualmente "/" probablemente es un placeholder o muy básico
   - Necesitas: hero, features, pricing público, testimonios, FAQ, CTA
   - SEO meta tags, sitemap.xml, robots.txt
   - OpenGraph y Twitter cards

7. **Página pública de pricing**
   - Que cualquier visitante (sin login) vea precios y planes
   - Comparativa de tiers
   - FAQ de pagos

8. **Demo público**
   - Una invitación de demo navegable (`/demo`) sin login
   - Crítico para conversión

### Operación (baja prioridad inicial pero importante)

9. **Dashboard de admin (super-admin)**
   - Vista de todos los users, eventos, ingresos
   - Búsqueda y filtros
   - Capacidad de promover users a ADMIN sin SQL manual
   - Exportar reportes

10. **Analytics**
    - Vercel Analytics (gratis)
    - O PostHog para events de producto
    - Tracking de funnel: signup → primer evento → primer pago

11. **Backup automático**
    - Supabase pro tiene backups diarios automáticos ($25/mes)
    - O implementar dump manual semanal a S3

12. **Monitoreo y errores**
    - Sentry para errors en producción (gratis hasta 5k events/mes)
    - Status page de Vercel ya está

13. **Tests**
    - Cero tests actualmente
    - Mínimo viable: tests del webhook handler
    - Vitest + Playwright para e2e

## 🚀 Roadmap recomendado (próximas 4-6 semanas)

### Phase 6 — Notificaciones por email (1 semana)
- Setup Resend
- Templates React Email
- Webhook hooks para disparar emails desde Stripe events
- Test end-to-end

### Phase 7 — Páginas legales + Landing (1 semana)
- Términos, Privacidad, Reembolso
- Rediseñar landing
- Demo público navegable
- SEO básico

### Phase 8 — Templates adicionales (2-3 semanas)
- 2 templates más (boda alternativa + XV)
- Preview en wizard
- Custom colors / fonts por evento

### Phase 9 — Polish y go-live (1 semana)
- Dark mode (en proceso)
- Stripe Live mode
- Smoke tests completos
- Soft launch beta (5-10 usuarios)

### Phase 10 — Tests + observabilidad (continuo)
- Sentry
- Tests del webhook
- Tests del wizard

## 🧱 Decisiones pendientes

1. **Modelo de auth**: ¿solo agencias (admin) o usuarios finales también?
2. **Reembolsos**: política exacta
3. **Pricing final**: ajustes vs los $499/$1,499 actuales
4. **Free tier**: ¿invitación gratuita con marca de agua?
5. **Custom domain**: ¿permitir dominio propio del organizador?
6. **Multi-idioma**: solo español o también inglés desde día 1
