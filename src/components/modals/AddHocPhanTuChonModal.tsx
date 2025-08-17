import { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  BookOpen,
  Trash2,
  Search,
  Plus,
  BookCopy,
  ChevronDown,
  ChevronRight,
  Info,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import CreatableSelect from "react-select/creatable";
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

// --- STEP INDICATOR COMPONENT ---
const StepIndicator = ({ currentStep }: { currentStep: 1 | 2 }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-3">
        {/* Step 1 */}
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-base ${
              currentStep >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
          </div>
          <div className="ml-2 text-base">
            <div className={`font-medium ${currentStep >= 1 ? "text-blue-600" : "text-gray-500"}`}>
              Thông tin nhóm
            </div>
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className={`w-4 h-4 ${currentStep >= 2 ? "text-blue-600" : "text-gray-300"}`} />

        {/* Step 2 */}
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-base ${
              currentStep >= 2
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </div>
          <div className="ml-2 text-base">
            <div className={`font-medium ${currentStep >= 2 ? "text-blue-600" : "text-gray-500"}`}>
              Chọn học phần
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  // Options cho CreatableSelect
  const selectOptions = useMemo(() => [
    { value: "new", label: "🆕 Tạo nhóm mới", isNew: true },
    ...existingNhomHocPhan.map(nhom => ({
      value: nhom.id,
      label: `✏️ ${nhom.tenNhom}`,
      isNew: false,
      nhom: nhom
    }))
  ], [existingNhomHocPhan]);

  // Giá trị hiện tại được chọn
  const selectedValue = useMemo(() => {
    if (selectedNhomId === "new") {
      return { value: "new", label: "🆕 Tạo nhóm mới", isNew: true };
    }
    const option = selectOptions.find(opt => opt.value === selectedNhomId);
    return option || null;
  }, [selectedNhomId, selectOptions]);

  const handleSelectChange = (newValue: any) => {
    if (!newValue) return;
    
    if (newValue.__isNew__) {
      // Nhóm mới được tạo từ input
      onChangeNhomId("new");
      onChangeTenNhom(newValue.label);
    } else if (newValue.value === "new") {
      // Chọn tạo nhóm mới
      onChangeNhomId("new");
      onChangeTenNhom("");
    } else {
      // Chọn nhóm có sẵn
      onChangeNhomId(newValue.value);
    }
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '0.75rem',
      fontSize: '0.875rem'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '0.875rem'
    })
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chọn nhóm học phần hoặc tạo mới
        </label>
        <CreatableSelect
          value={selectedValue}
          onChange={handleSelectChange}
          options={selectOptions}
          styles={customStyles}
          placeholder="Chọn nhóm có sẵn hoặc nhập tên nhóm mới..."
          formatCreateLabel={(inputValue) => `Tạo nhóm: "${inputValue}"`}
          createOptionPosition="first"
          isClearable={false}
          className="text-sm"
        />
        
        {selectedNhomId !== "new" && (
          <p className="text-base text-blue-600 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Đang chỉnh sửa nhóm có sẵn. Bạn có thể thay đổi tên và số tín chỉ.
          </p>
        )}
      </div>
      
      {/* Form inputs - Luôn cho phép chỉnh sửa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tên nhóm
            {selectedNhomId !== "new" && (
              <span className="text-base text-blue-600 ml-1">(có thể chỉnh sửa)</span>
            )}
          </label>
          <input
            type="text"
            value={tenNhom}
            onChange={(e) => onChangeTenNhom(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-3 border transition-all duration-200"
            placeholder="VD: Tự chọn chuyên ngành - TC01"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Số tín chỉ yêu cầu
            {selectedNhomId !== "new" && (
              <span className="text-base text-blue-600 ml-1">(có thể chỉnh sửa)</span>
            )}
          </label>
          <input
            type="number"
            value={soTinChiYeuCau}
            onChange={(e) => onChangeTinChiYeuCau(parseInt(e.target.value, 10) || 0)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-3 border transition-all duration-200"
            placeholder="VD: 3"
            min={0}
          />
        </div>
      </div>
    </div>
  );
};

// ---- BẢNG CHỌN HỌC PHẦN (7 dòng, nút +, + mờ khi đã chọn) ----
const CollapsibleSelectableSubjectsTable = ({
  hocPhans,
  selectedHocPhans,
  onAdd,
  checkPrerequisites,
}: {
  hocPhans: HocPhan[];
  selectedHocPhans: HocPhan[];
  onAdd: (hocPhan: HocPhan) => void;
  checkPrerequisites: (hocPhan: HocPhan) => { isValid: boolean; missingPrerequisites: string[] };
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

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

  // Filter - Tự động mở rộng group khi tìm kiếm
  const filteredData = useMemo(() => {
    if (!globalFilter) return flattenedData;
    const filterValue = globalFilter.toLowerCase();
    
    // Tìm các group có chứa học phần khớp với từ khóa tìm kiếm
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
      
      // Khi có tìm kiếm, luôn hiển thị các học phần khớp (không phụ thuộc vào expandedGroups)
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
    });
    return result;
  }, [flattenedData, globalFilter, subjectGroups]);

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
        cell: ({ row }) => {
          if (row.original.isGroupHeader) return null;
          
          const hocPhan = row.original;
          const isSelected = selectedHocPhans.some((hp) => hp.maHp === hocPhan.maHp);
          
          // Kiểm tra điều kiện tiên quyết
          const prerequisiteCheck = checkPrerequisites(hocPhan);
          const canAdd = prerequisiteCheck.isValid;
          const missingPrerequisites = prerequisiteCheck.missingPrerequisites;

          const buttonDisabled = isSelected || !canAdd;
          let buttonTitle = "Thêm học phần vào danh sách";
          
          if (isSelected) {
            buttonTitle = "Đã thêm vào danh sách";
          } else if (!canAdd) {
            buttonTitle = `Chưa có học phần tiên quyết: ${missingPrerequisites.join(', ')}`;
          }
          
          return (
            <button
              onClick={() => onAdd(hocPhan)}
              disabled={buttonDisabled}
              className={`p-2 rounded-full transition-all duration-200 shadow-sm ${
                buttonDisabled
                  ? "bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 hover:scale-110 hover:shadow-md"
              }`}
              title={buttonTitle}
            >
              <Plus className="w-4 h-4" />
            </button>
          );
        },
        size: 60,
      },
    ],
    [selectedHocPhans, onAdd, checkPrerequisites]
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
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Chọn học phần</h3>
            <p className="text-sm text-gray-600">
              {filteredData.filter(item => !item.isGroupHeader).length} học phần có sẵn
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm học phần..."
            className="border border-gray-300 pl-9 pr-4 py-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64 transition-all duration-200"
          />
        </div>
      </div>
      <div className="overflow-x-auto flex-1 max-h-[400px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-base font-semibold text-gray-600 uppercase tracking-wider text-left"
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
                    className={`${colors.bg} border-l-4 ${colors.border} cursor-pointer transition-colors duration-200 ${colors.hover}`}
                  >
                    <td
                      colSpan={columns.length}
                      className={`px-4 py-3 border-b ${colors.text}`}
                      onClick={() => toggleGroup(item.groupId)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedGroups.has(item.groupId) ? (
                          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                        )}
                        <span className="font-semibold text-sm">{item.groupTitle}</span>
                        <span className={`text-base px-2 py-1 rounded-full ${colors.badge}`}>
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
                  className="hover:bg-blue-50/50 group transition-colors duration-200 border-b border-gray-100"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm ${idx === 1 ? "pl-8 font-medium text-gray-900" : "text-gray-700"}`}
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
      {/* Pagination controls - improved styling */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600 font-medium">
          Trang {table.getState().pagination.pageIndex + 1} của {table.getPageCount()}
          <span className="text-gray-500 ml-2">
            ({filteredData.filter(item => !item.isGroupHeader).length} học phần)
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang đầu"
          >
            <span className="font-bold text-sm">&laquo;</span>
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang trước"
          >
            <span className="text-sm">&lsaquo;</span>
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang sau"
          >
            <span className="text-sm">&rsaquo;</span>
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang cuối"
          >
            <span className="font-bold text-sm">&raquo;</span>
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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });

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
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110"
            title="Xóa khỏi danh sách"
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
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return (
    <div className="h-full flex flex-col">
      <div className="overflow-auto flex-1 max-h-[350px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-base font-semibold text-gray-600 uppercase tracking-wider text-left"
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
              table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td 
                      key={cell.id} 
                      className={`px-4 py-3 text-sm ${
                        idx === 1 ? "font-medium text-gray-900" : "text-gray-700"
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
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <BookCopy className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Chưa chọn học phần nào</p>
                      <p className="text-sm text-gray-500 mt-1">Hãy chọn học phần từ danh sách bên trái</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls cho học phần đã chọn - đã hoạt động đúng */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600 font-medium">
          Trang {table.getState().pagination.pageIndex + 1} của {Math.max(1, table.getPageCount())}
          <span className="text-gray-500 ml-2">
            ({data.length} học phần đã chọn)
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang đầu"
          >
            <span className="font-bold text-sm">&laquo;</span>
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang trước"
          >
            <span className="text-sm">&lsaquo;</span>
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang sau"
          >
            <span className="text-sm">&rsaquo;</span>
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-600 hover:text-gray-900"
            title="Trang cuối"
          >
            <span className="font-bold text-sm">&raquo;</span>
          </button>
        </div>
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
  
  // Pagination state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
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
    } catch {
      setAvailableHocPhans([]);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  // Hàm kiểm tra học phần tiên quyết
  const checkPrerequisites = useCallback(
    (hocPhan: HocPhan): { isValid: boolean; missingPrerequisites: string[] } => {
      if (!hocPhan.hocPhanTienQuyet || hocPhan.hocPhanTienQuyet.trim() === "") {
        return { isValid: true, missingPrerequisites: [] };
      }

      // Tách các mã học phần tiên quyết (có thể phân tách bằng dấu phẩy hoặc dấu chấm phẩy)
      const prerequisiteCodes = hocPhan.hocPhanTienQuyet
        .split(/[,;]+/)
        .map(code => code.trim())
        .filter(code => code !== "");

      // Tạo danh sách tất cả học phần có sẵn (đã chọn trong nhóm hiện tại)
      const allAvailableCourses = [
        ...selectedHocPhans.map(item => item.maHp), // Học phần đã chọn trong nhóm
      ];

      // Kiểm tra học phần tiên quyết nào chưa có
      const missingPrerequisites = prerequisiteCodes.filter(
        prereqCode => !allAvailableCourses.includes(prereqCode)
      );

      return {
        isValid: missingPrerequisites.length === 0,
        missingPrerequisites
      };
    },
    [selectedHocPhans]
  );

  useEffect(() => {
    if (isOpen) {
      fetchAvailableHocPhans();
      // Reset về trạng thái tạo mới và trang đầu tiên
      setCurrentStep(1);
      setSelectedNhomId("new");
      setTenNhom("");
      setSoTinChiYeuCau(0);
      setSelectedHocPhans([]);
    }
  }, [isOpen, fetchAvailableHocPhans]);
  // Effect riêng để xử lý khi chọn nhóm có sẵn
  useEffect(() => {
    if (selectedNhomId !== "new") {
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
      // Payload cho cập nhật nhóm có sẵn
      payload = {
        id: existingGroup.id,
        tenNhom,
        tinChiYeuCau: soTinChiYeuCau,
        khoaHoc: selectedKhoaHoc,
        maNganh: selectedNganh,
        hocPhanTuChonList: selectedHocPhans.map((hp) => ({
          maHp: hp.maHp,
          tenHp: hp.tenHp,
          tinChi: hp.tinChi,
          loaiHp: hp.loaiHp,
          hocPhanTienQuyet: hp.hocPhanTienQuyet || "",
        })),
      };
    } else {
      // Payload cho tạo nhóm mới
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
    }
    
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
    const isCurrentlySelected = selectedHocPhans.some((hp) => hp.maHp === hocPhan.maHp);
    
    if (isCurrentlySelected) {
      // Nếu đang được chọn, cho phép bỏ chọn
      setSelectedHocPhans((prev) => prev.filter((hp) => hp.maHp !== hocPhan.maHp));
    } else {
      // Nếu chưa được chọn, kiểm tra điều kiện tiên quyết trước khi thêm
      const { isValid, missingPrerequisites } = checkPrerequisites(hocPhan);
      if (!isValid) {
        setErrorMessage(
          `Không thể thêm học phần "${hocPhan.tenHp}" (${hocPhan.maHp}) vì chưa có các học phần tiên quyết sau: ${missingPrerequisites.join(", ")}`
        );
        setShowErrorModal(true);
        return;
      }
      
      setSelectedHocPhans((prev) => [...prev, hocPhan]);
    }
  };

  // Navigation functions
  const handleNextStep = () => {
    if (!tenNhom || soTinChiYeuCau <= 0) {
      setErrorMessage("Vui lòng nhập tên nhóm và số tín chỉ yêu cầu lớn hơn 0.");
      setShowErrorModal(true);
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-1">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1400px] h-[95vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {/* Center section - Step Indicator */}
          <div className="flex-1 flex justify-center">
            <StepIndicator currentStep={currentStep} />
          </div>

          {/* Right section - Close button */}
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-gray-700"
            title="Đóng modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentStep === 1 ? (
            // Step 1: Group Information
            <div className="h-full flex flex-col">
              <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
                <div className="max-w-4xl mx-auto">
                  {/* Hướng dẫn sử dụng */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-semibold mb-2">Hướng dẫn sử dụng:</p>
                        <ul className="space-y-1 text-sm">
                          <li>• <strong>Chọn nhóm có sẵn:</strong> Click vào dropdown và chọn nhóm từ danh sách</li>
                          <li>• <strong>Tạo nhóm mới:</strong> Nhập tên nhóm mới trực tiếp vào ô select</li>
                          <li>• <strong>Chỉnh sửa nhóm:</strong> Có thể thay đổi tên và số tín chỉ yêu cầu của nhóm có sẵn</li>
                          <li>• <strong>Tiếp theo:</strong> Sau khi điền thông tin, bấm "Tiếp theo" để chọn học phần</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Form nhóm */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900">Thông tin nhóm học phần</h3>
                    </div>
                    <NhomForm
                      selectedNhomId={selectedNhomId}
                      existingNhomHocPhan={existingNhomHocPhan}
                      tenNhom={tenNhom}
                      soTinChiYeuCau={soTinChiYeuCau}
                      onChangeNhomId={setSelectedNhomId}
                      onChangeTenNhom={setTenNhom}
                      onChangeTinChiYeuCau={setSoTinChiYeuCau}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Step 1 */}
              <div className="flex items-center justify-between p-5 border-t bg-white">
                <div className="text-sm text-gray-600">
                  Bước 1/2: Thiết lập thông tin nhóm học phần tự chọn
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!tenNhom || soTinChiYeuCau <= 0}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span>Tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Select Subjects
            <div className="h-full flex flex-col">
              <div className="flex-1 flex flex-row gap-6 p-5 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
                {/* LEFT PANEL - Subject Selection */}
                <div className="flex-1 flex flex-col max-w-[60%] min-w-[500px]">
                  <div className="flex-1 min-h-[450px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                      <div className="flex items-center justify-center py-20 text-gray-500">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600 font-medium">Đang tải danh sách học phần...</p>
                        </div>
                      </div>
                    ) : (
                      <CollapsibleSelectableSubjectsTable
                        hocPhans={availableHocPhans}
                        selectedHocPhans={selectedHocPhans}
                        onAdd={toggleSelectHocPhan}
                        checkPrerequisites={checkPrerequisites}
                      />
                    )}
                  </div>
                </div>
                
                {/* RIGHT PANEL - Selected Subjects */}
                <div className="flex-1 flex flex-col min-w-[420px] max-w-[40%]">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <BookCopy className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Học phần đã chọn</h3>
                            <p className="text-sm text-gray-600">
                              {selectedHocPhans.length} học phần • 
                              <span className="ml-1 font-medium text-green-600">
                                {selectedHocPhans.reduce((sum, hp) => sum + (hp.tinChi || 0), 0)} tín chỉ
                              </span>
                            </p>
                          </div>
                        </div>
                        {selectedHocPhans.length > 0 && (
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {selectedHocPhans.length}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <SelectedSubjectsTable
                        data={selectedHocPhans}
                        onRemove={toggleSelectHocPhan}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Step 2 */}
              <div className="flex items-center justify-between p-5 border-t bg-white">
                <div className="text-sm text-gray-600">
                  {selectedHocPhans.length > 0 && (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Đã chọn {selectedHocPhans.length} học phần ({selectedHocPhans.reduce((sum, hp) => sum + (hp.tinChi || 0), 0)} tín chỉ) cho nhóm "{tenNhom}"
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      !tenNhom ||
                      soTinChiYeuCau <= 0 ||
                      selectedHocPhans.length === 0
                    }
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{selectedNhomId === "new" ? "Tạo nhóm" : "Lưu thay đổi"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
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
