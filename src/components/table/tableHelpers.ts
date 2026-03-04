import type { Column } from "../../lib/Constants";

export type SortConfig =
  | {
      key: string;
      direction: "asc" | "desc";
    }
  | null;

export const buildInitialColumnWidths = (
  columns: Column[]
): Record<string, number> =>
  columns.reduce<Record<string, number>>((acc, col) => {
    acc[col.key] = col.initialWidth ?? 150;
    return acc;
  }, {});

export const ensureColumnWidthsForColumns = (
  prev: Record<string, number>,
  columns: Column[]
): Record<string, number> => {
  const next: Record<string, number> = { ...prev };
  columns.forEach((col) => {
    if (next[col.key] == null) {
      next[col.key] = col.initialWidth ?? 150;
    }
  });
  return next;
};

export const processRows = (
  rows: Array<Record<string, any>>,
  columns: Column[],
  filters: Record<string, string>,
  sortConfig: SortConfig
) => {
  const filtered = rows.filter((row) =>
    columns.every((col) => {
      const filterValue = filters[col.key];
      if (!filterValue) return true;

      const cell = row[col.key];
      const cellString =
        cell === undefined || cell === null ? "" : String(cell);

      return cellString.toLowerCase().includes(filterValue.toLowerCase());
    })
  );

  if (!sortConfig) return filtered;

  const { key, direction } = sortConfig;
  const factor = direction === "asc" ? 1 : -1;

  return [...filtered].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1 * factor;
    if (bVal == null) return 1 * factor;

    if (aVal < bVal) return -1 * factor;
    if (aVal > bVal) return 1 * factor;
    return 0;
  });
};

