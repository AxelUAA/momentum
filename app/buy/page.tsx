import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BuyForm from "./BuyForm";

type Props = {
  searchParams: Promise<{ template?: string }>;
};

export async function generateMetadata({ searchParams }: Props) {
  const { template: slug } = await searchParams;
  if (!slug) return { title: "Comprar | Momentum" };
  const template = await prisma.template.findUnique({
    where: { slug, isActive: true },
    select: { name: true, type: true },
  });
  if (!template) return { title: "Comprar | Momentum" };
  return { title: `Comprar ${template.name} | Momentum` };
}

async function BuyPageContent({ searchParams }: Props) {
  const { template: slug } = await searchParams;

  // Sin plantilla seleccionada → ir al catálogo
  if (!slug) redirect("/plantillas");

  // Require auth — redirect to login preserving destination
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/buy?template=${slug}`);
  }

  const template = await prisma.template.findUnique({
    where: { slug, isActive: true },
    select: {
      slug: true,
      name: true,
      type: true,
      description: true,
      previewImageUrl: true,
      isPremium: true,
    },
  });

  // Plantilla no existe o inactiva → catálogo
  if (!template) redirect("/plantillas");

  return (
    <BuyForm
      template={template}
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
    />
  );
}

export default function BuyPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-champagne)]" />
        </div>
      }
    >
      <BuyPageContent {...props} />
    </Suspense>
  );
}
