import React, { useState, useMemo, useCallback } from "react";
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
  BookOpen, // Using BookOpen for course type groups
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import Loading from "../Loading";
import { EmptyTableState } from "./EmptyTableState";
import type { KetQuaHocTapTableType } from "./KetQuaHocTapTable"; // Import the correct type

interface GroupedKetQuaHocTapTableProps {
  name: string;
  data: KetQuaHocTapTableType[];
  loading?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

interface CourseTypeGroup {
  id: string;
  title: string; // e.g., "Học phần Đại cương"
  subtitle: string; // e.g., "5 học phần • 15 tín chỉ"
  courses: KetQuaHocTapTableType[];
  totalCredits: number;
  colorScheme: string;
}

interface CourseWithGroup extends KetQuaHocTapTableType {
  groupId: string;
  isGroupHeader?: boolean;
  groupTitle?: string;
  groupSubtitle?: string;
  groupTotalCredits?: number;
  colorScheme?: string;
}

export const GroupedKetQuaHocTapTable: React.FC<
  GroupedKetQuaHocTapTableProps
> = ({
  name,
  data,
  loading = false,
  emptyStateTitle,
  emptyStateDescription,
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [diemChuFilter, setDiemChuFilter] = useState<string>("");
  const [completionStatusFilter, setCompletionStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 7,
  });

  // Group results by course type (nhomHp)
  const courseTypeGroups = useMemo((): CourseTypeGroup[] => {
    const groupsMap = new Map<string, CourseTypeGroup>();
    const definedOrder = [ "Anh văn", "chính trị", "thể chất", "Quốc phòng-An ninh", "Đại cương", "Cơ sở ngành", "Chuyên ngành", "Tự chọn", "Khác"];

    data.forEach((item) => {
      const courseType = item.nhomHp || "Khác";
      const groupId = `type-${courseType.replace(/\s+/g, "-").toLowerCase()}`;

      if (!groupsMap.has(groupId)) {
        let colorScheme = "blue"; // Default
        if (courseType.includes("Đại cương") || courseType.includes("Anh văn") || courseType.includes("chính trị") || courseType.includes("thể chất") || courseType.includes("Quốc phòng")) {
          colorScheme = "purple";
        } else if (courseType.includes("Cơ sở ngành")) {
          colorScheme = "blue";
        } else if (courseType.includes("Chuyên ngành")) {
          colorScheme = "orange";
        } else if (courseType.includes("Tự chọn")) {
          colorScheme = "green";
        }
        groupsMap.set(groupId, {
          id: groupId,
          title: `Học phần ${courseType}`,
          subtitle: "",
          courses: [],
          totalCredits: 0,
          colorScheme,
        });
      }
      const group = groupsMap.get(groupId)!;
      group.courses.push(item);
      group.totalCredits += item.soTinChi || 0;
    });

    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
      const aTitle = a.title.replace("Học phần ", "");
      const bTitle = b.title.replace("Học phần ", "");
      const aIndex = definedOrder.indexOf(aTitle);
      const bIndex = definedOrder.indexOf(bTitle);
      if (aIndex === -1 && bIndex === -1) return aTitle.localeCompare(bTitle);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    sortedGroups.forEach((group) => {
      group.subtitle = `${group.courses.length} học phần • ${group.totalCredits} tín chỉ`;
    });

    return sortedGroups;
  }, [data]);

  // Toggle group expansion
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

  // Create flattened data structure - group headers with their courses directly below
  // const flattenedData = useMemo((): CourseWithGroup[] => {
  //   const result: CourseWithGroup[] = [];
  //   courseTypeGroups.forEach((group) => {
  //     // Add group header
  //     result.push({
  //       id: `group-header-${group.id}`, // Unique ID for header
  //       maHp: "", // Not applicable for header
  //       tenHp: group.title, // Use title for header display
  //       soTinChi: 0,
  //       diemChu: "",
  //       diemSo: 0,
  //       dieuKien: false,
  //       nhomHp: "",
  //       hocKy: null, // Not applicable for header
  //       groupId: group.id,
  //       isGroupHeader: true,
  //       groupTitle: group.title,
  //       groupSubtitle: group.subtitle,
  //       groupTotalCredits: group.totalCredits,
  //       colorScheme: group.colorScheme,
  //     } as CourseWithGroup);

  //     // Add courses immediately after the header if group is expanded
  //     if (expandedGroups.has(group.id)) {
  //       group.courses.forEach((course) => {
  //         result.push({
  //           ...course,
  //           groupId: group.id,
  //           isGroupHeader: false,
  //           colorScheme: group.colorScheme,
  //         } as CourseWithGroup);
  //       });
  //     }
  //   });
  //   return result;
  // }, [courseTypeGroups, expandedGroups]);

  // Filter data based on all active filters, ensuring search works on collapsed groups
  const filteredData = useMemo(() => {
    const result: CourseWithGroup[] = [];
    const textFilter = globalFilter.toLowerCase().trim();

    // For each original group...
    courseTypeGroups.forEach(group => {
        // 1. Filter its courses based on the dropdowns first.
        const coursesAfterDropdowns = group.courses.filter(course => {
            if (diemChuFilter && course.diemChu !== diemChuFilter) return false;
            
            const grade = course.diemChu;
            if (completionStatusFilter !== "all" && grade) {
                const completedGrades = ["A", "B+", "B", "C+", "C", "D+", "D"];
                const failedGrades = ["F", "I"];
                const improvementGrades = ["C+", "C", "D+", "D", "F", "I"];

                if (completionStatusFilter === "completed" && !completedGrades.includes(grade)) return false;
                if (completionStatusFilter === "failed" && !failedGrades.includes(grade)) return false;
                if (completionStatusFilter === "needs_improvement" && !improvementGrades.includes(grade)) return false;
            }
            return true;
        });

        // If no text filter is active, only show groups that are not empty after dropdown filtering.
        if (!textFilter) {
            if (coursesAfterDropdowns.length > 0) {
                const subtitle = `${coursesAfterDropdowns.length} học phần • ${coursesAfterDropdowns.reduce((sum, c) => sum + (c.soTinChi || 0), 0)} tín chỉ`;
                result.push({
                    id: `group-header-${group.id}`, maHp: "", tenHp: group.title, soTinChi: 0, diemChu: "", diemSo: 0, dieuKien: false, nhomHp: "", hocKy: null,
                    groupId: group.id, isGroupHeader: true, groupTitle: group.title, groupSubtitle: subtitle, groupTotalCredits: group.totalCredits, colorScheme: group.colorScheme,
                } as CourseWithGroup);
                if (expandedGroups.has(group.id)) {
                    coursesAfterDropdowns.forEach(course => result.push({ ...course, groupId: group.id, isGroupHeader: false, colorScheme: group.colorScheme } as CourseWithGroup));
                }
            }
            return; // continue to next group
        }

        // If a text filter IS active...
        const groupTitleMatches = group.title.toLowerCase().includes(textFilter);
        const coursesMatchingText = coursesAfterDropdowns.filter(course => {
            const maHp = course.maHp?.toLowerCase() ?? "";
            const tenHp = course.tenHp?.toLowerCase() ?? "";
            const diemChu = course.diemChu?.toLowerCase() ?? "";
            const nhomHp = course.nhomHp?.toLowerCase() ?? "";
            return maHp.includes(textFilter) || tenHp.includes(textFilter) || diemChu.includes(textFilter) || nhomHp.includes(textFilter);
        });

        // Show the group if the title matches OR if it has courses that match the text filter.
        if (groupTitleMatches || coursesMatchingText.length > 0) {
            const coursesToShow = groupTitleMatches ? coursesAfterDropdowns : coursesMatchingText;
            const subtitle = `${coursesToShow.length} học phần • ${coursesToShow.reduce((sum, c) => sum + (c.soTinChi || 0), 0)} tín chỉ`;
            
            result.push({
                id: `group-header-${group.id}`, maHp: "", tenHp: group.title, soTinChi: 0, diemChu: "", diemSo: 0, dieuKien: false, nhomHp: "", hocKy: null,
                groupId: group.id, isGroupHeader: true, groupTitle: group.title, groupSubtitle: subtitle, groupTotalCredits: group.totalCredits, colorScheme: group.colorScheme,
            } as CourseWithGroup);

            if (expandedGroups.has(group.id)) {
                coursesToShow.forEach(course => result.push({ ...course, groupId: group.id, isGroupHeader: false, colorScheme: group.colorScheme } as CourseWithGroup));
            }
        }
    });

    return result;
  }, [globalFilter, diemChuFilter, completionStatusFilter, courseTypeGroups, expandedGroups]);

  // Use filteredData directly for display with pagination
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
            return null; // No STT for group headers
          }

