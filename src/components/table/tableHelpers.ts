import type { Column } from "../../lib/Constants";

export type SortConfig =
  | {
      key: string;
      direction: "asc" | "desc";
    }
  | null;

  // Build initial column widths based on the provided columns, using their initialWidth or a default value
export const buildInitialColumnWidths = (
  columns: Column[]
): Record<string, number> =>
  columns.reduce<Record<string, number>>((acc, col) => { // Set initial width for each column based on its key, using the column's initialWidth or a default of 150
    acc[col.key] = col.initialWidth ?? 150; // Use nullish coalescing to assign default width if initialWidth is not provided
    return acc;
  }, {});

  // Ensure that column widths are maintained for existing columns and new columns get default widths
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

// Process rows based on current filters and sorting configuration
export const processRows = (
  rows: Array<Record<string, any>>,
  columns: Column[],
  filters: Record<string, string>,
  sortConfig: SortConfig
) => {
  const filtered = rows.filter((row) => // Apply filters: check if each cell in the row matches the filter criteria for its column
    columns.every((col) => {
      const filterValue = filters[col.key];
      if (!filterValue) return true;

      const cell = row[col.key];
      const cellString =
        cell === undefined || cell === null ? "" : String(cell);

      return cellString.toLowerCase().includes(filterValue.toLowerCase()); // Case-insensitive substring match
    })
  );

  if (!sortConfig) return filtered;

  const { key, direction } = sortConfig;
  const factor = direction === "asc" ? 1 : -1; // Handle sorting with null/undefined values and different data types

  return [...filtered].sort((a, b) => { // Handle null/undefined values and compare
    const aVal = a[key];
    const bVal = b[key];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1 * factor;
    if (bVal == null) return 1 * factor;

    if (aVal < bVal) return -1 * factor;
    if (aVal > bVal) return 1 * factor;
    return 0; // Equal values remain unchanged in order
  });
};

