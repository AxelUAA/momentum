# Auditoría Phase 5 — Fixes aplicados

## Pasos obligatorios después de pull

1. **Regenerar Prisma client** (cambió enum `SubscriptionStatus`):
   ```bash
   npx prisma generate
   ```

2. **Push del schema a la DB**:
   ```bash
   npx prisma db push
   ```
   Esto aplica los nuevos valores `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID` y elimina el mapping erróneo `TRIALING @map("EXPIRED")`.

3. **Verificar webhook 400** — pendiente de diagnóstico, ver sección abajo.

---

## Cambios por archivo

### Schema (`prisma/schema.prisma`)
- **FIX:** `SubscriptionStatus.TRIALING @map("EXPIRED")` corregido. TRIALING ahora se guarda como TRIALING.
- **NUEVO:** Valores de enum `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID` para que el webhook pueda mapear todos los estados que Stripe emite (especialmente para OXXO/SPEI que entran en `incomplete` esperando primer pago).

### Webhook (`app/api/webhooks/stripe/route.ts`) — reescrito completo
- **FIX:** `current_period_end` ahora se lee de `subscription.items.data[0]` (API 2025+) con fallback al campo legacy.
- **FIX:** Todo el handler corre dentro de `prisma.$transaction` — `paymentLog` y `event.update` son atómicos. La idempotencia ahora es real.
- **FIX:** Eventos cuya sesión/suscripción no existe en DB (fixtures de `stripe trigger`, otros tenants) regresan **200 con warning**, no 500. Esto evita que Stripe reintente indefinidamente.
- **NUEVO:** Handler para `customer.subscription.created` (antes solo manejabas `updated` y `deleted`).
- **MEJOR LOGGING:** Cada error 400/500 ahora incluye detalle (`signature error: <msg>` en lugar de string genérico) — clave para depurar el 400 actual.
- **REMOVIDO:** Todos los `as any`. Usamos guards y `mapSubscriptionStatus` para los nuevos status.

### Billing actions (`app/actions/billing.ts`)
- **FIX:** `requireAdmin()` → `requireUser()` en las tres funciones. Cualquier usuario logueado puede pagar/suscribirse.
- **NUEVO:** Ownership check en `createOneTimeCheckout`: el evento debe pertenecer al user (o ser admin).
- **NUEVO:** Bloqueo de doble suscripción en `createSubscriptionCheckout` (si ya tiene `ACTIVE`, no permite crear otra).
- **NUEVO:** Bloqueo de doble pago en `createOneTimeCheckout` (si `paymentStatus === "PAID"`, error claro).
- **NUEVO:** `customer_creation: "always"` en pagos one-time. Ahora los users que solo hacen pagos individuales también tendrán `stripeCustomerId` y podrán usar el portal.
- **FIX:** El return URL del portal va a `/dashboard/billing` (antes iba a `/dashboard`).

### Página pública (`app/e/[slug]/page.tsx`)
- **FIX:** Validación de `activeUntil` añadida. Una vez expirado el periodo (60 días post-evento), la invitación deja de renderizar y muestra mensaje "ya no está disponible". Antes renderizaba para siempre.

### Events actions (`app/actions/events.ts`) — varias correcciones
- **FIX:** `updateEvent` hace **deep-merge** de `settings` sobre el JSON actual. Editar solo `dressCode` ya no borra `story`/`timeline`/`gallery`/etc.
- **FIX:** `duplicateEvent` excluye explícitamente todos los campos de pago (`stripeCheckoutId`, `stripePaymentIntentId`, `paidAt`, `activeUntil`, `subscriptionId`, `paymentStatus`). La copia nace UNPAID y sin links a Stripe — antes copiaba el `stripeCheckoutId` y violaba la `@unique`.
- **FIX:** `updateEventStatus` valida el status contra una lista cerrada de valores permitidos (antes aceptaba cualquier string).
- **FIX:** `updateActiveSections` ahora tiene try/catch y tipado.
- **REMOVIDO:** Todos los `console.log` con datos sensibles del usuario.
- **REMOVIDO:** Import no usado (`redirect`).

### EventActions (`components/dashboard/events/EventActions.tsx`)
- **NUEVO:** Botón "Pagar" cuando `paymentStatus !== "PAID"`. Llama a `createOneTimeCheckout` y redirige a Stripe.
- **NUEVO:** Prop `paymentStatus` opcional.

