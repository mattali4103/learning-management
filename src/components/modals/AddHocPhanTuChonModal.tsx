import { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  BookOpen,
  Trash2,
  Search,
  Plus,
  PackagePlus,
  BookCopy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import ErrorMessageModal from "./ErrorMessageModal";
import SuccessMessageModal from "./SuccessMessageModal";
import type { HocPhan } from "../../types/HocPhan";
import type { HocPhanTuChon } from "../../types/HocPhanTuChon";

// --- MÀU GROUP ---
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

interface AddHocPhanTuChonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  existingNhomHocPhan: HocPhanTuChon[];
  selectedKhoaHoc: string;
  selectedNganh: string;
  selectedCTDTId: number;
}

// ---- FORM NHÓM VÀ TÍN CHỈ TRÊN CÙNG HÀNG ----
const NhomForm = ({
  selectedNhomId,
  existingNhomHocPhan,
  tenNhom,
  soTinChiYeuCau,
  onChangeNhomId,
  onChangeTenNhom,
  onChangeTinChiYeuCau,
}: {
  selectedNhomId: number | "new";
  existingNhomHocPhan: HocPhanTuChon[];
  tenNhom: string;
  soTinChiYeuCau: number;
  onChangeNhomId: (value: number | "new") => void;
  onChangeTenNhom: (value: string) => void;
  onChangeTinChiYeuCau: (value: number) => void;
}) => {
  // Lấy nhóm đã có (nếu đang sửa)
  const currentNhom =
    selectedNhomId !== "new"
      ? existingNhomHocPhan.find((n) => n.id === selectedNhomId)
      : null;

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Chọn nhóm
        </label>
        <select
          value={selectedNhomId}
          onChange={(e) =>
            onChangeNhomId(
              e.target.value === "new" ? "new" : Number(e.target.value)
            )
          }
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
        >
          <option value="new">Tạo mới</option>
          {existingNhomHocPhan.map((nhom) => (
            <option key={nhom.id} value={nhom.id}>
              {nhom.tenNhom}
            </option>
          ))}
        </select>
      </div>
      {/* Nếu tạo mới thì nhập tên, nhập tín chỉ. Nếu sửa thì chỉ hiển thị */}
      {selectedNhomId === "new" ? (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Tên nhóm mới
            </label>
             
            <input
              type="text"
              value={tenNhom}
              onChange={(e) => onChangeTenNhom(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
              placeholder="VD: Tự chọn chuyên ngành"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700">
              Số tín chỉ yêu cầu
            </label>
            <input
              type="number"
              value={soTinChiYeuCau}
              onChange={(e) =>
                onChangeTinChiYeuCau(parseInt(e.target.value, 10) || 0)
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
              placeholder="VD: 3"
              min={0}
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Tên nhóm
            </label>
            <input
              disabled
              value={currentNhom?.tenNhom || ""}
              className="mt-1 block w-full border-gray-200 bg-gray-100 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700">
              Số tín chỉ yêu cầu
            </label>
            <input
              disabled
              value={currentNhom?.tinChiYeuCau || 0}
              className="mt-1 block w-full border-gray-200 bg-gray-100 rounded-md shadow-sm p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ---- BẢNG CHỌN HỌC PHẦN (7 dòng, nút +, + mờ khi đã chọn) ----
const CollapsibleSelectableSubjectsTable = ({
  hocPhans,
  selectedHocPhans,
  onAdd,
}: {
  hocPhans: HocPhan[];
  selectedHocPhans: HocPhan[];
  onAdd: (hocPhan: HocPhan) => void;
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 7 });

  // Group
  const subjectGroups = useMemo((): SubjectGroup[] => {
    const groupedByLoaiHp = hocPhans.reduce(
      (acc, course) => {
        const type = course.loaiHp || "Khác";
        if (!acc[type]) acc[type] = [];
        acc[type].push(course);
        return acc;
      },
      {} as Record<string, HocPhan[]>
    );
    return Object.entries(groupedByLoaiHp).map(([loaiHp, courses]) => {
      const totalCredits = courses.reduce((sum, c) => sum + (c.tinChi || 0), 0);
      let colorScheme = "blue";
      if (loaiHp.includes("Đại cương")) colorScheme = "purple";
      else if (loaiHp.includes("Cơ sở ngành")) colorScheme = "blue";
      else if (loaiHp.includes("Chuyên ngành")) colorScheme = "orange";
      else if (loaiHp.includes("Tự chọn")) colorScheme = "green";
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
  // Flatten
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

  // Filter
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

  // Columns: Mã | Tên | Tín chỉ | Tiên quyết | Thao tác (+)
  const columns = useMemo<ColumnDef<SubjectRow>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: "Mã HP",
        cell: ({ row }) =>
          row.original.isGroupHeader ? null : row.original.maHp,
        size: 80,
      },
      {
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ row }) =>
          row.original.isGroupHeader ? null : row.original.tenHp,
        size: 200,
      },
      {
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ row }) =>
          row.original.isGroupHeader ? null : (
            <div className="text-center">{row.original.tinChi}</div>
          ),
        size: 60,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "Tiên quyết",
        cell: ({ row }) =>
          row.original.isGroupHeader ? null : (
            <div className="text-center">
              {row.original.hocPhanTienQuyet || "Không"}
            </div>
          ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          !row.original.isGroupHeader && (
            <button
              onClick={() => onAdd(row.original)}
              disabled={selectedHocPhans.some(
                (hp) => hp.maHp === row.original.maHp
              )}
              className={`ml-auto p-2 rounded-full transition-all duration-200 ${
                selectedHocPhans.some((hp) => hp.maHp === row.original.maHp)
                  ? "bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-110"
              }`}
              title={
                selectedHocPhans.some((hp) => hp.maHp === row.original.maHp)
                  ? "Đã thêm"
                  : "Thêm học phần"
              }
              style={{
                pointerEvents: selectedHocPhans.some(
                  (hp) => hp.maHp === row.original.maHp
                )
                  ? "none"
                  : undefined,
              }}
            >
              <Plus className="w-3 h-3" />
            </button>
          ),
        size: 60,
      },
    ],
    [selectedHocPhans, onAdd]
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
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="font-semibold text-base flex items-center gap-2">
          <BookOpen /> Chọn học phần
        </span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm học phần..."
            className="border border-gray-300 pl-9 pr-3 py-1.5 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm w-56"
          />
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{
                      width: header.getSize(),
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
                    className={`${colors.bg} border-l-4 ${colors.border} cursor-pointer`}
                  >
                    <td
                      colSpan={columns.length}
                      className={`px-4 py-2 border-b ${colors.text}`}
                      onClick={() => toggleGroup(item.groupId)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedGroups.has(item.groupId) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-semibold">{item.groupTitle}</span>
                        <span className={`text-xs ml-2 ${colors.text}`}>
                          {item.groupSubtitle}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 group transition-colors"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 text-sm border-b ${idx === 1 ? "pl-8" : "text-gray-700"}`}
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
      {/* Pagination controls - cập nhật theo style tham khảo */}
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
            title="Trang đầu"
          >
            <span style={{ fontWeight: "bold" }}>&laquo;</span>
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Trang trước"
          >
            <span>&lsaquo;</span>
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Trang sau"
          >
            <span>&rsaquo;</span>
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Trang cuối"
          >
            <span style={{ fontWeight: "bold" }}>&raquo;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- BẢNG ĐÃ CHỌN (bổ sung Tiên quyết) ---
const SelectedSubjectsTable = ({
  data,
  onRemove,
}: {
  data: HocPhan[];
  onRemove: (hocPhan: HocPhan) => void;
}) => {
  const columns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      { accessorKey: "maHp", header: "Mã HP", size: 80 },
      { accessorKey: "tenHp", header: "Tên học phần", size: 180 },
      { accessorKey: "tinChi", header: "Tín chỉ", size: 60 },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "Tiên quyết",
        cell: ({ row }) => row.original.hocPhanTienQuyet || "Không",
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() => onRemove(row.original)}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
        size: 50,
      },
    ],
    [onRemove]
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      <div className="p-3 border-b font-semibold flex items-center gap-2">
        <BookCopy /> Đã chọn ({data.length})
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-xs font-medium text-gray-500 uppercase"
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
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-sm border-b">
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
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500"
                >
                  Chưa chọn học phần nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MODAL MAIN ---
const AddHocPhanTuChonModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  existingNhomHocPhan,
  selectedKhoaHoc,
  selectedNganh,
  selectedCTDTId,
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
    let payload;
    if (isEditing) {
      const existingGroup = existingNhomHocPhan.find(
        (nhom) => nhom.id === selectedNhomId
      );
      if (!existingGroup) {
        setErrorMessage("Nhóm học phần không tồn tại.");
        setShowErrorModal(true);
        setIsSaving(false);
        return;
      }
      payload = {
        id: existingGroup.id,
        tenNhom,
        tinChiYeuCau: soTinChiYeuCau,
        khoaHoc: selectedKhoaHoc,
        maNganh: selectedNganh,
        hocPhanTuChonList: [
          ...selectedHocPhans.filter(
            (hp) =>
              !existingGroup.hocPhanTuChonList.some(
                (exHp) => exHp.maHp === hp.maHp
              )
          ),
        ],
      };
    }
    // Nếu là nhóm mới, tạo payload mới
    payload = {
      id: selectedCTDTId,
      nhomHocPhanTuChon: [
        {
          tenNhom,
          tinChiYeuCau: soTinChiYeuCau,
          hocPhanTuChonList: selectedHocPhans.map((hp) => ({
            maHp: hp.maHp,
            tenHp: hp.tenHp,
            tinChi: hp.tinChi,
            loaiHp: hp.loaiHp,
            hocPhanTienQuyet: hp.hocPhanTienQuyet || "",
          })),
        },
      ],
    };
    console.log("Saving hoc phan tu chon:", payload);
    try {
      const response = isEditing
        ? await axiosPrivate.put(HOCPHAN_SERVICE.TU_CHON_UPDATE, payload)
        : await axiosPrivate.post(HOCPHAN_SERVICE.TU_CHON_ADD, payload);
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
      }
    } catch (error) {
      console.error("Error saving hoc phan tu chon:", error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1300px] h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-2 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <PackagePlus className="mr-2" />
            {selectedNhomId === "new"
              ? "Thêm Nhóm Học Phần Tự Chọn"
              : "Chỉnh Sửa Nhóm Học Phần Tự Chọn"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-row gap-6 p-2 overflow-auto bg-gray-50">
          {/* LEFT */}
          <div className="flex-1 flex flex-col max-w-[60%] min-w-[420px]">
            <NhomForm
              selectedNhomId={selectedNhomId}
              existingNhomHocPhan={existingNhomHocPhan}
              tenNhom={tenNhom}
              soTinChiYeuCau={soTinChiYeuCau}
              onChangeNhomId={setSelectedNhomId}
              onChangeTenNhom={setTenNhom}
              onChangeTinChiYeuCau={setSoTinChiYeuCau}
            />
            <p className="text-[12px]">Để tạo nhóm chuyên ngành, cần đặt tên theo quy tắc: [Tên nhóm] - [Mã nhóm] ví dụ: [Nhóm Chuyên Ngành] - [CN1]</p>
            <div className="flex-1 min-h-[390px]">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Đang tải danh sách học phần...
                  </div>
                </div>
              ) : (
                <CollapsibleSelectableSubjectsTable
                  hocPhans={availableHocPhans}
                  selectedHocPhans={selectedHocPhans}
                  onAdd={toggleSelectHocPhan}
                />
              )}
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex-1 flex flex-col min-w-[340px] max-w-[40%]">
            <SelectedSubjectsTable
              data={selectedHocPhans}
              onRemove={toggleSelectHocPhan}
            />
          </div>
        </div>
        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 p-2 border-t bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              !tenNhom ||
              soTinChiYeuCau <= 0 ||
              selectedHocPhans.length === 0
            }
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="w-4 h-4 inline-block mr-1" />
            )}
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
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
