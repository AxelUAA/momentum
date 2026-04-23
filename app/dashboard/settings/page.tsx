import { Settings } from "lucide-react";

export const metadata = {
  title: "Configuración | Dashboard",
};

export default function SettingsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight">Configuración</h1>
        <p className="mt-1 text-[var(--color-midnight)]/70">
          Próximamente: Configuración
        </p>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 rounded-full bg-[var(--color-midnight)]/5 p-6">
          <Settings className="h-12 w-12 text-[var(--color-midnight)]/40" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-midnight)]">
          Esta sección estará disponible próximamente
        </h2>
        <p className="mt-2 max-w-md text-[var(--color-midnight)]/60">
          Aquí podrás configurar tu perfil, datos de facturación, preferencias de notificaciones y más.
        </p>
      </div>
    </div>
  );
}
