import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts";
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  AlertCircle,
  Search,
  Trash2,
  Plus,
  X,
  Save,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE, HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import DeleteModal from "../../components/modals/DeleteModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import { GroupedTable } from "../../components/table/GroupedTable";
import type { ColumnDef } from "@tanstack/react-table";

interface CreditStatData {
  tenHocKy: string;
  soTinChi: number;
  hocKyId: number;
  namHocId: number;
  namHoc: string;
}

interface KeHoachHocTapDetailItem {
  id: string;
  hocPhan: HocPhan;
  hocKy: HocKy | null;
  namHoc: number | undefined;
  hocPhanCaiThien: boolean;
}

const KeHoachHocTapDetail = () => {
  const { auth } = useAuth();
  const { maSo, khoaHoc, maNganh } = auth.user || {};
  const axiosPrivate = useAxiosPrivate();
  const availableSubjectsRef = useRef<HTMLDivElement>(null);

  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allData, setAllData] = useState<KeHoachHocTap[]>([]);
  const [availableHocPhans, setAvailableHocPhans] = useState<HocPhan[]>([]);
  const [danhSachHocKy, setDanhSachHocKy] = useState<HocKy[]>([]);
  const [pendingHocPhans, setPendingHocPhans] = useState<KeHoachHocTapDetailItem[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTabNamHoc, setSelectedTabNamHoc] = useState<number | null>(null);
  const [selectedHocKyChart, setSelectedHocKyChart] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterNamHoc, setSelectedFilterNamHoc] = useState<number | null>(null);
  const [selectedFilterHocKy, setSelectedFilterHocKy] = useState<number | null>(null);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hocPhanToDelete, setHocPhanToDelete] = useState<KeHoachHocTap | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const hocKyHienTai : HocKy = useMemo(() => {
    const storedHocKy = localStorage.getItem("hocKyHienTai");
    return storedHocKy ? JSON.parse(storedHocKy) : null;
  }, []);
  // Available academic years for navigation
  const availableNamHoc = useMemo(() => {
    const years = new Map<number, { id: number; tenNh: string }>();
    danhSachHocKy.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        // Chỉ lấy năm học có học kỳ <= hocKyHienTai?.maHocKy
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

  // Available semesters for selected academic year
  const availableHocKy = useMemo(() => {
    if (!selectedTabNamHoc) return [];
    return danhSachHocKy
      .filter(item => item.namHoc?.id === selectedTabNamHoc && (!hocKyHienTai || item.maHocKy <= hocKyHienTai.maHocKy))
      .map(item => ({
        id: item.maHocKy,
        ten: item.tenHocKy,
        namHoc: item.namHoc
      }))
      .sort((a, b) => a.id - b.id);
  }, [danhSachHocKy, selectedTabNamHoc, hocKyHienTai]);

  // Credit statistics for chart
  const creditStatistics = useMemo(() => {
    const statsMap = new Map<string, CreditStatData>();

    allData.forEach((item) => {
      if (item.tenHocKy && item.namBdNamKt) {
        const key = `${item.maHocKy}`;
        const existing = statsMap.get(key) || {
          tenHocKy: item.tenHocKy,
          soTinChi: 0,
          hocKyId: item.maHocKy,
          namHocId: item.namHocId,
          namHoc: item.namBdNamKt,
        };

        existing.soTinChi += item.tinChi;
        statsMap.set(key, existing);
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => {
      if (a.namHocId !== b.namHocId) {
        return a.namHocId - b.namHocId;
      }
      return a.hocKyId - b.hocKyId;
    });
  }, [allData]);

  // Calculate statistics from all data
  const statistics = useMemo(() => {
    const totalCredits = allData.reduce((sum, item) => sum + item.tinChi, 0);
    const totalSubjects = allData.length;
    
    const semesterSet = new Set<string>();
    allData.forEach(item => {
      if (item.tenHocKy && item.namBdNamKt) {
        semesterSet.add(`${item.tenHocKy}-${item.namBdNamKt}`);
      }
    });

    return {
      totalCredits,
      totalSubjects,
      totalSemesters: semesterSet.size,
    };
  }, [allData]);

  // Selected semester data for table
  const selectedSemesterData = useMemo(() => {
    if (!selectedHocKyChart) return [];
    return allData.filter((item) => item.maHocKy === selectedHocKyChart);
  }, [allData, selectedHocKyChart]);

  // Filtered available subjects
  const filteredAvailableHocPhans = useMemo(() => {
    let filtered = availableHocPhans.filter(
      (hp) => !allData.some((item) => item.maHp === hp.maHp)
    );

    if (searchTerm) {
      filtered = filtered.filter(
        (hp) =>
          hp.tenHp.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hp.maHp.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [availableHocPhans, allData, searchTerm]);

  // Current filter values
  const currentFilterNamHoc = useMemo(() => {
    if (activeTab.startsWith("semester-")) {
      const hocKyId = parseInt(activeTab.replace("semester-", ""));
      const selectedHocKy = danhSachHocKy.find((hk) => hk.maHocKy === hocKyId);
      return selectedHocKy?.namHoc?.id || null;
    }
    return selectedFilterNamHoc;
  }, [activeTab, danhSachHocKy, selectedFilterNamHoc]);

  const currentFilterHocKy = useMemo(() => {
    if (activeTab.startsWith("semester-")) {
      return parseInt(activeTab.replace("semester-", ""));
    }
    return selectedFilterHocKy;
  }, [activeTab, selectedFilterHocKy]);

  const showFilterSection = activeTab === "all";

  // Fetch functions
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

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosPrivate.get(KHHT_SERVICE.KHHT_DETAIL.replace(":maSo", maSo || ""));
      const processResponse = (response: any): KeHoachHocTap[] => {
        if (response.status === 200 && response.data?.code === 200) {
          return response.data.data.map((item: any) => ({
            id: item.id,
            maHp: item.hocPhan.maHp,
            tenHp: item.hocPhan.tenHp,
            tinChi: item.hocPhan.tinChi,
            hocPhanTienQuyet: item.hocPhan.hocPhanTienQuyet,
            loaiHp: item.hocPhan.loaiHp,
            maHocKy: item.hocKy.maHocKy,
            tenHocKy: item.hocKy.tenHocKy,
            namHocId: item.namHoc.id,
            namBdNamKt: item.namHoc.namBatDau + "-" + item.namHoc.namKetThuc,
          }));
        }
        return [];
      };
      const processedData = processResponse(response);
      setAllData(processedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maSo]);

  // Fetch available subjects that are not in current study plan
  const fetchAvailableHocPhansNotInKHHT = useCallback(async () => {
    if (!maNganh || !khoaHoc || !maSo) return;

    try {
      const response = await axiosPrivate.get(
        KHHT_SERVICE.CTDT_NOT_IN_KHHT.replace(":id", maSo)
          .replace(":khoaHoc", khoaHoc)
          .replace(":maNganh", maNganh)
      );

      if (response.data.code === 200 && response.data.data) {
        // Remove duplicates based on maHp
        const rawData = response.data.data || [];
        const uniqueHocPhan = rawData.filter((hocPhan: HocPhan, index: number, self: HocPhan[]) => 
          self.findIndex(hp => hp.maHp === hocPhan.maHp) === index
        );
        setAvailableHocPhans(uniqueHocPhan);
      } else {
        setAvailableHocPhans([]);
      }
    } catch (error) {
      console.error("Error fetching available hoc phans:", error);
      setAvailableHocPhans([]);
    }
  }, [maNganh, khoaHoc, maSo, axiosPrivate]);

  // Event handlers
  const handleChartBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload as CreditStatData;
      setSelectedHocKyChart(clickedData.hocKyId);
      setActiveTab(`semester-${clickedData.hocKyId}`);
    }
  };

  const handleNamHocTabClick = (namHocId: number) => {
    if (selectedTabNamHoc === namHocId) {
      setSelectedTabNamHoc(null);
      setActiveTab("all");
    } else {
      setSelectedTabNamHoc(namHocId);
      setActiveTab("all");
    }
    setSelectedHocKyChart(null);
  };

  const handleHocKyTabClick = (hocKyId: number) => {
    setSelectedHocKyChart(hocKyId);
    setActiveTab(`semester-${hocKyId}`);

    const selectedHocKy = danhSachHocKy.find((hk) => hk.maHocKy === hocKyId);
    if (selectedHocKy) {
      setSelectedTabNamHoc(selectedHocKy.namHoc?.id || null);
    }
  };

  const handleAllTabClick = () => {
    setActiveTab("all");
    setSelectedTabNamHoc(null);
    setSelectedHocKyChart(null);
  };

  const handleAddHocPhanClick = () => {
    setTimeout(() => {
      availableSubjectsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleAddToPending = useCallback((hocPhan: HocPhan) => {
    let defaultHocKy: HocKy | null = null;
    let defaultNamHoc: number | undefined = undefined;

    const targetNamHoc = currentFilterNamHoc;
    const targetHocKy = currentFilterHocKy;

    if (targetHocKy && targetNamHoc) {
      defaultHocKy = danhSachHocKy.find((hk) => hk.maHocKy === targetHocKy) || null;
      defaultNamHoc = targetNamHoc;
    }

    const newItem: KeHoachHocTapDetailItem = {
      id: `pending-${hocPhan.maHp}-${Date.now()}`,
      hocPhan,
      hocKy: defaultHocKy,
      namHoc: defaultNamHoc,
      hocPhanCaiThien: false,
    };

    setPendingHocPhans((prev) => [...prev, newItem]);
  }, [currentFilterNamHoc, currentFilterHocKy, danhSachHocKy]);

  const handleRemoveFromPending = useCallback((id: string) => {
    setPendingHocPhans((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdatePending = useCallback((
    id: string,
    updates: Partial<KeHoachHocTapDetailItem>
  ) => {
    setPendingHocPhans((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleSavePending = useCallback(async () => {
    if (!maSo || !khoaHoc || !maNganh) {
      setErrorMessage("Thiếu thông tin sinh viên");
      setShowErrorModal(true);
      return;
    }

    // Validate pending items
    const validItems = pendingHocPhans.filter((item) => item.hocKy !== null);
    if (validItems.length === 0) {
      setErrorMessage("Vui lòng chọn học kỳ cho các học phần chuẩn bị thêm");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      // Create học phần one by one
      for (const item of validItems) {
        const payload = {
          maSo: maSo,
          khoaHoc: khoaHoc,
          maNganh: maNganh,
          maHocKy: item.hocKy!.maHocKy,
          maHocPhan: item.hocPhan.maHp,
        };

        await axiosPrivate.post(KHHT_SERVICE.CREATE, payload);
      }

      setSuccessMessage(`Đã thêm thành công ${validItems.length} học phần vào kế hoạch học tập!`);
      setShowSuccessModal(true);
      setPendingHocPhans([]);
      setShowAddModal(false);
      
      // Refresh data
      await fetchAllData();
      await fetchAvailableHocPhansNotInKHHT();
    } catch (error: any) {
      setErrorMessage(
        "Có lỗi xảy ra khi thêm học phần: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  }, [maSo, khoaHoc, maNganh, pendingHocPhans, axiosPrivate, fetchAllData, fetchAvailableHocPhansNotInKHHT]);

  const fetchDeleteHocPhan = useCallback(async (id: number) => {
    try {
      setIsDeleting(true);
      const response = await axiosPrivate.delete(
        KHHT_SERVICE.DELETE.replace(":id", id.toString())
      );

      if (response.status === 200 && response.data?.code === 200) {
        setSuccessMessage("Đã xóa học phần khỏi kế hoạch học tập thành công!");
        setShowSuccessModal(true);
        await fetchAllData();
      } else {
        setErrorMessage("Không thể xóa học phần. Vui lòng thử lại.");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error deleting hoc phan:", error);
      setErrorMessage("Không thể xóa học phần. Vui lòng thử lại.");
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  }, [axiosPrivate, fetchAllData]);

  const handleDeleteClick = useCallback((hocPhan: KeHoachHocTap) => {
    setHocPhanToDelete(hocPhan);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (hocPhanToDelete && !isDeleting) {
      fetchDeleteHocPhan(hocPhanToDelete.id);
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [hocPhanToDelete, isDeleting, fetchDeleteHocPhan]);

  const handleCloseDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [isDeleting]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSuccessMessage(`Đã sao chép: ${text}`);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      })
      .catch((error) => {
        setErrorMessage("Không thể sao chép mã học phần");
        setShowErrorModal(true);
        console.error("Copy to clipboard failed:", error);
      });
  };

  // Chart tooltip component
  const CreditChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CreditStatData;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.tenHocKy}</p>
          <p className="text-blue-600">
            Số tín chỉ: <span className="font-bold">{data.soTinChi}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">Nhấn để xem chi tiết</p>
        </div>
      );
    }
    return null;
  };

  // Table columns for edit mode (with delete action)
  const editModeColumns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "maHp",
        header: "Mã học phần",
        cell: ({ getValue }) => {
          const maHp = getValue() as string;
          return (
            <div className="text-center">
              <button
                onClick={() => copyToClipboard(maHp)}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors cursor-pointer"
                title={`Nhấn để sao chép: ${maHp}`}
              >
                {maHp}
              </button>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="text-left font-semibold text-gray-900 text-sm">
            {getValue() as string}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-emerald-700">
              {getValue() as number}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "loaiHp",
        header: "Loại học phần",
        cell: ({ getValue }) => {
          const loaiHp = getValue() as string;
          const colorMap: Record<string, string> = {
            "Đại cương": "bg-blue-100 text-blue-800",
            "Cơ sở ngành": "bg-green-100 text-green-800",
            "Chuyên ngành": "bg-purple-100 text-purple-800",
          };
          return (
            <div className="flex justify-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[loaiHp] || "bg-gray-100 text-gray-800"}`}
              >
                {loaiHp}
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "maHocKy",
        accessorKey: "tenHocKy",
        header: "Học kỳ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1.5">
              {getValue() as string}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "namHocId",
        accessorKey: "namBdNamKt",
        header: "Năm học",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600">
              {getValue() as string}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "Tiên quyết",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {(getValue() as string) || "Không"}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200 group"
              title="Xóa học phần"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleDeleteClick]
  );

  // Available subjects table columns
  const availableColumnsForMain = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        size: 80,
      },
      {
        id: "maHp",
        accessorKey: "maHp",
        header: "Mã học phần",
        cell: ({ getValue }) => {
          const maHp = getValue() as string;
          return (
            <div className="text-center">
              <button
                onClick={() => copyToClipboard(maHp)}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors cursor-pointer"
                title={`Nhấn để sao chép: ${maHp}`}
              >
                {maHp}
              </button>
            </div>
          );
        },
        size: 140,
      },
      {
        id: "tenHp",
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() as string}</div>
        ),
        size: 300,
      },
      {
        id: "soTinChi",
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() as number}</div>
        ),
        size: 100,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const hocPhan = row.original;
          const isAlreadyAdded = allData.some((item) => item.maHp === hocPhan.maHp);
          const isInPending = pendingHocPhans.some((item) => item.hocPhan.maHp === hocPhan.maHp);
          
          return (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handleAddToPending(hocPhan)}
                disabled={isAlreadyAdded || isInPending || !currentFilterNamHoc || !currentFilterHocKy}
                className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  isAlreadyAdded
                    ? "Đã có trong kế hoạch"
                    : isInPending
                      ? "Đã thêm vào danh sách chờ"
                      : !currentFilterNamHoc || !currentFilterHocKy
                        ? "Vui lòng chọn năm học và học kỳ"
                        : "Thêm vào danh sách chờ"
                }
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 140,
      },
    ],
    [allData, pendingHocPhans, currentFilterNamHoc, currentFilterHocKy, handleAddToPending]
  );

  // Pending subjects table columns
  const pendingColumns = useMemo<ColumnDef<KeHoachHocTapDetailItem>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        size: 80,
      },
      {
        id: "maHp",
        accessorKey: "hocPhan.maHp",
        header: "Mã học phần",
        cell: ({ getValue }) => {
          const maHp = getValue() as string;
          return (
            <div className="text-center">
              <button
                onClick={() => copyToClipboard(maHp)}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors cursor-pointer"
                title={`Nhấn để sao chép: ${maHp}`}
              >
                {maHp}
              </button>
            </div>
          );
        },
        size: 120,
      },
      {
        id: "tenHp",
        accessorKey: "hocPhan.tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() as string}</div>
        ),
        size: 200,
      },
      {
        id: "soTinChi",
        accessorKey: "hocPhan.tinChi",
        header: "Tín chỉ",
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() as number}</div>
        ),
        size: 80,
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
                  const namHocId = Number(e.target.value);
                  handleUpdatePending(detail.id, { namHoc: namHocId });
                  // Reset hocKy when namHoc changes
                  handleUpdatePending(detail.id, { hocKy: null });
                }}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn năm học</option>
                {availableNamHoc.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tenNh}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        size: 120,
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
                  const hocKyId = Number(e.target.value);
                  const selectedHocKy = danhSachHocKy.find(
                    (hk) => hk.maHocKy === hocKyId
                  );
                  handleUpdatePending(detail.id, { hocKy: selectedHocKy || null });
                }}
                disabled={!detail.namHoc}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Chọn học kỳ</option>
                {filteredHocKy.map((item) => (
                  <option key={item.maHocKy} value={item.maHocKy}>
                    {item.tenHocKy}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        size: 100,
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
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                title="Xóa khỏi danh sách chờ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 80,
      },
    ],
    [availableNamHoc, danhSachHocKy, handleUpdatePending, handleRemoveFromPending]
  );

  // Effects
  useEffect(() => {
    fetchDanhSachHocKy();
  }, [fetchDanhSachHocKy]);

  useEffect(() => {
    if (maSo && khoaHoc && maNganh) {
      fetchAllData();
      fetchAvailableHocPhansNotInKHHT();
    }
  }, [maSo, khoaHoc, maNganh, fetchAllData, fetchAvailableHocPhansNotInKHHT]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title="Điều chỉnh Kế hoạch Học tập"
        description="Chỉnh sửa và quản lý kế hoạch học tập cá nhân"
        icon={BookOpen}
        iconColor="from-emerald-500 to-teal-600"
        descriptionIcon={GraduationCap}
      />

      {/* Credit Statistics Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">
            Thống kê tín chỉ theo học kỳ ({statistics.totalCredits} tín chỉ)
          </h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {creditStatistics.length > 0 ? (
              <BarChart
                data={creditStatistics}
                onClick={handleChartBarClick}
                style={{ cursor: "pointer" }}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="tenHocKy" fontSize={12} stroke="#6b7280" />
                <YAxis
                  fontSize={12}
                  stroke="#6b7280"
                  label={{
                    value: "Số tín chỉ",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CreditChartTooltip />} />
                <Bar
                  dataKey="soTinChi"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tab Navigation for Edit Mode */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Academic Year Level Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex items-center px-6 py-3">
            <div className="flex space-x-6 overflow-x-auto">
              <button
                onClick={handleAllTabClick}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "all" && !selectedTabNamHoc
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tất cả ({allData.length})
              </button>

              {availableNamHoc.map((namHoc) => (
                <button
                  key={namHoc.id}
                  onClick={() => handleNamHocTabClick(namHoc.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTabNamHoc === namHoc.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {namHoc.tenNh} ({allData.filter(item => item.namHocId === namHoc.id && (!hocKyHienTai || item.maHocKy <= hocKyHienTai.maHocKy)).length})
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Semester Level Navigation */}
        {selectedTabNamHoc && availableHocKy.length > 0 && (
          <div className="border-b border-gray-100 bg-gray-50">
            <nav className="flex items-center px-6 py-2">
              <div className="flex space-x-4 overflow-x-auto">
                {availableHocKy.map((hocKy) => (
                  <button
                    key={hocKy.id}
                    onClick={() => handleHocKyTabClick(hocKy.id)}
                    className={`whitespace-nowrap py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedHocKyChart === hocKy.id
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {hocKy.ten} ({allData.filter(item => item.maHocKy === hocKy.id && (!hocKyHienTai || item.maHocKy <= hocKyHienTai.maHocKy)).length})
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "all" ? (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Tất cả học phần trong kế hoạch ({allData.length})
              </h4>

              {allData.length > 0 ? (
                <GroupedTable
                  name="Tất cả học phần"
                  data={allData}
                  columns={editModeColumns}
                  groupByKey="tenHocKy"
                  groupDisplayName={(groupKey: string) => groupKey || "Chưa xác định học kỳ"}
                  groupColorScheme={(groupKey: string) => {
                    const colors = [
                      "bg-blue-50 border-blue-200 text-blue-700",
                      "bg-green-50 border-green-200 text-green-700", 
                      "bg-purple-50 border-purple-200 text-purple-700",
                      "bg-orange-50 border-orange-200 text-orange-700",
                      "bg-pink-50 border-pink-200 text-pink-700",
                    ];
                    const hashCode = groupKey ? groupKey.split('').reduce((a: number, b: string) => {
                      a = ((a << 5) - a) + b.charCodeAt(0);
                      return a & a;
                    }, 0) : 0;
                    return colors[Math.abs(hashCode) % colors.length];
                  }}
                  initialExpanded={true}  
                  enablePagination={true}
                  pageSize={7}
                  emptyStateTitle="Chưa có học phần nào"
                  emptyStateDescription="Nhấn 'Thêm học phần' để bắt đầu"
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Chưa có học phần nào trong kế hoạch</p>
                  <p className="text-gray-500 mt-2">Nhấn "Thêm học phần" để bắt đầu thêm học phần vào kế hoạch</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Học phần trong học kỳ đã chọn ({selectedSemesterData.length})
              </h4>

              {selectedSemesterData.length > 0 ? (
                <GroupedTable
                  name="Học phần theo học kỳ"
                  data={selectedSemesterData}
                  columns={editModeColumns}
                  groupByKey="loaiHp"
                  groupDisplayName={(groupKey: string) => `Học phần ${groupKey || "Khác"}`}
                  groupColorScheme={(groupKey: string) => {
                    const colorMap: Record<string, string> = {
                      "Đại cương": "bg-blue-50 border-blue-200 text-blue-700",
                      "Cơ sở ngành": "bg-green-50 border-green-200 text-green-700",
                      "Chuyên ngành": "bg-purple-50 border-purple-200 text-purple-700",
                    };
                    return colorMap[groupKey] || "bg-gray-50 border-gray-200 text-gray-700";
                  }}
                  initialExpanded={true}
                  enablePagination={true}
                  pageSize={7}
                  emptyStateTitle="Chưa có học phần nào trong học kỳ này"
                  emptyStateDescription="Thêm học phần đầu tiên cho học kỳ này"
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Chưa có học phần nào trong học kỳ này</p>
                  <p className="text-gray-500 mt-2">Thêm học phần đầu tiên cho học kỳ này</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Available Subjects Section */}
      <div ref={availableSubjectsRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Học phần có thể thêm
            {filteredAvailableHocPhans.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredAvailableHocPhans.length} học phần)
              </span>
            )}
          </h4>
          <button
            onClick={handleAddHocPhanClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm học phần
          </button>
        </div>

        {showFilterSection && (
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Năm học:</label>
              <select
                value={selectedFilterNamHoc || ""}
                onChange={(e) => setSelectedFilterNamHoc(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn năm học</option>
                {availableNamHoc.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tenNh}
                  </option>
                ))}
              </select>
            </div>

            {selectedFilterNamHoc && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Học kỳ:</label>
                <select
                  value={selectedFilterHocKy || ""}
                  onChange={(e) => setSelectedFilterHocKy(e.target.value ? Number(e.target.value) : null)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn học kỳ</option>
                  {danhSachHocKy
                    .filter((hk) => hk.namHoc?.id === selectedFilterNamHoc && (!hocKyHienTai || hk.maHocKy <= hocKyHienTai.maHocKy))
                    .map((item) => (
                      <option key={item.maHocKy} value={item.maHocKy}>
                        {item.tenHocKy}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm học phần..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {filteredAvailableHocPhans.length > 0 ? (
          <KeHoachHocTapTable
            name="Học phần có thể thêm"
            data={filteredAvailableHocPhans}
            columns={availableColumnsForMain}
            pageSize={3}
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              {searchTerm 
                ? "Không tìm thấy học phần phù hợp" 
                : "Không có học phần nào có thể thêm"}
            </p>
          </div>
        )}
      </div>

      {/* Fixed Floating Button for Pending Subjects */}
      {pendingHocPhans.length > 0 && (
        <div className="fixed right-6 bottom-1.5 transform -translate-y-1/2 z-40">
          <button
            onClick={() => setShowAddModal(true)}
            className={`relative flex items-center px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 ${
              pendingHocPhans.length > 0
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 animate-pulse"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            }`}
            title={`${pendingHocPhans.length > 0 ? "Có" : "Chưa có"} học phần chuẩn bị thêm`}
          >
            <div className="flex flex-col items-center">
              <BookOpen className="w-6 h-6 mb-1" />
            </div>
            {pendingHocPhans.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce border-2 border-white shadow-lg">
                {pendingHocPhans.length}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Pending Subjects Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Học phần chuẩn bị thêm</h3>
                  <p className="text-blue-100 mt-1">
                    {pendingHocPhans.length} học phần đang chờ thêm vào kế hoạch
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {pendingHocPhans.length > 0 ? (
                <GroupedTable
                  name="Học phần chuẩn bị thêm"
                  data={pendingHocPhans}
                  columns={pendingColumns}
                  groupByKey="hocKy.tenHocKy"
                  groupDisplayName={(groupKey: string) => groupKey || "Chưa xác định học kỳ"}
                  groupColorScheme={(groupKey: string) => {
                    if (groupKey.includes("1")) return "blue";
                    if (groupKey.includes("2")) return "green";
                    if (groupKey.includes("3")) return "orange";
                    return "purple";
                  }}
                  initialExpanded={true}
                  enablePagination={true}
                  pageSize={5}
                  emptyStateTitle="Chưa có học phần nào"
                  emptyStateDescription="Thêm học phần từ danh sách có sẵn"
                />
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Chưa có học phần nào được chọn</p>
                  <p className="text-gray-500 mt-2">Vui lòng chọn học phần từ danh sách bên dưới</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Tổng cộng: <span className="font-medium">{pendingHocPhans.length}</span> học phần
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleSavePending}
                    disabled={saving || pendingHocPhans.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu tất cả
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteModal}
        title="Xác nhận xóa học phần"
        message={`Bạn có chắc chắn muốn xóa học phần "${hocPhanToDelete?.tenHp}" không? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
      />

      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <ErrorMessageModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default KeHoachHocTapDetail;
