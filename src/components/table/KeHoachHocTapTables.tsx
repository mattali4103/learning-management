/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import type { HocPhan } from "../../types/HocPhan";
import { ArrowUpDown, Trash2 } from "lucide-react";
import Error from "../Error";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import DeleteBookModal from "../modals/DeleteModal";

export const KeHoachHocTapTables = ({
  keHoachHocTap,
}: {
  keHoachHocTap: any[] | null;
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHocPhanId, setSelectedHocPhanId] = useState<string | null>(null);
  const [data, setData] = useState<KeHoachHocTap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flatten the nested data structure
  useEffect(() => {
    if (Array.isArray(keHoachHocTap) && keHoachHocTap.length > 0) {
      const flattenedData: KeHoachHocTap[] = keHoachHocTap.map((item) => ({
        id: item.id,
        maHp: item.hocPhan.maHp,
        tenHp: item.hocPhan.tenHp,
        tinChi: item.hocPhan.tinChi,
        hocPhanTienQuyet: item.hocPhan.hocPhanTienQuyet,
        loaiHp: item.hocPhan.loaiHp,
        maHocKy: item.hocKy.maHocKy,
        tenHocKy: item.hocKy.tenHocKy,
        namHocId: item.namHoc.id,
        namBdNamKt: `${item.namHoc.namBatDau}-${item.namHoc.namKetThuc}`,
      }));
      setData(flattenedData);
      setIsLoading(false);
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [keHoachHocTap]);

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedHocPhanId) return;
      await apiDelete<any>(KHHT_SERVICE.DELETE.replace(":id", selectedHocPhanId));
      // Update the data state by filtering out the deleted item
      setData((prevData) =>
        prevData.filter((item) => item.id !== Number(selectedHocPhanId))
      );
    } catch (err) {
      setError((err as Error).message || "Lỗi khi xóa học phần");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedHocPhanId(null);
    }
  };

  const columns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => (
          <div className="items-center justify-center hidden">STT</div>
        ),
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      },
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div>{row.getValue("maHp")}</div>,
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tên học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tín chỉ
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "loaiHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Loại học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        id: "maHocKy",
        accessorKey: "tenHocKy",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Học kỳ
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        id: "namHocId",
        accessorKey: "namBdNamKt",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Năm học
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tiên quyết
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-800"
              onClick={() => {
                setSelectedHocPhanId(row.getValue("id"));
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (error) {
    return <Error error={error} />;
  }
  if (isLoading) {
    return <div className="text-center">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto p-2 rounded-lg shadow-xl bg-gray-50">
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
      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default KeHoachHocTapTables;