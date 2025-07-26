import { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  BookOpen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  PackagePlus,
  BookCopy,
  ChevronDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import ErrorMessageModal from "./ErrorMessageModal";
import SuccessMessageModal from "./SuccessMessageModal";
import type { HocPhan } from "../../types/HocPhan";
import type { HocPhanTuChon } from "../../types/HocPhanTuChon";

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
  };
  return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
};

interface AddHocPhanTuChonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  existingNhomHocPhan: HocPhanTuChon[];
  selectedKhoaHoc: string;
  selectedNganh: string;
}

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

const CollapsibleAvailableSubjectsTable = ({
  hocPhans,
  selectedHocPhans,
  onToggleSelect,
}: {
  hocPhans: HocPhan[];
  selectedHocPhans: HocPhan[];
  onToggleSelect: (hocPhan: HocPhan) => void;
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 7,
  });

  const subjectGroups = useMemo((): SubjectGroup[] => {
    const groupedByLoaiHp = hocPhans.reduce(
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

    return Object.entries(groupedByLoaiHp).map(([loaiHp, courses]) => {
      const totalCredits = courses.reduce(
        (sum, course) => sum + (course.tinChi || 0),
        0
      );
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
  }, [hocPhans]);

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

    const result: SubjectRow[] = [];
    subjectGroups.forEach((group) => {
      const matchingCourses = group.courses.filter(
        (c) =>
          c.tenHp.toLowerCase().includes(filterValue) ||
          c.maHp.toLowerCase().includes(filterValue)
      );

      if (
        group.title.toLowerCase().includes(filterValue) ||
        matchingCourses.length > 0
      ) {
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
          const coursesToShow = group.title.toLowerCase().includes(filterValue)
            ? group.courses
            : matchingCourses;
          coursesToShow.forEach((course) => {
            result.push({
              ...course,
              isGroupHeader: false,
              groupId: group.id,
              colorScheme: group.colorScheme,
            });
          });
        }
      }
    });
    return result;
  }, [flattenedData, globalFilter, subjectGroups, expandedGroups]);

  const columns = useMemo<ColumnDef<SubjectRow>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) =>
          !row.original.isGroupHeader && (
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={selectedHocPhans.some(
                (hp) => hp.maHp === row.original.maHp
              )}
              onChange={() => onToggleSelect(row.original)}
            />
          ),
        size: 40,
      },
      {
        accessorKey: "maHp",
        header: "Mã HP",
        cell: ({ row }) =>
          row.original.isGroupHeader ? null : row.original.maHp,
        size: 100,
      },
      {
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ row }) =>
          row.original.isGroupHeader ? null : row.original.tenHp,
        size: 250,
      },
      {
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ row }) =>
          row.original.isGroupHeader ? null : (
            <div className="text-center">{row.original.tinChi}</div>
          ),
        size: 80,
      },
    ],
    [selectedHocPhans, onToggleSelect]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.maHp,
  });

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <BookOpen className="mr-2" /> Danh sách học phần
      </h3>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Tìm kiếm học phần..."
          className="border border-gray-300 pl-9 pr-3 py-1.5 rounded-lg w-full"
        />
      </div>
      <div className="overflow-auto border rounded-lg flex-1">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    style={{ width: header.getSize() }}
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
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              if (item.isGroupHeader) {
                const colors = getColorClasses(item.colorScheme || "blue");
                return (
                  <tr
                    key={row.id}
                    className={`${colors.bg} ${colors.hover} cursor-pointer transition-colors border-l-4 ${colors.border}`}
                    onClick={() => toggleGroup(item.groupId)}
                  >
                    <td colSpan={columns.length} className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1.5 rounded-lg ${colors.badge
                              .replace("text-", "bg-")
                              .replace("-800", "-100")}`}
                          >
                            <BookOpen className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <div className="flex items-baseline space-x-2">
                            <span
                              className={`font-semibold ${colors.text} text-sm`}
                            >
                              {item.groupTitle}
                            </span>
                            <span
                              className={`text-xs ${colors.text} opacity-80`}
                            >
                              ({item.groupSubtitle})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6 rounded">
                          {expandedGroups.has(item.groupId) ? (
                            <ChevronDown className={`w-5 h-5 ${colors.text}`} />
                          ) : (
                            <ChevronRight
                              className={`w-5 h-5 ${colors.text}`}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-1.5 whitespace-nowrap text-sm ${
                        index === 1 ? "pl-12" : ""
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
      {table.getPageCount() > 1 && <PaginationControls table={table} />}
    </div>
  );
};

const AddHocPhanTuChonModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  existingNhomHocPhan,
  selectedKhoaHoc,
  selectedNganh,
}: AddHocPhanTuChonModalProps) => {
  const axiosPrivate = useAxiosPrivate();
  const [selectedNhomId, setSelectedNhomId] = useState<number | "new">("new");
  const [tenNhom, setTenNhom] = useState("");
  const [soTinChiYeuCau, setSoTinChiYeuCau] = useState<number>(0);
  const [selectedHocPhans, setSelectedHocPhans] = useState<HocPhan[]>([]);
  const [availableHocPhans, setAvailableHocPhans] = useState<HocPhan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchAvailableHocPhans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get(HOCPHAN_SERVICE.HOCPHAN_LIST);
      if (response.data.code === 200 && response.data.data) {
        setAvailableHocPhans(response.data.data as HocPhan[]);
      } else {
        setAvailableHocPhans([]);
      }
    } catch (error) {
      console.error("Error fetching available hoc phans:", error);
      setAvailableHocPhans([]);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableHocPhans();
      setSelectedNhomId("new");
      setTenNhom("");
      setSoTinChiYeuCau(0);
      setSelectedHocPhans([]);
    }
  }, [isOpen, fetchAvailableHocPhans]);

  useEffect(() => {
    if (selectedNhomId === "new") {
      setTenNhom("");
      setSoTinChiYeuCau(0);
      setSelectedHocPhans([]);
    } else {
      const selectedGroup = existingNhomHocPhan.find(
        (nhom) => nhom.id === selectedNhomId
      );
      if (selectedGroup) {
        setTenNhom(selectedGroup.tenNhom);
        setSoTinChiYeuCau(selectedGroup.tinChiYeuCau);
        setSelectedHocPhans(selectedGroup.hocPhanTuChonList || []);
      }
    }
  }, [selectedNhomId, existingNhomHocPhan]);

  const handleSave = async () => {
    if (!tenNhom || soTinChiYeuCau <= 0 || selectedHocPhans.length === 0) {
      setErrorMessage(
        "Vui lòng nhập tên nhóm, số tín chỉ yêu cầu lớn hơn 0 và chọn ít nhất một học phần."
      );
      setShowErrorModal(true);
      return;
    }

    setIsSaving(true);
    const isEditing = selectedNhomId !== "new";
    const payload = {
      id: isEditing ? selectedNhomId : undefined,
      tenNhom,
      tinChiYeuCau: soTinChiYeuCau,
      khoaHoc: selectedKhoaHoc,
      maNganh: selectedNganh,
      hocPhanList: selectedHocPhans.map((hp) => ({ maHp: hp.maHp })),
    };

    try {
      const response = isEditing
        ? await axiosPrivate.put(
            HOCPHAN_SERVICE.CTDT_UPDATE, // Replace with your update endpoint
            payload
          )
        : await axiosPrivate.post(
            HOCPHAN_SERVICE.CTDT_CREATE, // Replace with your create endpoint
            payload
          );

      if (response.data.code === 200) {
        setSuccessMessage(
          `Đã ${
            isEditing ? "cập nhật" : "thêm"
          } nhóm học phần tự chọn thành công!`
        );
        setShowSuccessModal(true);
        setTimeout(() => {
          onClose();
          onSaveSuccess();
        }, 1500);
      } else {
        throw new Error(response.data.message || "Lỗi không xác định");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra khi lưu. Vui lòng thử lại.");
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectHocPhan = (hocPhan: HocPhan) => {
    setSelectedHocPhans((prev) =>
      prev.some((hp) => hp.maHp === hocPhan.maHp)
        ? prev.filter((hp) => hp.maHp !== hocPhan.maHp)
        : [...prev, hocPhan]
    );
  };

  const selectedColumns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      { accessorKey: "maHp", header: "Mã HP", size: 100 },
      { accessorKey: "tenHp", header: "Tên học phần", size: 250 },
      { accessorKey: "tinChi", header: "Tín chỉ", size: 80 },
      {
        id: "actions",
        header: "Xóa",
        cell: ({ row }) => (
          <button
            onClick={() => toggleSelectHocPhan(row.original)}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
        size: 60,
      },
    ],
    []
  );

  const selectedTable = useReactTable({
    data: selectedHocPhans,
    columns: selectedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <PackagePlus className="mr-2" /> Thêm Nhóm Học Phần Tự Chọn
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Panel: Form and Available Subjects */}
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="nhom-select"
                className="block text-sm font-medium text-gray-700"
              >
                Chế độ
              </label>
              <select
                id="nhom-select"
                value={selectedNhomId}
                onChange={(e) =>
                  setSelectedNhomId(
                    e.target.value === "new" ? "new" : Number(e.target.value)
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
              >
                <option value="new">Tạo nhóm tự chọn mới</option>
                {existingNhomHocPhan.map((nhom) => (
                  <option key={nhom.id} value={nhom.id}>
                    Chỉnh sửa: {nhom.tenNhom}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tenNhom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tên nhóm
                </label>
                <input
                  type="text"
                  id="tenNhom"
                  value={tenNhom}
                  onChange={(e) => setTenNhom(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                  placeholder="VD: Tự chọn chuyên ngành"
                />
              </div>
              <div>
                <label
                  htmlFor="soTinChiYeuCau"
                  className="block text-sm font-medium text-gray-700"
                >
                  Số tín chỉ yêu cầu
                </label>
                <input
                  type="number"
                  id="soTinChiYeuCau"
                  value={soTinChiYeuCau}
                  onChange={(e) =>
                    setSoTinChiYeuCau(parseInt(e.target.value, 10) || 0)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                  placeholder="VD: 3"
                />
              </div>
            </div>

            <CollapsibleAvailableSubjectsTable
              hocPhans={availableHocPhans.filter(
                (hp) => !selectedHocPhans.some((shp) => shp.maHp === hp.maHp)
              )}
              selectedHocPhans={selectedHocPhans}
              onToggleSelect={toggleSelectHocPhan}
            />
          </div>

          {/* Right Panel: Selected Subjects */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <BookCopy className="mr-2" /> Học phần đã chọn (
              {selectedHocPhans.length})
            </h3>
            <div className="overflow-auto border rounded-lg flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50 sticky top-0">
                    {selectedTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                            style={{ width: header.getSize() }}
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
                    {selectedTable.getRowModel().rows.length > 0 ? (
                      selectedTable.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 py-2 whitespace-nowrap text-sm"
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
                          colSpan={selectedColumns.length}
                          className="text-center py-8 text-gray-500"
                        >
                          Chưa chọn học phần nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {selectedTable.getPageCount() > 1 && (
              <PaginationControls table={selectedTable} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="w-4 h-4 inline-block mr-1" />
            )}
            {isSaving ? "Đang lưu..." : "Thêm nhóm"}
          </button>
        </div>
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

export default AddHocPhanTuChonModal;
