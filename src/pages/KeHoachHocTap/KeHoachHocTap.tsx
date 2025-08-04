import { useCallback, useEffect, useState, useMemo } from "react";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Outlet } from "react-router-dom";
import KHHTBarChart from "../../components/chart/KHHTBarChart";
import useAuth from "../../hooks/useAuth";
import type { HocKy } from "../../types/HocKy";
import StatisticsCard from "../../components/StatisticsCard";
import { BookOpen, GraduationCap, Calendar } from "lucide-react";

// Interface cho dữ liệu biểu đồ từ API COUNT_TINCHI_GROUP_BY_HOCKY
interface TinChiThongKe {
  hocKy: HocKy;
  soTinChiDangKy: number;
  soTinChiCaiThien: number;
}

export const KeHoachHocTapPage = () => {
  const { auth } = useAuth();
  const [tinChiThongKe, setTinChiThongKe] = useState<TinChiThongKe[]>([]); // Dữ liệu cho biểu đồ
  const [loading, setLoading] = useState<boolean>(true); // Loading cho toàn bộ trang (lần đầu)
  const [error, setError] = useState<string | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const maSo = auth.user?.maSo || "";

  // Function fetch dữ liệu thống kê tín chỉ
  const fetchTinChiThongKe = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        KHHT_SERVICE.COUNT_TINCHI_GROUP_BY_HOCKY.replace(":maSo", maSo)
      );

      if (response.status === 200 && response.data?.code === 200) {
        const thongKeData: TinChiThongKe[] = response.data.data;
        setTinChiThongKe(thongKeData);
        return thongKeData;
      } else {
        throw new Error(
          `API returned code: ${response.data?.code || response.status}`
        );
      }
    } catch (error) {
      console.error("Error fetching tin chi thong ke:", error);
      setTinChiThongKe([]);
      return [];
    }
  }, [axiosPrivate, maSo]);

  // Calculate statistics from chart data
  const statistics = useMemo(() => {
    const totalCredits = tinChiThongKe.reduce(
      (sum, item) => sum + item.soTinChiDangKy + item.soTinChiCaiThien, 
      0
    );
    const totalSubjects = tinChiThongKe.length;
    const totalSemesters = tinChiThongKe.length;

    return {
      totalCredits,
      totalSubjects,
      totalSemesters,
    };
  }, [tinChiThongKe]);

  // useEffect cho lần đầu load trang
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!maSo) return;

      setLoading(true);
      try {
        await fetchTinChiThongKe();
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError(
          error instanceof Error ? `Lỗi: ${error.message}` : "Có lỗi xảy ra"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [maSo, fetchTinChiThongKe]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Loading showOverlay={false} message="Đang tải kế hoạch học tập..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6 overflow-hidden ">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatisticsCard
          title="Tổng số tín chỉ"
          value={statistics.totalCredits}
          subtitle="tín chỉ"
          icon={BookOpen}
          colorScheme="blue"
          size="md"
          style="modern"
        />
        <StatisticsCard
          title="Tổng số học phần"
          value={statistics.totalSubjects}
          subtitle="học phần"
          icon={GraduationCap}
          colorScheme="green"
          size="md"
          style="modern"
        />
        <StatisticsCard
          title="Số học kỳ"
          value={statistics.totalSemesters}
          subtitle="học kỳ"
          icon={Calendar}
          colorScheme="purple"
          size="md"
          style="modern"
        />
      </div>

      {/* Biểu đồ tín chỉ và môn học theo học kỳ */}
      {tinChiThongKe.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
          <p className="text-lg text-center font-bold uppercase mb-4">
            Số tín chỉ đăng ký và cải thiện theo học kỳ
          </p>
          <p className="text-sm text-center text-gray-600 mb-4">
            Nhấn vào cột biểu đồ để xem chi tiết học kỳ tương ứng
          </p>
          <KHHTBarChart rawData={tinChiThongKe} height={400} />
        </div>
      )}
    </div>
  );
};

const KeHoachHocTap = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default KeHoachHocTap;
