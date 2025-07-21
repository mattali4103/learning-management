import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
  BookOpen,
  Users,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
} from "lucide-react";
import Loading from "../Loading";
import { EmptyTableState } from "./EmptyTableState";
import { KeHoachHocTapExportButton } from "../PDFExportButton";
import type { HocPhan } from "../../types/HocPhan";

interface AllCoursesCollapsibleTableProps {
  name: string;
  allData: HocPhan[];
  loading?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onDelete?: (maHp: string) => void;
}

interface CourseGroup {
  id: string;
  type: 'required' | 'elective';
  title: string;
  subtitle: string;
  courses: HocPhan[];
  totalCredits: number;
  requiredCredits?: number;
  colorScheme: string;
}

interface CourseWithGroup extends HocPhan {
  groupId: string;
  groupType: 'required' | 'elective';
  isGroupHeader?: boolean;
  groupTitle?: string;
  groupSubtitle?: string;
  groupTotalCredits?: number;
  groupRequiredCredits?: number;
  colorScheme?: string;
}

export const AllCoursesCollapsibleTable: React.FC<
  AllCoursesCollapsibleTableProps
> = ({
  name,
  allData,
  loading = false,
  emptyStateTitle,
  emptyStateDescription,
  onDelete,
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set()
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const courseGroups = useMemo((): CourseGroup[] => {
    const requiredOrder = [
      "Quốc Phòng",
      "Anh văn",
      "Chính Trị",
      "Thể Chất",
      "Đại cương",
      "Cơ sở ngành",
      "Chuyên ngành",
    ];

    const coursesByType = allData.reduce((acc, course) => {
      const type = course.loaiHp || "Khác";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(course);
      return acc;
    }, {} as Record<string, HocPhan[]>);

    const groups: CourseGroup[] = Object.entries(coursesByType).map(
      ([courseType, courses]) => {
        const totalCredits = courses.reduce(
          (sum, course) => sum + (course.tinChi || 0),
          0
        );
        let colorScheme = 'blue';
        if (courseType.includes('Đại cương') || courseType.includes('Anh văn') || courseType.includes('chính trị') || courseType.includes('thể chất')) {
          colorScheme = 'purple';
        } else if (courseType.includes('Cơ sở ngành')) {
          colorScheme = 'blue';
        } else if (courseType.includes('Chuyên ngành')) {
          colorScheme = 'orange';
        }

        return {
          id: `group-${courseType.replace(/\s+/g, "-").toLowerCase()}`,
          type: 'required', // Assuming all are required for now
          title: `Học phần ${courseType}`,
          subtitle: `${courses.length} học phần • ${totalCredits} tín chỉ`,
          courses: courses,
          totalCredits,
          colorScheme,
        };
      }
    );

    groups.sort((a, b) => {
      const aIndex = requiredOrder.findIndex((order) =>
        a.title.includes(order)
      );
      const bIndex = requiredOrder.findIndex((order) =>
        b.title.includes(order)
      );
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return groups;
  }, [allData]);

  useEffect(() => {
    if (courseGroups.length > 0) {
      const allGroupIds = new Set(courseGroups.map((g) => g.id));
      setExpandedGroups(allGroupIds);
    } else {
      setExpandedGroups(new Set());
    }
  }, [courseGroups]);

  const toggleGroup = useCallback(
    (groupId: string) => {
      const newExpanded = new Set(expandedGroups);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      setExpandedGroups(newExpanded);
    },
    [expandedGroups]
  );

  const flattenedData = useMemo((): CourseWithGroup[] => {
    const result: CourseWithGroup[] = [];

    courseGroups.forEach((group) => {
      result.push({
        maHp: `group-header-${group.id}`,
        tenHp: group.title,
        tinChi: 0,
        loaiHp: "group",
        hocPhanTienQuyet: "",
        groupId: group.id,
        groupType: group.type,
        isGroupHeader: true,
        groupTitle: group.title,
        groupSubtitle: group.subtitle,
        groupTotalCredits: group.totalCredits,
        groupRequiredCredits: group.requiredCredits,
        colorScheme: group.colorScheme,
      } as CourseWithGroup);

      if (expandedGroups.has(group.id)) {
        group.courses.forEach((course) => {
          result.push({
            ...course,
            groupId: group.id,
            groupType: group.type,
            isGroupHeader: false,
            colorScheme: group.colorScheme,
          } as CourseWithGroup);
        });
      }
    });

    return result;
  }, [courseGroups, expandedGroups]);

  const filteredData = useMemo(() => {
    let filtered = flattenedData;
    if (globalFilter) {
      const lowercasedFilter = globalFilter.toLowerCase();
      filtered = flattenedData.filter((item) => {
        if (item.isGroupHeader) {
          return (
            item.groupTitle?.toLowerCase().includes(lowercasedFilter) ||
            item.groupSubtitle?.toLowerCase().includes(lowercasedFilter)
          );
        } else {
          return (
            item.maHp?.toLowerCase().includes(lowercasedFilter) ||
            item.tenHp?.toLowerCase().includes(lowercasedFilter) ||
            item.loaiHp?.toLowerCase().includes(lowercasedFilter) ||
            item.hocPhanTienQuyet?.toLowerCase().includes(lowercasedFilter)
          );
        }
      });
    }
    return filtered;
  }, [flattenedData, globalFilter]);

  const displayData = useMemo((): CourseWithGroup[] => {
    return filteredData;
  }, [filteredData]);

  const columns = useMemo<ColumnDef<CourseWithGroup>[]>(
    () => [
        {
            id: "stt",
            header: "STT",
            cell: ({ row, table }) => {
              const item = row.original;
              if (item.isGroupHeader) {
                return null; 
              }
              
              const allRows = table.getFilteredRowModel().rows;
              let courseIndex = 0;
              
              for (let i = 0; i <= row.index; i++) {
                const currentRow = allRows[i];
                if (currentRow && !currentRow.original.isGroupHeader) {
                  courseIndex++;
                }
              }
              
              return (
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-600">
                    {courseIndex}
                  </span>
                </div>
              );
            },
            size: 80,
            enableSorting: false,
          },
          {
            id: "maHp",
            accessorKey: "maHp",
            header: "Mã học phần",
            cell: ({ row }) => {
              const item = row.original;
              if (item.isGroupHeader) {
                return null;
              }
              return item.maHp || '';
            },
            size: 140,
            enableSorting: true,
            sortingFn: "alphanumeric",
          },
          {
            id: "tenHp",
            accessorKey: "tenHp",
            header: "Tên học phần",
            cell: ({ row }) => {
              const item = row.original;
              if (item.isGroupHeader) {
                return null;
              }
              return (
                <div className="max-w-xs">
                  <div className="font-semibold text-gray-900 text-sm leading-tight">
                    {item.tenHp || "Chưa có tên"}
                  </div>
                </div>
              );
            },
            size: 300,
            enableSorting: true,
            sortingFn: "alphanumeric",
          },
          {
            id: "tinChi",
            accessorKey: "tinChi",
            header: "Tín chỉ",
            cell: ({ row }) => {
              const item = row.original;
              if (item.isGroupHeader) {
                return null;
              }
              return (
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700">
                    {item.tinChi || 0}
                  </span>
                </div>
              );
            },
            size: 100,
            enableSorting: true,
            sortingFn: "basic",
          },
          {
            id: "loaiHp",
            accessorKey: "loaiHp",
            header: "Loại học phần",
            cell: ({ row }) => {
              const item = row.original;
              if (item.isGroupHeader) {
                return null;
              }
              return (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {item.loaiHp || "N/A"}
                  </span>
                </div>
              );
            },
            size: 120,
            enableSorting: true,
            sortingFn: "alphanumeric",
          },
          {
            id: "hocPhanTienQuyet",
            accessorKey: "hocPhanTienQuyet",
            header: "Tiên quyết",
            cell: ({ row }) => {
              const item = row.original;
              if (item.isGroupHeader) {
                return null;
              }
              return (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {item.hocPhanTienQuyet || "-"}
                  </span>
                </div>
              );
            },
            size: 150,
            enableSorting: true,
            sortingFn: "alphanumeric",
          },
          {
            id: "action",
            header: "",
            cell: ({ row }) => {
              const item = row.original;
              if (item.isGroupHeader || !onDelete) {
                return null;
              }
              return (
                <div className="flex items-center justify-center">
                  <button
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg transition-colors duration-200"
                    onClick={() => onDelete(item.maHp)}
                    title="Xóa khỏi kế hoạch"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              );
            },
            size: 80,
          },
    ],
    [onDelete]
  );

  const table = useReactTable({
    data: displayData,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
  });

  const displayRows = useMemo(() => {
    const allRows = table.getFilteredRowModel().rows;
    const { pageIndex, pageSize } = pagination;
    const pageStart = pageIndex * pageSize;
    const pageEnd = pageStart + pageSize;
    return allRows.slice(pageStart, pageEnd);
  }, [table, pagination]);

  const paginationInfo = useMemo(() => {
    const coursesCount = filteredData.filter(item => !item.isGroupHeader).length;
    const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
    const currentPage = pagination.pageIndex + 1;
    const canPreviousPage = pagination.pageIndex > 0;
    const canNextPage = pagination.pageIndex < totalPages - 1;
    
    return {
      totalPages,
      currentPage,
      canPreviousPage,
      canNextPage,
      coursesCount
    };
  }, [filteredData, pagination]);

  const getColorClasses = (colorScheme: string) => {
    const schemes = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        badge: "bg-blue-100 text-blue-800",
        hover: "hover:bg-blue-100",
        header: "from-blue-400 to-blue-500",
        border: "border-l-blue-500"
      },
      green: {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-800",
        hover: "hover:bg-emerald-100",
        header: "from-emerald-400 to-emerald-500",
        border: "border-l-emerald-500"
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-800",
        badge: "bg-purple-100 text-purple-800",
        hover: "hover:bg-purple-100",
        header: "from-purple-400 to-purple-500",
        border: "border-l-purple-500"
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-800",
        badge: "bg-orange-100 text-orange-800",
        hover: "hover:bg-orange-100",
        header: "from-orange-400 to-orange-500",
        border: "border-l-orange-500"
      }
    };
    return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
  };

  if (courseGroups.length === 0 && !loading) {
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
            description={emptyStateDescription || "Hiện tại chưa có học phần nào"}
          />
        </div>
      </div>
    );
  }

  const totalCourses = allData.length;
  const totalCredits = allData.reduce((sum, course) => sum + (course.tinChi || 0), 0);

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2 text-sm text-gray-700">
        <span>
          Hiển thị {pagination.pageSize} dòng trong tổng số {paginationInfo.coursesCount} học phần
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Trang {paginationInfo.currentPage} / {paginationInfo.totalPages}
        </span>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
            disabled={!paginationInfo.canPreviousPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            disabled={!paginationInfo.canPreviousPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            disabled={!paginationInfo.canNextPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: paginationInfo.totalPages - 1 }))}
            disabled={!paginationInfo.canNextPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang cuối"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

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
          {totalCourses > 0 && (
            <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {globalFilter
                ? `${filteredData.filter(item => !item.isGroupHeader).length}/${totalCourses}`
                : `${totalCourses}`}{" "}
              học phần • {totalCredits} tín chỉ
            </span>
          )}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {totalCourses > 0 && (
            <KeHoachHocTapExportButton
              data={allData}
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
                      className={`px-2 py-2 border-1 bg-gradient-to-b from-blue-400 to-blue-500 text-center text-lg font-medium text-white border-b transition-colors duration-200 hover:from-blue-500 hover:to-blue-600 ${
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
                              {header.column.getIsSorted() === 'asc' ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ArrowDown className="w-4 h-4" />
                              ) : (
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
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8">
                    <EmptyTableState
                      title="Không tìm thấy kết quả"
                      description="Không có học phần nào phù hợp với từ khóa tìm kiếm"
                    />
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => {
                  const item = row.original;
                  
                  if (item.isGroupHeader) {
                    const colors = getColorClasses(item.colorScheme || 'blue');
                    return (
                      <tr key={row.id} className={`${colors.bg} ${colors.hover} cursor-pointer transition-colors border-l-4 ${colors.border}`}>
                        <td 
                          colSpan={columns.length}
                          className="px-4 py-3 border-b border-gray-200"
                          onClick={() => toggleGroup(item.groupId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded transition-transform hover:bg-white/20">
                                {expandedGroups.has(item.groupId) ? (
                                  <ChevronDown className={`w-4 h-4 ${colors.text} transition-transform`} />
                                ) : (
                                  <ChevronRight className={`w-4 h-4 ${colors.text} transition-transform`} />
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${colors.badge.replace('text-', 'bg-').replace('-800', '-100')}`}>
                                  {item.groupType === 'required' ? (
                                    <BookOpen className={`w-4 h-4 ${colors.text}`} />
                                  ) : (
                                    <Users className={`w-4 h-4 ${colors.text}`} />
                                  )}
                                </div>
                                <div>
                                  <div className={`font-semibold ${colors.text} text-base leading-tight`}>
                                    {item.groupTitle}
                                  </div>
                                  <div className={`text-sm ${colors.text} opacity-75 mt-1`}>
                                    {item.groupSubtitle}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge} border border-current border-opacity-20`}>
                                {item.groupTotalCredits} TC
                              </span>
                              {item.groupRequiredCredits && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300`}>
                                  Yêu cầu: {item.groupRequiredCredits} TC
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr 
                        key={row.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <td
                            key={cell.id}
                            className={`px-3 py-2 text-center border-b border-gray-100 ${
                              index === 0 ? 'border-l-4 border-l-transparent group-hover:border-l-gray-300' : ''
                            }`}
                            style={index === 0 ? { 
                              paddingLeft: '2rem',
                              position: 'relative'
                            } : undefined}
                          >
                            {index === 0 && (
                              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-px bg-gray-300"></div>
                            )}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>

          {!loading && displayRows.length > 0 && (
            <PaginationControls />
          )}
        </div>
      </div>
    </div>
  );
};