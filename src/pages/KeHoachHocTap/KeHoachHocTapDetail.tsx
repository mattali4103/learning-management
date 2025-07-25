import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
  Cell,
} from "recharts";
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  AlertCircle,
  Plus,
  Calendar,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import type { HocKy } from "../../types/HocKy";
import type { HocPhanTuChon } from "../../types/HocPhanTuChon";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE, HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import DeleteModal from "../../components/modals/DeleteModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import { AllCoursesCollapsibleTable } from "../../components/table/AllCoursesCollapsibleTable";
import type { HocPhan } from "../../types/HocPhan";
import ThemKHHTModal from "../../components/modals/ThemKHHTModal";

interface CreditStatData {
  tenHocKy: string;
  soTinChi: number;
  soTinChiConLai: number;
  hocKyId: number;
  namHocId: number;
  namHoc: string;
  hasCourses: boolean;
}
export interface KeHoachHocTapDetail {
  id: string;
  hocPhan: HocPhan;
  hocKy: HocKy | null;
  namHoc?: number;
  hocPhanCaiThien: boolean;
}

const KeHoachHocTapDetail = () => {
  const { auth } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { maSo: authMaSo, khoaHoc, maNganh } = auth.user || {};
  const maSo = params.maSo || authMaSo;
  const axiosPrivate = useAxiosPrivate();
  // States
  const tableRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allData, setAllData] = useState<KeHoachHocTap[]>([]);
  const [danhSachHocKy, setDanhSachHocKy] = useState<HocKy[]>([]);
  const [pendingHocPhans, setPendingHocPhans] = useState<
    KeHoachHocTapDetail[]
  >([]);
  const [nhomHocPhanTuChon, setNhomHocPhanTuChon] = useState<HocPhanTuChon[]>(
    []
  );

  // UI States
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTabNamHoc, setSelectedTabNamHoc] = useState<number | null>(
    null
  );
  const [selectedHocKyChart, setSelectedHocKyChart] = useState<number | null>(
    null
  );
  const [selectedFilterNamHoc, setSelectedFilterNamHoc] = useState<
    number | null
  >(null);
  const [selectedFilterHocKy, setSelectedFilterHocKy] = useState<number | null>(
    null
  );
  const [selectedHocPhans, setSelectedHocPhans] = useState<
    KeHoachHocTap[]
  >([]);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hocPhanToDelete, setHocPhanToDelete] = useState<KeHoachHocTap | null>(
    null
  );
  const [initialModalTab, setInitialModalTab] = useState<"available" | "add">(
    "available"
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
 
  const [showAvailableSubjectsModal, setShowAvailableSubjectsModal] =
    useState(false);
  const MAX_CREDITS_PER_SEMESTER = 20;

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

  const hocKyHienTai: HocKy | null = useMemo(() => {
    const storedHocKy = localStorage.getItem("hocKyHienTai");
    return storedHocKy ? JSON.parse(storedHocKy) : null;
  }, []);

  const minHocKyInKHHT = useMemo(() => {
    if (allData.length === 0) return null;
    return Math.min(...allData.map(item => item.maHocKy));
  }, [allData]);
  
  // Available academic years for navigation
  const availableNamHoc = useMemo(() => {
    const years = new Map<number, { id: number; tenNh: string }>();
    danhSachHocKy.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        // Chỉ lấy năm học có học kỳ <= hocKyHienTai?.maHocKy và >= minHocKyInKHHT
        if (
          hocKyHienTai &&
          hk.maHocKy <= hocKyHienTai.maHocKy &&
          (!minHocKyInKHHT || hk.maHocKy >= minHocKyInKHHT)
        ) {
          years.set(hk.namHoc.id, {
            id: hk.namHoc.id,
            tenNh: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`,
          });
        }
      }
    });
    return Array.from(years.values()).sort((a, b) => a.id - b.id);
  }, [danhSachHocKy, hocKyHienTai, minHocKyInKHHT]);

  // Available semesters for selected academic year
  const availableHocKy = useMemo(() => {
    if (!selectedTabNamHoc) return [];
    return danhSachHocKy
      .filter(
        (item) =>
          item.namHoc?.id === selectedTabNamHoc &&
          (!hocKyHienTai || item.maHocKy <= hocKyHienTai.maHocKy) &&
          (!minHocKyInKHHT || item.maHocKy >= minHocKyInKHHT)
      )
      .map((item) => ({
        id: item.maHocKy,
        ten: item.tenHocKy,
        namHoc: item.namHoc,
      }))
      .sort((a, b) => a.id - b.id);
  }, [danhSachHocKy, selectedTabNamHoc, hocKyHienTai, minHocKyInKHHT]);

  // Credit statistics for chart
  const creditStatistics = useMemo(() => {
    const statsMap = new Map<string, CreditStatData>();
    
    // First, populate with semesters that have courses from allData
    selectedHocPhans.forEach((item) => {
      if (item.maHocKy) {
        const key = `${item.maHocKy}`;
        const existing = statsMap.get(key) || {
          tenHocKy: item.tenHocKy,
          soTinChi: 0,
          soTinChiConLai: MAX_CREDITS_PER_SEMESTER,
          hocKyId: item.maHocKy,
          namHocId: item.namHocId || 0,
          namHoc: item.namBdNamKt,
          hasCourses: false,
        };
        existing.soTinChi += item.tinChi;
        existing.soTinChiConLai = Math.max(
          0,
          MAX_CREDITS_PER_SEMESTER - existing.soTinChi
        );
        existing.hasCourses = true;
        statsMap.set(key, existing);
      }
    });

    // Then, add all other relevant semesters
    danhSachHocKy.forEach((hk) => {
      if (
        hocKyHienTai &&
        hk.maHocKy <= hocKyHienTai.maHocKy &&
        (!minHocKyInKHHT || hk.maHocKy >= minHocKyInKHHT)
      ) {
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
  }, [selectedHocPhans, danhSachHocKy, hocKyHienTai, minHocKyInKHHT]);

  const handleChartBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload as CreditStatData;
      setSelectedHocKyChart(clickedData.hocKyId);
      setSelectedFilterNamHoc(clickedData.namHocId);
      setSelectedFilterHocKy(clickedData.hocKyId);
      setSelectedTabNamHoc(clickedData.namHocId);
      setActiveTab(`semester-${clickedData.hocKyId}`);
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    setInitialModalTab("available");
    setShowAvailableSubjectsModal(true);
  };

  const fetchDeleteHocPhan = useCallback(
    async (khht: KeHoachHocTap) => {
      try {
        setIsDeleting(true);
        const numbericId = khht.id;
        if (!isNaN(numbericId)) {
          const response = await axiosPrivate.delete(
            KHHT_SERVICE.DELETE.replace(":id", numbericId.toString()),
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
        //Re-Fetch all data to ensure UI is updated
        fetchAllData();
        setIsDeleting(false);
      }
    },
    [axiosPrivate]
  );

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
            Tín chỉ đã nhập: <span className="font-bold">{data.soTinChi}</span>
          </p>
          <p className="text-gray-600">
            Tín chỉ có thể nhập:{" "}
            <span className="font-bold">{data.soTinChiConLai}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">Nhấn để xem chi tiết</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchDanhSachHocKy();
  }, [fetchDanhSachHocKy]);

  // Selected semester data for table
  const selectedSemesterData = useMemo(() => {
    if (!selectedHocKyChart) return [];
    return allData.filter((item) => item.maHocKy === selectedHocKyChart);
  }, [allData, selectedHocKyChart]);
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(
        KHHT_SERVICE.KHHT_DETAIL.replace(":maSo", maSo || "")
      );
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
      setSelectedHocPhans(processedData);
      setAllData(processedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maSo]);

  const fetchNhomHocPhanTuChon = useCallback(async () => {
    if (!khoaHoc || !maNganh) return;
    try {
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_HOC_PHAN_TU_CHON_LIST,
        {
          params: {
            khoaHoc: khoaHoc,
            maNganh: maNganh,
          },
        }
      );
      if (response.data.code === 200 && response.data.data) {
        const uniqueNhomHocPhanTuChon = (response.data.data || []).map(
          (nhom: HocPhanTuChon) => ({
            ...nhom,
            hocPhanTuChonList: nhom.hocPhanTuChonList.filter(
              (hocPhan, index, self) =>
                self.findIndex((hp) => hp.maHp === hocPhan.maHp) === index
            ),
          })
        );
        setNhomHocPhanTuChon(uniqueNhomHocPhanTuChon);
      }
    } catch (err) {
      console.error("Error fetching NhomHocPhanTuChon:", err);
    }
  }, [axiosPrivate, khoaHoc, maNganh]);

  useEffect(() => {
    if (maSo && khoaHoc && maNganh) {
      fetchAllData();
      fetchNhomHocPhanTuChon();
    }
  }, [
    maSo,
    khoaHoc,
    maNganh,
    fetchAllData,
    fetchNhomHocPhanTuChon,
  ]);

  // Read filters from URL on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const namHocId = searchParams.get("namHocId");
    const hocKyId = searchParams.get("hocKyId");

    if (namHocId) {
      const namHocIdNum = parseInt(namHocId, 10);
      setSelectedTabNamHoc(namHocIdNum);
      setSelectedFilterNamHoc(namHocIdNum);
      if (hocKyId) {
        const hocKyIdNum = parseInt(hocKyId, 10);
        setActiveTab(`semester-${hocKyIdNum}`);
        setSelectedHocKyChart(hocKyIdNum);
        setSelectedFilterHocKy(hocKyIdNum);
      } else {
        setActiveTab("all");
      }
    }
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (selectedTabNamHoc) {
      searchParams.set("namHocId", selectedTabNamHoc.toString());
    }
    if (activeTab.startsWith("semester-")) {
      const hocKyId = activeTab.replace("semester-", "");
      searchParams.set("hocKyId", hocKyId);
    }
    navigate({ search: searchParams.toString() }, { replace: true });
  }, [selectedTabNamHoc, activeTab, navigate]);

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
                  {namHoc.tenNh} (
                  {
                    allData.filter(
                      (item) =>
                        item.namHocId === namHoc.id &&
                        (!hocKyHienTai || item.maHocKy <= hocKyHienTai.maHocKy)
                    ).length
                  }
                  )
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Semester Level Navigation */}
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
        <div className="p-6" ref={tableRef}>
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
                <AllCoursesCollapsibleTable
                  activeTab={activeTab}
                  name={
                    activeTab === "all"
                      ? "Tất cả học phần"
                      : `${availableHocKy.find((s) => s.id === selectedHocKyChart)?.ten}`
                  }
                  allData={selectedHocPhans}
                  nhomHocPhanTuChon={nhomHocPhanTuChon}
                  loading={loading}
                  emptyStateTitle="Chưa có học phần nào"
                  emptyStateDescription="Nhấn 'Thêm học phần' để bắt đầu"
                  onDelete={(maHp: string) => {
                    const hocPhan = selectedHocPhans.find(
                      (item) => item.maHp === maHp
                    );
                    if (hocPhan) {
                      setHocPhanToDelete(hocPhan);
                      setIsDeleteModalOpen(true);
                    }
                  }}
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
                  Kế hoạch học tập{" "}
                  {
                    creditStatistics.find(
                      (s) => s.hocKyId === selectedHocKyChart
                    )?.tenHocKy
                  }
                  -{" "}
                  {
                    creditStatistics.find(
                      (s) => s.hocKyId === selectedHocKyChart
                    )?.namHoc
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
                <AllCoursesCollapsibleTable
                  activeTab={activeTab}
                  name="Học phần theo học kỳ"
                  allData={selectedSemesterData.map((item, idx) => ({
                    id: idx + 1, // fake id for table
                    maHp: item.maHp,
                    tenHp: item.tenHp,
                    tinChi: item.tinChi,
                    hocPhanTienQuyet: item.hocPhanTienQuyet,
                    loaiHp: item.loaiHp,
                    maHocKy: item.maHocKy || 0,
                    tenHocKy: item.tenHocKy || "",
                    namHocId: item.namHocId || 0,
                    namBdNamKt: item.namBdNamKt || "",
                  }))}
                  nhomHocPhanTuChon={nhomHocPhanTuChon}
                  loading={loading}
                  emptyStateTitle="Chưa có học phần nào trong học kỳ này"
                  emptyStateDescription="Thêm học phần đầu tiên cho học kỳ này"
                  onDelete={(maHp: string) => {
                    const hocPhan = selectedHocPhans.find(
                      (item) => item.maHp === maHp
                    );
                    if (hocPhan) {
                      setHocPhanToDelete(hocPhan);
                      setIsDeleteModalOpen(true);
                    }
                  }}
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
           {/* Fixed Floating Button for Pending Subjects */}
      {pendingHocPhans.length > 0 && (
        <div
          className="fixed right-6 bottom-1.5 transform -translate-y-1/2 z-40"
          id="floating-button"
        >
          <button
            onClick={() => {
              setInitialModalTab("add");
              setShowAvailableSubjectsModal(true);
            }}
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
        <ThemKHHTModal
          isOpen={showAvailableSubjectsModal}
          currentHocPhans={selectedHocPhans.map((item) => {
            return {
              id: String(item.id),
              hocPhan: {
                maHp: item.maHp,
                tenHp: item.tenHp,
                tinChi: item.tinChi,
                hocPhanTienQuyet: item.hocPhanTienQuyet,
                loaiHp: item.loaiHp,
              },
              hocKy: {
                maHocKy: item.maHocKy || 0,
                tenHocKy: item.tenHocKy || "",
              },
              namHoc: item.namHocId,
              hocPhanCaiThien: false
            } as KeHoachHocTapDetail;
          })}
          onClose={() => setShowAvailableSubjectsModal(false)}
          initialTab={initialModalTab}
          pendingHocPhans={pendingHocPhans}
          setPendingHocPhans={setPendingHocPhans}
          selectedNganh={maNganh ?? ""}
          selectedKhoaHoc={khoaHoc ?? ""}
          currentFilterNamHoc={selectedFilterNamHoc}
          currentFilterHocKy={selectedFilterHocKy}
          onSaveSuccess={
            () => {
              setShowSuccessModal(true);
              setSuccessMessage("Đã thêm học phần thành công!");
            }
          }
        />
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
