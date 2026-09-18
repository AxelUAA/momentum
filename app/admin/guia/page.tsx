import Link from "next/link";
import {
  Banknote,
  BarChart3,
  CalendarCheck,
  Eye,
  Lightbulb,
  MessageCircle,
  Package,
  PackagePlus,
  Receipt,
  ShoppingBag,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Guía de uso | ${BRAND.name}` };

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-heading text-xl uppercase tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export default function GuiaPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl uppercase tracking-tight">
          Guía de uso de {BRAND.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cómo funciona toda tu página y cómo operarla día a día. Esta guía solo
          la ves tú (admin).
        </p>
      </div>

      {/* ─── Visión general ─── */}
      <Section icon={Eye} title="Cómo funciona tu página">
        <p>
          {BRAND.name} tiene dos caras: la <strong>tienda pública</strong> (un
          exhibidor que compartes por WhatsApp o redes, donde tus clientes ven
          los productos y el stock real) y este <strong>panel admin</strong>{" "}
          (donde vive tu negocio: ventas, inventario, gastos y resultados).
        </p>
        <p>
          <strong>La página no cobra en línea a propósito.</strong> El cierre de
          cada venta es contigo por WhatsApp: la tienda junta el pedido y te lo
          manda; tú acuerdas pago y entrega, y registras la venta aquí. Por eso
          el stock <strong>solo baja cuando tú registras la venta</strong>, no
          cuando alguien manda un pedido.
        </p>
      </Section>

      {/* ─── Tienda pública ─── */}
      <Section icon={Store} title="Lo que ven tus clientes">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Filtro de edad 18+</strong> al entrar (obligatorio por ser
            producto con nicotina).
          </li>
          <li>
            El <strong>catálogo con stock real</strong>: cada producto muestra
            cuántos sabores hay disponibles; si todos se agotan, aparece
            "Agotado" en gris. Lo que tú edites en Productos se refleja al
            momento.
          </li>
          <li>
            En cada producto eligen <strong>sabor y cantidad</strong>, lo agregan
            al carrito y al darle <strong>"Pedir por WhatsApp"</strong> se abre
            un chat contigo con el pedido armado y un código (ej.{" "}
            <strong>MV-ABC12</strong>). Ese pedido te aparece en la sección{" "}
            <strong>Pedidos</strong>.
          </li>
          <li>
            Si crean cuenta (con Google), guardan favoritos y ven el historial de
            sus pedidos. No es obligatorio para pedir.
          </li>
        </ul>
        <Tip>
          Comparte el link de tu página directamente en tus estados y chats: es
          tu aparador. Tus clientes siempre ven el stock actualizado, así que
          mantén el inventario al día y la página vende sola.
        </Tip>
      </Section>

      {/* ─── Flujo de una venta ─── */}
      <Section icon={Banknote} title="El flujo completo de una venta">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Te llega un pedido por WhatsApp (aparece en <strong>Pedidos</strong>)
            o un cliente te compra directo.
          </li>
          <li>
            Acuerdas entrega y pago. Cuando la venta se concreta, ve a{" "}
            <strong>Ventas → Registrar venta</strong>.
          </li>
          <li>
            Eliges producto y sabor (te muestra el stock de cada uno), cantidad y
            precio (viene prellenado del catálogo, pero puedes cambiarlo si diste
            descuento). Capturas nombre y <strong>teléfono</strong> del cliente —
            el teléfono es oro para la cobranza.
          </li>
          <li>
            Eliges <strong>Contado</strong> (queda pagada) o{" "}
            <strong>A plazos</strong> (capturas el enganche y queda "Por
            cobrar").
          </li>
          <li>
            Al guardar: <strong>el stock baja solo</strong>, la venta queda en tu
            historial y la ganancia se calcula con el costo de tus productos.
          </li>
          <li>
            Si es a plazos: cada que te abonen, búscala en Ventas y usa{" "}
            <strong>"Abonar"</strong>. Cuando el saldo llegue a cero, se marca
            "Pagada" sola. El botón <strong>"Recordar pago"</strong> abre
            WhatsApp con el mensaje de cobro ya escrito.
          </li>
        </ol>
        <Tip>
          ¿Te equivocaste o se cayó la venta? <strong>Cancélala</strong> desde la
          tarjeta de la venta: el stock regresa solo al inventario y la venta
          deja de contar en tus números.
        </Tip>
      </Section>

      {/* ─── Compras ─── */}
      <Section icon={PackagePlus} title="Compras / resurtidos">
        <p>
          Cada vez que te llegue mercancía, regístrala en{" "}
          <strong>Compras → Registrar compra</strong>: producto, sabor, cantidad
          y <strong>costo por pieza</strong>. Al guardar pasan dos cosas:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            El <strong>stock sube solo</strong> (no edites el número a mano en
            Productos para resurtir — usa Compras, así queda el historial).
          </li>
          <li>
            El <strong>costo del producto se actualiza</strong>, y con él se
            calcula automáticamente tu ganancia en cada venta futura.
          </li>
        </ul>
        <Tip>
          El costo es la pieza clave para saber si de verdad estás ganando.
          Registra hasta los gastos de envío del proveedor como gasto (categoría
          "Envíos") para no perderlos de vista.
        </Tip>
      </Section>

      {/* ─── Gastos ─── */}
      <Section icon={Receipt} title="Gastos">
        <p>
          Todo lo que sale del negocio que <strong>no</strong> sea mercancía:
          gasolina de entregas, empaque, publicidad, apps, envíos. Se captura en
          10 segundos: descripción, categoría, monto y fecha.
        </p>
        <p>
          Sin gastos capturados, tus "Resultados" mienten: podrías estar
          vendiendo mucho y ganando poco. La regla es simple:{" "}
          <strong>si salió dinero, se captura</strong>.
        </p>
      </Section>

      {/* ─── Resultados ─── */}
      <Section icon={BarChart3} title="Resultados: leer tus números">
        <p>
          La página <strong>Resultados</strong> es tu estado de cuenta del
          negocio. Elige el periodo (este mes, el pasado, o un rango) y lee de
          arriba hacia abajo:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Ventas</strong> − <strong>costo de la mercancía</strong> ={" "}
            <strong>ganancia bruta</strong> (lo que te deja el producto).
          </li>
          <li>
            Ganancia bruta − <strong>gastos</strong> ={" "}
            <strong>utilidad neta</strong>: lo que de verdad ganaste. Abajo te
            compara contra el periodo anterior.
          </li>
          <li>
            <strong>"Efectivo cobrado"</strong> es distinto: es el dinero que
            realmente entró en el periodo (incluye abonos de ventas viejas). Si
            fías mucho, puedes tener buena utilidad "en papel" y poco efectivo —
            este número te lo dice.
          </li>
        </ul>
        <p>
          Con los botones <strong>CSV</strong> descargas tus ventas y gastos del
          periodo en Excel: tu respaldo, o lo que le entregarías a un contador.
        </p>
      </Section>

      {/* ─── Clientes ─── */}
      <Section icon={Users} title="Clientes y cobranza">
        <p>
          Se arma solo con las ventas que registras: cada cliente con cuánto te
          ha comprado, <strong>cuánto te debe</strong> y su última compra,
          ordenados con los deudores arriba.
        </p>
        <p>
          El botón <strong>"Recordar pago"</strong> abre WhatsApp con el mensaje
          de cobro amable ya redactado, con su saldo y códigos de venta. Cobrar
          sin pena y sin escribir nada.
        </p>
        <Tip>
          Por eso conviene capturar siempre el teléfono al registrar la venta:
          sin teléfono no hay botón de cobranza.
        </Tip>
      </Section>

      {/* ─── Pedidos ─── */}
      <Section icon={Package} title="Pedidos de WhatsApp">
        <p>
          Aquí caen los carritos que tus clientes mandan desde la tienda, con
          código y detalle. Son <strong>solicitudes, no ventas</strong>: no mueven
          stock ni cuentan en resultados. Usa los estados para llevar tu
          seguimiento: Nuevo → En contacto → Confirmado → Entregado (o
          Cancelado). Cuando concretes uno,{" "}
          <strong>regístralo como venta</strong> en Ventas.
        </p>
      </Section>

      {/* ─── Productos y catálogo ─── */}
      <Section icon={ShoppingBag} title="Productos, fotos y stock">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Fotos:</strong> desde editar producto subes tus fotos (se
            comprimen solas); la primera es la portada y con la estrella la
            cambias. Con varias fotos, la tienda muestra galería.
          </li>
          <li>
            <strong>Variantes:</strong> cada sabor/color con su stock y precio
            especial opcional. Una variante en 0 sale "agotada" en la tienda; si
            todas están en 0, el producto entero se ve "Agotado".
          </li>
          <li>
            <strong>Costo unitario:</strong> lo que te cuesta la pieza. Se
            actualiza solo al registrar compras; solo edítalo a mano si aún no
            usas Compras.
          </li>
          <li>
            <strong>Estrella</strong> = aparece en destacados; <strong>ojo</strong>{" "}
            = visible u oculto en la tienda; el <strong>bote</strong> lo elimina
            (si ya tuvo ventas, solo se oculta para no perder historial).
          </li>
          <li>
            El stock editado a mano cuenta como <strong>ajuste</strong> y queda
            registrado — úsalo para correcciones o mermas (se rompió, lo
            regalaste), no para resurtir.
          </li>
        </ul>
      </Section>

      {/* ─── Marcas ─── */}
      <Section icon={Tags} title="Marcas y categorías">
        <p>
          Son los filtros de tu catálogo público. Crea las marcas que manejas y
          agrupa en categorías (desechables, pods...). El ojo las oculta de la
          tienda sin borrar nada — útil si dejas de manejar una marca por
          temporada.
        </p>
      </Section>

      {/* ─── Rutina ─── */}
      <Section icon={CalendarCheck} title="Tu rutina recomendada">
        <p>
          <strong>Diario (5 min):</strong> revisa Pedidos nuevos y contéstalos;
          registra las ventas que cerraste y los abonos que te cayeron; captura
          los gastos del día.
        </p>
        <p>
          <strong>Cuando llegue mercancía:</strong> registra la Compra ahí mismo
          — stock y costos quedan al día sin hacer nada más.
        </p>
        <p>
          <strong>Semanal:</strong> mira "Resurtir pronto" en el Resumen para
          armar tu pedido al proveedor, y manda "Recordar pago" a quien deba.
        </p>
        <p>
          <strong>Fin de mes:</strong> abre Resultados, compara contra el mes
          anterior y descarga tus CSV de respaldo. Con eso sabes exactamente
          cómo va el negocio.
        </p>
        <Tip>
          La regla de oro de todo el sistema:{" "}
          <strong>
            todo movimiento de dinero o mercancía se registra en el momento
          </strong>
          . Si lo dejas "para al rato", los números dejan de cuadrar y el panel
          pierde su valor.
        </Tip>
      </Section>

      <div className="rounded-3xl border border-border bg-surface p-6 text-center">
        <MessageCircle className="mx-auto h-6 w-6" />
        <p className="mt-3 text-sm text-muted-foreground">
          ¿Dudas o quieres que el panel haga algo más? Pídeselo a Claude en tu
          próxima sesión de trabajo — esta guía se actualiza junto con la
          página.
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-gold-deep"
        >
          Ir al resumen
        </Link>
      </div>
    </div>
  );
}
