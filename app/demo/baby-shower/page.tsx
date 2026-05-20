import { DemoBaby } from "./DemoBaby";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Baby Shower | Momentum",
  description:
    "Mira cómo se ve una invitación de Baby Shower digital interactiva creada con Momentum.",
  openGraph: {
    title: "Demo Baby Shower | Momentum",
    description:
      "Mira cómo se ve una invitación de Baby Shower digital interactiva creada con Momentum.",
    url: "https://momentuminvites.com/demo/baby-shower",
    siteName: "Momentum",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo Baby Shower | Momentum",
    description:
      "Mira cómo se ve una invitación de Baby Shower digital interactiva.",
  },
};

import dynamic from "next/dynamic";

const DemoBabyDynamic = dynamic(() =>
  import("./DemoBaby").then((mod) => mod.DemoBaby)
);

export default function DemoBabyPage() {
  return <DemoBabyDynamic />;
}
