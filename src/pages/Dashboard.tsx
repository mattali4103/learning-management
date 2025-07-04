import { useEffect, useState, useMemo } from "react";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  KHHT_SERVICE,
  PROFILE_SERVICE,
  KQHT_SERVICE,
} from "../api/apiEndPoints";
import Loading from "../components/Loading";
import TinChiChart from "../components/chart/TinChiChart";
import GPAChart from "../components/chart/GPAChart";
import CreditProgressCard from "../components/progress/CreditProgressCard";
import MiniGPABarChartCompact from "../components/chart/MiniGPABarChartCompact";
import {
  User,
  Calendar,
  BookOpen,
  Award,
  GraduationCap,
  Clock,
  Target,
} from "lucide-react";

interface UserInfo {
  maSo: string;
  hoTen: string;
  ngaySinh: Date;
  gioiTinh: boolean;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
}
interface ThongKeTinChiByHocKy {
  hocKy: any;
  soTinChiCaiThien: number;
  soTinChiDangKy: number;
}
interface ThongKeTinChi {
  tongSoTinChi: number;
  soTinChiTichLuy: number;
  soTinChiCaiThien: number;
}

interface DiemTrungBinhHocKy {
  hocKy: {
    maHocKy: number;
    tenHocKy: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    namHoc: {
      id: number;
      namBatDau: string;
      namKetThuc: string;
    };
  };
  diemTrungBinh: number;
  diemTrungBinhTichLuy: number;
}
const Dashboard = () => {
  // Get user info from auth context
  const { auth } = useAuth();
  // Custom hook to handle private axios requests
  const axiosPrivate = useAxiosPrivate();
  // State to manage user information and loading/error states
  const [error, setError] = useState<string | null>(null);
  // State to hold user information
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // State to hold the list of tin chi tich luy by the user
  const [tinChiTichLuy, setTinChiTichLuy] = useState<ThongKeTinChiByHocKy[]>(
    []
  );
  const [thongKeTinChi, setThongKeTinChi] = useState<ThongKeTinChi>({
    tongSoTinChi: 0,
    soTinChiTichLuy: 0,
    soTinChiCaiThien: 0,
  });
  // State to hold the GPA data by semester
  const [diemTrungBinhHocKy, setDiemTrungBinhHocKy] = useState<
    DiemTrungBinhHocKy[]
  >([]);

  // Fetch user information when the component mounts
  useEffect(() => {
    const fetchThongKeTinChi = async () => {
      try {
        const response = await axiosPrivate.get<any>(
          KHHT_SERVICE.COUNT_TINCHI_IN_KHHT.replace(
            ":khoaHoc",
            auth.user?.khoaHoc || ""
          )
            .replace(":maNganh", auth.user?.maNganh || "")
            .replace(":maSo", auth.user?.maSo || ""),
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          setThongKeTinChi(response.data.data);
        } else {
          console.warn(
            "API returned non-200 code for thong ke tin chi:",
            response.data?.code
          );
        }
      } catch (error) {
        console.error("Error fetching thong ke tin chi:", error);
        // Don't show error to user for non-critical data
      } finally {
        setLoading(false);
      }
    };
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          PROFILE_SERVICE.GET_MY_PROFILE.replace(":maSo", auth.user?.maSo || "")
        );

        // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          setUserInfo(response.data.data);
        } else {
          throw new Error(
            `API returned code: ${response.data?.code || response.status}`
          );
        }
      } catch (error) {
        setError("Không thể lấy thông tin người dùng. Vui lòng thử lại.");
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchTinChiTichLuy = async () => {
      try {
        const response = await axiosPrivate.get<any>(
          KHHT_SERVICE.COUNT_TINCHI_GROUP_BY_HOCKY.replace(
            ":maSo",
            auth.user?.maSo || ""
          ),
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        ); // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          setTinChiTichLuy(response.data.data);
        } else {
          console.warn(
            "API returned non-200 code for tin chi tich luy:",
            response.data?.code
          );
        }
      } catch (error) {
        console.error("Error fetching tin chi tich luy:", error);
        // Don't show error for non-critical data
      }
    };

    const fetchDiemTrungBinh = async () => {
      try {
        const response = await axiosPrivate.post<any>(
          KQHT_SERVICE.GET_DIEM_TRUNG_BINH_BY_HOCKY,
          {
            maSo: auth.user?.maSo || "",
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        ); // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          setDiemTrungBinhHocKy(response.data.data);
        } else {
          console.warn(
            "API returned non-200 code for GPA data:",
            response.data?.code
          );
        }
      } catch (error) {
        console.error("Error fetching diem trung binh:", error);
        // Don't show error for GPA data as it's not critical
      }
    };
    fetchUserInfo();
    fetchThongKeTinChi();
    fetchTinChiTichLuy();
    fetchDiemTrungBinh();
  }, [axiosPrivate, auth.user?.maSo, auth.user?.khoaHoc, auth.user?.maNganh]); // Tính toán thống kê từ dữ liệu thực
  const statistics = useMemo(() => {
    const { tongSoTinChi, soTinChiTichLuy, soTinChiCaiThien } = thongKeTinChi;
    const tinChiConLai = Math.max(0, tongSoTinChi - soTinChiTichLuy);

    // Tính điểm TB tích lũy từ dữ liệu GPA cuối cùng
    const latestGPA =
      diemTrungBinhHocKy.length > 0
        ? diemTrungBinhHocKy[diemTrungBinhHocKy.length - 1].diemTrungBinhTichLuy
        : 0;

    return {
      tongSoTinChi,
      soTinChiTichLuy,
      tinChiConLai,
      soTinChiCaiThien,
      tinChiCanCaiThien: 0,
      diemTBTichLuy: latestGPA,
    };
  }, [thongKeTinChi, diemTrungBinhHocKy]);
  // Lấy thời gian hiện tại để chào hỏi
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) return "Chào buổi sáng";
    if (hour <= 18 && hour >= 12) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // State to manage loading state
  const [loading, setLoading] = useState<boolean>(true);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <Loading
            showOverlay={false}
            message="Đang tải thông tin dashboard..."
          />
        </div>
      </div>
    );
  }
  // If there's an error, display it
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {getGreeting()}, {userInfo?.hoTen?.split(" ").pop()}!
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <User className="w-4 h-4 mr-2" />
                {userInfo?.maSo} - {userInfo?.tenNganh}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 flex items-center justify-end">
              <Clock className="w-4 h-4 mr-1" />
              {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
      {/* Progress Section with Circular Progress Bars */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Tiến độ học tập</h2>
        </div>
        {/* Main Progress Grid */}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tín chỉ tích lũy */}
          <CreditProgressCard
            currentCredits={statistics.soTinChiTichLuy}
            totalCredits={156}
          />

          {/* Điểm trung bình tích lũy qua các học kỳ */}
          <MiniGPABarChartCompact
            rawData={
              diemTrungBinhHocKy && diemTrungBinhHocKy.length > 0
                ? diemTrungBinhHocKy.map(item => ({
                    diemTrungBinh: item.diemTrungBinh,
                    diemTrungBinhTichLuy: item.diemTrungBinhTichLuy,
                    soTinChi: 0,
                    hocKy: item.hocKy
                  }))
                : []
            }
            title="Điểm TB tích lũy"
            showCumulativeGPA={true}
            height={100}
          />

          {/* Điểm trung bình theo từng học kỳ */}
          <MiniGPABarChartCompact
            rawData={
              diemTrungBinhHocKy && diemTrungBinhHocKy.length > 0
                ? diemTrungBinhHocKy.map(item => ({
                    diemTrungBinh: item.diemTrungBinh,
                    diemTrungBinhTichLuy: item.diemTrungBinhTichLuy,
                    soTinChi: 0,
                    hocKy: item.hocKy
                  }))
                : []
            }
            title="Điểm TB theo học kỳ"
            showCumulativeGPA={false}
            height={100}
          />
        </div>
        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {tinChiTichLuy.length}
            </p>
            <p className="text-sm text-gray-600">Học kỳ đã hoàn thành</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {(() => {
                if (tinChiTichLuy.length === 0) return 0;

                // Tính tín chỉ của từng học kỳ riêng lẻ từ dữ liệu tích lũy
                let totalTinChiRiengLe = 0;
                for (let i = 0; i < tinChiTichLuy.length; i++) {
                  const tinChiHocKy =
                    i === 0
                      ? tinChiTichLuy[i].soTinChiDangKy
                      : tinChiTichLuy[i].soTinChiDangKy -
                        tinChiTichLuy[i - 1].soTinChiDangKy;
                  totalTinChiRiengLe += tinChiHocKy;
                }

                return (totalTinChiRiengLe / tinChiTichLuy.length).toFixed(1);
              })()}
            </p>
            <p className="text-sm text-gray-600">Tín chỉ TB/học kỳ</p>
          </div>

          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <GraduationCap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">
              {(
                (statistics.soTinChiTichLuy / 156) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="text-sm text-gray-600">Tiến độ tổng thể</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">
              Thông tin sinh viên
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Mã số sinh viên",
                value: userInfo?.maSo,
                icon: BookOpen,
              },
              { label: "Họ và tên", value: userInfo?.hoTen, icon: User },
              {
                label: "Ngày sinh",
                value: userInfo?.ngaySinh
                  ? new Date(userInfo.ngaySinh).toLocaleDateString("vi-VN")
                  : "",
                icon: Calendar,
              },
              {
                label: "Giới tính",
                value: userInfo?.gioiTinh === true ? "Nữ" : "Nam",
                icon: User,
              },
              { label: "Lớp", value: userInfo?.maLop, icon: GraduationCap },
              { label: "Khóa học", value: userInfo?.khoaHoc, icon: Calendar },
              { label: "Ngành học", value: userInfo?.tenNganh, icon: BookOpen },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <IconComponent className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 block">
                      {item.label}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>{" "}
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {" "}
          {/* Tin Chi Line Chart */}
          <TinChiChart
            data={
              tinChiTichLuy && tinChiTichLuy.length > 0
                ? tinChiTichLuy.map((item, index) => {
                    const hocKyId = item.hocKy?.maHocKy || null;
                    const namHocId = item.hocKy?.namHoc?.id || null;

                    return {
                      name: `Học kỳ ${index + 1}`,
                      tinChiTichLuy: item.soTinChiDangKy || 0,
                      tinChiCaiThien: item.soTinChiCaiThien || 0,
                      hocKyId,
                      namHocId,
                    };
                  })
                : []
            }
          />
          {/* GPA Line Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 text-blue-600 mr-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3v18h18v-2H5V3H3z"/>
                  <path d="M7 17h2V9H7v8zm4 0h2V7h-2v10zm4 0h2v-4h-2v4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                So sánh điểm trung bình qua các học kỳ
              </h3>
            </div>
            <GPAChart
              data={diemTrungBinhHocKy.map((item, index) => ({
                name: `Học kỳ ${index + 1}`,
                diem: item.diemTrungBinhTichLuy,
                hocKyId: item.hocKy?.maHocKy || null,
                namHocId: item.hocKy?.namHoc?.id || null,
              }))}
            />
          </div>
        </div>
      </div>
      {/* Quick Actions Footer */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm">
              Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
