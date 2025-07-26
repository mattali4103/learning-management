import { useState, useMemo, useCallback, useEffect } from "react";
import {
  X,
  BookOpen,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type Table,
  type SortingState,
} from "@tanstack/react-table";

// Components
import ErrorMessageModal from "./ErrorMessageModal";
import SuccessMessageModal from "./SuccessMessageModal";

// Types
import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";
import type { KeHoachHocTapDetail } from "../../types/KeHoachHocTapMau";

// API endpoints
import { HOCPHAN_SERVICE, KHHT_SERVICE, KQHT_SERVICE } from "../../api/apiEndPoints";

// Hooks
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
interface AvailableSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingHocPhans: KeHoachHocTapDetail[];
  setPendingHocPhans: React.Dispatch<
    React.SetStateAction<KeHoachHocTapDetail[]>
  >;
  selectedNganh: string;
  selectedKhoaHoc: string;
  currentFilterNamHoc: number | null;
  currentFilterHocKy: number | null;
  onSaveSuccess: () => void;
  initialTab: "available" | "add";
  currentHocPhans: KeHoachHocTapDetail[];
}

interface KHHTCreatePayload {
  maSo: string;
  khoaHoc: string;
  maNganh: string;
  maHocKy: number;
  maHocPhan: string;
}
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
  data: KeHoachHocTapDetail[];
  columns: ColumnDef<KeHoachHocTapDetail>[];
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

// --- New Table for Available Subjects (Grouped and Collapsible) ---
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

