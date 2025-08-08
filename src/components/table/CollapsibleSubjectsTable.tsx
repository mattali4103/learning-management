import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import type { HocPhan } from "../../types/HocPhan";
import type { KeHoachHocTapDetail } from "../../types/KeHoachHocTapMau";

// Types
interface SubjectGroup {
  id: string;
  title: string;
  subtitle: string;
  courses: HocPhan[];
  totalCredits: number;
  colorScheme: string;
}

interface SubjectRow extends HocPhan {
  isGroupHeader: boolean;
  groupId: string;
  groupTitle?: string;
  groupSubtitle?: string;
  colorScheme?: string;
}

// Props interface
interface CollapsibleSubjectsTableProps {
  // Required data
  hocPhans: HocPhan[];
  onAddToPending: (hocPhan: HocPhan) => void;
  
  // Current/pending courses (can be different types)
  pendingHocPhans: HocPhan[] | KeHoachHocTapDetail[];
  currentHocPhans: HocPhan[] | KeHoachHocTapDetail[];
  
  // Optional special groups for ThemKHHTModal
  hocPhanGoiY?: HocPhan[];
  hocPhanCaiThien?: HocPhan[];
  hocPhanTheChat?: HocPhan[]; // Danh sách học phần thể chất từ API
  
  // Configuration
  enableImprovementCourses?: boolean; // Enable special logic for improvement courses
  
  // Danh sách học phần đã học (để kiểm tra điều kiện tiên quyết)
  hocPhanDaHoc?: string[]; // Mảng chứa mã học phần đã hoàn thành
}

// Helper function to extract maHp from different data types
const extractMaHp = (item: HocPhan | KeHoachHocTapDetail): string => {
  if ('hocPhan' in item) {
    return item.hocPhan?.maHp || '';
  }
  return item.maHp || '';
};

// Helper: Color Schemes
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
    red: {
      bg: "bg-red-50",
      text: "text-red-800",
      badge: "bg-red-100 text-red-800",
      hover: "hover:bg-red-100",
      border: "border-l-red-500",
    },
  };
  return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
};

