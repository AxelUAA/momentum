import type { ComponentType } from "react";

/* ─── Step config type ──────────────────────────────────────────────────── */

export type StepConfig = {
  title: string;
  component: ComponentType<any>;
};

/* ─── Lazy imports (keeps bundle small per route) ───────────────────────── */

import { Step1BasicInfo } from "@/components/dashboard/wizard/Step1BasicInfo";
import { Step2Story } from "@/components/dashboard/wizard/Step2Story";
import { Step3Venues } from "@/components/dashboard/wizard/Step3Venues";
import { Step4DressCode } from "@/components/dashboard/wizard/Step4DressCode";
import { Step5Advanced } from "@/components/dashboard/wizard/Step5Advanced";
import { Step6Review } from "@/components/dashboard/wizard/Step6Review";

// New steps
import { Step2Template } from "@/components/dashboard/wizard/Step2Template";
import { Step2Birthday } from "@/components/dashboard/wizard/Step2Birthday";
import { Step3SingleVenue } from "@/components/dashboard/wizard/Step3SingleVenue";
import { Step2QuinceStory } from "@/components/dashboard/wizard/Step2QuinceStory";
import { Step3QuinceVenues } from "@/components/dashboard/wizard/Step3QuinceVenues";
import { Step4Court } from "@/components/dashboard/wizard/Step4Court";
import { Step2Baby } from "@/components/dashboard/wizard/Step2Baby";
import { Step4Theme } from "@/components/dashboard/wizard/Step4Theme";
import { Step5WishList } from "@/components/dashboard/wizard/Step5WishList";

/* ─── Steps por tipo de evento ──────────────────────────────────────────── */

export const WIZARD_STEPS: Record<string, StepConfig[]> = {
  WEDDING: [
    { title: "Básicos", component: Step1BasicInfo },
    { title: "Diseño", component: Step2Template },
    { title: "Historia", component: Step2Story },
    { title: "Lugares", component: Step3Venues },
    { title: "Dress Code", component: Step4DressCode },
    { title: "Avanzado", component: Step5Advanced },
    { title: "Revisión", component: Step6Review },
  ],
  BIRTHDAY: [
    { title: "Básicos", component: Step1BasicInfo },
    { title: "Diseño", component: Step2Template },
    { title: "El festejado", component: Step2Birthday },
    { title: "Lugar", component: Step3SingleVenue },
    { title: "Dress Code", component: Step4DressCode },
    { title: "Lista de deseos", component: Step5WishList },
    { title: "Revisión", component: Step6Review },
  ],
  XV: [
    { title: "Básicos", component: Step1BasicInfo },
    { title: "Diseño", component: Step2Template },
    { title: "Su historia", component: Step2QuinceStory },
    { title: "Lugares", component: Step3QuinceVenues },
    { title: "Corte de honor", component: Step4Court },
    { title: "Dress Code", component: Step4DressCode },
    { title: "Revisión", component: Step6Review },
  ],
  BABY_SHOWER: [
    { title: "Básicos", component: Step1BasicInfo },
    { title: "Diseño", component: Step2Template },
    { title: "El bebé", component: Step2Baby },
    { title: "Lugar", component: Step3SingleVenue },
    { title: "Tema", component: Step4Theme },
    { title: "Lista de regalos", component: Step5WishList },
    { title: "Revisión", component: Step6Review },
  ],
};

/* ─── Fallback para tipos sin config específica ─────────────────────────── */

const DEFAULT_STEPS: StepConfig[] = [
  { title: "Básicos", component: Step1BasicInfo },
  { title: "Lugar", component: Step3SingleVenue },
  { title: "Dress Code", component: Step4DressCode },
  { title: "Avanzado", component: Step5Advanced },
  { title: "Revisión", component: Step6Review },
];

export function getWizardSteps(eventType: string): StepConfig[] {
  return WIZARD_STEPS[eventType] ?? DEFAULT_STEPS;
}
