import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ArrowUp,
  Asterisk,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { SortableHeader } from "./SortableHeader";
import type { HocKy } from "../../types/HocKy";
import type { NamHoc } from "../../types/NamHoc";
import Loading from "../Loading";
import { EmptyTableState } from "./EmptyTableState";
import { KetQuaHocTapExportButton } from "../PDFExportButton";

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
  },  {
    accessorKey: "maHp",
    header: ({ column }) => (
      <SortableHeader column={column} title="Mã học phần" className="ml-2 hover:text-white/80 transition-colors" />
    ),
  },  {
    accessorKey: "tenHp",
    header: ({ column }) => (
      <SortableHeader column={column} title="Tên học phần" className="ml-2 hover:text-white/80 transition-colors" />
    ),
  },  {
    accessorKey: "dieuKien",
    header: ({ column }) => (
      <SortableHeader column={column} title="Điều kiện" className="ml-2 hover:text-white/80 transition-colors" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.getValue("dieuKien") ? (
          <Asterisk className="text-red-600 w-4 h-4" />
        ) : (
          <></>
        )}
      </div>
    ),
  },  {
    accessorKey: "nhomHp",
    header: ({ column }) => (
      <SortableHeader column={column} title="Nhóm học phần" className="ml-2 hover:text-white/80 transition-colors" />
    ),
  },
  {
    accessorKey: "soTinChi",
    header: ({ column }) => (
      <SortableHeader column={column} title="Số tín chỉ" className="ml-2 hover:text-white/80 transition-colors" />
    ),
  },  {
    accessorKey: "diemChu",
    header: ({ column }) => (
      <SortableHeader column={column} title="Điểm chữ" className="ml-2 hover:text-white/80 transition-colors" />
    ),
  },
  {
    accessorKey: "diemSo",
    header: ({ column }) => (
      <SortableHeader column={column} title="Điểm số" className="ml-2 hover:text-white/80 transition-colors" />
    ),
  },
];
interface KetQuaHocTapTableProps {
  data: KetQuaHocTapTableType[];
  name?: string;
  initialExpanded?: boolean;
  // Server-side pagination props
  enableServerPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  loading?: boolean;
}

