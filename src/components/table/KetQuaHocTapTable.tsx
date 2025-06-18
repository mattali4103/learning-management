import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, Asterisk } from "lucide-react";
import React, { useMemo, useState } from "react";
import type { HocKy } from "../../types/hocKy";
import type { NamHoc } from "../../types/namHoc";

// define columns for the KetQuaHocTapTable
export interface KetQuaHocTapTableType {
  id: number;
  maHp: string;
  tenHp: string;
  dieuKien: boolean;
  nhomHp: string;
  soTinChi: number;
  diemChu: string;
  diemSo: number;
  hocKy: HocKy;
  namHoc: NamHoc;
}

const columns: ColumnDef<KetQuaHocTapTableType>[] = [
  {
    accessorKey: "id",
    header: () => <span className="text-center hidden"></span>,
  },
  {
    accessorKey: "maHp",
    header: ({ column }) => (
      <div className="flex items-center justify-center">
        Mã học phần
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    accessorKey: "tenHp",
    header: ({ column }) => (
      <div className="flex items-center justify-center">
        Tên học phần
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    accessorKey: "dieuKien",
    header: ({ column }) => (
      <div className="flex items-center justify-center">
        Tên học phần
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.getValue("dieuKien") ? (
          <Asterisk className="text-black w-3  h-3" />
        ) : (
          <></>
        )}
      </div>
    ),
  },
  {
    accessorKey: "nhomHp",
    header: ({ column }) => (
      <div className="flex items-center justify-center">
        Nhóm học phần
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    accessorKey: "soTinChi",
    header: ({ column }) => (
      <div className="flex items-center justify-center">
        Số tín chỉ
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    accessorKey: "diemChu",
    header: ({ column }) => (
      <div className="flex items-center justify-center">
        Điểm chữ
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    accessorKey: "diemSo",
    header: ({ column }) => (
      <div className="flex items-center justify-center">
        Điểm số
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
interface KetQuaHocTapTableProps {
  data: KetQuaHocTapTableType[];
}
const KetQuaHocTapTable: React.FC<KetQuaHocTapTableProps> = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const memorizedCollumns = useMemo(() => columns, []);
  const table = useReactTable({
    data: data,
    columns: memorizedCollumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <div className="overflow-y-auto p-4 rounded-lg shadow-xl bg-gray-200 mb-2">
        {/* TABLE */}
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
            Kết Quả Học Tập
          </p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-center">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-2 py-4 border-1 text-black bg-blue-400  text-center text-base font-medium border-b ${
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
                    className={`px-1.5 py-3 border-b-1 border-gray-200 text-center border-x-gray-300 border-x-1 ${
                      cell.column.id === "id" ? "hidden" : ""
                    }`}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,

                      cell.getContext()
                    )}
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

export default KetQuaHocTapTable;
