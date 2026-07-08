import Link from "next/link";

export const metadata = {
  title: "Página no encontrada | Momentum",
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col items-center px-4 text-center">
        <p className="mb-2 font-heading text-8xl uppercase text-accent">404</p>
        <h1 className="mb-4 font-heading text-3xl uppercase tracking-tight">
          Página no encontrada
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/productos"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent/90"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