const CollapsibleSubjectsTable = ({
  hocPhans,
  hocPhanGoiY,
  hocPhanCaiThien,
  onAddToPending,
  pendingHocPhans,
  currentHocPhans,
}: {
  hocPhans: HocPhan[];
  hocPhanGoiY: HocPhan[];
  hocPhanCaiThien: HocPhan[];
  onAddToPending: (hocPhan: HocPhan) => void;
  pendingHocPhans: KeHoachHocTapDetail[];
  currentHocPhans: KeHoachHocTapDetail[];
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const subjectGroups = useMemo((): SubjectGroup[] => {
    const currentMaHps = new Set(currentHocPhans.map((item) => item.hocPhan.maHp));
  
    // Regular filtering for non-improvement courses
    const filterCourses = (courseList: HocPhan[]) => courseList.filter(hp => !currentMaHps.has(hp.maHp));
  
    const availableSubjects = filterCourses(hocPhans);
    const suggestedSubjects = filterCourses(hocPhanGoiY);
    // Improvement courses are not filtered against the current plan, as they can be re-added.
    const improvementSubjects = hocPhanCaiThien;
  
    const newGroups: SubjectGroup[] = [];
  
    // Group 1: Suggested Courses
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
  
    // Group 2: Improvement Courses
    if (improvementSubjects.length > 0) {
      const totalCredits = improvementSubjects.reduce((sum, course) => sum + (course.tinChi || 0), 0);
      newGroups.push({
        id: "group-improvement",
        title: "Học phần cải thiện",
        subtitle: `${improvementSubjects.length} học phần • ${totalCredits} tín chỉ`,
        courses: improvementSubjects,
        totalCredits,
        colorScheme: "red",
      });
    }
  
    // Group 3: Regular courses grouped by loaiHp
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
  }, [hocPhans, hocPhanGoiY, hocPhanCaiThien, currentHocPhans]);

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
          <div className="text-base">{row.original.tinChi}</div>
        ),
        size: 80,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "HP Tiên quyết",
        cell: ({ row }) => (
          <div className="text-base">
            {row.original.hocPhanTienQuyet || "Không"}
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: () => (
          <div className="text-center">
            Thao tác
          </div>
        ),
        cell: ({ row }) => {
            const hocPhan = row.original;
            const isImprovementCourse = hocPhan.loaiHp === "Cải thiện";
  
            // Always check if it's in the current pending list to prevent adding twice in one go.
            const isInPending = pendingHocPhans.some(
              (item) => item.hocPhan.maHp === hocPhan.maHp
            );
  
            // Check if it's in the main plan.
            const isInCurrentPlan = currentHocPhans.some(
              (item) => item.hocPhan.maHp === hocPhan.maHp
            );
  
            // Disable button if it's pending.
            // Also disable if it's in the current plan UNLESS it's an improvement course.
            const isAdded = isInPending || (isInCurrentPlan && !isImprovementCourse);
  
            return (
              <div className="text-center">
                <button
                  onClick={() => onAddToPending(hocPhan)}
                  disabled={isAdded}
                  className={`p-2 text-white bg-emerald-600 rounded-full transition-all duration-200 ${
                    isAdded
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-emerald-700 hover:scale-105"
                  }`}
                  title={isAdded ? "Đã thêm học phần này" : "Thêm vào danh sách"}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          },
        size: 100,
      },
    ],
    [pendingHocPhans, currentHocPhans, onAddToPending]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
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

const ThemKHHTModal = ({
  isOpen,
  onClose,
  pendingHocPhans,
  setPendingHocPhans,
  selectedNganh,
  selectedKhoaHoc,
  currentFilterNamHoc,
  currentFilterHocKy,
  onSaveSuccess,
  initialTab,
  currentHocPhans,
}: AvailableSubjectsModalProps) => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const maSo = auth.user?.maSo || "";
  const [activeTab, setActiveTab] = useState<"available" | "add">(initialTab);
  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);
  const [formNamHoc, setFormNamHoc] = useState<number | null>(null);
  const [formHocKy, setFormHocKy] = useState<number | null>(null);

  // Internal states for data fetching and messages
  const [availableHocPhans, setAvailableHocPhans] = useState<HocPhan[]>([]);
  const [hocPhanGoiY, setHocPhanGoiY] = useState<HocPhan[]>([]);
  const [hocPhanCaiThien, setHocPhanCaiThien] = useState<HocPhan[]>([]);
  const [loadingAvailableSubjects, setLoadingAvailableSubjects] =
    useState(false);
  const [danhSachHocKy, setDanhSachHocKy] = useState<HocKy[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const hocKyHienTai: HocKy | null = useMemo(() => {
    const storedHocKy = localStorage.getItem("hocKyHienTai");
    return storedHocKy ? JSON.parse(storedHocKy) : null;
  }, []);

  const availableNamHoc = useMemo(() => {
    const years = new Map<number, { id: number; tenNh: string }>();
    danhSachHocKy.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        if (hocKyHienTai && hk.maHocKy <= hocKyHienTai.maHocKy) {
          years.set(hk.namHoc.id, {
            id: hk.namHoc.id,
            tenNh: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`,
          });
        }
      }
    });
    return Array.from(years.values()).sort((a, b) => a.id - b.id);
  }, [danhSachHocKy, hocKyHienTai]);

  // Fetching functions
  const fetchChuongTrinhDaoTao = useCallback(async () => {
    if (!selectedNganh || !selectedKhoaHoc) return;
    setLoadingAvailableSubjects(true);
    try {
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_NGANH_KHOAHOC.replace(":khoaHoc", selectedKhoaHoc).replace(
          ":maNganh",
          selectedNganh
        )
      );
      if (response.data.code === 200 && response.data.data) {
        const chuongTrinhData = response.data.data;
        const chuongTrinh = Array.isArray(chuongTrinhData)
          ? chuongTrinhData[0]
          : chuongTrinhData;
        if (chuongTrinh && chuongTrinh.hocPhanList) {
          setAvailableHocPhans(chuongTrinh.hocPhanList);
        } else {
          setAvailableHocPhans([]);
        }
      } else {
        setAvailableHocPhans([]);
      }
    } catch (error) {
      console.error("Error fetching chuong trinh dao tao:", error);
      setAvailableHocPhans([]);
    } finally {
      setLoadingAvailableSubjects(false);
    }
  }, [selectedNganh, selectedKhoaHoc, axiosPrivate]);
  const fetchHocPhanGoiY = useCallback(async () => {
    if (!maSo || !selectedKhoaHoc || !selectedNganh) return;
    try {
      const response = await axiosPrivate.post(
        KHHT_SERVICE.GET_HOCPHAN_BY_GOIY,
        { maSo: maSo, khoaHoc: selectedKhoaHoc, maNganh: selectedNganh }
      );
      if (response.data.code === 200 && response.data.data) {
        setHocPhanGoiY(response.data.data);
      } else {
        setHocPhanGoiY([]);
      }
    } catch (error) {
      console.error("Error fetching suggested courses:", error);
      setHocPhanGoiY([]);
    }
  }, [axiosPrivate, maSo, selectedKhoaHoc, selectedNganh]);
  
  const fetchHocPhanCaiThien = useCallback(async () => {
    if (!maSo) return;
    try {
      const response = await axiosPrivate.get(
        KQHT_SERVICE.GET_HOC_PHAN_CAI_THIEN.replace(":maSo", maSo)
      );
      if (response.data.code === 200 && response.data.data) {
        const improvementCourses: HocPhan[] = response.data.data.map(
          (item: any) => ({
            ...item.hocPhan,
            loaiHp: "Cải thiện", // Add a specific type for easy identification
          })
        );
        setHocPhanCaiThien(improvementCourses);
      } else {
        setHocPhanCaiThien([]);
      }
    } catch (error) {
      console.error("Error fetching improvement courses:", error);
      setHocPhanCaiThien([]);
    }
  }, [axiosPrivate, maSo]);
  const fetchDanhSachHocKy = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(HOCPHAN_SERVICE.GET_ALL_HOCKY);
      if (response.data.code === 200 && response.data.data) {
        const result: HocKy[] = response.data.data.map((item: any) => ({
          maHocKy: item.maHocKy,
          tenHocKy: item.tenHocKy,
          ngayBatDau: item.ngayBatDau,
          ngayKetThuc: item.ngayKetThuc,
          namHoc: item.namHocDTO,
        }));
        result.sort((a, b) => a.maHocKy - b.maHocKy);
        setDanhSachHocKy(result);
      }
    } catch (error) {
      console.error("Error fetching danh sach hoc ky:", error);
    }
  }, [axiosPrivate]);

  // Effect to reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Set initial form values based on current filters if available
      setFormNamHoc(currentFilterNamHoc);
      setFormHocKy(currentFilterHocKy);
      // If no current filter, show the form to select semester
      if (!currentFilterNamHoc || !currentFilterHocKy) {
        setShowAddSubjectForm(true);
      } else {
        setShowAddSubjectForm(false);
      }
      // Fetch data when modal opens
      fetchChuongTrinhDaoTao();
      fetchDanhSachHocKy();
      fetchHocPhanGoiY();
      fetchHocPhanCaiThien();
    } else {
      // Reset states when modal closes
      setActiveTab("available");
      setShowAddSubjectForm(false);
      setFormNamHoc(null);
      setFormHocKy(null);
      setAvailableHocPhans([]); // Clear available subjects when modal closes
      setHocPhanGoiY([]);
      setHocPhanCaiThien([]);
      setLoadingAvailableSubjects(false);
      setDanhSachHocKy([]);
      setErrorMessage("");
      setShowErrorModal(false);
      setSuccessMessage("");
      setShowSuccessModal(false);
    }
  }, [
    isOpen,
    currentFilterNamHoc,
    currentFilterHocKy,
    fetchChuongTrinhDaoTao,
    fetchDanhSachHocKy,
    fetchHocPhanGoiY,
    fetchHocPhanCaiThien,
  ]);

  // Tab button classes
  const tabButtonClass = (tab: "available" | "add") =>
    `px-4 py-2 font-semibold text-sm rounded-t-lg cursor-pointer ${
      activeTab === tab
        ? "bg-white border-t border-x border-gray-300 text-gray-900"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  const handleAddToPending = useCallback(
    (hocPhan: HocPhan) => {
      let defaultHocKy: HocKy | null = null;
      let defaultNamHoc: number | undefined = undefined;

      const targetNamHoc = formNamHoc;
      const targetHocKy = formHocKy;

      if (targetHocKy && targetNamHoc) {
        defaultHocKy =
          danhSachHocKy.find((hk) => hk.maHocKy === targetHocKy) || null;
        defaultNamHoc = targetNamHoc;
      }

      if (!defaultHocKy || !defaultNamHoc) {
        setErrorMessage(
          "Vui lòng chọn năm học và học kỳ trước khi thêm học phần."
        );
        setShowErrorModal(true);
        return;
      }

      const newItem: KeHoachHocTapDetail = {
        id: `pending-${hocPhan.maHp}-${Date.now()}`,
        hocPhan,
        hocKy: defaultHocKy,
        namHoc: defaultNamHoc,
        hocPhanCaiThien: hocPhan.loaiHp === "Cải thiện",
      };

      setPendingHocPhans((prev) => [...prev, newItem]);
    },
    [
      formHocKy,
      formNamHoc,
      danhSachHocKy,
      setPendingHocPhans,
      setErrorMessage,
      setShowErrorModal,
    ]
  );

  const handleRemoveFromPending = useCallback(
    (id: string) => {
      setPendingHocPhans((prev) => prev.filter((item) => item.id !== id));
    },
    [setPendingHocPhans]
  );

  const handleUpdatePending = useCallback(
    (id: string, updates: Partial<KeHoachHocTapDetail>) => {
      setPendingHocPhans((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    [setPendingHocPhans]
  );

  const handleSavePending = async () => {
    if (!selectedNganh || !selectedKhoaHoc) {
      setErrorMessage("Thiếu thông tin ngành và khóa học.");
      setShowErrorModal(true);
      return;
    }

    const validItems = pendingHocPhans.filter((item) => item.hocKy !== null);
    if (validItems.length === 0) {
      setErrorMessage("Vui lòng chọn học kỳ cho các học phần chuẩn bị thêm.");
      setShowErrorModal(true);
      return;
    }

    try {
      const newItemsPayload: KHHTCreatePayload[] = validItems.map(
        (item) => ({
          maSo: maSo,
          khoaHoc: selectedKhoaHoc,
          maNganh: selectedNganh,
          maHocKy: item.hocKy!.maHocKy,
          maHocPhan: item.hocPhan.maHp,
        })
      );
      const response = await axiosPrivate.post(
        KHHT_SERVICE.CREATE,
        newItemsPayload
      );

      if (response.data.code === 200) {
        setPendingHocPhans([]); // Clear pending after successful save
        onClose(); // Close modal
        setSuccessMessage("Đã thêm học phần vào kế hoạch học tập thành công!");
        setShowSuccessModal(true);
        onSaveSuccess(); // Notify parent component
      } else {
        setErrorMessage(
          "Có lỗi xảy ra khi thêm học phần: " +
            (response.data.message || "Lỗi không xác định")
        );
        setShowErrorModal(true);
      }
    } catch (error: any) {
      setErrorMessage(
        "Có lỗi xảy ra khi thêm học phần: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
      setShowErrorModal(true);
    }
  };

  const pendingColumns = useMemo<ColumnDef<KeHoachHocTapDetail>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        size: 80,
      },
      {
        accessorKey: "hocPhan.maHp",
        header: "Mã học phần",
        cell: ({ row }) => (
          <div className="text-base font-medium">
            {row.original.hocPhan?.maHp}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "hocPhan.tenHp",
        header: "Tên học phần",
      },
      {
        accessorKey: "hocPhan.tinChi",
        header: "Tín chỉ",
        cell: ({ row }) => (
          <div className="text-base">{row.original.hocPhan?.tinChi}</div>
        ),
        size: 80,
      },
      {
        accessorKey: "hocPhan.loaiHp",
        header: "Loại học phần",
        cell: ({ row }) => (
          <div className="text-base">{row.original.hocPhan?.loaiHp}</div>
        ),
      },
      {
        accessorKey: "hocPhan.hocPhanTienQuyet",
        header: "HP Tiên quyết",
        cell: ({ row }) => (
          <div className="text-base">
            {row.original.hocPhan?.hocPhanTienQuyet || "Không"}
          </div>
        ),
      },
      {
        id: "namHoc",
        header: "Năm học",
        cell: ({ row }) => {
          const detail = row.original;
          return (
            <div className="text-base">
              <select
                value={detail.namHoc || ""}
                onChange={(e) => {
                  const newNamHocId = parseInt(e.target.value) || undefined;
                  handleUpdatePending(detail.id, {
                    namHoc: newNamHocId,
                    hocKy: null,
                  });
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn năm học</option>
                {availableNamHoc.map((nh) => (
                  <option key={nh.id} value={nh.id}>
                    {nh.tenNh}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        size: 130,
      },
      {
        id: "hocKy",
        header: "Học kỳ",
        cell: ({ row }) => {
          const detail = row.original;
          const filteredHocKy = danhSachHocKy.filter(
            (hk) => hk.namHoc?.id === detail.namHoc
          );

          return (
            <div className="text-base">
              <select
                value={detail.hocKy?.maHocKy || ""}
                onChange={(e) => {
                  const selectedHk = danhSachHocKy.find(
                    (hk) => hk.maHocKy === parseInt(e.target.value)
                  );
                  handleUpdatePending(detail.id, {
                    hocKy: selectedHk || null,
                  });
                }}
                disabled={!detail.namHoc}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!detail.namHoc ? "Chọn năm học trước" : "Chọn học kỳ"}
                </option>
                {filteredHocKy.map((hk) => (
                  <option key={hk.maHocKy} value={hk.maHocKy}>
                    {hk.tenHocKy}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        size: 130,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const detail = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleRemoveFromPending(detail.id)}
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
    [
      handleUpdatePending,
      handleRemoveFromPending,
      availableNamHoc,
      danhSachHocKy,
    ]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col">
        {/* Modal Header with Tabs */}
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
              Học phần chuẩn bị thêm ({pendingHocPhans.length})
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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === "available" ? (
            <>
              {showAddSubjectForm ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    {/* Form Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">
                            Chọn học kỳ
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Chọn năm học và học kỳ để thêm học phần
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddSubjectForm(false);
                          onClose();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Năm học
                          </label>
                          <select
                            value={formNamHoc || ""}
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseInt(e.target.value)
                                : null;
                              setFormNamHoc(value);
                              setFormHocKy(null);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Chọn năm học</option>
                            {availableNamHoc.map((nh) => (
                              <option key={nh.id} value={nh.id}>
                                {nh.tenNh}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Học kỳ
                          </label>
                          <select
                            value={formHocKy || ""}
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseInt(e.target.value)
                                : null;
                              setFormHocKy(value);
                            }}
                            disabled={!formNamHoc}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {!formNamHoc
                                ? "Chọn năm học trước"
                                : "Chọn học kỳ"}
                            </option>
                            {formNamHoc &&
                              danhSachHocKy
                                .filter((hk) => hk.namHoc?.id === formNamHoc)
                                .map((hk) => (
                                  <option key={hk.maHocKy} value={hk.maHocKy}>
                                    {hk.tenHocKy}
                                  </option>
                                ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Form Footer */}
                    <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
                      <button
                        onClick={() => {
                          setShowAddSubjectForm(false);
                          onClose();
                        }}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          if (formNamHoc && formHocKy) {
                            setShowAddSubjectForm(false);
                          }
                        }}
                        disabled={!formNamHoc || !formHocKy}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Tiếp tục
                      </button>
                    </div>
                  </div>
                </div>
              ) : loadingAvailableSubjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Đang tải...</p>
                  </div>
                </div>
              ) : availableHocPhans.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Không có học phần</p>
                  <p className="text-sm">
                    Tất cả học phần đã được thêm hoặc không có học phần nào
                    trong chương trình đào tạo này.
                  </p>
                </div>
              ) : (
                <CollapsibleSubjectsTable
                hocPhans={availableHocPhans}
                hocPhanGoiY={hocPhanGoiY}
                hocPhanCaiThien={hocPhanCaiThien}
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

export default ThemKHHTModal;
