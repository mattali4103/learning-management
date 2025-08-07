import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  type TooltipProps,
} from "recharts";
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  AlertCircle,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import type { HocKy } from "../../types/HocKy";
import type { HocPhanTuChon } from "../../types/HocPhanTuChon";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  KHHT_SERVICE,
  HOCPHAN_SERVICE,
  PROFILE_SERVICE,
} from "../../api/apiEndPoints";
import { AllCoursesCollapsibleTable } from "../../components/table/AllCoursesCollapsibleTable";
import type { PreviewProfile } from "../../types/PreviewProfile";

interface CreditStatData {
  tenHocKy: string;
  soTinChi: number;
  soTinChiConLai: number;
  hocKyId: number;
  namHocId: number;
  namHoc: string;
  hasCourses: boolean;
}

const KeHoachHocTapView = () => {
  const { auth } = useAuth();
  const params = useParams();
  const { maSo: authMaSo } = auth.user || {};
  const maSo = params.maSo || authMaSo;
  const axiosPrivate = useAxiosPrivate();

  const [studentInfo, setStudentInfo] = useState<PreviewProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allData, setAllData] = useState<KeHoachHocTap[]>([]);
  const [danhSachHocKy, setDanhSachHocKy] = useState<HocKy[]>([]);
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

  const MAX_CREDITS_PER_SEMESTER = 20;

  // Event handlers
  const handleChartBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload as CreditStatData;
      setSelectedHocKyChart(clickedData.hocKyId);
      setActiveTab(`semester-${clickedData.hocKyId}`);
    }
  };

  const hocKyHienTai: HocKy = useMemo(() => {
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

  const handleAllTabClick = () => {
    setActiveTab("all");
    setSelectedTabNamHoc(null);
    setSelectedHocKyChart(null);
  };


  // Available semesters for selected academic year
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

  // Credit statistics for chart
  const creditStatistics = useMemo(() => {
    const statsMap = new Map<string, CreditStatData>();
    
    // First, populate with semesters that have courses from allData
    allData.forEach((item) => {
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
        hk.maHocKy <= hocKyHienTai.maHocKy
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
  }, [allData, danhSachHocKy, hocKyHienTai]);

  // Calculate statistics from all data
  const statistics = useMemo(() => {
    const totalCredits = allData.reduce((sum, item) => sum + item.tinChi, 0);
    const totalSubjects = allData.length;

    const semesterSet = new Set<string>();
    allData.forEach((item) => {
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
  // Current filter values
  // Fetch functions
  const fetchAllData = useCallback(
    async (studentMaSo: string) => {
      try {
        const response = await axiosPrivate.get(
          KHHT_SERVICE.KHHT_DETAIL.replace(":maSo", studentMaSo)
        );
        if (response.status === 200 && response.data?.code === 200) {
          const processedData = response.data.data.map((item: any) => ({
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
          setAllData(processedData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu kế hoạch học tập:", error);
        throw new Error("Không thể tải kế hoạch học tập.");
      }
    },
    [axiosPrivate]
  );

  const fetchNhomHocPhanTuChon = useCallback(
    async (studentKhoaHoc: string, studentMaNganh: string) => {
      try {
        const response = await axiosPrivate.get(
          HOCPHAN_SERVICE.CTDT_HOC_PHAN_TU_CHON_LIST,
          {
            params: {
              khoaHoc: studentKhoaHoc,
              maNganh: studentMaNganh,
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
        throw new Error("Không thể tải nhóm học phần tự chọn.");
      }
    },
    [axiosPrivate]
  );
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

  // Event handlers

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

  // Chart tooltip component
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
            Tín chỉ đã học: <span className="font-bold">{data.soTinChi}</span>
          </p>
          <p className="text-gray-600">
            Tín chỉ có thể học:{" "}
            <span className="font-bold">{data.soTinChiConLai}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">Nhấn để xem chi tiết</p>
        </div>
      );
    }
    return null;
  };
  // Effects
  useEffect(() => {
    fetchDanhSachHocKy();
  }, [fetchDanhSachHocKy]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!maSo) {
        setError("Không tìm thấy mã số sinh viên.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const profileResponse = await axiosPrivate.get(
          PROFILE_SERVICE.GET_SINHVIEN_PREVIEW_PROFILE.replace(":maSo", maSo)
        );

        if (
          profileResponse.status === 200 &&
          profileResponse.data?.code === 200
        ) {
          const studentData = profileResponse.data.data;
          setStudentInfo(studentData);
          await Promise.all([
            fetchAllData(maSo), 
            fetchDanhSachHocKy(),
            fetchNhomHocPhanTuChon(studentData.khoaHoc, studentData.maNganh)
          ]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định."
        );
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [
    maSo,
    axiosPrivate,
    fetchAllData,
    fetchDanhSachHocKy,
    fetchNhomHocPhanTuChon,
  ]);
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
        title="Kế hoạch Học tập"
        description={`Xem chi tiết kế hoạch học tập của sinh viên ${studentInfo?.hoTen || ""}`}
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
                      key={`cell-${index}`} 
                      fill={entry.hasCourses ? "#3b82f6" : "#e5e7eb"} 
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
                  <p>Chưa có dữ liệu</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {creditStatistics.length > 0
            ? "Nhấn vào cột để xem chi tiết học kỳ"
            : "Biểu đồ sẽ hiển thị khi có học phần trong kế hoạch"}
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
                    className={`whitespace-nowrap py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                      selectedHocKyChart === hocKy.id
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {hocKy.ten} (
                    {
                      allData.filter(
                        (item) =>
                          item.maHocKy === hocKy.id &&
                          (!hocKyHienTai ||
                            item.maHocKy <= hocKyHienTai.maHocKy)
                      ).length
                    }
                    )
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
                <AllCoursesCollapsibleTable
                  key={activeTab}
                  activeTab={activeTab}
                  name="Tất cả học phần"
                  allData={allData}
                  nhomHocPhanTuChon={nhomHocPhanTuChon}
                  loading={false}
                  emptyStateTitle="Chưa có học phần nào"
                  emptyStateDescription="Hiện tại chưa có học phần nào trong kế hoạch"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Chưa có học phần nào</p>
                  <p className="text-sm">Hiện tại chưa có học phần nào trong kế hoạch học tập</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Kế hoạch học tập
                  {selectedHocKyChart && (
                    <>
                      {" - "}
                      {availableHocKy.find((s) => s.id === selectedHocKyChart)?.ten}
                    </>
                  )}
                </h4>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedSemesterData.reduce((sum, item) => sum + item.tinChi, 0)} tín chỉ
                  </span>
                </div>
              </div>

              {selectedSemesterData.length > 0 ? (
                <AllCoursesCollapsibleTable
                  key={activeTab}
                  activeTab={activeTab}
                  name="Học phần theo học kỳ"
                  allData={selectedSemesterData}
                  nhomHocPhanTuChon={nhomHocPhanTuChon}
                  loading={false}
                  emptyStateTitle="Chưa có học phần nào trong học kỳ này"
                  emptyStateDescription="Hiện tại chưa có học phần nào trong học kỳ này"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Chưa có học phần nào trong học kỳ này
                  </p>
                  <p className="text-sm">
                    Học kỳ này chưa có học phần nào được thêm vào kế hoạch
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeHoachHocTapView;
