import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import { useMemo } from "react";

interface SelectedHocPhanTableProps {
  selectedHocPhan: KeHoachHocTap[];
  removeHocPhan: (id: number) => void;
}   

const SelectedHocPhanTable = ({
  selectedHocPhan,
  removeHocPhan,
}: SelectedHocPhanTableProps) => {
  // Columns for selected courses table
  const columns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: () => <div className="text-center">Học phần</div>,
        cell: ({ row }) => <div>{row.getValue("maHp")}</div>,
        size: 100,
      },
      {
        accessorKey: "tenHp",
        header: () => <div className="text-center">Tên học phần</div>,
        size: 200,
      },
      {
        accessorKey: "tinChi",
        header: () => <div className="text-center">Tín chỉ</div>,
        size: 80,
      },
      {
        accessorKey: "loaiHp",
        header: () => <div className="text-center">Loại học phần</div>,
        size: 120,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: () => <div className="text-center">Tiên quyết</div>,
        size: 120,
      },
            {
        accessorKey: "namBdNamKt",
        header: () => <div className="text-center">Năm học</div>,
        size: 100,
      },
      {
        id: "maHocKy",
        accessorKey: "tenHocKy",
        header: () => <div className="text-center">Học kỳ</div>,
        size: 100,
      },
      {
        accessorKey: "action",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => removeHocPhan(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
        size: 150,
      },
    ],
    []
  );

  const table = useReactTable({
    data: selectedHocPhan,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  // Handle submitting selected courses
  const handleSubmit = () => {
    if (selectedHocPhan.length === 0) {
      alert("Không có học phần nào được chọn.");
      return;
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Học phần đã chọn</h2>
      {selectedHocPhan.length === 0 ? (
        <div className="text-center text-gray-500">Chưa có học phần nào được chọn.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="text-center">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-5 py-3 border-b bg-blue-400 text-center text-lg font-medium text-gray-700"
                      style={{ width: header.column.columnDef.size }}
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
                <tr key={row.id} className="hover:bg-gray-200 bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-5 py-1.5 border-x-0 border-gray-200 ${
                        cell.column.id === "tenHp" || cell.column.id === "loaiHp"
                          ? "text-left"
                          : "text-center"
                      }`}
                      style={{ width: cell.column.columnDef.size }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
            >
              Previous
            </button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Gửi kế hoạch
        </button>
      </div>
    </div>
  );
};

export default SelectedHocPhanTable;