import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import Loading from "../../components/Loading";
import StatisticsCard from "../../components/StatisticsCard";
import GPABarChart, {
  type RawSemesterData,
} from "../../components/chart/GPABarChart";
import GradeDistributionPieChart, {
  type RawGradeData,
} from "../../components/chart/GradeDistributionPieChart";

import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KQHT_SERVICE } from "../../api/apiEndPoints";
import type { HocKy } from "../../types/HocKy";
import type { NamHoc } from "../../types/NamHoc";

export interface KetQuaHocTapData {
  id: number;
  maHp: string;
  tenHp: string;
  dieuKien: boolean;
  nhomHp: string;
  soTinChi: number;
  diemChu: string;
  diemSo: number;
  hocKy: HocKy;
  namHoc: NamHoc;
}
// Để tương thích với component cũ
export interface KetQuaHocTapTableProps {
  id: number;
  maHp: string;
  tenHp: string;
  dieuKien: boolean;
  nhomHp: string;
  soTinChi: number;
  diemChu: string;
  diemSo: number;
  hocKy: HocKy;
  namHoc: NamHoc;
}
export default function KetQuaHocTap() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ketQuaData, setKetQuaData] = useState<KetQuaHocTapData[]>([]);
  const [semesterData, setSemesterData] = useState<RawSemesterData[]>([]);

  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { maSo } = auth.user || {}; // Fetch dữ liệu kết quả học tập
  const fetchKetQuaHocTap = useCallback(async () => {
    if (!maSo) {
      setError("Không tìm thấy mã số sinh viên");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Fetch dữ liệu điểm trung bình đã tính toán từ server
      const response = await axiosPrivate.post(
        KQHT_SERVICE.GET_DIEM_TRUNG_BINH_BY_HOCKY,
        {
          maSo: maSo,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status !== 200 || response.data?.code !== 200) {
        throw new Error(
          `API returned code: ${response.data?.code || response.status}`
        );
      }
      const responseData = response.data.data;
      const data = Array.isArray(responseData) ? responseData : [];

      // Store raw semester data without transformation
      setSemesterData(data);

      // Fetch thêm dữ liệu chi tiết để tính thống kê tổng quan
      const detailResponse = await axiosPrivate.get(KQHT_SERVICE.GET_KETQUA, {
        params: {
          maSo: maSo,
          page: 1,
          size: 1000,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (detailResponse.status === 200 && detailResponse.data?.code === 200) {
        const detailData = Array.isArray(detailResponse.data.data?.data)
          ? detailResponse.data.data.data
          : [];

        // Transform detail data for statistics
        const transformedDetailData: KetQuaHocTapData[] = detailData.map(
          (item: any) => ({
            id: item.id,
            maHp: item.hocPhan?.maHp || "",
            tenHp: item.hocPhan?.tenHp || "",
            dieuKien: item.dieuKien || false,
            nhomHp: item.hocPhan?.loaiHp || "",
            soTinChi: item.soTinChi || item.hocPhan?.tinChi || 0,
            diemChu: item.diemChu || "",
            diemSo: item.diemSo ? Math.round(item.diemSo * 10) / 10 : 0,
            hocKy: {
              maHocKy: item.hocKy?.maHocKy || 0,
              tenHocKy: item.hocKy?.tenHocKy || "",
              ngayBatDau: item.hocKy?.ngayBatDau || "",
              ngayKetThuc: item.hocKy?.ngayKetThuc || "",
              namHoc: {
                id: item.hocKy?.namHoc?.id || 0,
                namBatDau: item.hocKy?.namHoc?.namBatDau || "",
                namKetThuc: item.hocKy?.namHoc?.namKetThuc || "",
              },
            },
            namHoc: {
              id: item.hocKy?.namHoc?.id || 0,
              namBatDau: item.hocKy?.namHoc?.namBatDau || "",
              namKetThuc: item.hocKy?.namHoc?.namKetThuc || "",
            },
          })
        );

        setKetQuaData(transformedDetailData);
      }
    } catch (error) {
      console.error("Error fetching ket qua hoc tap:", error);
      setError("Không thể lấy thông tin kết quả học tập. Vui lòng thử lại.");
      setKetQuaData([]);
      setSemesterData([]);
    } finally {
      setLoading(false);
    }
  }, [maSo, axiosPrivate]);
  useEffect(() => {
    fetchKetQuaHocTap();
  }, [fetchKetQuaHocTap]); // Tính toán thống kê tổng quan từ dữ liệu semester và raw data
  const statistics = useMemo(() => {
    if (!ketQuaData.length || !semesterData.length)
      return {
        tongTinChi: 0,
        diemTBTichLuy: 0,
        tinChiCanCaiThien: 0,
        tinChiNo: 0,
      };

    const validData = ketQuaData.filter(
      (item) => item.diemChu !== "W" && item.diemChu !== "I" // Bỏ qua điểm W và I
    );

    const tongTinChi = validData.reduce((sum, item) => sum + item.soTinChi, 0);

    // Tín chỉ cần cải thiện: điểm số <= 6.5
    const tinChiCanCaiThien = validData
      .filter((item) => item.diemSo > 0 && item.diemSo <= 6.5)
      .reduce((sum, item) => sum + item.soTinChi, 0);

    // Tín chỉ nợ: điểm số < 5 hoặc điểm chữ F
    const tinChiNo = validData
      .filter((item) => item.diemSo < 5 || item.diemChu === "F")
      .reduce((sum, item) => sum + item.soTinChi, 0);

    // Lấy điểm TB tích lũy từ học kỳ cuối cùng
    const latestSemester = semesterData[semesterData.length - 1];
    const diemTBTichLuy = latestSemester
      ? latestSemester.diemTrungBinhTichLuy
      : 0;

    return {
      tongTinChi,
      diemTBTichLuy,
      tinChiCanCaiThien,
      tinChiNo,
    };
  }, [ketQuaData, semesterData]); // Prepare raw data for pie chart component
  const gradeRawData: RawGradeData[] = useMemo(() => {
    return ketQuaData.map((item) => ({
      tenHp: item.tenHp,
      diemChu: item.diemChu,
    }));
  }, [ketQuaData]);

  if (loading) {
    return (
      <div className="p-6">
        <Loading
          showOverlay={false}
          message="Đang tải dữ liệu kết quả học tập..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tổng quan kết quả học tập
            </h1>
            <p className="text-gray-600">
              Biểu đồ điểm trung bình và thống kê học tập
            </p>
          </div>
        </div>
      </div>{" "}
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatisticsCard
          title="Điểm TB tích lũy"
          value={statistics.diemTBTichLuy}
          icon={Award}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          textColor="text-blue-100"
          iconColor="text-blue-200"
          subtitle="Đã đạt được"
          subtitleIcon={TrendingUp}
        />
        <StatisticsCard
          title="Tổng tín chỉ"
          value={statistics.tongTinChi}
          icon={BookOpen}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          textColor="text-green-100"
          iconColor="text-green-200"
          subtitle="Đã tích lũy"
          subtitleIcon={TrendingUp}
        />
        <StatisticsCard
          title="Tín chỉ cần cải thiện"
          value={statistics.tinChiCanCaiThien}
          icon={Target}
          gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          textColor="text-purple-100"
          iconColor="text-purple-200"
          subtitle="Cần cải thiện"
          subtitleIcon={BarChart3}
        />
        <StatisticsCard
          title="Số tín chỉ nợ"
          value={statistics.tinChiNo}
          icon={Calendar}
          gradient="bg-gradient-to-br from-red-500 to-pink-600"
          textColor="text-red-100"
          iconColor="text-red-200"
          subtitle="Cần bổ sung"
          subtitleIcon={Award}
        />
      </div>
      {/* Charts Section - Two charts in one row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* GPA Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Biểu đồ điểm trung bình qua các học kỳ
              </h2>
              <p className="text-gray-600">
                So sánh điểm TB học kỳ và điểm TB tích lũy
              </p>
            </div>
          </div>
          {semesterData.length > 0 ? (
            <GPABarChart rawData={semesterData} height={400} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Chưa có dữ liệu</p>
                <p className="text-sm">
                  Không có dữ liệu kết quả học tập để hiển thị biểu đồ
                </p>
              </div>
            </div>
          )}
        </div>{" "}
        {/* Grade Distribution Pie Chart */}
        <GradeDistributionPieChart rawData={gradeRawData} />
      </div>
    </div>
  );
}
