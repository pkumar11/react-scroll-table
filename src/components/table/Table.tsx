import React, { useEffect, useMemo, useState } from "react";
import type { Column } from "../../lib/Constants";
import "./Table.css";
import {
  buildInitialColumnWidths,
  ensureColumnWidthsForColumns,
  processRows,
  type SortConfig,
} from "./tableHelpers";
import { throttle } from "lodash";

type TableProps = {
  columns: Column[];
  rows: Array<Record<string, any>>;
  onRowDelete?: (row: Record<string, any>) => void;
  onEndReached?: () => void;
};

type ResizeState =
  | {
      key: string;
      startX: number;
      startWidth: number;
    }
  | null;

const Table: React.FC<TableProps> = ({
  columns,
  rows,
  onRowDelete,
  onEndReached,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    buildInitialColumnWidths(columns)
  );
  const [resizing, setResizing] = useState<ResizeState>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  useEffect(() => {
    setColumnWidths((prev) => ensureColumnWidthsForColumns(prev, columns));
  }, [columns]);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - resizing.startX;
      const nextWidth = Math.max(80, resizing.startWidth + deltaX);

      setColumnWidths((prev) => ({
        ...prev,
        [resizing.key]: nextWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const startResize = (
    event: React.MouseEvent<HTMLDivElement>,
    key: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setResizing({
      key,
      startX: event.clientX,
      startWidth: columnWidths[key] ?? 150,
    });
  };

  const handleRowClick = (rowIndex: number, row: Record<string, any>) => {
    setEditingRowIndex(rowIndex);
    setEditValues(row);
  };


  const handleDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: Record<string, any>
  ) => {
    event.stopPropagation();
    if (onRowDelete) {
      onRowDelete(row);
    }
  };

  const handleScroll = throttle((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const threshold = 100;
    if (
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - threshold
    ) {
      if (onEndReached) {
        onEndReached();
      }
    }
  }, 200); // Throttle to execute at most once every 200ms

  const processedRows = useMemo(
    () => processRows(rows, columns, filters, sortConfig),
    [rows, columns, filters, sortConfig]
  );

  const Row = React.memo(({ row, rowIndex }: { row: Record<string, any>; rowIndex: number }) => {
    const isEditing = editingRowIndex === rowIndex;
    return (
      <tr
        key={rowIndex}
        className={`table-row${isEditing ? " table-row-editing" : ""}`}
        onClick={() => handleRowClick(rowIndex, row)}
      >
        {columns.map((col) => {
          const width = columnWidths[col.key] ?? 150;
          const value =
            isEditing && col.key in editValues
              ? editValues[col.key]
              : row[col.key];
          return (
            <td
              key={col.key}
              style={{
                width,
                minWidth: width,
                maxWidth: width,
              }}
              className="table-body-cell"
            >
           
              <span className="table-cell-value">{value}</span>
            </td>
          );
        })}
        <td className="table-body-cell delete-cell">
          <button
            type="button"
            className="table-delete-button"
            onClick={(event) => handleDeleteClick(event, row)}
          >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="15px" height="15px">    <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"/></svg>
          </button>
        </td>
      </tr>
    );
  });

  return (
    <div className="table-container" onScroll={handleScroll}>
      <table className="table-root">
        <thead>
          <tr>
            {columns.map((col) => {
              const width = columnWidths[col.key] ?? 150;
              const isSorted = sortConfig?.key === col.key;
              const direction = sortConfig?.direction;

              return (
                <th
                  key={col.key}
                  style={{
                    width,
                    minWidth: width,
                    maxWidth: width,
                  }}
                  className="table-header-cell"
                >
                  <div
                    className="table-header-label"
                    onClick={() => handleSort(col.key)}
                  >
                    <span>{col.title}</span>
                    <span className="table-sort-icons">
                      <span
                        style={{
                          fontWeight:
                            isSorted && direction === "asc" ? "bold" : "normal",
                        }}
                      >
                        ▲
                      </span>
                      <span
                        style={{
                          marginLeft: 2,
                          fontWeight:
                            isSorted && direction === "desc"
                              ? "bold"
                              : "normal",
                        }}
                      >
                        ▼
                      </span>
                    </span>
                  </div>
                  <input
                    className="table-filter-input"
                    placeholder="Filter..."
                    value={filters[col.key] ?? ""}
                    onChange={(event) =>
                      handleFilterChange(col.key, event.target.value)
                    }
                    onClick={(event) => event.stopPropagation()}
                  />
                  {!col.isFixed && (
                    <div
                      className="table-resizer"
                      onMouseDown={(event) => startResize(event, col.key)}
                    />
                  )}
                </th>
              );
            })}
            <th className="table-header-cell table-header-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {processedRows.map((row, rowIndex) => (
            <Row key={rowIndex} row={row} rowIndex={rowIndex} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;