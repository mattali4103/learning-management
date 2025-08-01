
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { PROFILE_SERVICE, KQHT_SERVICE } from "../api/apiEndPoints";
import Loading from "../components/Loading";
import CreditProgressCard from "../components/progress/CreditProgressCard";
import CombinedCreditGPAChart from "../components/chart/CombinedCreditGPAChart";
import {
  User,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Star,
} from "lucide-react";
import type { HocKy } from "../types/HocKy";
import type { PreviewProfile } from "../types/PreviewProfile";

interface ThongKeTinChiByHocKy {
  hocKy: HocKy;
  soTinChiTichLuy: number;
  soTinChiRot: number;
}

interface DiemTrungBinhHocKy {
  hocKy: HocKy;
  diemTrungBinh: number;
  diemTrungBinhTichLuy: number;
}

const Dashboard = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [userInfo, setUserInfo] = useState<PreviewProfile | null>(null);
  const [tinChiTichLuy, setTinChiTichLuy] = useState<ThongKeTinChiByHocKy[]>(
    []
  );
  const [diemTrungBinhHocKy, setDiemTrungBinhHocKy] = useState<
    DiemTrungBinhHocKy[]
  >([]);

  const [progressState, setProgressState] = useState({
    status: "Chưa có dữ liệu",
    color: "text-gray-600",
    bg: "bg-gray-50",
  });

  // Helper function to get academic classification styling
  const getAcademicClassificationStyle = (xepLoai: string | undefined) => {
    if (!xepLoai) {
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-300",
        icon: AlertTriangle,
        iconColor: "text-gray-500",
      };
    }
    const xepLoaiLower = xepLoai.toLowerCase();
    if (xepLoaiLower.includes("xuất sắc")) {
      return {
        bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
        textColor: "text-purple-900",
        borderColor: "border-purple-300",
        icon: Star,
        iconColor: "text-purple-600",
      };
    } else if (xepLoaiLower.includes("giỏi")) {
      return {
        bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
        textColor: "text-blue-900",
        borderColor: "border-blue-300",
        icon: Award,
        iconColor: "text-blue-600",
      };
    } else if (xepLoaiLower.includes("khá")) {
      return {
        bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
        textColor: "text-green-900",
        borderColor: "border-green-300",
        icon: CheckCircle,
        iconColor: "text-green-600",
      };
    } else if (xepLoaiLower.includes("trung bình")) {
      return {
        bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
        textColor: "text-yellow-900",
        borderColor: "border-yellow-300",
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
      };
    } else {
      return {
        bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
        textColor: "text-red-900",
        borderColor: "border-red-300",
        icon: AlertTriangle,
        iconColor: "text-red-600",
      };
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const maSo = auth.user?.maSo;
        if (!maSo) {
          throw new Error("Không tìm thấy mã số sinh viên.");
        }

        // Fetch all data in parallel
        const [
          profileResponse,
          tinChiResponse,
          gpaResponse,
        ] = await Promise.all([
          axiosPrivate.get(
            PROFILE_SERVICE.GET_SINHVIEN_PREVIEW_PROFILE.replace(":maSo", maSo)
          ),
          axiosPrivate.get(
            KQHT_SERVICE.GET_THONGKE_TINCHI.replace(":maSo", maSo)
          ),
          axiosPrivate.post(KQHT_SERVICE.GET_DIEM_TRUNG_BINH_BY_HOCKY, {
            maSo,
          }),
        ]);

        // Process Profile
        if (
          profileResponse.status === 200 &&
          profileResponse.data?.code === 200
        ) {
          setUserInfo(profileResponse.data.data);
        } else {
          console.warn("Could not fetch user profile.");
        }

        // Process Credit Stats
        if (tinChiResponse.status === 200 && tinChiResponse.data?.code === 200) {
          setTinChiTichLuy(tinChiResponse.data.data);
        } else {
          console.warn("Could not fetch credit accumulation.");
        }

        // Process GPA Stats
        if (gpaResponse.status === 200 && gpaResponse.data?.code === 200) {
          setDiemTrungBinhHocKy(gpaResponse.data.data);
        } else {
          console.warn("Could not fetch GPA data.");
        }
      } catch (error) {
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [axiosPrivate, auth.user?.maSo]);

  // Update progress state based on fetched data
  useEffect(() => {
    if (!userInfo) return;

    const totalCredits = userInfo.soTinChiTichLuy ?? 0;
    const totalSemesters = tinChiTichLuy.length;

    if (totalSemesters > 0) {
      const avg = totalCredits / totalSemesters;
      if (avg < 10) {
        setProgressState({
          status: "Trễ tiến độ",
          color: "text-red-600",
          bg: "bg-red-50",
        });
      } else if (avg > 20) {
        setProgressState({
          status: "Vượt tiến độ",
          color: "text-green-600",
          bg: "bg-green-50",
        });
      } else {
        setProgressState({
          status: "Đúng tiến độ",
          color: "text-blue-600",
          bg: "bg-blue-50",
        });
      }
    } else {
      setProgressState({
        status: "Chưa có dữ liệu",
        color: "text-gray-600",
        bg: "bg-gray-50",
      });
    }
  }, [userInfo, tinChiTichLuy]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

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

  if (error) {
    return (
      <div className="p-4 text-center">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div
            className={`lg:col-span-1 content-center rounded-2xl p-6 transition-colors duration-300 ${
              userInfo?.canhBaoHocVu?.lyDo ? "bg-red-50" : progressState.bg
            }`}
          >
            <CreditProgressCard
              currentCredits={userInfo?.soTinChiTichLuy ?? 0}
              totalCredits={156}
            />
            {(() => {
              const classificationStyle = getAcademicClassificationStyle(
                userInfo?.xepLoaiHocLuc
              );
              const IconComponent = classificationStyle.icon;
              return (
                <div className="mt-6 space-y-2">
                  <div
                    className={`p-4 bg-white/60 rounded-lg border ${classificationStyle.borderColor} shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IconComponent
                          className={`w-5 h-5 ${classificationStyle.iconColor} mr-2`}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Xếp loại
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${classificationStyle.textColor}`}
                      >
                        {userInfo?.xepLoaiHocLuc ?? "Chưa xác định"}
                      </span>
                    </div>
                  </div>

                  {userInfo?.canhBaoHocVu?.lyDo && (
                    <div className="p-3 bg-white/60 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-xs text-red-700 font-semibold">
                            Cảnh báo học vụ:
                          </span>
                          <div className="text-xs text-red-700 mt-1 whitespace-pre-line">
                            {userInfo.canhBaoHocVu.lyDo}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="lg:col-span-2">
            {(() => {
              const combinedData = [];
              const maxLength = Math.max(
                tinChiTichLuy.length,
                diemTrungBinhHocKy.length
              );
              for (let i = 0; i < maxLength; i++) {
                const tinChiItem = tinChiTichLuy[i] || null;
                const diemItem = diemTrungBinhHocKy[i] || null;
                combinedData.push({
                  hocKy: diemItem?.hocKy || tinChiItem?.hocKy || null,
                  name: `Học kỳ ${i + 1}`,
                  soTinChiRot: tinChiItem?.soTinChiRot || 0,
                  soTinChiTichLuy: tinChiItem?.soTinChiTichLuy || 0,
                  diemTrungBinhTichLuy:
                    diemItem?.diemTrungBinhTichLuy || 0,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
          <div
            className={`text-center p-4 rounded-lg hover:bg-opacity-80 transition-colors ${progressState.bg}`}
          >
            <Target
              className={`w-8 h-8 mx-auto mb-2 ${progressState.color}`}
            />
            <p className="text-sm text-gray-600 mb-2">Tiến độ học tập</p>
            <p className={`text-xl font-bold ${progressState.color}`}>
              {progressState.status}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {tinChiTichLuy.length}
            </p>
            <p className="text-sm text-gray-600">Học kỳ đã hoàn thành</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
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
              {
                label: "Khóa học",
                value: userInfo?.khoaHoc,
                icon: Calendar,
              },
              {
                label: "Ngành học",
                value: userInfo?.tenNganh,
                icon: BookOpen,
              },
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
      </div>

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
