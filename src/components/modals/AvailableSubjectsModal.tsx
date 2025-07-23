import { useState, useMemo, useCallback, useEffect } from "react";
import {
  X,
  BookOpen,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";

// Components
import ErrorMessageModal from "./ErrorMessageModal";
import SuccessMessageModal from "./SuccessMessageModal";

// Types
import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";
import type { KeHoachHocTapDetail } from "../../types/KeHoachHocTapMau";

// API endpoints
import { HOCPHAN_SERVICE, KHHT_SERVICE } from "../../api/apiEndPoints";

// Hooks
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
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

interface KHHTMauCreatePayload {
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
                    colSpan={cell.column.id === "group" ? table.getAllColumns().length : 1}
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

// --- Table for Available Subjects (Grouped and Collapsible) ---
interface GroupHeaderRow {
  isGroupHeader: true;
  groupName: string;
  count: number;
}

interface HocPhanRow {
  isGroupHeader: false;
  hocPhan: HocPhan;
}

type AvailableTableRow = GroupHeaderRow | HocPhanRow;

interface AvailableSubjectsTableProps {
  hocPhans: HocPhan[];
  onAddToPending: (hocPhan: HocPhan) => void;
  pendingHocPhans: KeHoachHocTapDetail[];
  currentHocPhans: KeHoachHocTapDetail[];
}

const AvailableSubjectsTable = ({
  hocPhans,
  onAddToPending,
  pendingHocPhans,
  currentHocPhans,
}: AvailableSubjectsTableProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Ensure hocPhans are unique by maHp before grouping
  const uniqueHocPhans = useMemo(() => {
    const seenMaHps = new Set<string>();
    const filteredHocPhans = hocPhans.filter(hp => {
      if (seenMaHps.has(hp.maHp)) {
        return false;
      }
      seenMaHps.add(hp.maHp);
      return true;
    });
    console.log("Unique Hoc Phans:", filteredHocPhans);
    return filteredHocPhans;
  }, [hocPhans]);

  const groupedData = useMemo(() => {
    const data = uniqueHocPhans.reduce(
      (acc, hocPhan) => {
        const groupKey = hocPhan.loaiHp || "Chưa phân loại";
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(hocPhan);
        return acc;
      },
      {} as Record<string, HocPhan[]>
    );
    console.log("Grouped Data:", data);
    return data;
  }, [uniqueHocPhans]);

  useEffect(() => {
    setExpandedGroups(new Set(Object.keys(groupedData)));
  }, [groupedData]);

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) newSet.delete(groupName);
      else newSet.add(groupName);
      return newSet;
    });
  }, []);

  const displayRows = useMemo((): AvailableTableRow[] => {
    const rows: AvailableTableRow[] = [];
    // Create a set of maHp for quick lookup of pending and current hoc phans
    const pendingAndCurrentMaHps = new Set([
      ...pendingHocPhans.map((item) => item.hocPhan.maHp),
      ...currentHocPhans.map((item) => item.hocPhan.maHp),
    ]);
    console.log("Pending and Current MaHps:", pendingAndCurrentMaHps);

    Object.entries(groupedData).forEach(([groupName, data]) => {
      const filteredSubjects = data.filter((hp) => {
        const isAlreadyAdded = pendingAndCurrentMaHps.has(hp.maHp);
        if (isAlreadyAdded) {
          console.log(`Filtering out ${hp.maHp} - ${hp.tenHp} (already added)`);
        }
        return !isAlreadyAdded;
      });

      if (filteredSubjects.length > 0) {
        rows.push({ isGroupHeader: true, groupName, count: filteredSubjects.length });
        if (expandedGroups.has(groupName)) {
          filteredSubjects.forEach((hp) => rows.push({ isGroupHeader: false, hocPhan: hp }));
        }
      }
    });
    return rows;
  }, [groupedData, expandedGroups, pendingHocPhans, currentHocPhans]);

  const columns = useMemo<ColumnDef<AvailableTableRow>[]>(
    () => [
      {
        id: "group",
        header: "Học phần",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) {
            const isExpanded = expandedGroups.has(item.groupName);
            return (
              <button
                onClick={() => toggleGroup(item.groupName)}
                className="w-full flex items-center justify-between font-bold text-md text-gray-700 p-2 bg-gray-100 hover:bg-gray-200"
              >
                <span>
                  {item.groupName} ({item.count})
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            );
          }
          return <div className="pl-6">{item.hocPhan.tenHp}</div>;
        },
      },
      {
        accessorKey: "hocPhan.maHp",
        header: "Mã HP",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) return null;
          return item.hocPhan.maHp;
        },

      },
      {
        accessorKey: "hocPhan.tinChi",
        header: "Tín chỉ",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) return null;
          return item.hocPhan.tinChi;
        },
      },
      {
        accessorKey: "hocPhan.loaiHp",
        header: "Loại học phần",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) return null;
          return item.hocPhan.loaiHp;
        },

      },
      {
        accessorKey: "hocPhan.hocPhanTienQuyet",
        header: "HP Tiên quyết",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) return null;
          return item.hocPhan.hocPhanTienQuyet || "Không";
        },

      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const item = row.original;
          if (item.isGroupHeader) return null;
          return (
            <div className="text-center">
              <button
                onClick={() => onAddToPending(item.hocPhan)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
              >
                Thêm
              </button>
            </div>
          );
        },
      },
    ],
    [expandedGroups, onAddToPending, toggleGroup]
  );

  const table = useReactTable({
    data: displayRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 7 } },
    getRowId: (row) =>
      (row as any).isGroupHeader
        ? (row as GroupHeaderRow).groupName
        : (row as HocPhanRow).hocPhan.maHp,
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
                    colSpan={columns.length}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              <tr
                key={row.id}
                className={`hover:bg-gray-50 ${(row.original as AvailableTableRow).isGroupHeader ? "bg-gray-50" : ""}`}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      colSpan={columns.length}
                      className="px-4 py-3 whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.getPageCount() > 1 && <PaginationControls table={table} />}
    </div>
  );
};

