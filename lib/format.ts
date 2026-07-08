const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(cents: number): string {
  return mxn.format(cents / 100);
}

export function formatPuffs(puffs: number): string {
  return puffs >= 1000 ? `${(puffs / 1000).toFixed(0)}K puffs` : `${puffs} puffs`;
}
