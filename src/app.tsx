import {
  type AggregationFn,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  type GroupingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { type Item, items } from "./data";

declare module "@tanstack/react-table" {
  interface AggregationFns {
    truthyCount: AggregationFn<Item>;
  }
}

export function App() {
  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: "username",
        header: () => (
          <span className="text-left whitespace-normal">Имя пользователя</span>
        ),
      },
      {
        accessorKey: "user_email",
        header: () => (
          <span className="text-left whitespace-normal">Email</span>
        ),
      },
      {
        accessorKey: "user_subscription_date",
        header: () => (
          <span className="text-left whitespace-normal">Дата подписки</span>
        ),
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return value ? value : "-";
        },
      },
      {
        accessorKey: "link_name",
        header: () => (
          <span className="text-left whitespace-normal">Название ссылки</span>
        ),
      },
      {
        accessorKey: "link_url",
        header: () => (
          <span className="text-left whitespace-normal">URL ссылки</span>
        ),
      },
      {
        accessorKey: "link_source_name",
        header: () => (
          <span className="text-left whitespace-normal">Source</span>
        ),
      },
      {
        accessorKey: "link_medium_name",
        header: () => (
          <span className="text-left whitespace-normal">Medium</span>
        ),
      },
      {
        accessorKey: "link_campaign_name",
        header: () => (
          <span className="text-left whitespace-normal">Campaign</span>
        ),
      },
      {
        accessorKey: "link_content_name",
        header: () => (
          <span className="text-left whitespace-normal">Content</span>
        ),
      },
      {
        accessorKey: "product_name",
        header: () => (
          <span className="text-left whitespace-normal">Название продукта</span>
        ),
      },

      {
        accessorKey: "request_date",
        id: "request_date",
        header: () => (
          <span className="text-left whitespace-normal">Дата заявки</span>
        ),
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return value ? value : "-";
        },
      },
      {
        accessorKey: "purchase_date",
        id: "purchase_date",
        header: () => (
          <span className="text-left whitespace-normal">Дата покупки</span>
        ),
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return value ? value : "-";
        },
      },
      {
        accessorKey: "purchase_date",
        id: "is_purchase",
        header: () => (
          <span className="text-left whitespace-normal">Совершил покупку</span>
        ),
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          console.log("call 3", value);
          return typeof value === "string" ? "Да" : "Нет";
        },
        getGroupingValue: (row) => {
          console.log("call 1");
          const value = row.purchase_date ? true : false;
          return value;
        },
        aggregationFn: "truthyCount",
      },
      {
        accessorKey: "amount",
        id: "sum_amount", // Уникальный ID для первой колонки amount
        header: () => (
          <span className="text-left whitespace-normal">Сумма</span>
        ),
        aggregationFn: "sum",
        aggregatedCell: ({ getValue }) => {
          const value = getValue() as number;
          return `Общая: ${value.toLocaleString("ru-RU")} ₽`;
        },
        getGroupingValue: (row) => {
          const value = row.amount ?? 0;
          return value;
        },
        cell: ({ getValue }) => {
          const value = getValue<number | null>();
          return typeof value === "number" ? `${value} ₽` : "-";
        },
      },
    ],
    []
  );

  const [grouping, setGrouping] = useState<GroupingState>(["link_source_name"]);

  const table = useReactTable({
    data: items,
    columns,
    state: {
      grouping,
    },
    onGroupingChange: setGrouping,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
    aggregationFns: {
      truthyCount: (columnId, leafRows) => {
        const count = leafRows.filter((row) => {
          const value = row.getValue(columnId);
          console.log("call 2", columnId, value);

          return !!value;
        }).length;
        return count;
      },
    },
  });

  return (
    <div className="p-2">
      <div className="table-container">
        <table className="table-auto w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {header.column.getCanGroup() ? (
                            // If the header can be grouped, let's add a toggle
                            <button
                              {...{
                                onClick:
                                  header.column.getToggleGroupingHandler(),
                                style: {
                                  cursor: "pointer",
                                },
                              }}
                            >
                              {header.column.getIsGrouped()
                                ? `🛑(${header.column.getGroupedIndex()}) `
                                : `👊 `}
                            </button>
                          ) : null}{" "}
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        {...{
                          style: {
                            background: cell.getIsGrouped()
                              ? "#0aff0082"
                              : cell.getIsAggregated()
                              ? "#ffa50078"
                              : cell.getIsPlaceholder()
                              ? "#ff000042"
                              : "white",
                          },
                        }}
                      >
                        {cell.getIsGrouped() ? (
                          // If it's a grouped cell, add an expander and row count
                          <>
                            <button
                              {...{
                                onClick: row.getToggleExpandedHandler(),
                                style: {
                                  cursor: row.getCanExpand()
                                    ? "pointer"
                                    : "normal",
                                },
                              }}
                            >
                              {row.getIsExpanded() ? "👇" : "👉"}{" "}
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}{" "}
                              ({row.subRows.length})
                            </button>
                          </>
                        ) : cell.getIsAggregated() ? (
                          // If the cell is aggregated, use the Aggregated
                          // renderer for cell
                          flexRender(
                            cell.column.columnDef.aggregatedCell ??
                              cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                          // Otherwise, just render the regular cell
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            min="1"
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50, 100, 200, 500].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{table.getRowModel().rows.length} Rows</div>

      <pre>{JSON.stringify(grouping, null, 2)}</pre>
    </div>
  );
}
