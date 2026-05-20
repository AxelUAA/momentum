import { DemoQuince } from "./DemoQuince";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo XV Años | Momentum",
  description:
    "Mira cómo se ve una invitación de XV años digital interactiva creada con Momentum.",
  openGraph: {
    title: "Demo XV Años | Momentum",
    description:
      "Mira cómo se ve una invitación de XV años digital interactiva creada con Momentum.",
    url: "https://momentuminvites.com/demo/quince",
    siteName: "Momentum",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo XV Años | Momentum",
    description:
      "Mira cómo se ve una invitación de XV años digital interactiva.",
  },
};

import dynamic from "next/dynamic";

const DemoQuinceDynamic = dynamic(() =>
  import("./DemoQuince").then((mod) => mod.DemoQuince)
);

export default function DemoQuincePage() {
  return <DemoQuinceDynamic />;
}
