import { useState, useMemo, useCallback, useEffect } from "react";
import {
  X,
  BookOpen,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUp,
  ChevronDown,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  getPaginationRowModel,
  type Table,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from "@tanstack/react-table";

import type { HocPhan } from "../../types/HocPhan";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";

import type { HocPhanTuChon } from "../../types/HocPhanTuChon";
import SuccessMessageModal from "./SuccessMessageModal";
import ErrorMessageModal from "./ErrorMessageModal";

interface CTDTPayLoad {
  khoaHoc: string;
  maNganh: string;
  hocPhanList: HocPhan[];
  nhomHocPhanTuChon: HocPhanTuChon[];
}

interface AddHocPhanToCTDTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    selectedHocPhans: HocPhan[],
    selectedNhomHocPhans: HocPhanTuChon[]
  ) => void;
  pendingHocPhans: HocPhan[];
  selectedNganh: string;
  selectedKhoaHoc: string;
  setPendingHocPhans: React.Dispatch<React.SetStateAction<HocPhan[]>>;
  onSaveSuccess: () => void;
  initialTab: "available" | "add";
  currentHocPhans: HocPhan[];
}

// Course group interfaces from HocPhanTable
interface CourseGroup {
  id: string;
  originalId?: any;
  type: 'required' | 'elective';
  title: string;
  subtitle: string;
  courses: HocPhan[];
  totalCredits: number;
  requiredCredits?: number;
  colorScheme: string;
  groupType?: string; 
}

interface CourseWithGroup extends HocPhan {
  groupId: string;
  groupOriginalId?: any;
  groupType: 'required' | 'elective';
  isGroupHeader?: boolean;
  groupTitle?: string;
  groupSubtitle?: string;
  groupTotalCredits?: number;
  groupRequiredCredits?: number;
  colorScheme?: string;
  type?: 'direct-required' | 'elective';
  isVisible?: boolean;
}

// --- Available Subjects Table with Group Headers ---
interface AvailableSubjectsTableProps {
  hocPhans: HocPhan[];
  onAddToPending: (hocPhan: HocPhan) => void;
  pendingHocPhans: HocPhan[];
  currentHocPhans: HocPhan[];
}

