"use client";

import { motion } from "motion/react";
import type { CourtMember } from "@/types/event-settings";

export function CourtOfHonor({
  court,
  primaryColor,
}: {
  court?: CourtMember[];
  primaryColor: string;
}) {
  if (!court || court.length === 0) return null;

  // Separar por roles
  const chambelanes = court.filter((c) => c.role === "chambelan");
  const chambelanas = court.filter((c) => c.role === "chambelana");
  const padrinos = court.filter((c) => c.role === "padrino");
  const madrinas = court.filter((c) => c.role === "madrina");

  const Section = ({ title, members, icon }: { title: string; members: CourtMember[]; icon: string }) => {
    if (members.length === 0) return null;
    return (
      <div className="mb-12">
        <h3 className="font-serif text-2xl text-[#2c2c2c] mb-6 flex items-center justify-center gap-3">
          <span style={{ color: primaryColor }}>{icon}</span>
          {title}
          <span style={{ color: primaryColor }}>{icon}</span>
        </h3>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {members.map((m, i) => (
            <span key={i} className="text-lg text-[#666] font-light">
              {m.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-[#FAFAFA] py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-[#2c2c2c] mb-4">
            Corte de Honor
          </h2>
          <p className="text-[#888] font-light tracking-widest uppercase text-sm">
            Las personas especiales que me acompañan
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Section title="Chambelanes" members={chambelanes} icon="♦" />
          <Section title="Damas" members={chambelanas} icon="❀" />
          <Section title="Padrinos" members={padrinos} icon="✧" />
          <Section title="Madrinas" members={madrinas} icon="✧" />
        </motion.div>
      </div>
    </section>
  );
}
