"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "¿Funciona si mis invitados no tienen smartphone moderno?",
    answer: "Sí. Las invitaciones están optimizadas para abrirse en cualquier navegador web, independientemente del teléfono que usen tus invitados. No necesitan descargar ninguna aplicación.",
  },
  {
    question: "¿Puedo enviar por WhatsApp?",
    answer: "¡Por supuesto! Recibirás un enlace único que podrás enviar por WhatsApp, Messenger, Instagram o cualquier otra plataforma. Se verá una vista previa elegante del enlace.",
  },
  {
    question: "¿Aceptan OXXO Pay?",
    answer: "Sí, aceptamos tarjetas de crédito/débito, transferencias SPEI y pagos en efectivo a través de tiendas OXXO en todo México.",
  },
  {
    question: "¿Cuánto duran activas mis invitaciones?",
    answer: "Tus invitaciones y panel de control estarán activos desde el momento de la compra hasta 6 meses después de la fecha de tu evento. Tus fotos y recuerdos estarán a salvo.",
  },
  {
    question: "¿Puedo cambiar la fecha del evento después?",
    answer: "Sí, si tu evento se pospone o hay un cambio de planes, puedes actualizar la fecha, hora y lugar desde tu panel de control y todos los invitados verán la nueva información automáticamente.",
  },
  {
    question: "¿Mis invitados necesitan crear cuenta para confirmar?",
    answer: "No. Hemos diseñado el proceso para que sea lo más sencillo posible. Los invitados solo necesitan escribir su nombre y elegir si asisten o no, sin necesidad de contraseñas ni cuentas.",
  },
  {
    question: "¿Puedo descargar la lista de confirmados?",
    answer: "Sí, puedes exportar toda la lista de invitados, junto con su estado de confirmación, preferencias de comida o alergias, directamente a un archivo de Excel (.xlsx) o CSV.",
  },
  {
    question: "¿Hay límite de invitados?",
    answer: "El plan Esencial incluye hasta 50 invitados. Los planes Premium y Pro no tienen límite de invitados.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="w-full bg-[var(--color-cream)] dark:bg-[var(--color-midnight)] py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Resolvemos tus dudas para que organices tu evento con tranquilidad.
          </p>
        </div>

        <Accordion className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left font-medium text-lg hover:text-[var(--color-champagne)]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
