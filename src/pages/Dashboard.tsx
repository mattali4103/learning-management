import { useEffect, useState, useMemo } from "react";
import Loading from "../components/Loading";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { KHHT_SERVICE, PROFILE_SERVICE, KQHT_SERVICE } from "../api/apiEndPoints";
import TinChiChart from "../components/chart/TinChiChart";
import GPAChart from "../components/chart/GPAChart";
import {
  User,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  GraduationCap,
  Clock,
  Target,
  BarChart3,
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
  maHocKy: number;
  diemTrungBinhTichLuy: number;
}
// interface NamHoc {
//   id: number;
//   namBatDau: number;
//   namKetThuc: number;
// }
// interface HocKy {
//   maHocKy: number;
//   tenHocKy: string;
//   ngayBatDau: string;
//   ngayKetThuc: string;
//   namHoc: NamHoc;
// }
const Dashboard = () => {
  // Get user info from auth context
  const { auth } = useAuth();
  // Custom hook to handle private axios requests
  const axiosPrivate = useAxiosPrivate();
  // State to manage user information and loading/error states
  const [error, setError] = useState<string | null>(null);
  // State to hold user information
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);  // State to hold the list of tin chi tich luy by the user
  const [tinChiTichLuy, setTinChiTichLuy] = useState<ThongKeTinChiByHocKy[]>(
    []
  );
  const [thongKeTinChi, setThongKeTinChi] = useState<ThongKeTinChi>({
    tongSoTinChi: 0,
    soTinChiTichLuy: 0,
    soTinChiCaiThien: 0,
  });
  // State to hold the GPA data by semester
  const [diemTrungBinhHocKy, setDiemTrungBinhHocKy] = useState<DiemTrungBinhHocKy[]>([]);

  // Fetch user information when the component mounts
  useEffect(() => {    const fetchThongKeTinChi = async () => {
      try{
        const response = await axiosPrivate.get<any>(
          KHHT_SERVICE.COUNT_TINCHI_IN_KHHT.replace(
            ":khoaHoc", auth.user?.khoaHoc || "")
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
          console.warn("API returned non-200 code for thong ke tin chi:", response.data?.code);
        }
      } catch (error) {
        console.error("Error fetching thong ke tin chi:", error);
        // Don't show error to user for non-critical data
      } finally{
        setLoading(false);
      }
    };    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          PROFILE_SERVICE.GET_MY_PROFILE.replace(":maSo", auth.user?.maSo || "")
        );
        
        // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          setUserInfo(response.data.data);
        } else {
          throw new Error(`API returned code: ${response.data?.code || response.status}`);
        }
      } catch (error) {
        setError("Không thể lấy thông tin người dùng. Vui lòng thử lại.");
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };    const fetchTinChiTichLuy = async () => {
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
        );
          // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          console.log("Raw TinChi API response:", response.data.data);
          setTinChiTichLuy(response.data.data);
        } else {
          console.warn("API returned non-200 code for tin chi tich luy:", response.data?.code);
        }
      } catch (error) {
        console.error("Error fetching tin chi tich luy:", error);
        // Don't show error for non-critical data
      }
    };

    const fetchDiemTrungBinh = async () => {
      try {
        const response = await axiosPrivate.post<any>(
          KQHT_SERVICE.GET_DIEM_TRUNG_BINH_BY_HOCKY,{
            maSo: auth.user?.maSo || "",
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
          // Check response code
        if (response.status === 200 && response.data?.code === 200) {
          console.log("Raw GPA API response:", response.data.data);
          setDiemTrungBinhHocKy(response.data.data);
        } else {
          console.warn("API returned non-200 code for GPA data:", response.data?.code);
        }
      } catch (error) {
        console.error("Error fetching diem trung binh:", error);
        // Don't show error for GPA data as it's not critical
      }
    };    fetchUserInfo();
    fetchThongKeTinChi();
    fetchTinChiTichLuy();
    fetchDiemTrungBinh();
  }, [axiosPrivate, auth.user?.maSo, auth.user?.khoaHoc]); 
  // Tính toán thống kê từ dữ liệu thực
  const statistics = useMemo(() => {
    const { tongSoTinChi, soTinChiTichLuy, soTinChiCaiThien } = thongKeTinChi;
    const tinChiConLai = Math.max(0, tongSoTinChi - soTinChiTichLuy); 
    return {
      tongSoTinChi,
      soTinChiTichLuy,
      tinChiConLai,
      soTinChiCaiThien,
      tinChiCanCaiThien: 0,
    };
  }, [thongKeTinChi]);
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
    return <Loading />;
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Tín chỉ tích lũy
              </p>
              <p className="text-3xl font-bold">{statistics.soTinChiTichLuy}</p>
            </div>
            <BookOpen className="w-12 h-12 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">Đã hoàn thành</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Tín chỉ còn lại
              </p>
              <p className="text-3xl font-bold">{statistics.tinChiConLai}</p>
            </div>
            <Target className="w-12 h-12 text-yellow-200" />
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">Cần hoàn thành</span>
          </div>
        </div>{" "}
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">
                Tín chỉ cần cải thiện
              </p>
              <p className="text-3xl font-bold">
                {statistics.tinChiCanCaiThien}
              </p>
            </div>
            <Award className="w-12 h-12 text-red-200" />
          </div>
          <div className="mt-4 flex items-center">
            <BarChart3 className="w-4 h-4 mr-1" />
            <span className="text-sm">Cần cải thiện</span>
          </div>
        </div>{" "}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Tín chỉ đã cải thiện
              </p>
              <p className="text-3xl font-bold">
                {statistics.soTinChiCaiThien}
              </p>
            </div>
            <GraduationCap className="w-12 h-12 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center">
            <Award className="w-4 h-4 mr-1" />
            <span className="text-sm">Đã nâng cao</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Tiến độ học tập</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Tín chỉ tích lũy
              </span>
              <span className="text-sm font-bold text-gray-900">
                {statistics.soTinChiTichLuy}/{statistics.tongSoTinChi} tín chỉ
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min((statistics.soTinChiTichLuy / statistics.tongSoTinChi) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {((statistics.soTinChiTichLuy / statistics.tongSoTinChi) * 100).toFixed(1)}% hoàn thành
            </p>
          </div>

          {statistics.tinChiCanCaiThien > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Tín chỉ cần cải thiện
                </span>
                <span className="text-sm font-bold text-red-600">
                  {statistics.tinChiCanCaiThien} tín chỉ
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-pink-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min((statistics.tinChiCanCaiThien / statistics.tongSoTinChi) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {tinChiTichLuy.length}
              </p>
              <p className="text-sm text-gray-600">Học kỳ đã hoàn thành</p>
            </div>{" "}
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
        </div>        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">          {/* Tin Chi Chart */}
          <TinChiChart
            data={
              tinChiTichLuy && tinChiTichLuy.length > 0
                ? tinChiTichLuy.map((item, index) => {
                    const hocKyId = item.hocKy?.maHocKy || null;
                    const namHocId = item.hocKy?.namHoc?.id || null;
                    
                    console.log(`TinChi data point ${index}:`, {
                      name: `Học Kỳ ${index + 1}`,
                      hocKyId,
                      namHocId,
                      item: item.hocKy
                    });
                    
                    return {
                      name: `Học Kỳ ${index + 1}`,
                      tinChiTichLuy: item.soTinChiDangKy || 0,
                      tinChiCaiThien: item.soTinChiCaiThien || 0,
                      hocKyId,
                      namHocId,
                    };
                  })
                : []
            }
          />          {/* GPA Chart */}
          <GPAChart
            data={
              diemTrungBinhHocKy && diemTrungBinhHocKy.length > 0                ? diemTrungBinhHocKy.map((item: any, index) => {
                    const hocKyId = item.maHocKy || null;
                    const namHocId = item.namHocId || item.namHoc?.id || null;
                    
                    console.log(`GPA data point ${index}:`, {
                      name: `Học Kỳ ${index + 1}`,
                      hocKyId,
                      namHocId,
                      diem: item.diemTrungBinhTichLuy,
                      rawItem: item
                    });
                    
                    return {
                      name: `Học Kỳ ${index + 1}`,
                      diem: Number(item.diemTrungBinhTichLuy) || 0,
                      hocKyId,
                      namHocId,
                    };
                  })
                : []
            }
          />
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
