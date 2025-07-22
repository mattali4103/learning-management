import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Plus,
  BarChart3,
  X,
  Calendar,
  Users,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { ColumnDef } from "@tanstack/react-table";

// Components
import PageHeader from "../../components/PageHeader";
import { GroupedTable } from "../../components/table/GroupedTable";
import DeleteModal from "../../components/modals/DeleteModal";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";

// Hooks
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

// Types
import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";
import type { Nganh } from "../../types/Nganh";
import type { Khoa } from "../../types/Khoa";
import type { KeHoachHocTapDetail } from "../../types/KeHoachHocTapMau";

// API endpoints
import {
  HOCPHAN_SERVICE,
  KHHT_SERVICE,
  PROFILE_SERVICE,
} from "../../api/apiEndPoints";

// Interface cho thống kê tín chỉ
interface CreditStatData {
  tenHocKy: string;
  soTinChi: number;
  hocKyId: number;
  namHocId: number;
  namHoc: string;
}

// Interface for create payload
interface KHHTMauCreatePayload {
  khoaHoc: string;
  maNganh: string;
  maHocKy: number;
  maHocPhan: string;
}

const ThemKeHoachHocTapMau = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  // Check if this is edit mode (only for /edit/ route, not /add/ route)
  const isEditMode = Boolean(
    params.maNganh && params.khoaHoc && location.pathname.includes("/edit/")
  );
  const isAddMode = Boolean(
    params.maNganh && params.khoaHoc && location.pathname.includes("/add/")
  );
  const initialMaNganh = params.maNganh || "";
  const initialKhoaHoc = params.khoaHoc || "";

  // Ref for available subjects section
  // const availableSubjectsRef = useRef<HTMLDivElement>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [checkingExistingPlan, setCheckingExistingPlan] = useState(false);
  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);
  const [selectedNganh, setSelectedNganh] = useState<string>(initialMaNganh);
  const [selectedKhoaHoc, setSelectedKhoaHoc] =
    useState<string>(initialKhoaHoc);
  const [selectedHocPhans, setSelectedHocPhans] = useState<
    KeHoachHocTapDetail[]
  >([]);
  const [availableHocPhans, setAvailableHocPhans] = useState<HocPhan[]>([]);
  const [danhSachHocKy, setDanhSachHocKy] = useState<HocKy[]>([]);
  const [khoaHocOptions, setKhoaHocOptions] = useState<string[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTabNamHoc, setSelectedTabNamHoc] = useState<number | null>(
    null
  );
  const [selectedHocKyChart, setSelectedHocKyChart] = useState<number | null>(
    null
  );

  // const [showAddModal, setShowAddModal] = useState(false);
  const [pendingHocPhans, setPendingHocPhans] = useState<KeHoachHocTapDetail[]>(
    []
  );
  const [hasCheckedExistingPlan, setHasCheckedExistingPlan] = useState(false);

  // Filter states for available subjects (always shown at bottom)
  const [selectedFilterNamHoc, setSelectedFilterNamHoc] = useState<
    number | null
  >(null);
  const [selectedFilterHocKy, setSelectedFilterHocKy] = useState<number | null>(
    null
  );

  // Add subject modal states
  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);
  const [formNamHoc, setFormNamHoc] = useState<number | null>(null);
  const [formHocKy, setFormHocKy] = useState<number | null>(null);
  const [showAvailableSubjectsModal, setShowAvailableSubjectsModal] =
    useState(false);
  // Error and success modals
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hocPhanToDelete, setHocPhanToDelete] =
    useState<KeHoachHocTapDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const maKhoa = auth.user?.maKhoa || "";

  // Academic years data for navigation
  const availableNamHoc = useMemo(() => {
    const years = new Map<number, { id: number; tenNh: string }>();
    danhSachHocKy.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        years.set(hk.namHoc.id, {
          id: hk.namHoc.id,
          tenNh: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`,
        });
      }
    });
    return Array.from(years.values()).sort((a, b) => a.id - b.id);
  }, [danhSachHocKy]);

  // Available semesters for selected academic year
  const availableHocKy = useMemo(() => {
    if (!selectedTabNamHoc) return [];
    return danhSachHocKy
      .filter((item) => item.namHoc?.id === selectedTabNamHoc)
      .map((item) => ({
        id: item.maHocKy,
        ten: item.tenHocKy,
        namHoc: item.namHoc,
      }))
      .sort((a, b) => a.id - b.id);
  }, [danhSachHocKy, selectedTabNamHoc]);

  // Credit statistics for chart
  const creditStatistics = useMemo(() => {
    const statsMap = new Map<string, CreditStatData>();

    selectedHocPhans.forEach((item) => {
      if (item.hocKy) {
        const key = `${item.hocKy.maHocKy}`;
        const existing = statsMap.get(key) || {
          tenHocKy: item.hocKy.tenHocKy,
          soTinChi: 0,
          hocKyId: item.hocKy.maHocKy,
          namHocId: item.hocKy.namHoc?.id || 0,
          namHoc: `${item.hocKy.namHoc?.namBatDau}-${item.hocKy.namHoc?.namKetThuc}`,
        };

        existing.soTinChi += item.hocPhan.tinChi;
        statsMap.set(key, existing);
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => {
      // Sort by nam hoc first, then by hoc ky
      if (a.namHocId !== b.namHocId) {
        return a.namHocId - b.namHocId;
      }
      return a.hocKyId - b.hocKyId;
    });
  }, [selectedHocPhans]);

  // Selected semester data for table
  const selectedSemesterData = useMemo(() => {
    if (!selectedHocKyChart) return [];
    return selectedHocPhans.filter(
      (item) => item.hocKy?.maHocKy === selectedHocKyChart
    );
  }, [selectedHocPhans, selectedHocKyChart]);

  // Filtered available subjects
  const filteredAvailableHocPhans = useMemo(() => {
    const filtered = availableHocPhans.filter(
      (hp) => !selectedHocPhans.some((item) => item.hocPhan.maHp === hp.maHp)
    );
    return filtered;
  }, [availableHocPhans, selectedHocPhans]);

  // Get current filter values (either from manual filter or from active tab)
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

  // Show filter section only when on "all" tab
  // const showFilterSection = activeTab === "all";

  // Fetch functions
  const fetchDanhSachNganh = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_KHOA.replace(":maKhoa", maKhoa)
      );
      if (response.data.code === 200 && response.data.data) {
        const khoaData = response.data.data as Khoa;
        setDanhSachNganh(khoaData.dsnganh || []);
      }
    } catch (error) {
      console.error("Error fetching danh sach nganh:", error);
    }
  }, [axiosPrivate, maKhoa]);

  const fetchKhoaHoc = useCallback(async () => {
    if (!selectedNganh) return;

    try {
      const response = await axiosPrivate.get<any>(
        HOCPHAN_SERVICE.CTDT_BY_NGANH.replace(":maNganh", selectedNganh)
      );
      if (response.data.code === 200 && response.data.data) {
        const khoaHocList = response.data.data.map((item: any) => item.khoaHoc);
        setKhoaHocOptions(khoaHocList);
      }
    } catch (error) {
      console.error("Error fetching khoa hoc:", error);
      setKhoaHocOptions([]);
    }
  }, [axiosPrivate, selectedNganh]);

  const fetchChuongTrinhDaoTao = useCallback(async () => {
    if (!selectedNganh || !selectedKhoaHoc) return;

    setLoading(true);
    try {
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_NGANH.replace(":khoaHoc", selectedKhoaHoc).replace(
          ":maNganh",
          selectedNganh
        )
      );
      console.log("Chuong trinh dao tao:", response);
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
      setLoading(false);
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

  const checkExistingPlan = useCallback(async () => {
    if (!selectedNganh || !selectedKhoaHoc) return false;

    setCheckingExistingPlan(true);
    try {
      const response = await axiosPrivate.get(
        KHHT_SERVICE.KHHT_MAU_BY_KHOAHOC_MA_NGANH,
        {
          params: {
            khoaHoc: selectedKhoaHoc,
            maNganh: selectedNganh,
          },
        }
      );

      if (
        response.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        // Plan exists, load the data
        setSelectedHocPhans(
          response.data.data.map((item: any) => ({
            ...item,
            namHoc: item.hocKy?.namHoc?.id,
            hocKy: item.hocKy,
          }))
        );

        // Also fetch available subjects for editing
        await fetchChuongTrinhDaoTao();
        setHasCheckedExistingPlan(true);
        return true;
      }

      setHasCheckedExistingPlan(true);
      return false;
    } catch (error) {
      console.error("Error checking existing plan:", error);
      setHasCheckedExistingPlan(true);
      return false;
    } finally {
      setCheckingExistingPlan(false);
    }
  }, [selectedNganh, selectedKhoaHoc, axiosPrivate, fetchChuongTrinhDaoTao]);

  // Event handlers
  const handleBack = () => {
    navigate("/giangvien/study-plans");
  };

  const handleChartBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload as CreditStatData;
      setSelectedHocKyChart(clickedData.hocKyId);
      setSelectedFilterNamHoc(clickedData.namHocId);
      setSelectedFilterHocKy(clickedData.hocKyId);
      setSelectedTabNamHoc(clickedData.namHocId);
      setActiveTab(`semester-${clickedData.hocKyId}`);

      //Tự động điền thông tin năm học và học kỳ
      const selectedHocKy = danhSachHocKy.find(
        (hk) => hk.maHocKy === clickedData.hocKyId
      );
      if (selectedHocKy) {
        setFormNamHoc(selectedHocKy.namHoc?.id || null);
        setFormHocKy(clickedData.hocKyId);
      }
    }
  };
  // New tab navigation handlers for improved UX
  const handleNamHocTabClick = (namHocId: number) => {
    if (selectedTabNamHoc === namHocId) {
      // If same year clicked, toggle selection
      setSelectedTabNamHoc(null);
      setActiveTab("all");
    } else {
      // Set selected year and reset other selections
      setSelectedTabNamHoc(namHocId);
      setSelectedFilterNamHoc(namHocId);
      setActiveTab("all");
    }
    setSelectedHocKyChart(null);
    setFormNamHoc(null);
    setFormHocKy(null);
  };

  const handleHocKyTabClick = (hocKyId: number) => {
    setSelectedHocKyChart(hocKyId);
    setSelectedFilterHocKy(hocKyId);
    setActiveTab(`semester-${hocKyId}`);

    // Auto-set form data for the selected semester
    const selectedHocKy = danhSachHocKy.find((hk) => hk.maHocKy === hocKyId);
    if (selectedHocKy) {
      setFormNamHoc(selectedHocKy.namHoc?.id || null);
      setFormHocKy(hocKyId);
      setSelectedTabNamHoc(selectedHocKy.namHoc?.id || null);
    }
  };

  const handleAllTabClick = () => {
    setActiveTab("all");
    setSelectedTabNamHoc(null);
    setSelectedHocKyChart(null);
    setFormNamHoc(null);
    setFormHocKy(null);
  };

  const handleAddHocPhanClick = () => {
    setShowAvailableSubjectsModal(true);
  };

  const handleAddToPending = useCallback(
    (hocPhan: HocPhan) => {
      // Get the semester info from form data (either pre-filled or user-selected)
      let defaultHocKy: HocKy | null = null;
      let defaultNamHoc: number | undefined = undefined;

      // Use current filter values or form values
      const targetNamHoc = formNamHoc || currentFilterNamHoc;
      const targetHocKy = formHocKy || currentFilterHocKy;

      if (targetHocKy && targetNamHoc) {
        defaultHocKy =
          danhSachHocKy.find((hk) => hk.maHocKy === targetHocKy) || null;
        defaultNamHoc = targetNamHoc;
      }

      const newItem: KeHoachHocTapDetail = {
        id: `pending-${hocPhan.maHp}-${Date.now()}`,
        hocPhan,
        hocKy: defaultHocKy,
        namHoc: defaultNamHoc,
        hocPhanCaiThien: false,
      };

      setPendingHocPhans((prev) => [...prev, newItem]);
    },
    [
      formHocKy,
      formNamHoc,
      currentFilterNamHoc,
      currentFilterHocKy,
      danhSachHocKy,
    ]
  );

  const handleRemoveFromPending = (id: string) => {
    setPendingHocPhans((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdatePending = (
    id: string,
    updates: Partial<KeHoachHocTapDetail>
  ) => {
    setPendingHocPhans((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSavePending = async () => {
    if (!selectedNganh || !selectedKhoaHoc) {
      setErrorMessage("Thiếu thông tin ngành và khóa học");
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


    try {
      // Prepare payload for new items only
      const newItemsPayload: KHHTMauCreatePayload[] = validItems.map(
        (item) => ({
          khoaHoc: selectedKhoaHoc,
          maNganh: selectedNganh,
          maHocKy: item.hocKy!.maHocKy,
          maHocPhan: item.hocPhan.maHp,
        })
      );

      // Always use CREATE endpoint for adding new items to existing plan
      // The backend will handle merging with existing plan
      const response = await axiosPrivate.post(
        KHHT_SERVICE.KHHT_MAU_CREATES,
        newItemsPayload
      );

      if (response.data.code === 200) {
        // Add pending items to main list only after successful API call
        setSelectedHocPhans((prev) => [...prev, ...validItems]);

        // Clear pending and close modal
        setPendingHocPhans([]);
        setShowAvailableSubjectsModal(false);

        setSuccessMessage("Đã thêm học phần vào kế hoạch học tập thành công!");
        setShowSuccessModal(true);
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
    } finally {
      setShowAvailableSubjectsModal(false);
    }
  };

  // Hàm xử lý xóa học phần qua API
  const fetchDeleteHocPhan = useCallback(
    async (khht: KeHoachHocTapDetail) => {
      try {
        setIsDeleting(true);
        // Nếu học phần có ID số (đã lưu trong DB), gọi API xóa
        // ID từ database sẽ có dạng số nguyên (parse được), còn ID tạm sẽ có prefix "pending-"
        const numbericId = parseInt(khht.id);
        if (!isNaN(numbericId)) {
          const response = await axiosPrivate.delete(
            KHHT_SERVICE.KHHT_MAU_DELETE,
            {
              data: {
                id: numbericId,
              },
            }
          );
          if (response.status === 200 && response.data?.code === 200) {
            // Xóa thành công từ DB, cập nhật state
            setSelectedHocPhans((prev) =>
              prev.filter((item) => item.id !== khht.id)
            );
            setSuccessMessage(
              "Đã xóa học phần khỏi kế hoạch học tập thành công!"
            );
            setShowSuccessModal(true);
          }
        }
      } catch (error) {
        console.error("Error deleting hoc phan:", error);
        setErrorMessage("Không thể xóa học phần. Vui lòng thử lại.");
        setShowErrorModal(true);
      } finally {
        setIsDeleting(false);
      }
    },
    [axiosPrivate]
  );

  // Hàm mở modal xác nhận xóa
  const handleDeleteClick = useCallback((hocPhan: KeHoachHocTapDetail) => {
    setHocPhanToDelete(hocPhan);
    setIsDeleteModalOpen(true);
  }, []);

  // Hàm xác nhận xóa
  const handleConfirmDelete = useCallback(() => {
    if (hocPhanToDelete && !isDeleting) {
      console.log("Deleting hoc phan:", hocPhanToDelete);
      fetchDeleteHocPhan(hocPhanToDelete);
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [hocPhanToDelete, isDeleting, fetchDeleteHocPhan]);

  // Hàm đóng modal
  const handleCloseDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [isDeleting]);
  // Hàm đóng modal thông báo lỗi
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

  // Chart custom tooltip
  const CreditChartTooltip = ({
    active,
    payload,
  }: TooltipProps<number, string>) => {
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

  // Table columns for semester details
  const semesterDetailColumns = useMemo<ColumnDef<KeHoachHocTapDetail>[]>(
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
        size: 140,
      },
      {
        id: "tenHp",
        accessorKey: "hocPhan.tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() as string}</div>
        ),
        size: 300,
      },
      {
        id: "soTinChi",
        accessorKey: "hocPhan.tinChi",
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
          const item = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleDeleteClick(item)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200 group"
                title="Xóa học phần"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          );
        },
        size: 120,
      },
    ],
    [handleDeleteClick]
  );

  // Available subjects table columns for main view
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
          const isAlreadyAdded = selectedHocPhans.some(
            (item) => item.hocPhan.maHp === hocPhan.maHp
          );
          const isInPending = pendingHocPhans.some(
            (item) => item.hocPhan.maHp === hocPhan.maHp
          );
          return (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  handleAddToPending(hocPhan);
                }}
                disabled={
                  isAlreadyAdded ||
                  isInPending ||
                  !currentFilterNamHoc ||
                  !currentFilterHocKy
                }
                className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  isAlreadyAdded
                    ? "Đã có trong kế hoạch"
                    : isInPending
                      ? "Đã thêm vào danh sách chờ"
                      : !currentFilterNamHoc || !currentFilterHocKy
                        ? activeTab === "all"
                          ? "Vui lòng chọn năm học và học kỳ"
                          : "Đang tải thông tin học kỳ"
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
    [
      selectedHocPhans,
      pendingHocPhans,
      currentFilterNamHoc,
      currentFilterHocKy,
      handleAddToPending,
      activeTab,
    ]
  );

  // Effects
  useEffect(() => {
    fetchDanhSachNganh();
    fetchDanhSachHocKy();
  }, [fetchDanhSachNganh, fetchDanhSachHocKy]);

  useEffect(() => {
    if (selectedNganh) {
      fetchKhoaHoc();
      if (!isEditMode && !isAddMode) {
        setSelectedKhoaHoc("");
      }
      // Reset when nganh changes
      setHasCheckedExistingPlan(false);
      setSelectedHocPhans([]);
    } else {
      setKhoaHocOptions([]);
      setSelectedKhoaHoc("");
      setHasCheckedExistingPlan(false);
      setSelectedHocPhans([]);
    }
  }, [selectedNganh, fetchKhoaHoc, isEditMode, isAddMode]);

  useEffect(() => {
    // Luôn gọi fetchChuongTrinhDaoTao khi thay đổi ngành hoặc khóa học
    if (selectedNganh && selectedKhoaHoc) {
      fetchChuongTrinhDaoTao();
    }
  }, [selectedNganh, selectedKhoaHoc, fetchChuongTrinhDaoTao]);

  useEffect(() => {
    const fetchExistingPlan = async () => {
      if ((isEditMode || isAddMode) && selectedNganh && selectedKhoaHoc) {
        try {
          const response = await axiosPrivate.get(
            KHHT_SERVICE.KHHT_MAU_BY_KHOAHOC_MA_NGANH,
            {
              params: {
                khoaHoc: selectedKhoaHoc,
                maNganh: selectedNganh,
              },
            }
          );
          if (response.data && Array.isArray(response.data.data)) {
            setSelectedHocPhans(
              response.data.data.map((item: any) => ({
                ...item,
                namHoc: item.hocKy?.namHoc?.id,
                hocKy: item.hocKy,
              }))
            );
          }
        } catch (err) {
          console.error("Lỗi khi tải kế hoạch học tập mẫu để chỉnh sửa", err);
        }
      }
    };
    fetchExistingPlan();
  }, [isEditMode, isAddMode, selectedNganh, selectedKhoaHoc, axiosPrivate]);

  // Auto-setup for add mode
  useEffect(() => {
    if (isAddMode && selectedNganh && selectedKhoaHoc) {
      setHasCheckedExistingPlan(true);
      fetchChuongTrinhDaoTao();
    }
  }, [isAddMode, selectedNganh, selectedKhoaHoc, fetchChuongTrinhDaoTao]);

  // If in step 1 (create mode), show the initial form
  if (
    !isEditMode &&
    !isAddMode &&
    (!selectedNganh || !selectedKhoaHoc || !hasCheckedExistingPlan)
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
        <PageHeader
          title="Tạo Kế hoạch Học tập Mẫu"
          description="Chọn ngành và khóa học để tạo kế hoạch học tập mẫu mới"
          icon={BookOpen}
          iconColor="from-emerald-500 to-teal-600"
          descriptionIcon={GraduationCap}
          backButton={
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          }
        />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngành
              </label>
              <select
                value={selectedNganh}
                onChange={(e) => {
                  setSelectedNganh(e.target.value);
                  // Reset states when changing nganh
                  setHasCheckedExistingPlan(false);
                  setSelectedHocPhans([]);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Chọn ngành</option>
                {danhSachNganh.map((nganh) => (
                  <option key={nganh.maNganh} value={nganh.maNganh}>
                    {nganh.tenNganh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn khóa học
              </label>
              <select
                value={selectedKhoaHoc}
                onChange={(e) => {
                  setSelectedKhoaHoc(e.target.value);
                  // Reset states when changing khoa hoc
                  setHasCheckedExistingPlan(false);
                  setSelectedHocPhans([]);
                }}
                disabled={!selectedNganh}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Chọn khóa học</option>
                {khoaHocOptions.map((khoaHoc) => (
                  <option key={khoaHoc} value={khoaHoc}>
                    {khoaHoc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                if (selectedNganh && selectedKhoaHoc) {
                  // Check if plan already exists
                  const planExists = await checkExistingPlan();
                  if (!planExists) {
                    // Initialize with empty plan if no existing plan
                    setSelectedHocPhans([]);
                    fetchChuongTrinhDaoTao();
                  }
                  // If plan exists, data is already loaded by checkExistingPlan
                }
              }}
              disabled={
                !selectedNganh || !selectedKhoaHoc || checkingExistingPlan
              }
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingExistingPlan ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tiếp tục
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main interface (step 2 - add subjects)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      <PageHeader
        title={
          isEditMode
            ? "Chỉnh sửa Kế hoạch Học tập Mẫu"
            : selectedHocPhans.length > 0
              ? "Chỉnh sửa Kế hoạch Học tập Mẫu"
              : "Nhập Học phần - Kế hoạch Học tập Mẫu"
        }
        description={
          isEditMode
            ? "Chỉnh sửa kế hoạch học tập mẫu cho chương trình đào tạo"
            : selectedHocPhans.length > 0
              ? "Kế hoạch học tập mẫu đã tồn tại - Chỉnh sửa theo nhu cầu"
              : "Thêm các học phần vào kế hoạch học tập mẫu theo từng học kỳ"
        }
        icon={BookOpen}
        iconColor="from-emerald-500 to-teal-600"
        descriptionIcon={GraduationCap}
        backButton={
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
      />

      {/* Credit Statistics Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">
            Thống kê tín chỉ theo học kỳ
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
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Chưa có dữ liệu biểu đồ</p>
                  <p className="text-sm">Thêm học phần để xem thống kê</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {creditStatistics.length > 0
            ? "Nhấn vào cột để xem chi tiết học kỳ"
            : "Biểu đồ sẽ hiển thị khi có học phần được thêm vào"}
        </p>
      </div>

      {/* Tab Navigation */}
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
                Tất cả ({selectedHocPhans.length})
              </button>

              {/* Academic year buttons */}
              {availableNamHoc.map((namHoc) => (
                <button
                  key={namHoc.id}
                  onClick={() => handleNamHocTabClick(namHoc.id)}
                  className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedTabNamHoc === namHoc.id
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {namHoc.tenNh}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Semester Level Navigation - Only show when academic year is selected */}
        {selectedTabNamHoc && availableHocKy.length > 0 && (
          <div className="border-b border-gray-100 bg-gray-50">
            <nav className="flex items-center px-6 py-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500 mr-4">
                <span>Học kỳ:</span>
              </div>
              <div className="flex space-x-3 overflow-x-auto">
                {availableHocKy.map((hocKy) => (
                  <button
                    key={hocKy.id}
                    onClick={() => handleHocKyTabClick(hocKy.id)}
                    className={`whitespace-nowrap py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                      activeTab === `semester-${hocKy.id}`
                        ? "bg-green-100 text-green-700 border border-green-300 shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {hocKy.ten}
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
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Tất cả học phần đã thêm
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleAddHocPhanClick()}
                      className="flex items-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm học phần
                    </button>
                  </div>
                </div>
              </div>
              {selectedHocPhans.length > 0 ? (
                <div>
                  <GroupedTable
                    name="Tất cả học phần"
                    data={selectedHocPhans}
                    columns={semesterDetailColumns}
                    groupByKey="hocKy.tenHocKy"
                    groupDisplayName={(groupKey) =>
                      groupKey || "Chưa xác định học kỳ"
                    }
                    groupColorScheme={(groupKey) => {
                      // Phân màu theo học kỳ
                      if (groupKey.includes("1")) return "blue";
                      if (groupKey.includes("2")) return "green";
                      if (groupKey.includes("3")) return "orange";
                      return "purple";
                    }}
                    initialExpanded={true}
                    enablePagination={true}
                    pageSize={7}
                    emptyStateTitle="Chưa có học phần nào"
                    emptyStateDescription="Nhấn 'Thêm học phần' để bắt đầu"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Chưa có học phần nào</p>
                  <p className="text-sm">Nhấn "Thêm học phần" để bắt đầu</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Học phần của
                  {
                    creditStatistics.find(
                      (s) => s.hocKyId === selectedHocKyChart
                    )?.tenHocKy
                  }
                </h4>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAddHocPhanClick()}
                    className="flex items-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm học phần
                  </button>
                </div>
              </div>

              {selectedSemesterData.length > 0 ? (
                <GroupedTable
                  name="Học phần theo học kỳ"
                  data={selectedSemesterData}
                  columns={semesterDetailColumns}
                  groupByKey="hocPhan.loaiHp"
                  groupDisplayName={(groupKey) =>
                    `Học phần ${groupKey || "Khác"}`
                  }
                  groupColorScheme={(groupKey) => {
                    // Phân màu theo loại học phần
                    if (groupKey?.includes("Đại cương")) return "purple";
                    if (groupKey?.includes("Cơ sở ngành")) return "blue";
                    if (groupKey?.includes("Chuyên ngành")) return "orange";
                    if (groupKey?.includes("Anh văn")) return "green";
                    return "gray";
                  }}
                  initialExpanded={true}
                  enablePagination={true}
                  pageSize={7}
                  emptyStateTitle="Chưa có học phần nào trong học kỳ này"
                  emptyStateDescription="Thêm học phần đầu tiên cho học kỳ này"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Chưa có học phần nào trong học kỳ này
                  </p>
                  <button
                    onClick={() => handleAddHocPhanClick()}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm học phần đầu tiên
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Fixed Floating Button for Pending Subjects */}
      {pendingHocPhans.length > 0 && (
        <div className="fixed right-6 bottom-1.5 transform -translate-y-1/2 z-40">
          <button
            onClick={() => setShowAvailableSubjectsModal(true)}
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

      {/* Combined Modal with Tabs */}
      {showAvailableSubjectsModal && <AvailableSubjectsModal />}

      {/* Remove separate AddSubjectModal rendering */}
      {/* {showAddModal && <AddSubjectModal />} */}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteModal}
        title="Xác nhận xóa học phần"
        message={`Bạn có chắc chắn muốn xóa học phần "${hocPhanToDelete?.hocPhan?.tenHp}" không? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
      />

      {/* Error and Success Modals */}
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

  // Available Subjects Modal Component
  function AvailableSubjectsModal() {
    const [activeTab, setActiveTab] = useState<"available" | "add">("available");

    // Tab button classes
    const tabButtonClass = (tab: "available" | "add") =>
      `px-4 py-2 font-semibold text-sm rounded-t-lg cursor-pointer ${
        activeTab === tab
          ? "bg-white border-t border-x border-gray-300 text-gray-900"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col">
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
                Học phần chuẩn bị thêm
              </button>
            </div>
            <button
              onClick={() => setShowAvailableSubjectsModal(false)}
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
                {!selectedFilterNamHoc || !selectedFilterHocKy ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Chọn năm học và học kỳ</p>
                    <p className="text-sm">
                      Vui lòng chọn năm học và học kỳ để xem danh sách học phần có
                      thể thêm
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500">Đang tải...</p>
                    </div>
                  </div>
                ) : filteredAvailableHocPhans.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Không có học phần</p>
                  </div>
                ) : (
                  <GroupedTable
                    name="Học phần có thể thêm"
                    data={filteredAvailableHocPhans}
                    columns={availableColumnsForMain}
                    groupByKey="loaiHp"
                    groupDisplayName={(groupKey) =>
                      `Học phần ${groupKey || "Khác"}`
                    }
                    groupColorScheme={(groupKey) => {
                      if (
                        groupKey?.includes("Đại cương") ||
                        groupKey?.includes("Anh văn") ||
                        groupKey?.includes("Chính trị")
                      )
                        return "purple";
                      if (groupKey?.includes("Cơ sở ngành")) return "blue";
                      if (groupKey?.includes("Chuyên ngành")) return "orange";
                      if (groupKey?.includes("Thể chất")) return "green";
                      return "gray";
                    }}
                    initialExpanded={true}
                    enablePagination={true}
                    pageSize={10}
                    emptyStateTitle="Không có học phần"
                    emptyStateDescription={"Tất cả học phần đã được thêm"}
                    emptyStateIcon={BookOpen}
                  />
                )}
              </>
            ) : (
              <>
                {/* AddSubjectModal content moved here */}
                {/* Pending subjects table columns - moved outside conditional */}
                {(() => {
                  const pendingColumns = [
                    {
                      id: "stt",
                      header: "STT",
                      cell: ({ row }: any) => (
                        <div className="text-center">{row.index + 1}</div>
                      ),
                      size: 80,
                    },
                    {
                      id: "maHp",
                      accessorKey: "hocPhan.maHp",
                      header: "Mã học phần",
                      cell: ({ getValue }: any) => {
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
                      cell: ({ getValue }: any) => (
                        <div className="text-left">{getValue() as string}</div>
                      ),
                      size: 200,
                    },
                    {
                      id: "soTinChi",
                      accessorKey: "hocPhan.tinChi",
                      header: "Tín chỉ",
                      cell: ({ getValue }: any) => (
                        <div className="text-center">{getValue() as number}</div>
                      ),
                      size: 80,
                    },
                    {
                      id: "namHoc",
                      header: "Năm học",
                      cell: ({ row }: any) => {
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
                      size: 120,
                    },
                    {
                      id: "hocKy",
                      header: "Học kỳ",
                      cell: ({ row }: any) => {
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
                      size: 100,
                    },
                    {
                      id: "actions",
                      header: "Thao tác",
                      cell: ({ row }: any) => {
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
                  ];

                  // Check if we need to show the form first
                  const needsForm = !formNamHoc || !formHocKy;

                  if (needsForm && showAddSubjectForm) {
                    return (
                      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                          {/* Form Header */}
                          <div className="flex items-center justify-between px-6 border-b border-gray-200">
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
                                setShowAvailableSubjectsModal(false);
                                setShowAddSubjectForm(false);
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
                                    setFormHocKy(null); // Reset học kỳ khi thay đổi năm học
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
                                    {!formNamHoc ? "Chọn năm học trước" : "Chọn học kỳ"}
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
                                setShowAvailableSubjectsModal(false);
                                setShowAddSubjectForm(false);
                              }}
                              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => {
                                if (formNamHoc && formHocKy) {
                                  setShowAddSubjectForm(false);
                                  // Modal will now show the pending subjects interface
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
                    );
                  }

                  return (
                    <>
                      {pendingHocPhans.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Chưa có học phần nào</p>
                            <p className="text-sm">
                              Học phần được thêm từ bảng "Học phần có thể thêm" ở phía
                              dưới sẽ hiển thị ở đây
                            </p>
                            <button
                              onClick={() => {
                                setShowAvailableSubjectsModal(false);
                                setShowAddSubjectForm(false);
                              }}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Đóng và chọn học phần
                            </button>
                          </div>
                        </div>
                      ) : (
                        <GroupedTable
                          name="Danh sách chuẩn bị thêm"
                          data={pendingHocPhans}
                          columns={pendingColumns}
                          groupByKey="hocKy.tenHocKy"
                          groupDisplayName={(groupKey) =>
                            groupKey || "Chưa chọn học kỳ"
                          }
                          groupColorScheme={(groupKey) => {
                            if (groupKey.includes("1")) return "blue";
                            if (groupKey.includes("2")) return "green";
                            if (groupKey.includes("3")) return "orange";
                            return "purple";
                          }}
                          initialExpanded={true}
                          enablePagination={true}
                          pageSize={5}
                          emptyStateTitle="Chưa có học phần nào"
                          emptyStateDescription="Học phần được thêm từ bảng sẽ hiển thị ở đây"
                        />
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
          {/* Modal Footer */}
          { activeTab === "add" && (
            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAvailableSubjectsModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => handleSavePending()}
                className="ml-2 px-4 py-2 text-gray-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                Lưu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default ThemKeHoachHocTapMau;