const AvailableSubjectsModal = ({
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

  const [activeTab, setActiveTab] = useState<"available" | "add">(initialTab);
  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);
  const [formNamHoc, setFormNamHoc] = useState<number | null>(null);
  const [formHocKy, setFormHocKy] = useState<number | null>(null);

  // Internal states for data fetching and messages
  const [availableHocPhans, setAvailableHocPhans] = useState<HocPhan[]>([]);
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
        HOCPHAN_SERVICE.CTDT_NGANH.replace(":khoaHoc", selectedKhoaHoc).replace(
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
    } else {
      // Reset states when modal closes
      setActiveTab("available");
      setShowAddSubjectForm(false);
      setFormNamHoc(null);
      setFormHocKy(null);
      setAvailableHocPhans([]); // Clear available subjects when modal closes
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
        hocPhanCaiThien: false,
      };

      setPendingHocPhans((prev) => [...prev, newItem]);
      setSuccessMessage(`Đã thêm "${hocPhan.tenHp}" vào danh sách chờ.`);
      setShowSuccessModal(true);
    },
    [
      formHocKy,
      formNamHoc,
      danhSachHocKy,
      setPendingHocPhans,
      setErrorMessage,
      setShowErrorModal,
      setSuccessMessage,
      setShowSuccessModal,
    ]
  );

  const handleRemoveFromPending = useCallback(
    (id: string) => {
      setPendingHocPhans((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage("Đã xóa học phần khỏi danh sách chờ.");
      setShowSuccessModal(true);
    },
    [setPendingHocPhans, setSuccessMessage, setShowSuccessModal]
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
      const newItemsPayload: KHHTMauCreatePayload[] = validItems.map(
        (item) => ({
          khoaHoc: selectedKhoaHoc,
          maNganh: selectedNganh,
          maHocKy: item.hocKy!.maHocKy,
          maHocPhan: item.hocPhan.maHp,
        })
      );

      const response = await axiosPrivate.post(
        KHHT_SERVICE.KHHT_MAU_CREATES,
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
          <div className="text-center font-medium">
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
          <div className="text-center">{row.original.hocPhan?.tinChi}</div>
        ),
        size: 80,
      },
      {
        accessorKey: "hocPhan.loaiHp",
        header: "Loại học phần",
        cell: ({ row }) => (
          <div className="text-center">{row.original.hocPhan?.loaiHp}</div>
        ),
      },
      {
        accessorKey: "hocPhan.hocPhanTienQuyet",
        header: "HP Tiên quyết",
        cell: ({ row }) => (
          <div className="text-center">{row.original.hocPhan?.hocPhanTienQuyet || "Không"}</div>
        ),
      },
      {
        id: "namHoc",
        header: "Năm học",
        cell: ({ row }) => {
          const detail = row.original;
          return (
            <div className="text-center">
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
            <div className="text-center">
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
        <div className="flex-1 overflow-y-auto p-6">
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
                <AvailableSubjectsTable
                  hocPhans={availableHocPhans}
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
        {activeTab === "add" && (
          <div className="flex items-center justify-end p-6 border-t border-gray-200">
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

export default AvailableSubjectsModal;
