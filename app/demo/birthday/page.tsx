import { DemoBirthday } from "./DemoBirthday";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Cumpleaños | Momentum",
  description:
    "Mira cómo se ve una invitación de cumpleaños digital interactiva creada con Momentum.",
  openGraph: {
    title: "Demo Cumpleaños | Momentum",
    description:
      "Mira cómo se ve una invitación de cumpleaños digital interactiva creada con Momentum.",
    url: "https://momentuminvites.com/demo/birthday",
    siteName: "Momentum",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo Cumpleaños | Momentum",
    description:
      "Mira cómo se ve una invitación de cumpleaños digital interactiva.",
  },
};

// Dynamic import to avoid TS server caching issues
import dynamic from "next/dynamic";

const DemoBirthdayDynamic = dynamic(() =>
  import("./DemoBirthday").then((mod) => mod.DemoBirthday)
);

export default function DemoBirthdayPage() {
  return <DemoBirthdayDynamic />;
}
