import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SortableHeader } from "./SortableHeader";
import Loading from "../Loading";

// Local interface for table data
interface SemesterTableData {
  tenHocKy: string;
  namHoc: string;
  diemTBHocKy: number;
  diemTBTichLuy: number;
  soTinChi: number;
}

interface SemesterOverviewTableProps {
  data: SemesterTableData[];
  loading?: boolean;
}

const columns: ColumnDef<SemesterTableData>[] = [
  {
    accessorKey: "tenHocKy",
    header: ({ column }) => (
      <SortableHeader column={column} title="Học kỳ" className="ml-2 hover:text-white/80 transition-colors" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-gray-900">
        {row.getValue("tenHocKy")}
      </div>
    ),
  },
  {
    accessorKey: "namHoc",
    header: ({ column }) => (
      <SortableHeader column={column} title="Năm học" className="ml-2 hover:text-white/80 transition-colors" />
    ),
    cell: ({ row }) => (
      <div className="text-center text-gray-500">
        {row.getValue("namHoc")}
      </div>
    ),
  },  {
    accessorKey: "diemTBHocKy",
    header: ({ column }) => (
      <SortableHeader column={column} title="Điểm TB Học kỳ" className="ml-2 hover:text-white/80 transition-colors" />
    ),
    cell: ({ row }) => {
      const diemTBHocKy = row.getValue("diemTBHocKy") as number;
      return (
        <div className="text-center">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              diemTBHocKy >= 3.5
                ? "bg-green-100 text-green-800"
                : diemTBHocKy >= 2.5
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {diemTBHocKy}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "diemTBTichLuy",
    header: ({ column }) => (
      <SortableHeader column={column} title="Điểm TB Tích lũy" className="ml-2 hover:text-white/80 transition-colors" />
    ),
    cell: ({ row }) => {
      const diemTBTichLuy = row.getValue("diemTBTichLuy") as number;
      return (
        <div className="text-center">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              diemTBTichLuy >= 3.5
                ? "bg-green-100 text-green-800"
                : diemTBTichLuy >= 2.5
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {diemTBTichLuy}
          </span>
        </div>
      );
    },
  },
];

export default function SemesterOverviewTable({ data, loading = false }: SemesterOverviewTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const memoizedData = useMemo(() => data || [], [data]);

  const table = useReactTable({
    data: memoizedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  if (loading) {
    return (
      <div className="space-y-4">
        <Loading showOverlay={false} message="Đang tải dữ liệu bảng..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
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
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
