import React, { useState, useMemo, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightPagination,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Loading from "../Loading";
import { EmptyTableState } from "./EmptyTableState";
import { KeHoachHocTapExportButton } from "../PDFExportButton";

interface GroupedTableProps {
  name: string;
  data: any[];
  columns: ColumnDef<any>[];
  groupByKey: string;
  groupDisplayName?: (groupKey: string) => string;
  groupColorScheme?: (groupKey: string) => string;
  initialExpanded?: boolean;
  loading?: boolean;
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  // Empty state props
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: React.ComponentType<any>;
  showEmptyStateWarningBadge?: boolean;
  // Row click handler
  onRowClick?: (row: any) => void;
}

interface GroupedData {
  [key: string]: any[];
}

export const GroupedTable: React.FC<GroupedTableProps> = ({
  name,
  data,
  columns,
  groupByKey,
  groupDisplayName = (key) => key,
  groupColorScheme = () => "blue",
  initialExpanded = true,
  loading = false,
  enablePagination = true,
  pageSize = 7,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateIcon,
  showEmptyStateWarningBadge,
  onRowClick,
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  // Reset current page when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [globalFilter]);

  const groupData = useMemo(() => 
    (items: any[], key: string): GroupedData => {
      return items.reduce((groups: GroupedData, item) => {
        const groupKey = getNestedValue(item, key) || "Không xác định";
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
      }, {});
    }, []);

  function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Filter data based on global filter
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    return data.filter((item) => {
      return columns.some((column) => {
        const accessorKey = (column as any).accessorKey;
        if (!accessorKey) return false;
        const value = getNestedValue(item, accessorKey);
        return value?.toString().toLowerCase().includes(globalFilter.toLowerCase());
      });
    });
  }, [data, globalFilter, columns]);

  const groupedData = useMemo(() => groupData(filteredData, groupByKey), [filteredData, groupByKey, groupData]);
  
  // Custom sorting order for course types
  const courseTypeOrder = [
    "Anh văn căn bản",
    "Chính trị", 
    "Đại cương",
    "Cơ sở ngành",
    "Chuyên ngành",
    "Thể chất", // Keep existing types at the end
    "Không xác định"
  ];
  
  const sortedGroupKeys = Object.keys(groupedData).sort((a, b) => {
    const indexA = courseTypeOrder.indexOf(a);
    const indexB = courseTypeOrder.indexOf(b);
    
    // If both are in the predefined order, sort by index
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only one is in the predefined order, it comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // If neither is in the predefined order, sort alphabetically
    return a.localeCompare(b);
  });

  // Create table instance for sorting functionality
  const table = useReactTable({
    data: filteredData,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      pagination: {
        pageIndex: currentPage,
        pageSize: pageSize,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({ pageIndex: currentPage, pageSize });
        setCurrentPage(newPagination.pageIndex);
      }
    },
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pageSize),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  // Determine if we should show groups or paginated data
  // Show groups when pagination is disabled OR when there are multiple groups
  const shouldShowGroups = !enablePagination || sortedGroupKeys.length > 1;
  
  // For pagination, we need flat data when not showing groups
  const paginatedData = useMemo(() => {
    if (shouldShowGroups || !enablePagination) return [];
    
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, shouldShowGroups, enablePagination]);

  const getColorClasses = (colorScheme: string) => {
    const schemes = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        badge: "bg-blue-100 text-blue-800",
        hover: "hover:bg-blue-100",
        header: "from-blue-400 to-blue-500"
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-800",
        badge: "bg-green-100 text-green-800",
        hover: "hover:bg-green-100",
        header: "from-green-400 to-green-500"
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-800",
        badge: "bg-purple-100 text-purple-800",
        hover: "hover:bg-purple-100",
        header: "from-purple-400 to-purple-500"
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-800",
        badge: "bg-orange-100 text-orange-800",
        hover: "hover:bg-orange-100",
        header: "from-orange-400 to-orange-500"
      },
      red: {
        bg: "bg-red-50",
        text: "text-red-800",
        badge: "bg-red-100 text-red-800",
        hover: "hover:bg-red-100",
        header: "from-red-400 to-red-500"
      },
      teal: {
        bg: "bg-teal-50",
        text: "text-teal-800",
        badge: "bg-teal-100 text-teal-800",
        hover: "hover:bg-teal-100",
        header: "from-teal-400 to-teal-500"
      },
      gray: {
        bg: "bg-gray-50",
        text: "text-gray-800",
        badge: "bg-gray-100 text-gray-800",
        hover: "hover:bg-gray-100",
        header: "from-gray-400 to-gray-500"
      }
    };
    return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
  };

  // Handle empty state
  if ((!data || data.length === 0) && !loading) {
    return (
      <div className="overflow-x-auto rounded-lg shadow-xl bg-gray-200">
        <div className="text-center flex bg-gradient-to-r from-blue-400 to-blue-500 py-3 text-lg text-white relative">
          <div className="flex-1 flex justify-center items-center">
            <h3 className="font-bold uppercase tracking-wide">{name}</h3>
          </div>
        </div>
        <div className="p-8">
          <EmptyTableState
            title={emptyStateTitle || "Không có dữ liệu"}
            description={emptyStateDescription || "Hiện tại chưa có học phần nào được thêm vào"}
            icon={emptyStateIcon}
            showWarningBadge={showEmptyStateWarningBadge}
          />
        </div>
      </div>
    );
  }

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
              {globalFilter
                ? `${filteredData.length}/${data.length}`
                : `${data.length}`}{" "}
              học phần
            </span>
          )}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* PDF Export Button */}
          {data.length > 0 && (
            <KeHoachHocTapExportButton
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
        <div className={`transition-all duration-200 ${isExpanded ? "delay-100" : ""}`}>
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="text-center">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-2 py-3 border-1 bg-gradient-to-b from-blue-400 to-blue-500 text-center text-lg font-medium text-white border-b transition-colors duration-200 hover:from-blue-500 hover:to-blue-600 ${
                        header.id === "id" ? "hidden" : ""
                      } ${
                        header.column.getCanSort() ? "cursor-pointer select-none" : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === 'asc'
                            ? 'Sắp xếp tăng dần'
                            : header.column.getNextSortingOrder() === 'desc'
                              ? 'Sắp xếp giảm dần'
                              : 'Xóa sắp xếp'
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="ml-1">
                              {{
                                asc: <ArrowUp className="w-4 h-4" />,
                                desc: <ArrowDown className="w-4 h-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8">
                    <Loading />
                  </td>
                </tr>
              ) : sortedGroupKeys.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8">
                    <EmptyTableState
                      title="Không tìm thấy kết quả"
                      description="Không có học phần nào phù hợp với từ khóa tìm kiếm"
                    />
                  </td>
                </tr>
              ) : shouldShowGroups ? (
                // Show grouped data (no pagination within groups)
                sortedGroupKeys.map((groupKey) => {
                  const groupItems = groupedData[groupKey];
                  const isGroupExpanded = expandedGroups.has(groupKey);
                  const colors = getColorClasses(groupColorScheme(groupKey));
                  const totalCredits = groupItems.reduce((sum, item) => {
                    const credits = getNestedValue(item, 'hocPhan.tinChi') || getNestedValue(item, 'tinChi') || 0;
                    return sum + credits;
                  }, 0);

                  return (
                    <React.Fragment key={groupKey}>
                      {/* Group Header Row */}
                      <tr className={`${colors.bg} ${colors.hover} cursor-pointer transition-colors`}>
                        <td 
                          colSpan={columns.length}
                          className="px-4 py-3 border-b"
                          onClick={() => toggleGroup(groupKey)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                {isGroupExpanded ? (
                                  <ChevronDown className={`w-5 h-5 ${colors.text}`} />
                                ) : (
                                  <ChevronRight className={`w-5 h-5 ${colors.text}`} />
                                )}
                              </div>
                              <div>
                                <span className={`font-semibold ${colors.text} text-base`}>
                                  {groupDisplayName(groupKey)}
                                </span>
                                <span className={`ml-2 text-sm ${colors.text} opacity-80`}>
                                  ({groupItems.length} học phần • {totalCredits} tín chỉ)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                                {groupItems.length}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                                {totalCredits} TC
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Group Content Rows */}
                      {isGroupExpanded && groupItems.map((item, itemIndex) => (
                        <tr 
                          key={`${groupKey}-${itemIndex}`}
                          className={`hover:bg-gray-50 transition-colors ${
                            onRowClick ? "cursor-pointer" : ""
                          }`}
                          onClick={() => onRowClick?.(item)}
                        >
                          {columns.map((column, colIndex) => {
                            const accessorKey = (column as any).accessorKey;
                            const cellValue = accessorKey 
                              ? getNestedValue(item, accessorKey)
                              : item;
                            
                            return (
                              <td
                                key={`${groupKey}-${itemIndex}-${colIndex}`}
                                className="px-3 py-3 text-center border-b border-gray-100"
                              >
                                {column.cell 
                                  ? typeof column.cell === 'function'
                                    ? (column.cell as any)({ 
                                        getValue: () => cellValue,
                                        row: { 
                                          index: itemIndex, 
                                          original: item,
                                          getVisibleCells: () => [],
                                          id: `${groupKey}-${itemIndex}`
                                        }
                                      })
                                    : cellValue
                                  : cellValue
                                }
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                // Show paginated data (no groups, single flat list)
                paginatedData.map((item, itemIndex) => (
                  <tr 
                    key={`row-${currentPage}-${itemIndex}`}
                    className={`hover:bg-gray-50 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column, colIndex) => {
                      const accessorKey = (column as any).accessorKey;
                      const cellValue = accessorKey 
                        ? getNestedValue(item, accessorKey)
                        : item;
                      
                      return (
                        <td
                          key={`row-${currentPage}-${itemIndex}-${colIndex}`}
                          className="px-3 py-3 text-center border-b border-gray-100"
                        >
                          {column.cell 
                            ? typeof column.cell === 'function'
                              ? (column.cell as any)({ 
                                  getValue: () => cellValue,
                                  row: { 
                                    index: (currentPage * pageSize) + itemIndex, 
                                    original: item,
                                    getVisibleCells: () => [],
                                    id: `row-${currentPage}-${itemIndex}`
                                  }
                                })
                              : cellValue
                            : cellValue
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls - only show when pagination is enabled and have multiple pages */}
        {enablePagination && Math.ceil(filteredData.length / pageSize) > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span>
                Hiển thị {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, filteredData.length)} trong tổng số {filteredData.length} kết quả
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.ceil(filteredData.length / pageSize) }, (_, i) => {
                  const totalPages = Math.ceil(filteredData.length / pageSize);
                  const startPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                  const endPage = Math.min(totalPages, startPage + 5);
                  
                  if (i < startPage || i >= endPage) return null;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i
                          ? "bg-blue-500 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredData.length / pageSize) - 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang sau"
              >
                <ChevronRightPagination className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setCurrentPage(Math.ceil(filteredData.length / pageSize) - 1)}
                disabled={currentPage >= Math.ceil(filteredData.length / pageSize) - 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
