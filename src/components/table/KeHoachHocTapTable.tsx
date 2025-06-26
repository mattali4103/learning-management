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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import Loading from "../Loading";
import { EmptyTableState } from "./EmptyTableState";

interface KeHoachHocTapTableProps {
  name: string;
  data: any[];
  columns: ColumnDef<any>[];
  initialExpanded?: boolean;
  loading?: boolean;
  // Server-side pagination props
  enableServerPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  // Empty state props
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: React.ComponentType<any>;
  showEmptyStateWarningBadge?: boolean;
}

export const KeHoachHocTapTable: React.FC<KeHoachHocTapTableProps> = ({
  name,
  data,
  columns,
  initialExpanded = true,
  loading = false,
  // Server-side pagination props
  enableServerPagination = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
  // Empty state props
  emptyStateTitle,
  emptyStateDescription,
  emptyStateIcon,
  showEmptyStateWarningBadge,
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");

  //  Khởi tạo trạng thái mở rộng của bảng
  // Điều chỉnh trạng thái mở rộng của bảng
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);

  //  Sử dụng useEffect để cập nhật trạng thái mở rộng khi initialExpanded thay đổi
  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);
  //   Chuyển đổi dữ liệu thành dạng phù hợp với bảng
  //   Sử dụng useMemo để tối ưu hóa hiệu suất
  //   Chỉ cập nhật khi dữ liệu thay đổi
  const dataRow = useMemo(() => data, [data]);
  const table = useReactTable({
    data: dataRow,
    columns: columns,
    state: {
      globalFilter,
      ...(enableServerPagination && {
        pagination: {
          pageIndex: currentPage - 1, // Convert to 0-based for react-table
          pageSize: pageSize,
        },
      }),
    },
    //   Thiết lập các tùy chọn cho bảng
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enableServerPagination
      ? {
          // Server-side pagination setup
          manualPagination: true,
          pageCount: totalPages,
        }
      : {
          // Client-side pagination setup
          getPaginationRowModel: getPaginationRowModel(),
        }),
    initialState: {
      pagination: {
        pageSize: enableServerPagination ? pageSize : 7,
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
          {data.length > 0 && (
            <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {enableServerPagination ? (
                // Server-side pagination display
                <>
                  {totalElements} học phần
                  {totalPages > 1 && (
                    <span className="ml-1">
                      • Trang {currentPage}/{totalPages}
                    </span>
                  )}
                </>
              ) : (
                // Client-side pagination display
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
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
                    colSpan={
                      table
                        .getHeaderGroups()[0]
                        ?.headers.filter((header) => header.id !== "id")
                        .length || columns.length
                    }
                    className="px-5 py-8 text-center text-gray-500 bg-gray-50 border-b-1 border-gray-200"
                  >
                    <Loading
                      showOverlay={false}
                      message="Đang tải dữ liệu..."
                    />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
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
                      title={emptyStateTitle}
                      description={emptyStateDescription}
                      icon={emptyStateIcon}
                      showWarningBadge={showEmptyStateWarningBadge}
                    />{" "}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {((enableServerPagination && totalPages > 1) ||
          (!enableServerPagination &&
            (table.getPageCount() > 1 ||
              table.getFilteredRowModel().rows.length > 7))) && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              {enableServerPagination ? (
                // Server-side pagination info
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
                  <span className="font-medium">{totalElements}</span> học phần
                </span>
              ) : (
                // Client-side pagination info
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
            {/* Phân trang hiển thị khi bật server pagination hoặc có hơn 1 trang client-side */}
            {(enableServerPagination ||
              (!enableServerPagination && table.getPageCount() > 1)) && (
              <div className="flex flex-col space-y-2">
                {/* Hiển thị thông tin trang */}
                {enableServerPagination && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Trang {currentPage} / {totalPages} (Tổng: {totalElements}{" "}
                      mục)
                    </span>
                  </div>
                )}

                {/* Controls chuyển trang */}
                <div className="flex items-center space-x-2">
                  {enableServerPagination ? (
                    // Server-side pagination buttons
                    <>
                      {/* First page button */}
                      <button
                        onClick={() => onPageChange && onPageChange(1)}
                        disabled={currentPage <= 1}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          currentPage <= 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Trang đầu"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>

                      {/* Previous page button */}
                      <button
                        onClick={() =>
                          onPageChange && onPageChange(currentPage - 1)
                        }
                        disabled={currentPage <= 1}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          currentPage <= 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Trang trước"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Page numbers for server-side */}
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const pages = [];
                          const current = currentPage;
                          const total = totalPages;

                          // Always show first page
                          if (total > 0) {
                            pages.push(1);
                          }

                          // Show pages around current page
                          const start = Math.max(2, current - 1);
                          const end = Math.min(total - 1, current + 1);

                          // Add ellipsis if needed
                          if (start > 2) {
                            pages.push(-1); // -1 represents ellipsis
                          }

                          // Add middle pages
                          for (let i = start; i <= end; i++) {
                            if (i > 1 && i < total) {
                              pages.push(i);
                            }
                          }

                          // Add ellipsis if needed
                          if (end < total - 1) {
                            pages.push(-2); // -2 represents ellipsis
                          }

                          // Always show last page
                          if (total > 1) {
                            pages.push(total);
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

                            const isActive = page === current;
                            return (
                              <button
                                key={page}
                                onClick={() =>
                                  onPageChange && onPageChange(page)
                                }
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
                        onClick={() =>
                          onPageChange && onPageChange(currentPage + 1)
                        }
                        disabled={currentPage >= totalPages}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          currentPage >= totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Trang tiếp"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Last page button */}
                      <button
                        onClick={() => onPageChange && onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          currentPage >= totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Trang cuối"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    // Client-side pagination buttons (existing logic)
                    <>
                      {/* First page button */}
                      <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          !table.getCanPreviousPage()
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Trang đầu"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>

                      {/* Previous page button */}
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          !table.getCanPreviousPage()
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
                          const currentPageIndex =
                            table.getState().pagination.pageIndex;
                          const totalPages = table.getPageCount();
                          const pages = [];

                          // Always show first page
                          if (totalPages > 0) {
                            pages.push(0);
                          }

                          // Show pages around current page
                          const start = Math.max(1, currentPageIndex - 1);
                          const end = Math.min(
                            totalPages - 2,
                            currentPageIndex + 1
                          );

                          // Add ellipsis if needed
                          if (start > 1) {
                            pages.push(-1); // -1 represents ellipsis
                          }

                          // Add middle pages
                          for (let i = start; i <= end; i++) {
                            if (i > 0 && i < totalPages - 1) {
                              pages.push(i);
                            }
                          }

                          // Add ellipsis if needed
                          if (end < totalPages - 2) {
                            pages.push(-2); // -2 represents ellipsis
                          }

                          // Always show last page
                          if (totalPages > 1) {
                            pages.push(totalPages - 1);
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
                            const isActive = page === currentPageIndex;
                            return (
                              <button
                                key={page}
                                onClick={() => table.setPageIndex(page)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                  isActive
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                              >
                                {page + 1}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      {/* Next page button */}
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          !table.getCanNextPage()
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Trang tiếp"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      {/* Last page button */}
                      <button
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          !table.getCanNextPage()
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Trang cuối"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
