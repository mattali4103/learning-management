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

  return (
    <StudentProfileLayout
      userInfo={userInfo}
      tinChiTichLuy={tinChiTichLuy}
      diemTrungBinhHocKy={diemTrungBinhHocKy}
      progressState={progressState}
      header={header}
      showWelcomeHeader={false}
    />
  );
};

export default ThongTinSinhVien;
