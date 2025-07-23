
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
import CombinedCreditGPAChart from "../components/chart/CombinedCreditGPAChart";
import {
  User,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Target,
} from "lucide-react";
import type { HocKy } from "../types/HocKy";

interface UserInfo {
  maSo: string;
  hoTen: string;
  ngaySinh: Date;
  gioiTinh: boolean;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
  avatarUrl?: string;
}
interface ThongKeTinChiByHocKy {
  hocKy: HocKy;
  soTinChiTichLuy: number;
  soTinChiRot: number;
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
  // ...existing code...

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
        console.log("maso:", auth.user?.maSo);
        // Đảm bảo không có dấu / dư thừa
        const url = KHHT_SERVICE.COUNT_TINCHI_IN_KHHT
          .replace(":khoaHoc", auth.user?.khoaHoc || "_")
          .replace(":maNganh", auth.user?.maNganh || "_")
          .replace(":maSo", auth.user?.maSo || "");
        
        console.log("API URL:", url);
        
        const response = await axiosPrivate.get<any>(
          url,
          {
            headers: { 
              "Content-Type": "application/json"
            }
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
        const url = PROFILE_SERVICE.GET_MY_PROFILE.replace(":maSo", auth.user?.maSo || "");
        const response = await axiosPrivate.get(url);
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
        const url = KQHT_SERVICE.GET_THONGKE_TINCHI.replace(
          ":maSo",
          auth.user?.maSo || ""
        );
        console.log("Tin chi tich luy API URL:", url);
        const response = await axiosPrivate.get<any>(
          url,
          {
            headers: { "Content-Type": "application/json" }
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
            headers: { "Content-Type": "application/json" }
          }
        ); // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          console.log(response.data.data);
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

  // ...existing code...
  // Tính toán thống kê từ dữ liệu thực
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

  // --- Progress Status State ---
  const [progressState, setProgressState] = useState({
    status: "Chưa có dữ liệu",
    color: "text-gray-600",
    bg: "bg-gray-50",
    avg: null as number | null,
    totalCredits: 0,
    totalSemesters: 0,
  });

  useEffect(() => {
    const totalCredits = typeof statistics.soTinChiTichLuy === 'number' ? statistics.soTinChiTichLuy : 0;
    const totalSemesters = Array.isArray(tinChiTichLuy) ? tinChiTichLuy.length : 0;
    let status = "Chưa có dữ liệu";
    let color = "text-gray-600";
    let bg = "bg-gray-50";
    let avg: number | null = null;
    if (totalSemesters > 0) {
      avg = totalCredits / totalSemesters;
      if (avg < 10) {
        status = "Trễ tiến độ";
        color = "text-red-600";
        bg = "bg-red-50";
      } else if (avg > 20) {
        status = "Vượt tiến độ";
        color = "text-green-600";
        bg = "bg-green-50";
      } else {
        status = "Kịp tiến độ";
        color = "text-blue-600";
        bg = "bg-blue-50";
      }
    }
    setProgressState({ status, color, bg, avg, totalCredits, totalSemesters });
  }, [statistics.soTinChiTichLuy, tinChiTichLuy]);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 lg:p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
              {userInfo?.avatarUrl ? (
                <img 
                  src={userInfo.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {getGreeting()}, {userInfo?.hoTen?.split(" ").pop()}!
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <GraduationCap className="w-4 h-4 mr-2" />
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
      {/* Progress Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Tiến độ học tập</h2>
        </div>

        {/* Main Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tín chỉ tích lũy */}
          <div className="lg:col-span-1 justify-center items-center content-center">
            <CreditProgressCard
              currentCredits={statistics.soTinChiTichLuy}
              totalCredits={156}
            />
          </div>

          {/* Biểu đồ cột đôi cho điểm trung bình */}
          <div className="lg:col-span-2">
            {(() => {
              // Combine data from tinChiTichLuy and diemTrungBinhHocKy by index
              const combinedData = [];
              const maxLength = Math.max(tinChiTichLuy.length, diemTrungBinhHocKy.length);
              for (let i = 0; i < maxLength; i++) {
                const tinChiItem = tinChiTichLuy[i] || null;
                const diemItem = diemTrungBinhHocKy[i] || null;
                combinedData.push({
                  hocKy: diemItem?.hocKy || tinChiItem?.hocKy || null,
                  name: `Học kỳ ${i + 1}`,
                  soTinChiRot: tinChiItem?.soTinChiRot || 0,
                  soTinChiTichLuy: tinChiItem?.soTinChiTichLuy || 0,
                  diemTrungBinhTichLuy: diemItem?.diemTrungBinhTichLuy || 0,
                  diemTrungBinh: diemItem?.diemTrungBinh || 0,
                });
              }
              return (
                <CombinedCreditGPAChart
                  data={combinedData}
                  title="Tín chỉ & Điểm trung bình theo học kỳ"
                  height={300}
                />
              );
            })()}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          {/* Tiến độ học tập */}
          <div className={`text-center p-4 rounded-lg hover:bg-opacity-80 transition-colors ${progressState.bg}`}>
            <Target className={`w-8 h-8 mx-auto mb-2 ${progressState.color}`} />
            <p className="text-sm text-gray-600 mb-2">Tiến độ học tập</p>
            <p className={`text-xl font-bold ${progressState.color}`}>{progressState.status}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {tinChiTichLuy.length}
            </p>
            <p className="text-sm text-gray-600">Học kỳ đã hoàn thành</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors ">
            <GraduationCap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">
              {((statistics.soTinChiTichLuy / 156) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Tiến độ tổng thể</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Student Info & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Student Info Section - Left Side */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
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
        </div>

        {/* Charts Section - Right Side */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tin Chi Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <TinChiChart
              data={
                tinChiTichLuy && tinChiTichLuy.length > 0
                  ? tinChiTichLuy.map((item, index) => {
                      const hocKyId = item.hocKy?.maHocKy || null;
                      const namHocId = item.hocKy?.namHoc?.id || null;

                      return {
                        name: `Học kỳ ${index + 1}`,
                        tinChiTichLuy: item.soTinChiTichLuy || 0,
                        tinChiRot: item.soTinChiRot || 0,
                        tinChiCaiThien: 0,
                        hocKyId,
                        namHocId,
                      };
                    })
                  : []
              }
            />
          </div>

          {/* GPA Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
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
