import { Users } from "lucide-react";

export const metadata = {
  title: "Invitados | Dashboard",
};

export default function GuestsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-midnight)] tracking-tight">Invitados</h1>
        <p className="mt-1 text-[var(--color-midnight)]/70">
          Próximamente: Gestión de invitados
        </p>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 rounded-full bg-[var(--color-midnight)]/5 p-6">
          <Users className="h-12 w-12 text-[var(--color-midnight)]/40" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-midnight)]">
          Esta sección estará disponible en la Fase 3 del roadmap
        </h2>
        <p className="mt-2 max-w-md text-[var(--color-midnight)]/60">
          Aquí podrás gestionar la lista de invitados por evento, ver confirmaciones de asistencia (RSVPs) y asignar mesas.
        </p>
      </div>
    </div>
  );
}
