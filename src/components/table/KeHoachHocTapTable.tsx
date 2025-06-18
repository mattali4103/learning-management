import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

interface KeHoachHocTapTableProps {
  data: any[];
  columns: ColumnDef<any>[];
}
export const KeHoachHocTapTable: React.FC<KeHoachHocTapTableProps> = ({
  data, columns
}) => {
    const [globalFilter, setGlobalFilter] = useState<string>("");

    const dataRow = useMemo(() => data,[data])

    const table = useReactTable({
    data : dataRow,
    columns : columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    });

  return (
    <>
      <div className="overflow-x-auto p-2 rounded-lg shadow-xl bg-gray-200">
        <div className="text-center flex bg-blue-400 py-2 text-lg border-b-1 text-white">
          <div className="absolute ml-1">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm..."
              className="flex justify-baseline border-none px-1 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <p className="w-full flex justify-center items-center">
            Kế Hoạch Học Tập
          </p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-center">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-2 py-3 border-1 bg-blue-400 text-center text-lg font-medium text-gray-700 border-b ${
                      header.id === "id" ? "hidden" : ""
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-200 bg-gray-50 ${
                  row.id === "id" ? "hidden" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-5 py-1.5 border-b-1 border-gray-200 text-center border-x-gray-300 border-x-1 ${
                      cell.column.id === "id" ? "hidden" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