const KetQuaHocTapTable: React.FC<KetQuaHocTapTableProps> = ({
  data,
  name = "Kết Quả Học Tập",
  initialExpanded = true,
  enableServerPagination = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
  onPageSizeChange,
  loading = false,
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);

  // Cập nhật trạng thái mở rộng khi initialExpanded thay đổi
  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  const memorizedColumns = useMemo(() => columns, []);
  const dataRow = useMemo(() => data, [data]);

  const table = useReactTable({
    data: dataRow,
    columns: memorizedColumns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: enableServerPagination ? undefined : getFilteredRowModel(),
    getPaginationRowModel: enableServerPagination ? undefined : getPaginationRowModel(),
    manualPagination: enableServerPagination,
    pageCount: enableServerPagination ? totalPages : undefined,
    initialState: {
      pagination: {
        pageSize: enableServerPagination ? pageSize : 7,
        pageIndex: enableServerPagination ? currentPage - 1 : 0,
      },
    },
  });

  return (
    <div className="overflow-x-auto rounded-lg shadow-xl bg-gray-200 transition-all duration-200 hover:shadow-2xl">
      <div className="text-center flex bg-gradient-to-r from-blue-400 to-blue-500 py-3 text-lg text-white relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm học phần..."
            className="border-none px-3 py-1.5 rounded-lg bg-white/90 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white text-sm placeholder-gray-500 transition-all duration-200 w-48"
          />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <h3 className="font-bold uppercase tracking-wide">{name}</h3>
          {(data.length > 0 || enableServerPagination) && (
            <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {enableServerPagination ? (
                <>
                  {totalElements} học phần
                  {totalPages > 1 && (
                    <span className="ml-1">
                      • Trang {currentPage}/{totalPages}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {globalFilter
                    ? `${table.getFilteredRowModel().rows.length}/${data.length}`
                    : `${data.length}`}{" "}
                  học phần
                  {table.getPageCount() > 1 && (
                    <span className="ml-1">
                      • Trang {table.getState().pagination.pageIndex + 1}/
                      {table.getPageCount()}
                    </span>
                  )}
                </>
              )}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* PDF Export Button */}
          {data.length > 0 && (
            <KetQuaHocTapExportButton
              data={data}
              title={name}
              variant="minimal"
              size="sm"
              showText={false}
              className="text-white hover:bg-white/20 border-white/30"
            />
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            aria-label={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
            title={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
          >
            <ArrowUp
              className={`w-5 h-5 text-white transition-all duration-300 group-hover:scale-110 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-400 ease-in-out overflow-hidden ${
          isExpanded
            ? "max-h-[2000px] opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 transform -translate-y-2"
        }`}
      >
        <div
          className={`transition-all duration-200 ${isExpanded ? "delay-100" : ""}`}
        >
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="text-center">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-2 py-3 border-1 bg-gradient-to-b from-blue-400 to-blue-500 text-center text-lg font-medium text-white border-b transition-colors duration-200 hover:from-blue-500 hover:to-blue-600 ${
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
              {loading ? (
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0]?.headers.filter((header) => header.id !== "id").length || columns.length}
                    className="px-5 py-8 text-center text-gray-500 bg-gray-50 border-b-1 border-gray-200"
                  >                    
                  <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <Loading showOverlay={false} message="Đang tải dữ liệu..." />
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-200 bg-gray-50 transition-colors duration-200 ${
                      row.id === "id" ? "hidden" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-5 py-2 border-b-1 border-gray-200 text-center border-x-gray-300 border-x-1 ${
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      table
                        .getHeaderGroups()[0]
                        ?.headers.filter((header) => header.id !== "id")
                        .length || columns.length
                    }
                    className="px-5 py-8 text-center text-gray-500 bg-gray-50 border-b-1 border-gray-200"
                  >                    
                  <EmptyTableState
                      title="Chưa có kết quả học tập"
                      description="Không có dữ liệu để hiển thị cho mục này"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {((enableServerPagination && totalPages > 1) ||
          (!enableServerPagination && (table.getPageCount() > 1 || table.getFilteredRowModel().rows.length > 7))) && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                {enableServerPagination ? (
                  <span>
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalElements)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">
                      {totalElements}
                    </span>{" "}
                    học phần
                  </span>
                ) : (
                  <span>
                    Hiển thị{" "}
                    <span className="font-medium">
                      {table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                        1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                          table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                      )}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">
                      {table.getFilteredRowModel().rows.length}
                    </span>{" "}
                    học phần
                  </span>
                )}
              </div>
              {/* Page size selector */}
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <span>Số dòng:</span>
                <select
                  value={enableServerPagination ? pageSize : table.getState().pagination.pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    if (enableServerPagination) {
                      onPageSizeChange?.(newSize);
                    } else {
                      table.setPageSize(newSize);
                    }
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[5, 7, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Phân trang chỉ hiển thị khi có hơn 1 trang*/}
            {((enableServerPagination && totalPages > 1) || (!enableServerPagination && table.getPageCount() > 1)) && (
              <div className="flex items-center space-x-2">
                {/* First page button */}
                <button
                  onClick={() => {
                    if (enableServerPagination) {
                      onPageChange?.(1);
                    } else {
                      table.setPageIndex(0);
                    }
                  }}
                  disabled={enableServerPagination ? currentPage <= 1 : !table.getCanPreviousPage()}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    (enableServerPagination ? currentPage <= 1 : !table.getCanPreviousPage())
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  title="Trang đầu"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Previous page button */}
                <button
                  onClick={() => {
                    if (enableServerPagination) {
                      onPageChange?.(currentPage - 1);
                    } else {
                      table.previousPage();
                    }
                  }}
                  disabled={enableServerPagination ? currentPage <= 1 : !table.getCanPreviousPage()}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    (enableServerPagination ? currentPage <= 1 : !table.getCanPreviousPage())
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const currPage = enableServerPagination ? currentPage : table.getState().pagination.pageIndex + 1;
                    const totalPgs = enableServerPagination ? totalPages : table.getPageCount();
                    const pages = [];

                    // Always show first page
                    if (totalPgs > 0) {
                      pages.push(1);
                    }

                    // Show pages around current page
                    const start = Math.max(2, currPage - 1);
                    const end = Math.min(totalPgs - 1, currPage + 1);

                    // Add ellipsis if needed
                    if (start > 2) {
                      pages.push(-1); // -1 represents ellipsis
                    }

                    // Add middle pages
                    for (let i = start; i <= end; i++) {
                      if (i > 1 && i < totalPgs) {
                        pages.push(i);
                      }
                    }

                    // Add ellipsis if needed
                    if (end < totalPgs - 1) {
                      pages.push(-2); // -2 represents ellipsis
                    }

                    // Always show last page
                    if (totalPgs > 1) {
                      pages.push(totalPgs);
                    }

                    return pages.map((page, index) => {
                      if (page === -1 || page === -2) {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }

                      const isActive = page === currPage;
                      return (
                        <button
                          key={page}
                          onClick={() => {
                            if (enableServerPagination) {
                              onPageChange?.(page);
                            } else {
                              table.setPageIndex(page - 1);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Next page button */}
                <button
                  onClick={() => {
                    if (enableServerPagination) {
                      onPageChange?.(currentPage + 1);
                    } else {
                      table.nextPage();
                    }
                  }}
                  disabled={enableServerPagination ? currentPage >= totalPages : !table.getCanNextPage()}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    (enableServerPagination ? currentPage >= totalPages : !table.getCanNextPage())
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  title="Trang tiếp"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last page button */}
                <button
                  onClick={() => {
                    if (enableServerPagination) {
                      onPageChange?.(totalPages);
                    } else {
                      table.setPageIndex(table.getPageCount() - 1);
                    }
                  }}
                  disabled={enableServerPagination ? currentPage >= totalPages : !table.getCanNextPage()}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    (enableServerPagination ? currentPage >= totalPages : !table.getCanNextPage())
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  title="Trang cuối"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KetQuaHocTapTable;
