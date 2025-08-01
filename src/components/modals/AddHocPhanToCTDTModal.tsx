import { useState, useMemo, useCallback, useEffect } from "react";
import {
  X,
  BookOpen,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  getPaginationRowModel,
  type Table,
} from "@tanstack/react-table";

import type { HocPhan } from "../../types/HocPhan";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";

import CollapsibleSubjectsTable from "../table/CollapsibleSubjectsTable";
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
      const newItem: HocPhan = {
        ...hocPhan,
      };
      setPendingHocPhans((prev) => [...prev, newItem]);
    },
    [setPendingHocPhans]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
                <CollapsibleSubjectsTable
                  hocPhans={allHocPhans}
                  onAddToPending={handleAddToPending}
                  pendingHocPhans={pendingHocPhans}
                  currentHocPhans={currentHocPhans}
                  enableImprovementCourses={false}
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

export default AddHocPhanToCTDTModal;
