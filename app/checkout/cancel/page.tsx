import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1
          className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight font-serif"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Cancelaste el proceso de pago
        </h1>
        <p className="mt-3 text-[var(--color-midnight)]/70">
          No se realizó ningún cargo. Puedes volver al dashboard para intentarlo de nuevo.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-lg border border-black/10 px-5 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-midnight)] hover:bg-black/[0.02]"
        >
          Volver al dashboard
        </Link>
      </div>
    </main>
  );
}