### Events list (`app/dashboard/events/page.tsx`)
- **NUEVO:** Columna "Pago" con badge (Pagado/Procesando/Sin pagar/Expirado/Reembolsado) en vista desktop y mobile.
- **NUEVO:** Pasa `paymentStatus` al EventActions para activar el botón "Pagar".

### Billing page (`app/dashboard/billing/page.tsx`) — reescrita
- **NUEVO:** Tabla "Historial de pagos" con últimos 10 PaymentLogs (lo que pedía PROMPT 4).
- **FIX:** Maneja todos los status (`ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELED`, `INCOMPLETE`, etc.) con badges apropiados.
- **FIX:** Errores ya NO son silenciosos. Si checkout falla, redirige con `?error=...` y se muestra banner rojo.
- **FIX:** `TRIALING` ahora cuenta como "tiene plan" (antes solo `ACTIVE`).

### Sales page (`app/dashboard/sales/page.tsx`)
- **FIX:** "Total recaudado" suma SOLO eventos exitosos (`completed`, `async_payment_succeeded`, `invoice.payment_succeeded`). Antes inflaba con failed/expired.

---

## Pendientes que no toqué (decisiones de producto)

### 1. ¿`requireAdmin` o `requireUser` en `events.ts`?
Dejé `events.ts` con `requireAdmin` porque la decisión "users normales pueden crear eventos" cambia el modelo del producto (middleware bloquea non-admins del dashboard). Si quieres que cualquier user organice eventos, además hay que:
- Cambiar `requireAdmin` → `requireUser` en `events.ts`
- Cambiar middleware (`middleware.ts` línea 18) para no redirigir USER a /403
- Decidir qué ven los admins vs USER en `/dashboard/events` (filtrar por `userId`)

### 2. `PaymentStatus` enum mappings invertidos
Schema sigue con:
```
UNPAID @map("PENDING")
PAID @map("SUCCEEDED")
```
Funciona vía Prisma pero queries SQL directas ven nombres opuestos. Cambiarlo requiere migración de datos. **No lo toqué** — es bug latente, no activo.

### 3. `stripeCheckoutId @unique`
Si una sesión expira y el user reintenta, viola la constraint. Para arreglarlo limpio: cambiar a `@@index([stripeCheckoutId])` y mover la unique al modelo `PaymentLog`. Migración no trivial.

---

## Webhook 400 — diagnóstico pendiente

El handler quedó hardened (logging detallado, transacción, skip silencioso de fixtures). Si tras `prisma generate && prisma db push` y reiniciar `npm run dev` sigue dando 400, los logs ahora dirán explícitamente:

- `[stripe webhook] missing stripe-signature header` → header faltante (improbable con `stripe listen`)
- `[stripe webhook] STRIPE_WEBHOOK_SECRET no configurado` → falta env var
- `[stripe webhook] signature error: <mensaje específico de Stripe>` → mismatch de secret. La causa #1 es que el `whsec_` de tu `.env` no es el que `stripe listen` está emitiendo en esta corrida. Cierra `stripe listen`, vuelve a abrirlo, copia el `whsec_` que imprime, pégalo en `.env`, y reinicia `npm run dev`.

Si cambia a 500, ahora los logs traen `[stripe webhook] processing error (<event.type>): <mensaje>` con detalle completo.

---

## Checklist post-deploy

- [ ] `npx prisma generate`
- [ ] `npx prisma db push` (o crear migration si tienes migrations en repo)
- [ ] Reiniciar `npm run dev`
- [ ] `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`
- [ ] Copiar el `whsec_` que imprime → `.env`
- [ ] Reiniciar dev otra vez
- [ ] Probar checkout end-to-end con tarjeta `4242 4242 4242 4242`
- [ ] Verificar en logs que webhook devuelve 200
- [ ] `git commit` + push a Vercel
- [ ] En Vercel dashboard: agregar `STRIPE_WEBHOOK_SECRET` de **producción** (no el de listen)
- [ ] En Stripe dashboard → Developers → Webhooks: registrar endpoint de producción `https://momentum.mx/api/webhooks/stripe` con los eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
