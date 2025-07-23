import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Plus,
  BarChart3,
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
  Cell,
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
import AvailableSubjectsModal from "../../components/modals/AvailableSubjectsModal";

// Interface cho thống kê tín chỉ
interface CreditStatData {
  tenHocKy: string;
  soTinChi: number;
  soTinChiConLai: number;
  hocKyId: number;
  namHocId: number;
  namHoc: string;
  hasCourses: boolean;
}



const ThemKeHoachHocTapMau = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  const isEditMode = Boolean(
    params.maNganh && params.khoaHoc && location.pathname.includes("/edit/")
  );
  const isAddMode = Boolean(
    params.maNganh && params.khoaHoc && location.pathname.includes("/add/")
  );
  const initialMaNganh = params.maNganh || "";
  const initialKhoaHoc = params.khoaHoc || "";

  // States
  const [checkingExistingPlan, setCheckingExistingPlan] = useState(false);
  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);
  const [selectedNganh, setSelectedNganh] = useState<string>(initialMaNganh);
  const [selectedKhoaHoc, setSelectedKhoaHoc] =
    useState<string>(initialKhoaHoc);
  const [selectedHocPhans, setSelectedHocPhans] = useState<
    KeHoachHocTapDetail[]
  >([]);
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
  const [pendingHocPhans, setPendingHocPhans] = useState<KeHoachHocTapDetail[]>(
    []
  );
  const [hasCheckedExistingPlan, setHasCheckedExistingPlan] = useState(false);
  const [selectedFilterNamHoc, setSelectedFilterNamHoc] = useState<
    number | null
  >(null);
  const [selectedFilterHocKy, setSelectedFilterHocKy] = useState<number | null>(
    null
  );
  const [showAvailableSubjectsModal, setShowAvailableSubjectsModal] =
    useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hocPhanToDelete, setHocPhanToDelete] =
    useState<KeHoachHocTapDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const maKhoa = auth.user?.maKhoa || "";
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

  const availableHocKy = useMemo(() => {
    if (!selectedTabNamHoc) return [];
    return danhSachHocKy
      .filter(
        (item) =>
          item.namHoc?.id === selectedTabNamHoc &&
          (!hocKyHienTai || item.maHocKy <= hocKyHienTai.maHocKy)
      )
      .map((item) => ({
        id: item.maHocKy,
        ten: item.tenHocKy,
        namHoc: item.namHoc,
      }))
      .sort((a, b) => a.id - b.id);
  }, [danhSachHocKy, selectedTabNamHoc, hocKyHienTai]);

  const MAX_CREDITS_PER_SEMESTER = 20;

  const creditStatistics = useMemo(() => {
    const statsMap = new Map<string, CreditStatData>();
    selectedHocPhans.forEach((item) => {
      if (item.hocKy) {
        const key = `${item.hocKy.maHocKy}`;
        const existing = statsMap.get(key) || {
          tenHocKy: item.hocKy.tenHocKy,
          soTinChi: 0,
          soTinChiConLai: MAX_CREDITS_PER_SEMESTER,
          hocKyId: item.hocKy.maHocKy,
          namHocId: item.hocKy.namHoc?.id || 0,
          namHoc: `${item.hocKy.namHoc?.namBatDau}-${item.hocKy.namHoc?.namKetThuc}`,
          hasCourses: false,
        };
        existing.soTinChi += item.hocPhan.tinChi;
        existing.soTinChiConLai = Math.max(
          0,
          MAX_CREDITS_PER_SEMESTER - existing.soTinChi
        );
        existing.hasCourses = true;
        statsMap.set(key, existing);
      }
    });
    danhSachHocKy.forEach((hk) => {
      if (hocKyHienTai && hk.maHocKy <= hocKyHienTai.maHocKy) {
        const key = `${hk.maHocKy}`;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            tenHocKy: hk.tenHocKy,
            soTinChi: 0,
            soTinChiConLai: MAX_CREDITS_PER_SEMESTER,
            hocKyId: hk.maHocKy,
            namHocId: hk.namHoc?.id || 0,
            namHoc: `${hk.namHoc?.namBatDau}-${hk.namHoc?.namKetThuc}`,
            hasCourses: false,
          });
        }
      }
    });
    return Array.from(statsMap.values()).sort((a, b) => {
      if (a.namHocId !== b.namHocId) {
        return a.namHocId - b.namHocId;
      }
      return a.hocKyId - b.hocKyId;
    });
  }, [selectedHocPhans, danhSachHocKy, hocKyHienTai]);

  const selectedSemesterData = useMemo(() => {
    if (!selectedHocKyChart) return [];
    return selectedHocPhans.filter(
      (item) => item.hocKy?.maHocKy === selectedHocKyChart
    );
  }, [selectedHocPhans, selectedHocKyChart]);

  // const currentFilterNamHoc = useMemo(() => {
  //   if (activeTab.startsWith("semester-")) {
  //     const hocKyId = parseInt(activeTab.replace("semester-", ""));
  //     const selectedHocKy = danhSachHocKy.find((hk) => hk.maHocKy === hocKyId);
  //     return selectedHocKy?.namHoc?.id || null;
  //   }
  //   return selectedFilterNamHoc;
  // }, [activeTab, danhSachHocKy, selectedFilterNamHoc]);

  // const currentFilterHocKy = useMemo(() => {
  //   if (activeTab.startsWith("semester-")) {
  //     return parseInt(activeTab.replace("semester-", ""));
  //   }
  //   return selectedFilterHocKy;
  // }, [activeTab, selectedFilterHocKy]);

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
        setSelectedHocPhans(
          response.data.data.map((item: any) => ({
            ...item,
            namHoc: item.hocKy?.namHoc?.id,
            hocKy: item.hocKy,
          }))
        );
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
  }, [selectedNganh, selectedKhoaHoc, axiosPrivate]);

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
    }
  };

  const handleNamHocTabClick = (namHocId: number) => {
    if (selectedTabNamHoc === namHocId) {
      setSelectedTabNamHoc(null);
      setActiveTab("all");
    } else {
      setSelectedTabNamHoc(namHocId);
      setSelectedFilterNamHoc(namHocId);
      setActiveTab("all");
    }
    setSelectedHocKyChart(null);
  };

  const handleHocKyTabClick = (hocKyId: number) => {
    setSelectedHocKyChart(hocKyId);
    setSelectedFilterHocKy(hocKyId);
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
    setShowAvailableSubjectsModal(true);
  };

  const fetchDeleteHocPhan = useCallback(
    async (khht: KeHoachHocTapDetail) => {
      try {
        setIsDeleting(true);
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

  const handleDeleteClick = useCallback((hocPhan: KeHoachHocTapDetail) => {
    setHocPhanToDelete(hocPhan);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (hocPhanToDelete && !isDeleting) {
      fetchDeleteHocPhan(hocPhanToDelete);
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

  const CreditChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CreditStatData;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.tenHocKy}</p>
          <p className="text-blue-600">
            Tín chỉ đã nhập: <span className="font-bold">{data.soTinChi}</span>
          </p>
          <p className="text-gray-600">
            Tín chỉ có thể nhập: <span className="font-bold">{data.soTinChiConLai}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">Nhấn để xem chi tiết</p>
        </div>
      );
    }
    return null;
  };

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
              {maHp}
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
    if (selectedNganh && selectedKhoaHoc) {
      // No need to fetch chuong trinh dao tao here, modal handles it
    }
  }, [selectedNganh, selectedKhoaHoc]);

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

  useEffect(() => {
    if (isAddMode && selectedNganh && selectedKhoaHoc) {
      setHasCheckedExistingPlan(true);
      // No need to fetch chuong trinh dao tao here, modal handles it
    }
  }, [isAddMode, selectedNganh, selectedKhoaHoc]);

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
                  const planExists = await checkExistingPlan();
                  if (!planExists) {
                    setSelectedHocPhans([]);
                    // No need to fetch chuong trinh dao tao here, modal handles it
                  }
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
                  domain={[0, MAX_CREDITS_PER_SEMESTER]}
                />
                <Tooltip content={<CreditChartTooltip />} />
                <Bar
                  dataKey="soTinChi"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {creditStatistics.map((entry, index) => (
                    <Cell
                      key={`cell-soTinChi-${index}`}
                      fill={entry.hasCourses ? "#3b82f6" : "#9ca3af"}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="soTinChiConLai"
                  stackId="a"
                  fill="#d1d5db"
                  radius={[0, 0, 0, 0]}
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
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
                      onClick={handleAddHocPhanClick}
                      className="flex items-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm học phần
                    </button>
                  </div>
                </div>
              </div>
              {selectedHocPhans.length > 0 ? (
                <GroupedTable
                  name="Tất cả học phần"
                  data={selectedHocPhans}
                  columns={semesterDetailColumns}
                  groupByKey="hocKy.tenHocKy"
                  groupDisplayName={(groupKey) =>
                    groupKey || "Chưa xác định học kỳ"
                  }
                  groupColorScheme={(groupKey) => {
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
                    onClick={handleAddHocPhanClick}
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
                  groupDisplayName={(groupKey) => `Học phần ${groupKey || "Khác"}`}
                  groupColorScheme={(groupKey) => {
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
                    onClick={handleAddHocPhanClick}
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
      {showAvailableSubjectsModal && (
        <AvailableSubjectsModal
          isOpen={showAvailableSubjectsModal}
          onClose={() => setShowAvailableSubjectsModal(false)}
          pendingHocPhans={pendingHocPhans}
          setPendingHocPhans={setPendingHocPhans}
          selectedNganh={selectedNganh}
          selectedKhoaHoc={selectedKhoaHoc}
          currentFilterNamHoc={selectedFilterNamHoc}
          currentFilterHocKy={selectedFilterHocKy}
          onSaveSuccess={checkExistingPlan} // Re-fetch selectedHocPhans after save
        />
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteModal}
        title="Xác nhận xóa học phần"
        message={`Bạn có chắc chắn muốn xóa học phần "${hocPhanToDelete?.hocPhan?.tenHp}" không? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
      />
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
export default ThemKeHoachHocTapMau;