import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { PROFILE_SERVICE, KQHT_SERVICE } from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import TinChiChart from "../../components/chart/TinChiChart";
import GPAChart from "../../components/chart/GPAChart";
import CombinedCreditGPAChart from "../../components/chart/CombinedCreditGPAChart";
import CreditProgressCard from "../../components/progress/CreditProgressCard";
import PageHeader from "../../components/PageHeader";
import {
  User,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Target,
  ArrowLeft,
  Award,
  AlertTriangle,
  CheckCircle,
  Star,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import type { HocKy } from "../../hooks/useHocKyData";
import type { PreviewProfile } from "../../types/PreviewProfile";

interface ThongKeTinChiByHocKy {
  hocKy: HocKy;
  soTinChiCaiThien: number;
  soTinChiDangKy: number;
  soTinChiRot?: number;
  soTinChiTichLuy?: number;
}

interface DiemTrungBinhHocKy {
  hocKy: HocKy;
  diemTrungBinh: number;
  diemTrungBinhTichLuy: number;
}

const ThongTinSinhVien = () => {
  const { maSo, maLop } = useParams<{ maSo: string; maLop?: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [userInfo, setUserInfo] = useState<PreviewProfile | null>(null);
  const [tinChiTichLuy, setTinChiTichLuy] = useState<ThongKeTinChiByHocKy[]>(
    []
  );
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
    let totalCredits = 0;
    let totalSemesters = 0;
    if (typeof userInfo?.soTinChiTichLuy === "number") {
      totalCredits = userInfo.soTinChiTichLuy;
    }

    if (Array.isArray(tinChiTichLuy)) {
      totalSemesters = tinChiTichLuy.length;
    }
    console.log("Total Credits:", totalCredits);
    console.log("Total Semesters:", totalSemesters);
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
  }, [userInfo, tinChiTichLuy]);

  const [diemTrungBinhHocKy, setDiemTrungBinhHocKy] = useState<
    DiemTrungBinhHocKy[]
  >([]);

  // Helper function to get academic classification styling
  const getAcademicClassificationStyle = (xepLoai: string | undefined) => {
    if (!xepLoai) {
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-300",
        icon: AlertTriangle,
        iconColor: "text-gray-500",
        gradientFrom: "from-gray-400",
        gradientTo: "to-gray-500",
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
        gradientFrom: "from-purple-500",
        gradientTo: "to-indigo-600",
      };
    } else if (xepLoaiLower.includes("giỏi")) {
      return {
        bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
        textColor: "text-blue-900",
        borderColor: "border-blue-300",
        icon: Award,
        iconColor: "text-blue-600",
        gradientFrom: "from-blue-500",
        gradientTo: "to-cyan-600",
      };
    } else if (xepLoaiLower.includes("khá")) {
      return {
        bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
        textColor: "text-green-900",
        borderColor: "border-green-300",
        icon: CheckCircle,
        iconColor: "text-green-600",
        gradientFrom: "from-green-500",
        gradientTo: "to-emerald-600",
      };
    } else if (xepLoaiLower.includes("trung bình")) {
      return {
        bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
        textColor: "text-yellow-900",
        borderColor: "border-yellow-300",
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
        gradientFrom: "from-yellow-500",
        gradientTo: "to-orange-600",
      };
    } else {
      return {
        bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
        textColor: "text-red-900",
        borderColor: "border-red-300",
        icon: AlertTriangle,
        iconColor: "text-red-600",
        gradientFrom: "from-red-500",
        gradientTo: "to-pink-600",
      };
    }
  };

  // Fetch student information
  useEffect(() => {
    if (!maSo) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileResponse = await axiosPrivate.get(
          PROFILE_SERVICE.GET_SINHVIEN_PREVIEW_PROFILE.replace(":maSo", maSo)
        );

        if (
          profileResponse.status === 200 &&
          profileResponse.data?.code === 200
        ) {
          setUserInfo(profileResponse.data.data);
          // Fetch credit accumulation by semester
          try {
            const tinChiResponse = await axiosPrivate.get(
              KQHT_SERVICE.GET_THONGKE_TINCHI.replace(":maSo", maSo)
            );

            if (
              tinChiResponse.status === 200 &&
              tinChiResponse.data?.code === 200
            ) {
              setTinChiTichLuy(tinChiResponse.data.data);
            }
          } catch (error) {
            console.warn("Could not fetch credit accumulation:", error);
          }

          // Fetch GPA by semester
          try {
            const gpaResponse = await axiosPrivate.post(
              KQHT_SERVICE.GET_DIEM_TRUNG_BINH_BY_HOCKY,
              { maSo: maSo }
            );

            if (gpaResponse.status === 200 && gpaResponse.data?.code === 200) {
              setDiemTrungBinhHocKy(gpaResponse.data.data);
            }
          } catch (error) {
            console.warn("Could not fetch GPA data:", error);
          }
        } else {
          throw new Error(
            `API returned code: ${profileResponse.data?.code || profileResponse.status}`
          );
        }
      } catch (error) {
        setError("Không thể lấy thông tin sinh viên. Vui lòng thử lại.");
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [axiosPrivate, maSo]);

  // Navigation handlers
  const handleBack = () => {
    if (maLop) {
      const basePath = window.location.pathname.startsWith("/truongkhoa")
        ? "/truongkhoa"
        : "/giangvien";
      navigate(`${basePath}/lop/${maLop}`);
    } else {
      navigate("/giangvien/lop");
    }
  };

  const handleViewKHHT = () => {
    const basePath = window.location.pathname.startsWith("/truongkhoa")
      ? "/truongkhoa"
      : "/giangvien";
    navigate(`${basePath}/lop/${maLop}/student/${maSo}/khht`);
  };

  const handleViewKQHT = () => {
    const basePath = window.location.pathname.startsWith("/truongkhoa")
      ? "/truongkhoa"
      : "/giangvien";
    navigate(`${basePath}/lop/${maLop}/student/${maSo}/kqht`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <Loading
            showOverlay={false}
            message="Đang tải thông tin sinh viên..."
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 lg:p-6 space-y-6">
      {/* Keep existing PageHeader */}
      <PageHeader
        title={`Hồ sơ sinh viên: ${userInfo?.hoTen}`}
        description={`${userInfo?.maSo} - ${userInfo?.tenNganh}${maLop ? ` - Lớp ${maLop}` : ""}`}
        icon={GraduationCap}
        iconColor="from-blue-500 to-indigo-600"
        descriptionIcon={User}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={handleViewKHHT}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              Kế hoạch học tập
            </button>
            <button
              onClick={handleViewKQHT}
              className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Kết quả học tập
            </button>
          </div>
        }
        backButton={
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
      />

      {/* Progress Section similar to Dashboard */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Tiến độ học tập</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 justify-center items-center content-center">
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
                <div className="mt-6">
                  <div
                    className={`p-4 ${classificationStyle.bgColor} rounded-lg border ${classificationStyle.borderColor} shadow-sm`}
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

                  {/* Academic Warning - Compact Version */}
                  {userInfo?.canhBaoHocVu?.lyDo && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
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
          <div
            className={`text-center p-4 rounded-lg hover:bg-opacity-80 transition-colors ${progressState.bg}`}
          >
            <Target className={`w-8 h-8 mx-auto mb-2 ${progressState.color}`} />
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
          <div className="text-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors ">
            <GraduationCap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">
              {(((userInfo?.soTinChiTichLuy ?? 0) / 156) * 100).toFixed(1)}%
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

export default ThongTinSinhVien;
