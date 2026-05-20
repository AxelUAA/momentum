import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo — Invitación Digital | Momentum",
  description:
    "Mira cómo se ve una invitación de boda digital interactiva creada con Momentum. Incluye countdown, galería, RSVP y más.",
  openGraph: {
    title: "Demo — Invitación Digital | Momentum",
    description:
      "Mira cómo se ve una invitación de boda digital interactiva creada con Momentum.",
    url: "https://momentuminvites.com/demo",
    siteName: "Momentum",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo — Invitación Digital | Momentum",
    description:
      "Mira cómo se ve una invitación de boda digital interactiva.",
  },
};

// Dynamic import to avoid TS server caching issues with new files
import dynamic from "next/dynamic";

const DemoInvitation = dynamic(() =>
  import("./DemoInvitation").then((mod) => mod.DemoInvitation)
);

export default function DemoPage() {
  return <DemoInvitation />;
}
