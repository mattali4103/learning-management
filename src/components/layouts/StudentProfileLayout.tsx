import type { ReactNode } from "react";
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
  Star 
} from "lucide-react";
import CreditProgressCard from "../progress/CreditProgressCard";
import CombinedCreditGPAChart from "../chart/CombinedCreditGPAChart";
import PageHeader from "../PageHeader";
import type { PreviewProfile } from "../../types/PreviewProfile";
import type { HocKy } from "../../types/HocKy";

interface ThongKeTinChiByHocKy {
  hocKy: HocKy;
  soTinChiCaiThien?: number;
  soTinChiDangKy?: number;
  soTinChiRot?: number;
  soTinChiTichLuy?: number;
}

interface DiemTrungBinhHocKy {
  hocKy: HocKy;
  diemTrungBinh: number;
  diemTrungBinhTichLuy: number;
}

interface ProgressState {
  status: string;
  color: string;
  bg: string;
  avg?: number | null;
  totalCredits?: number;
  totalSemesters?: number;
}

interface StudentProfileLayoutProps {
  userInfo: PreviewProfile | null;
  tinChiTichLuy: ThongKeTinChiByHocKy[];
  diemTrungBinhHocKy: DiemTrungBinhHocKy[];
  progressState: ProgressState;
  header?: ReactNode;
  additionalContent?: ReactNode;
  showWelcomeHeader?: boolean;
  getGreeting?: () => string;
}

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

const StudentProfileLayout: React.FC<StudentProfileLayoutProps> = ({
  userInfo,
  tinChiTichLuy,
  diemTrungBinhHocKy,
  progressState,
  header,
  additionalContent,
  showWelcomeHeader = false,
  getGreeting,
}) => {
  // Prepare combined chart data
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 lg:p-6 space-y-6">
      {/* Header */}
      {header}

      {/* Welcome Header - Only show if requested */}
      {showWelcomeHeader && (
        <PageHeader
          title={`${getGreeting ? getGreeting() : "Xin chào"}, ${userInfo?.hoTen?.split(" ").pop()}!`}
          description={`${userInfo?.maSo} - ${userInfo?.tenNganh}`}
          icon={User}
          iconColor="from-blue-500 to-indigo-600"
          descriptionIcon={GraduationCap}
          actions={
            <div className="text-right">
              <p className="text-sm text-gray-500 flex items-center justify-end">
                <Clock className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
          }
        />
      )}

      {/* Progress Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Tiến độ học tập</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div
            className={`lg:col-span-1 content-center rounded-xl p-4 transition-colors duration-300 ${
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
                <div className="mt-4 space-y-2">
                  <div
                    className={`p-3 bg-white/60 rounded-lg border ${classificationStyle.borderColor} shadow-sm`}
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
            <CombinedCreditGPAChart
              data={combinedData}
              title="Tín chỉ & Điểm trung bình theo học kỳ"
              height={300}
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
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
        </div>
      </div>

      {/* Student Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">
            Thông tin sinh viên
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Additional Content */}
      {additionalContent && (
        <div className="space-y-6">
          {additionalContent}
        </div>
      )}

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

export default StudentProfileLayout;
export type { 
  StudentProfileLayoutProps, 
  ThongKeTinChiByHocKy, 
  DiemTrungBinhHocKy, 
  ProgressState 
};
