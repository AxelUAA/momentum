# Flujo operativo de Momentum

## Modelo: Agencia con producto digital

Tú (y eventualmente tu equipo) son los únicos con acceso al dashboard. Los clientes pagan, te dan info, tú armas la invitación. Los invitados solo reciben el link.

## Flujo end-to-end

### Cliente final
1. Descubre Momentum (Instagram, recomendación, Google, landing)
2. Se contacta (WhatsApp, formulario, DM)
3. Cotización → tier elegido + precio
4. Pago via Stripe (tarjeta/OXXO/SPEI) o transferencia
5. Manda materiales (fotos, story, fecha, lugar, lista invitados)
6. Revisa preview, pide cambios, aprueba
7. Recibe invitación final + lista de URLs únicas
8. Distribuye a invitados (WhatsApp generator)
9. Monitorea RSVPs (resumen semanal o acceso solo-lectura)
10. Post-evento: 60 días después auto-expira

### Tú (operador)
1. Captación: respondes, mandas catálogo, cotizas
2. Cobro: generas link Stripe, recibes notificación
3. Intake del cliente: form estructurado con todo lo que necesitas
4. Producción: dashboard wizard 6 pasos (5-10 min)
5. Preview: link `/e/[slug]` al cliente
6. Iteración + publicación
7. Distribución: WhatsApp Generator
8. Monitoreo: emails + dashboard
9. Cierre: archivas post-fecha

### Invitado
1. Recibe WhatsApp con link único
2. Abre invitación (countdown, story, venues, dress code, gallery, gift)
3. RSVP (asistencia, # personas, restricciones, mensaje)
4. Día del evento: vuelve a abrir
5. 60 días post-evento: link expira

## Cuellos de botella a 300 invitaciones/mes

| Bottleneck | Solución |
|---|---|
| Materiales del cliente tardan | Formulario de intake estructurado obligatorio post-pago |
| Wizard manual (tú) | Intake form → genera Event en DRAFT precargado, tú solo ajustas |
| Distribución WhatsApp manual | Integrar WhatsApp Business API (Twilio o 360dialog) |
| Solo 1 template | 5-7 templates por tipo de evento |
| Soporte cliente | FAQ + tutoriales + chatbot eventual |
| Tiempo del operador | Equipo (1-2 personas) + sistema de asignación |

## Roadmap para llegar a 300/mes

### Bloque 1 — Captación al pago (1 semana)
- Landing real con CTA claro
- Catálogo público de templates con previews
- Formulario de cotización con notificación
- Stripe Payment Links desde dashboard

### Bloque 2 — Intake automatizado (1 semana)
- Endpoint que recibe form data → crea Event en DRAFT
- Emails de "completa tu intake"
- Cron diario que recuerda intake pendiente

### Bloque 3 — Velocidad de producción (2 semanas)
- 4 templates más (total 5)
- Kits predefinidos por tipo de evento
- Componente "Compartir preview" con URL firmada
- CDN de imágenes (Cloudinary/ImageKit)

### Bloque 4 — Distribución masiva (1-2 semanas)
- WhatsApp Business API (Twilio)
- Envío masivo programado
- Tracking delivered/read

### Bloque 5 — Equipo + operación (1 semana)
- Roles: ADMIN, DESIGNER, CLIENT
- Asignación de eventos en dashboard
- Vista filtrable por estado/asignado/vencimiento
- Métricas internas

### Bloque 6 — Self-service (opcional, 2 semanas)
- Login para clientes
- Wizard recortado para clientes
- Tu rol → reviewer/approver

## Capacidad estimada por etapa

- **Hoy**: 5-10 invitaciones/mes (todo manual)
- **Bloques 1-2**: 30-50/mes (intake automatizado)
- **+ Bloque 3**: 50-100/mes (más templates + producción rápida)
- **+ Bloque 4**: 100-150/mes (distribución masiva)
- **+ Bloque 5**: 300+/mes (equipo en paralelo)
- **+ Bloque 6**: 500+/mes (self-service para power users)