const CollapsibleSubjectsTable: React.FC<CollapsibleSubjectsTableProps> = ({
  hocPhans,
  onAddToPending,
  pendingHocPhans,
  currentHocPhans,
  hocPhanGoiY = [],
  hocPhanCaiThien = [],
  hocPhanTheChat = [],
  enableImprovementCourses = false,
  hocPhanDaHoc = [],
}) => {
  // Helper function to check prerequisite courses
  const checkPrerequisites = useCallback((hocPhan: HocPhan): { canAdd: boolean; missingPrerequisites: string[] } => {
    if (!hocPhan.hocPhanTienQuyet || hocPhan.hocPhanTienQuyet.trim() === "") {
      return { canAdd: true, missingPrerequisites: [] };
    }

    // Parse prerequisites (assuming they are comma-separated)
    const prerequisites = hocPhan.hocPhanTienQuyet
      .split(',')
      .map(code => code.trim())
      .filter(code => code !== "");

    const missingPrerequisites = prerequisites.filter(prereq => 
      !hocPhanDaHoc.includes(prereq)
    );

    return {
      canAdd: missingPrerequisites.length === 0,
      missingPrerequisites
    };
  }, [hocPhanDaHoc]);

  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const subjectGroups = useMemo((): SubjectGroup[] => {
    // Extract maHp from current and pending courses
    const currentMaHps = new Set(currentHocPhans.map(extractMaHp));
    const pendingMaHps = new Set(pendingHocPhans.map(extractMaHp));

    // Helper function to filter courses
    const filterCourses = (courseList: HocPhan[]) => 
      courseList.filter(hp => !currentMaHps.has(hp.maHp || ''));

    const newGroups: SubjectGroup[] = [];

    // Special groups for ThemKHHTModal
    if (enableImprovementCourses) {
      // Group 1: Suggested Courses
      const suggestedSubjects = filterCourses(hocPhanGoiY);
      if (suggestedSubjects.length > 0) {
        const totalCredits = suggestedSubjects.reduce((sum, course) => sum + (course.tinChi || 0), 0);
        newGroups.push({
          id: "group-suggested",
          title: "Học phần gợi ý",
          subtitle: `${suggestedSubjects.length} học phần • ${totalCredits} tín chỉ`,
          courses: suggestedSubjects,
          totalCredits,
          colorScheme: "green",
        });
      }

      // Group 2: Improvement Courses (not filtered against current plan)
      // Chỉ hiển thị nếu có ít nhất 3 môn cải thiện
      if (hocPhanCaiThien.length >= 3) {
        const totalCredits = hocPhanCaiThien.reduce((sum, course) => sum + (course.tinChi || 0), 0);
        newGroups.push({
          id: "group-improvement",
          title: "Học phần cải thiện",
          subtitle: `${hocPhanCaiThien.length} học phần • ${totalCredits} tín chỉ`,
          courses: hocPhanCaiThien,
          totalCredits,
          colorScheme: "red",
        });
      }

      // Group 3: Physical Education Courses (từ API) với logic ưu tiên
      if (hocPhanTheChat.length > 0) {
        // Kiểm tra số tín chỉ thể chất đã hoàn thành
        const completedPhysicalEd = hocPhanTheChat.filter(course => 
          hocPhanDaHoc.includes(course.maHp || '')
        );
        const completedCredits = completedPhysicalEd.reduce((sum, course) => sum + (course.tinChi || 0), 0);
        
        // Kiểm tra trạng thái hoàn thành
        const isCompleted = completedCredits >= 3;
        const isInProgress = completedCredits > 0 && completedCredits < 3;
        
        let availablePhysicalEd = hocPhanTheChat.filter(course => 
          !hocPhanDaHoc.includes(course.maHp || '')
        );
        
        // Nếu đang trong quá trình hoàn thành, ưu tiên gợi ý học phần liên quan
        // Nếu đang trong quá trình hoàn thành, ưu tiên gợi ý học phần liên quan
        const prioritizedCourses: HocPhan[] = [];
        const otherCourses: HocPhan[] = [];
        
        if (isInProgress && completedPhysicalEd.length > 0) {
          // Lấy tên học phần đã hoàn thành để tìm series liên quan
          const completedNames = completedPhysicalEd.map(course => 
            course.tenHp?.toLowerCase().replace(/\s+/g, ' ').trim() || ''
          );
          
          // Tìm học phần cùng series (ví dụ: "điền kinh 1" -> ưu tiên "điền kinh 2", "điền kinh 3")
          
          availablePhysicalEd.forEach(course => {
            const courseName = course.tenHp?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
            
            // Kiểm tra xem có cùng series không (loại bỏ số ở cuối và so sánh)
            const isRelated = completedNames.some(completedName => {
              // Loại bỏ số ở cuối để so sánh tên cơ bản
              const completedBaseName = completedName.replace(/\s*\d+\s*$/, '').trim();
              const courseBaseName = courseName.replace(/\s*\d+\s*$/, '').trim();
              
              return completedBaseName.length > 0 && 
                     courseBaseName.length > 0 && 
                     completedBaseName === courseBaseName;
            });
            
            if (isRelated) {
              prioritizedCourses.push(course);
            } else {
              otherCourses.push(course);
            }
          });
          
          // Sắp xếp: học phần cùng series trước, sau đó các học phần khác
          availablePhysicalEd = [...prioritizedCourses, ...otherCourses];
        } else {
          // Nếu không có học phần đã hoàn thành hoặc chưa bắt đầu, giữ nguyên danh sách
          availablePhysicalEd = availablePhysicalEd.filter(course => 
            !hocPhanDaHoc.includes(course.maHp || '')
          );
        }
        
        const totalCredits = availablePhysicalEd.reduce((sum, course) => sum + (course.tinChi || 0), 0);
        
        // Tạo subtitle phản ánh trạng thái
        let subtitle = "";
        if (isCompleted) {
          subtitle = `Đã hoàn thành (${completedCredits}/3 tín chỉ) • ${availablePhysicalEd.length} học phần khác`;
        } else if (isInProgress) {
          // Hiển thị tên các học phần được ưu tiên để hoàn thành
          const prioritizedNames = prioritizedCourses.slice(0, 3).map(course => course.tenHp).join(', ');
          const remainingCount = Math.max(0, 3 - completedCredits);
          
          if (prioritizedNames) {
            subtitle = `Đang hoàn thành (${completedCredits}/3 tín chỉ) • Gợi ý: ${prioritizedNames}${prioritizedCourses.length > 3 ? '...' : ''} • Cần ${remainingCount} tín chỉ nữa`;
          } else {
            subtitle = `Đang hoàn thành (${completedCredits}/3 tín chỉ) • ${availablePhysicalEd.length} học phần còn lại • Cần ${remainingCount} tín chỉ nữa`;
          }
        } else {
          subtitle = `${availablePhysicalEd.length} học phần • ${totalCredits} tín chỉ (Cần 3 tín chỉ)`;
        }
        
        newGroups.push({
          id: "group-the-chat",
          title: "Nhóm học phần thể chất",
          subtitle: subtitle,
          courses: availablePhysicalEd,
          totalCredits,
          colorScheme: isCompleted ? "green" : isInProgress ? "orange" : "purple",
        });
      }
    }

    // Regular courses grouped by loaiHp
    const availableSubjects = enableImprovementCourses 
      ? filterCourses(hocPhans)
      : hocPhans.filter(hp => !currentMaHps.has(hp.maHp || '') && !pendingMaHps.has(hp.maHp || ''));

    const groupedByLoaiHp = availableSubjects.reduce(
      (acc, course) => {
        const type = course.loaiHp || "Khác";
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(course);
        return acc;
      },
      {} as Record<string, HocPhan[]>
    );

    const regularGroups = Object.entries(groupedByLoaiHp).map(([loaiHp, courses]) => {
      const totalCredits = courses.reduce((sum, course) => sum + (course.tinChi || 0), 0);
      let colorScheme = "blue";
      if (loaiHp.includes("Đại cương")) colorScheme = "purple";
      else if (loaiHp.includes("Cơ sở ngành")) colorScheme = "blue";
      else if (loaiHp.includes("Chuyên ngành")) colorScheme = "orange";
      else if (loaiHp.includes("Tự chọn")) colorScheme = "green";
      else if (loaiHp.includes("Thể chất")) colorScheme = "purple";

      return {
        id: `group-${loaiHp.replace(/\s+/g, "-")}`,
        title: `Học phần ${loaiHp}`,
        subtitle: `${courses.length} học phần • ${totalCredits} tín chỉ`,
        courses,
        totalCredits,
        colorScheme,
      };
    });

    return [...newGroups, ...regularGroups];
  }, [hocPhans, hocPhanGoiY, hocPhanCaiThien, hocPhanTheChat, currentHocPhans, pendingHocPhans, enableImprovementCourses, hocPhanDaHoc]);

  useEffect(() => {
    if (subjectGroups.length > 0) {
      setExpandedGroups(new Set(subjectGroups.map((g) => g.id)));
    }
  }, [subjectGroups]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) newSet.delete(groupId);
      else newSet.add(groupId);
      return newSet;
    });
  }, []);

  const flattenedData = useMemo((): SubjectRow[] => {
    const result: SubjectRow[] = [];
    subjectGroups.forEach((group) => {
      result.push({
        maHp: `group-header-${group.id}`,
        tenHp: group.title,
        tinChi: 0,
        loaiHp: "group",
        hocPhanTienQuyet: "",
        isGroupHeader: true,
        groupId: group.id,
        groupTitle: group.title,
        groupSubtitle: group.subtitle,
        colorScheme: group.colorScheme,
      });

      if (expandedGroups.has(group.id)) {
        group.courses.forEach((course) => {
          result.push({
            ...course,
            isGroupHeader: false,
            groupId: group.id,
            colorScheme: group.colorScheme,
          });
        });
      }
    });
    return result;
  }, [subjectGroups, expandedGroups]);

  const filteredData = useMemo(() => {
    if (!globalFilter) return flattenedData;
    const filterValue = globalFilter.toLowerCase();

    const filteredGroups = subjectGroups.filter(
      (group) =>
        group.title.toLowerCase().includes(filterValue) ||
        group.courses.some(
          (c) =>
            c.tenHp.toLowerCase().includes(filterValue) ||
            c.maHp.toLowerCase().includes(filterValue)
        )
    );

    const result: SubjectRow[] = [];
    filteredGroups.forEach((group) => {
      const matchingCourses = group.courses.filter(
        (c) =>
          c.tenHp.toLowerCase().includes(filterValue) ||
          c.maHp.toLowerCase().includes(filterValue)
      );

      const isGroupTitleMatch = group.title.toLowerCase().includes(filterValue);

      result.push({
        maHp: `group-header-${group.id}`,
        tenHp: group.title,
        tinChi: 0,
        loaiHp: "group",
        hocPhanTienQuyet: "",
        isGroupHeader: true,
        groupId: group.id,
        groupTitle: group.title,
        groupSubtitle: group.subtitle,
        colorScheme: group.colorScheme,
      });

      if (expandedGroups.has(group.id)) {
        (isGroupTitleMatch ? group.courses : matchingCourses).forEach(
          (course) => {
            result.push({
              ...course,
              isGroupHeader: false,
              groupId: group.id,
              colorScheme: group.colorScheme,
            });
          }
        );
      }
    });
    return result;
  }, [flattenedData, globalFilter, subjectGroups, expandedGroups]);

  const columns = useMemo<ColumnDef<SubjectRow>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: "Mã HP",
        cell: ({ row }) => row.original.maHp,
        size: 120,
      },
      {
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ row }) => row.original.tenHp,
        size: 300,
      },
      {
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ row }) => (
          <div className={enableImprovementCourses ? "text-base" : "text-center"}>
            {row.original.tinChi}
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "HP Tiên quyết",
        cell: ({ row }) => (
          <div className={enableImprovementCourses ? "text-base" : "text-center"}>
            {row.original.hocPhanTienQuyet ? (
              <span 
                className="text-blue-600 hover:text-blue-800 cursor-help"
                title={`Học phần tiên quyết: ${row.original.hocPhanTienQuyet}`}
              >
                {row.original.hocPhanTienQuyet}
              </span>
            ) : (
              <span className="text-gray-500">Không</span>
            )}
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: enableImprovementCourses ? () => (
          <div className="text-center">Thao tác</div>
        ) : "Thao tác",
        cell: ({ row }) => {
          const hocPhan = row.original;
          
          if (enableImprovementCourses) {
            const isImprovementCourse = hocPhan.loaiHp === "Cải thiện";
            const isInPending = pendingHocPhans.some(
              (item) => extractMaHp(item) === hocPhan.maHp
            );
            const isInCurrentPlan = currentHocPhans.some(
              (item) => extractMaHp(item) === hocPhan.maHp
            );
            const isAdded = isInPending || (isInCurrentPlan && !isImprovementCourse);
            
            // Kiểm tra điều kiện tiên quyết
            const prerequisiteCheck = checkPrerequisites(hocPhan);
            const canAdd = prerequisiteCheck.canAdd;
            const missingPrerequisites = prerequisiteCheck.missingPrerequisites;

            const buttonDisabled = isAdded || !canAdd;
            let buttonTitle = "Thêm vào danh sách";
            
            if (isAdded) {
              buttonTitle = "Đã thêm học phần này";
            } else if (!canAdd) {
              buttonTitle = `Chưa hoàn thành học phần tiên quyết: ${missingPrerequisites.join(', ')}`;
            }

            return (
              <div className="text-center">
                <button
                  onClick={() => {
                    if (canAdd && !isAdded) {
                      onAddToPending(hocPhan);
                    }
                  }}
                  disabled={buttonDisabled}
                  className={`p-2 text-white rounded-full transition-all duration-200 ${
                    buttonDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-400"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105"
                  }`}
                  title={buttonTitle}
                >
                  {!canAdd ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          }

          // Logic cho trường hợp không phải improvement courses
          const prerequisiteCheck = checkPrerequisites(hocPhan);
          const canAdd = prerequisiteCheck.canAdd;
          const missingPrerequisites = prerequisiteCheck.missingPrerequisites;
          
          let buttonTitle = "Thêm vào danh sách";
          if (!canAdd) {
            buttonTitle = `Chưa hoàn thành học phần tiên quyết: ${missingPrerequisites.join(', ')}`;
          }

          return (
            <div className="text-center">
              <button
                onClick={() => {
                  if (canAdd) {
                    onAddToPending(hocPhan);
                  }
                }}
                disabled={!canAdd}
                className={`p-2 text-white rounded-full transition-all duration-200 ${
                  !canAdd
                    ? "opacity-40 cursor-not-allowed bg-gray-400"
                    : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105"
                }`}
                title={buttonTitle}
              >
                {!canAdd ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        },
        size: 100,
      },
    ],
    [pendingHocPhans, currentHocPhans, onAddToPending, enableImprovementCourses, checkPrerequisites]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.maHp,
  });

  const totalCourses = useMemo(
    () => subjectGroups.reduce((sum, group) => sum + group.courses.length, 0),
    [subjectGroups]
  );

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={`Tìm kiếm trong ${totalCourses} học phần...`}
            className="border border-gray-300 pl-9 pr-3 py-1.5 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
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
            {table.getRowModel().rows.map((row) => {
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
                          <div className="flex items-center justify-center w-6 h-6 rounded">
                            {expandedGroups.has(item.groupId) ? (
                              <ChevronDown
                                className={`w-5 h-5 ${colors.text}`}
                              />
                            ) : (
                              <ChevronRight
                                className={`w-5 h-5 ${colors.text}`}
                              />
                            )}
                          </div>
                          <div
                            className={`p-2 rounded-lg ${colors.badge.replace("text-", "bg-").replace("-800", "-100")}`}
                          >
                            <BookOpen className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <div
                              className={`font-semibold ${colors.text} text-base`}
                            >
                              {item.groupTitle}
                            </div>
                            <div
                              className={`text-sm ${colors.text} opacity-80`}
                            >
                              {item.groupSubtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2.5 text-sm border-b border-gray-200 ${
                        index === 0 ? "pl-12" : "text-gray-700"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Trang {table.getState().pagination.pageIndex + 1} /{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSubjectsTable;