          // Calculate STT for courses only
          const allRows = table.getFilteredRowModel().rows;
          let courseIndex = 0;

          // Count courses up to current row
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
        accessorKey: "maHp",
        header: "Mã học phần",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) {
            return null;
          }
          return item.maHp || "";
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
          return item.tenHp || "";
        },
        size: 200,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "soTinChi",
        accessorKey: "soTinChi",
        header: "Tín chỉ",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) {
            return null;
          }
          return (
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700">
                {item.soTinChi || 0}
              </span>
            </div>
          );
        },
        size: 100,
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        id: "diemChu",
        accessorKey: "diemChu",
        header: "Điểm chữ",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) {
            return null;
          }
          return (
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {item.diemChu || "N/A"}
              </span>
            </div>
          );
        },
        size: 120,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "diemSo",
        accessorKey: "diemSo",
        header: "Điểm số",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) {
            return null;
          }
          return (
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {item.diemSo !== undefined && item.diemSo !== null
                  ? item.diemSo.toFixed(1)
                  : "N/A"}
              </span>
            </div>
          );
        },
        size: 120,
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        id: "nhomHp",
        accessorKey: "nhomHp",
        header: "Nhóm học phần",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) {
            return null;
          }
          return (
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {item.nhomHp || "N/A"}
              </span>
            </div>
          );
        },
        size: 150,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
    ],
    []
  );

  const tableState = useMemo(
    () => ({
      pagination,
      sorting,
      globalFilter,
    }),
    [pagination, sorting, globalFilter]
  );

  const table = useReactTable({
    data: displayData,
    columns,
    state: tableState,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    autoResetPageIndex: false,
  });

  // Custom pagination info
  const paginationInfo = useMemo(() => {
    // Count only courses for pagination info (excluding group headers)
    const coursesCount = filteredData.filter(
      (item) => !item.isGroupHeader
    ).length;
    const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
    const currentPage = pagination.pageIndex + 1;
    const canPreviousPage = pagination.pageIndex > 0;
    const canNextPage = pagination.pageIndex < totalPages - 1;

    return {
      totalPages,
      currentPage,
      canPreviousPage,
      canNextPage,
      coursesCount,
    };
  }, [filteredData, pagination]);

  const getColorClasses = (colorScheme: string) => {
    const schemes = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        badge: "bg-blue-100 text-blue-800",
        hover: "hover:bg-blue-100",
        border: "border-l-blue-500",
      },
      green: {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-800",
        hover: "hover:bg-emerald-100",
        border: "border-l-emerald-500",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-800",
        badge: "bg-purple-100 text-purple-800",
        hover: "hover:bg-purple-100",
        border: "border-l-purple-500",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-800",
        badge: "bg-orange-100 text-orange-800",
        hover: "hover:bg-orange-100",
        border: "border-l-orange-500",
      },
    };
    return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
  };

  if (courseTypeGroups.length === 0 && !loading) {
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
            description={
              emptyStateDescription || "Hiện tại chưa có kết quả học tập nào"
            }
          />
        </div>
      </div>
    );
  }

  const totalCourses = data.length;
  const totalCredits = data.reduce(
    (sum, course) => sum + (course.soTinChi || 0),
    0
  );

  // Pagination component with custom logic
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2 text-sm text-gray-700">
        <span>
          Hiển thị {pagination.pageSize} dòng trong tổng số{" "}
          {paginationInfo.coursesCount} học phần
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Trang {paginationInfo.currentPage} / {paginationInfo.totalPages}
        </span>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            disabled={!paginationInfo.canPreviousPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex - 1,
              }))
            }
            disabled={!paginationInfo.canPreviousPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
            disabled={!paginationInfo.canNextPage}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: paginationInfo.totalPages - 1,
              }))
            }
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
      {/* Filter Bar */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm học phần..."
              className="border pl-9 pr-3 py-1.5 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm placeholder-gray-500 transition-all duration-200 w-48"
            />
          </div>
          <div className="relative">
            <select
              value={diemChuFilter}
              onChange={(e) => setDiemChuFilter(e.target.value)}
              className="border pl-3 pr-8 py-1.5 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm placeholder-gray-500 transition-all duration-200"
            >
              <option value="">Tất cả điểm</option>
              <option value="A">A</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="D+">D+</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={completionStatusFilter}
              onChange={(e) => setCompletionStatusFilter(e.target.value)}
              className="border pl-3 pr-8 py-1.5 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm placeholder-gray-500 transition-all duration-200"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="failed">Rớt</option>
              <option value="needs_improvement">Có thể cải thiện</option>
            </select>
          </div>
        </div>
      </div>
      <div className="text-center flex bg-gradient-to-r from-blue-400 to-blue-500 py-3 text-lg text-white relative">
        <div className="flex-1 flex justify-center items-center">
          <h3 className="font-bold uppercase tracking-wide">{name}</h3>
          {totalCourses > 0 && (
            <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {globalFilter || diemChuFilter || completionStatusFilter !== "all"
                ? `${filteredData.filter((item) => !item.isGroupHeader).length}/${totalCourses}`
                : `${totalCourses}`}{" "}
              học phần • {totalCredits} tín chỉ
            </span>
          )}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            aria-label={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
            title={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
          >
            <ArrowUp
              className={`w-5 h-5 text-white transition-all duration-300 group-hover:scale-110 ${isExpanded ? "rotate-180" : "rotate-0"}`}
            />
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-400 ease-in-out overflow-hidden ${isExpanded ? "max-h-[2000px] opacity-100 transform translate-y-0" : "max-h-0 opacity-0 transform -translate-y-2"}`}
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
                      className={`px-2 py-2 border-1 bg-gradient-to-b from-blue-400 to-blue-500 text-center text-lg font-medium text-white border-b transition-colors duration-200 hover:from-blue-500 hover:to-blue-600 ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === "asc"
                            ? "Sắp xếp tăng dần"
                            : header.column.getNextSortingOrder() === "desc"
                              ? "Sắp xếp giảm dần"
                              : "Xóa sắp xếp"
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
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
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
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8">
                    <EmptyTableState
                      title={
                        globalFilter
                          ? "Không tìm thấy kết quả"
                          : "Không có kết quả học tập"
                      }
                      description={
                        globalFilter
                          ? "Không có kết quả học tập nào phù hợp với từ khóa tìm kiếm"
                          : ""
                      }
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const item = row.original;
                  if (item.isGroupHeader) {
                    const colors = getColorClasses(item.colorScheme || "blue");
                    return (
                      <tr
                        key={row.id}
                        className={`${colors.bg} ${colors.hover} cursor-pointer transition-colors border-l-4 ${colors.border}`}
                      >
                        <td
                          colSpan={columns.length}
                          className="px-4 py-3 border-b border-gray-200"
                          onClick={() => toggleGroup(item.groupId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded transition-transform hover:bg-white/20">
                                {expandedGroups.has(item.groupId) ? (
                                  <ChevronDown
                                    className={`w-4 h-4 ${colors.text} transition-transform`}
                                  />
                                ) : (
                                  <ChevronRight
                                    className={`w-4 h-4 ${colors.text} transition-transform`}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${colors.badge.replace("text-", "bg-").replace("-800", "-100")}`}
                                >
                                  <BookOpen
                                    className={`w-4 h-4 ${colors.text}`}
                                  />
                                </div>
                                <div>
                                  <div
                                    className={`font-semibold ${colors.text} text-base leading-tight`}
                                  >
                                    {item.groupTitle}
                                  </div>
                                  <div
                                    className={`text-sm ${colors.text} opacity-75 mt-1`}
                                  >
                                    {item.groupSubtitle}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge} border border-current border-opacity-20`}
                              >
                                {item.groupTotalCredits} TC
                              </span>
                              {/* Removed GPA display */}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr
                        key={row.id}
                        className="bg-white hover:bg-gray-100 transition-colors group"
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <td
                            key={cell.id}
                            className={`px-3 py-2 text-center border-b border-gray-200 ${
                              index === 0
                                ? "border-l-4 border-l-transparent group-hover:border-l-blue-300"
                                : ""
                            }`}
                            style={
                              index === 0
                                ? {
                                    paddingLeft: "2rem",
                                    position: "relative",
                                  }
                                : undefined
                            }
                          >
                            {index === 0 && (
                              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-px bg-gray-300"></div>
                            )}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {!loading && table.getRowModel().rows.length > 0 && <PaginationControls />}
        </div>
      </div>
    </div>
  );
};