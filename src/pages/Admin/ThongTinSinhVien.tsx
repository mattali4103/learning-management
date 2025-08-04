import { useParams, useNavigate } from "react-router-dom";
import useStudentProfileData from "../../hooks/useStudentProfileData";
import StudentProfileLayout from "../../components/layouts/StudentProfileLayout";
import Loading from "../../components/Loading";
import PageHeader from "../../components/PageHeader";
import {
  GraduationCap,
  ArrowLeft,
  FileText,
  ClipboardCheck,
  User,
  Target,
  AlertTriangle,
  Clock,
  BookOpen,
} from "lucide-react";

const ThongTinSinhVien = () => {
  const { maSo, maLop } = useParams<{ maSo: string; maLop?: string }>();
  const navigate = useNavigate();

  // Use the common hook for student profile data
  const {
    userInfo,
    tinChiTichLuy,
    diemTrungBinhHocKy,
    progressState,
    loading,
    error,
  } = useStudentProfileData({ maSo });

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

  // Check if no student data found
  if (!loading && !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Không tìm thấy thông tin sinh viên
            </h2>
            <p className="text-gray-600 mb-4">
              Sinh viên với mã số <strong>{maSo}</strong> không tồn tại trong hệ thống.
            </p>
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

  const header = (
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
  );

  const additionalContent = (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
              Tiến độ
            </span>
          </div>
          <h3 className="text-lg font-bold text-emerald-800 mb-2">
            {progressState.status}
          </h3>
          <p className="text-sm text-emerald-600">
            {progressState.avg ? `${progressState.avg.toFixed(1)} tín chỉ/học kỳ` : 'Chưa có dữ liệu'}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-600">
            <span>Tổng: {progressState.totalCredits} TC</span>
            <span>Học kỳ: {progressState.totalSemesters}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              Học tập
            </span>
          </div>
          <h3 className="text-lg font-bold text-blue-800 mb-2">
            {userInfo?.xepLoaiHocLuc || "Chưa xác định"}
          </h3>
          <p className="text-sm text-blue-600">
            Xếp loại học lực hiện tại
          </p>
          <div className="mt-4 text-xs text-blue-600">
            <span>Điểm TB: {userInfo?.diemTrungBinhTichLuy?.toFixed(2) || "0.00"}</span>
          </div>
        </div>
      </div>

      {/* No Academic Data Message */}
      {(!tinChiTichLuy || tinChiTichLuy.length === 0) && (!diemTrungBinhHocKy || diemTrungBinhHocKy.length === 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-l-4 border-yellow-400">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center">
                📊 Chưa có dữ liệu học tập
              </h3>
              <div className="bg-white/70 p-4 rounded-lg">
                <p className="text-sm text-yellow-700 leading-relaxed">
                  Hiện tại chưa có thông tin về kết quả học tập và tín chỉ tích lũy của sinh viên. 
                  Dữ liệu sẽ được cập nhật sau khi sinh viên hoàn thành các học kỳ.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Vui lòng kiểm tra lại sau</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Academic Warning Card */}
      {userInfo?.canhBaoHocVu?.lyDo && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border-l-4 border-red-400">
          <div className="flex items-start">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                🚨 Cảnh báo học vụ
              </h3>
              <div className="bg-white/70 p-4 rounded-lg">
                <p className="text-sm text-red-700 leading-relaxed">
                  {userInfo.canhBaoHocVu.lyDo}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-red-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Cần được xem xét và giải quyết</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Guide Card - Only show if there's academic data */}
      {((tinChiTichLuy && tinChiTichLuy.length > 0) || (diemTrungBinhHocKy && diemTrungBinhHocKy.length > 0)) && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-800">Hướng dẫn học tập</h3>
              <p className="text-sm text-purple-600">Một số lời khuyên dành cho bạn</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">📚 Học tập hiệu quả</h4>
              <p className="text-sm text-purple-700">
                Duy trì lịch học đều đặn và tham gia đầy đủ các buổi học
              </p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">⏰ Quản lý thời gian</h4>
              <p className="text-sm text-purple-700">
                Lập kế hoạch học tập rõ ràng cho từng học kỳ
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <StudentProfileLayout
      userInfo={userInfo}
      tinChiTichLuy={tinChiTichLuy}
      diemTrungBinhHocKy={diemTrungBinhHocKy}
      progressState={progressState}
      header={header}
      additionalContent={additionalContent}
      showWelcomeHeader={false}
    />
  );
};

export default ThongTinSinhVien;
