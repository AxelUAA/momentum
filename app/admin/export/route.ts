import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: (string | number)[][]): string {
  // BOM para que Excel abra acentos correctamente
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

function parseDate(value: string | null, fallback: Date, endOfDay = false): Date {
  const d = value ? new Date(`${value}T00:00:00`) : fallback;
  const result = isNaN(d.getTime()) ? fallback : d;
  if (endOfDay) result.setHours(23, 59, 59, 999);
  return result;
}

const mxn = (cents: number) => (cents / 100).toFixed(2);

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const tipo = params.get("tipo") ?? "ventas";
  const now = new Date();
  const from = parseDate(
    params.get("desde"),
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const to = parseDate(params.get("hasta"), now, true);

  let csv: string;

  if (tipo === "gastos") {
    const expenses = await prisma.expense.findMany({
      where: { expenseDate: { gte: from, lte: to } },
      orderBy: { expenseDate: "asc" },
    });
    csv = toCsv([
      ["Fecha", "Categoría", "Descripción", "Monto (MXN)"],
      ...expenses.map((e) => [
        e.expenseDate.toISOString().slice(0, 10),
        e.category,
        e.description,
        mxn(e.amountCents),
      ]),
    ]);
  } else {
    const sales = await prisma.sale.findMany({
      where: { saleDate: { gte: from, lte: to } },
      include: { items: true, payments: true },
      orderBy: { saleDate: "asc" },
    });
    csv = toCsv([
      [
        "Código",
        "Fecha",
        "Cliente",
        "Teléfono",
        "Tipo",
        "Estado",
        "Productos",
        "Total (MXN)",
        "Costo (MXN)",
        "Pagado (MXN)",
        "Saldo (MXN)",
      ],
      ...sales.map((s) => {
        const paid = s.payments.reduce((sum, p) => sum + p.amountCents, 0);
        return [
          s.code,
          s.saleDate.toISOString().slice(0, 10),
          s.customerName,
          s.customerPhone ?? "",
          s.type === "CASH" ? "Contado" : "A plazos",
          s.status === "OPEN"
            ? "Por cobrar"
            : s.status === "PAID"
              ? "Pagada"
              : "Cancelada",
          s.items
            .map(
              (i) =>
                `${i.quantity}x ${i.productName}${i.variantName ? ` (${i.variantName})` : ""}`
            )
            .join(" | "),
          mxn(s.totalCents),
          mxn(s.costCents),
          mxn(paid),
          mxn(s.status === "CANCELLED" ? 0 : s.totalCents - paid),
        ];
      }),
    ]);
  }

  const name = `momentum-${tipo}-${from.toISOString().slice(0, 10)}-a-${to.toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