const AvailableSubjectsTable: React.FC<AvailableSubjectsTableProps> = ({
  hocPhans,
  onAddToPending,
  pendingHocPhans,
  currentHocPhans,
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Helper function to get color classes
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

  // Create groups from available subjects
  const courseGroups = useMemo((): CourseGroup[] => {
    // Get codes of current courses to exclude (but keep pending courses visible)
    const currentMaHps = new Set(currentHocPhans.map(hp => hp.maHp));

    // Filter available courses - only exclude those already in CTDT
    const availableSubjects = hocPhans.filter(hp => 
      !currentMaHps.has(hp.maHp || '')
    );

    // Group by loaiHp
    const groupedByLoaiHp = availableSubjects.reduce((acc, course) => {
      const type = course.loaiHp || "Khác";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(course);
      return acc;
    }, {} as Record<string, HocPhan[]>);

    // Create course groups
    return Object.entries(groupedByLoaiHp).map(([loaiHp, courses]) => {
      const totalCredits = courses.reduce((sum, course) => sum + (course.tinChi || 0), 0);
      let colorScheme = "blue";
      
      if (loaiHp.includes("Đại cương") || loaiHp.includes("Anh văn") || loaiHp.includes("Chính trị")) {
        colorScheme = "purple";
      } else if (loaiHp.includes("Cơ sở ngành")) {
        colorScheme = "blue";
      } else if (loaiHp.includes("Chuyên ngành")) {
        colorScheme = "orange";
      } else if (loaiHp.includes("Tự chọn")) {
        colorScheme = "green";
      }

      return {
        id: `group-${loaiHp.replace(/\s+/g, "-")}`,
        type: 'required' as const,
        title: `Học phần ${loaiHp}`,
        subtitle: `${courses.length} học phần • ${totalCredits} tín chỉ`,
        courses,
        totalCredits,
        colorScheme,
      };
    });
  }, [hocPhans, currentHocPhans]);

  // Auto-expand all groups initially
  useEffect(() => {
    if (courseGroups.length > 0) {
      setExpandedGroups(new Set(courseGroups.map(g => g.id)));
    }
  }, [courseGroups]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) newSet.delete(groupId);
      else newSet.add(groupId);
      return newSet;
    });
  }, []);

  // Create flattened data for table
  const flattenedData = useMemo((): CourseWithGroup[] => {
    const result: CourseWithGroup[] = [];
    const textFilter = globalFilter.toLowerCase().trim();

    courseGroups.forEach(group => {
      // If no filter, show based on expansion state
      if (!textFilter) {
        // Add group header
        result.push({
          maHp: `group-header-${group.id}`,
          tenHp: group.title,
          tinChi: 0,
          loaiHp: group.type,
          hocPhanTienQuyet: '',
          groupId: group.id,
          groupType: group.type,
          isGroupHeader: true,
          groupTitle: group.title,
          groupSubtitle: group.subtitle,
          groupTotalCredits: group.totalCredits,
          colorScheme: group.colorScheme
        } as CourseWithGroup);

        // Add courses if expanded
        if (expandedGroups.has(group.id)) {
          group.courses.forEach(course => {
            result.push({
              ...course,
              groupId: group.id,
              groupType: group.type,
              isGroupHeader: false,
              colorScheme: group.colorScheme
            } as CourseWithGroup);
          });
        }
        return;
      }

      // If filter is active
      const groupTitleMatches = group.title.toLowerCase().includes(textFilter);
      const coursesMatchingText = group.courses.filter(course => (
        course.maHp?.toLowerCase().includes(textFilter) ||
        course.tenHp?.toLowerCase().includes(textFilter) ||
        course.loaiHp?.toLowerCase().includes(textFilter) ||
        course.hocPhanTienQuyet?.toLowerCase().includes(textFilter)
      ));

      if (groupTitleMatches || coursesMatchingText.length > 0) {
        const coursesToShow = groupTitleMatches ? group.courses : coursesMatchingText;
        
        result.push({
          maHp: `group-header-${group.id}`,
          tenHp: group.title,
          tinChi: 0,
          loaiHp: group.type,
          hocPhanTienQuyet: '',
          groupId: group.id,
          groupType: group.type,
          isGroupHeader: true,
          groupTitle: group.title,
          groupSubtitle: `${coursesToShow.length} học phần • ${coursesToShow.reduce((sum, c) => sum + (c.tinChi || 0), 0)} tín chỉ`,
          groupTotalCredits: group.totalCredits,
          colorScheme: group.colorScheme
        } as CourseWithGroup);

        coursesToShow.forEach(course => {
          result.push({
            ...course,
            groupId: group.id,
            groupType: group.type,
            isGroupHeader: false,
            colorScheme: group.colorScheme
          } as CourseWithGroup);
        });
      }
    });

    return result;
  }, [courseGroups, expandedGroups, globalFilter]);

  // Auto-expand groups with matches when searching
  useEffect(() => {
    if (globalFilter && globalFilter.trim()) {
      const searchTerm = globalFilter.toLowerCase().trim();
      const matchingGroupIds = new Set<string>();
      
      courseGroups.forEach(group => {
        const groupTitleMatches = group.title.toLowerCase().includes(searchTerm);
        const coursesMatchingText = group.courses.filter(course => (
          course.maHp?.toLowerCase().includes(searchTerm) ||
          course.tenHp?.toLowerCase().includes(searchTerm) ||
          course.loaiHp?.toLowerCase().includes(searchTerm) ||
          course.hocPhanTienQuyet?.toLowerCase().includes(searchTerm)
        ));

        if (groupTitleMatches || coursesMatchingText.length > 0) {
          matchingGroupIds.add(group.id);
        }
      });
      
      if (matchingGroupIds.size > 0) {
        setExpandedGroups(prev => new Set([...prev, ...matchingGroupIds]));
      }
    }
  }, [globalFilter, courseGroups]);

  // Columns definition
  const columns = useMemo<ColumnDef<CourseWithGroup>[]>(() => [
    {
      id: "stt",
      header: "STT",
      cell: ({ row, table }) => {
        const item = row.original;
        if (item.isGroupHeader) return null;
        
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
        if (item.isGroupHeader) return null;
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
        if (item.isGroupHeader) return null;
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
        if (item.isGroupHeader) return null;
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
        if (item.isGroupHeader) return null;
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
        if (item.isGroupHeader) return null;
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
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const hocPhan = row.original;
          if (hocPhan.isGroupHeader) return null;
          
          const isInPending = pendingHocPhans.some(item => item.maHp === hocPhan.maHp);
          
          return (
            <div className="text-center">
              <button
                onClick={() => !isInPending && onAddToPending(hocPhan)}
                className={`p-2 text-white rounded-full transition-all duration-200 ${
                  isInPending
                    ? "bg-gray-400 opacity-60 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105"
                }`}
                title={isInPending ? "Học phần này đã được thêm vào danh sách chờ xác nhận" : "Thêm vào danh sách"}
                disabled={isInPending}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 100,
      },
  ], [pendingHocPhans, onAddToPending]);

  // Create table instance
  const table = useReactTable({
    data: flattenedData,
    columns,
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
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.maHp,
  });

  const totalCourses = useMemo(
    () => courseGroups.reduce((sum, group) => sum + group.courses.length, 0),
    [courseGroups]
  );

  return (
    <div className="bg-white rounded-lg">
      {/* Search Bar */}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
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
                          <div className="flex flex-col">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </div>
                        )}
                      </div>
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
                              <ChevronDown className={`w-5 h-5 ${colors.text}`} />
                            ) : (
                              <ChevronRight className={`w-5 h-5 ${colors.text}`} />
                            )}
                          </div>
                          <div className={`p-2 rounded-lg ${colors.badge.replace("text-", "bg-").replace("-800", "-100")}`}>
                            <BookOpen className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${colors.text} text-base`}>
                              {item.groupTitle}
                            </div>
                            <div className={`text-sm ${colors.text} opacity-80`}>
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
                <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2.5 text-sm border-b border-gray-200 ${
                        index === 0 ? "pl-12" : "text-gray-700"
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
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

// --- Reusable Pagination Component ---
const PaginationControls = <TData,>({ table }: { table: Table<TData> }) => (
  <div className="flex items-center justify-end gap-2 mt-4">
    <button
      className="border rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <span className="flex items-center gap-1 text-sm">
      <div>Trang</div>
      <strong>
        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
      </strong>
    </span>
    <button
      className="border rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

// --- Table for Pending Subjects ---
interface PendingSubjectsTableProps {
  data: HocPhan[];
  columns: ColumnDef<HocPhan>[];
}
const PendingSubjectsTable = ({ data, columns }: PendingSubjectsTableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.getPageCount() > 1 && <PaginationControls table={table} />}
    </div>
  );
};
// --- Main Modal Component ---
const AddHocPhanToCTDTModal: React.FC<AddHocPhanToCTDTModalProps> = ({
  isOpen,
  onClose,
  pendingHocPhans,
  setPendingHocPhans,
  selectedNganh,
  selectedKhoaHoc,
  onSaveSuccess,
  initialTab,
  currentHocPhans,
}: AddHocPhanToCTDTModalProps) => {
  const axiosPrivate = useAxiosPrivate();
  const [activeTab, setActiveTab] = useState<"available" | "add">(initialTab);

  
  const [allHocPhans, setAllHocPhans] = useState<HocPhan[]>([]);
  const [loadingAvailableSubjects, setLoadingAvailableSubjects] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const LOAI_HP_LIST = useMemo(
    () => [
      "Quốc phòng",
      "Anh văn căn bản",
      "Chính trị",
      "Đại cương",
      "Cơ sở ngành",
      "Chuyên ngành",
      "Tự chọn",
    ],
    []
  );
  const fetchHocPhanByLoai = useCallback(async () => {
    setLoadingAvailableSubjects(true);
    if(!selectedNganh || !selectedKhoaHoc) return;
    try {
      const responses = await Promise.all(
        LOAI_HP_LIST.map((loaiHp) =>
          axiosPrivate.post(HOCPHAN_SERVICE.BY_LOAI_HP, { loaiHp })
        )
      );
      const hocPhans = responses.flatMap((res) => res.data.data || []);
      const uniqueHocPhans = new Map<string, HocPhan>();
      hocPhans.forEach((hp) => {
        if (!uniqueHocPhans.has(hp.maHp)) uniqueHocPhans.set(hp.maHp, hp);
      });
      console.log("Unique hoc phans after filtering:", uniqueHocPhans);
      setAllHocPhans(Array.from(uniqueHocPhans.values()));
    } catch (error) {
      console.error("Failed to fetch hoc phan:", error);
      setAllHocPhans([]);
    } finally {
      setLoadingAvailableSubjects(false);
    }
  }, [LOAI_HP_LIST, axiosPrivate, selectedNganh, selectedKhoaHoc]);

  useEffect(() => {
    if (isOpen) {
      fetchHocPhanByLoai();
    } else {
      setActiveTab("available");
      setAllHocPhans([]);
      setErrorMessage("");
      setShowErrorModal(false);
      setSuccessMessage("");
      setShowSuccessModal(false);
      setLoadingAvailableSubjects(false);
    }
  }, [isOpen, fetchHocPhanByLoai]);
  // Tab button classes
  const tabButtonClass = (tab: "available" | "add") =>
    `px-4 py-2 font-semibold text-sm rounded-t-lg cursor-pointer ${
      activeTab === tab
        ? "bg-white border-t border-x border-gray-300 text-gray-900"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  const handleAddToPending = useCallback(
    (hocPhan: HocPhan) => {
      // Kiểm tra xem học phần đã tồn tại trong danh sách chờ chưa
      const isAlreadyInPending = pendingHocPhans.some(item => item.maHp === hocPhan.maHp);
      if (isAlreadyInPending) {
        return; // Không thêm nếu đã tồn tại
      }
      
      const newItem: HocPhan = {
        ...hocPhan,
      };
      setPendingHocPhans((prev) => [...prev, newItem]);
    },
    [setPendingHocPhans, pendingHocPhans]
  );

  const handleRemoveFromPending = useCallback(
    (maHp: string) => {
      setPendingHocPhans((prev) => prev.filter((item) => item.maHp !== maHp));
    },
    [setPendingHocPhans]
  );

  const handleSavePending = async () => {
    const validItems = pendingHocPhans;
    if (validItems.length === 0) {
      setErrorMessage("Vui lòng chọn học kỳ cho các học phần chuẩn bị thêm.");
      setShowErrorModal(true);
      return;
    }
    try {
      const newItemsPayload: CTDTPayLoad = {
        khoaHoc: selectedKhoaHoc,
        maNganh: selectedNganh,
        hocPhanList: pendingHocPhans,
        nhomHocPhanTuChon: [],
      };
      const response = await axiosPrivate.put(
        HOCPHAN_SERVICE.CTDT_UPDATE,
        newItemsPayload
      );
      if (response.data.code === 200) {
        setSuccessMessage("Thêm học phần thành công!");
        setShowSuccessModal(true);
        onSaveSuccess();
        setPendingHocPhans([]);
      } else {
        setErrorMessage(response.data.message || "Lỗi khi thêm học phần.");
        setShowErrorModal(true);
      }
      // Fetch available hoc phans if not already done
    } catch (error) {
      console.error("Error fetching available hoc phans:", error);
      setErrorMessage("Không thể lấy danh sách học phần.");
      setShowErrorModal(true);
    }
  };
  const pendingColumns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        size: 80,
      },
      {
        accessorKey: "maHp",
        header: "Mã học phần",
        cell: ({ row }) => (
          <div className="text-center font-medium">{row.original.maHp}</div>
        ),
        size: 100,
      },
      {
        accessorKey: "tenHp",
        header: "Tên học phần",
      },
      {
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ row }) => (
          <div className="text-center">{row.original.tinChi}</div>
        ),
        size: 80,
      },
      {
        accessorKey: "loaiHp",
        header: "Loại học phần",
        cell: ({ row }) => (
          <div className="text-center">{row.original.loaiHp}</div>
        ),
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "HP Tiên quyết",
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.hocPhanTienQuyet || "Không"}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const detail = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleRemoveFromPending(detail.maHp)}
                className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200 hover:scale-105"
                title="Xóa khỏi danh sách"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        },
        size: 80,
      },
    ],
    [handleRemoveFromPending]
  );
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm p-1">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex space-x-2 px-3 py-2">
            <button
              className={tabButtonClass("available")}
              onClick={() => setActiveTab("available")}
            >
              Học phần có thể thêm
            </button>
            <button
              className={tabButtonClass("add")}
              onClick={() => setActiveTab("add")}
            >
              Chờ xác nhận
              {pendingHocPhans.length > 0 && (
                <span className="relative inline-flex ml-2">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold">
                    {pendingHocPhans.length}
                  </span>
                </span>
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50">
          <div className="h-full overflow-y-auto">
            {activeTab === "available" ? (
              <>
                {loadingAvailableSubjects ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500">Đang tải...</p>
                    </div>
                  </div>
                ) : allHocPhans.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Không có học phần</p>
                    <p className="text-sm">
                      Tất cả học phần đã được thêm hoặc không có học phần nào
                      trong chương trình đào tạo này.
                    </p>
                  </div>
                ) : (
                  <AvailableSubjectsTable
                    hocPhans={allHocPhans}
                    onAddToPending={handleAddToPending}
                    pendingHocPhans={pendingHocPhans}
                    currentHocPhans={currentHocPhans}
                  />
                )}
              </>
            ) : (
              <>
                {pendingHocPhans.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Chưa có học phần nào</p>
                      <p className="text-sm">
                        Học phần được thêm từ bảng "Học phần có thể thêm" sẽ hiển
                        thị ở đây
                      </p>
                      <button
                        onClick={() => setActiveTab("available")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Chọn học phần
                      </button>
                    </div>
                  </div>
                ) : (
                  <PendingSubjectsTable
                    data={pendingHocPhans}
                    columns={pendingColumns}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        {activeTab === "add" && pendingHocPhans.length > 0 && (
          <div className="flex items-center justify-end p-4 border-t border-gray-200 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSavePending}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={pendingHocPhans.length === 0}
            >
              Lưu
            </button>
          </div>
        )}
      </div>
      
      <ErrorMessageModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
};

export default AddHocPhanToCTDTModal;
