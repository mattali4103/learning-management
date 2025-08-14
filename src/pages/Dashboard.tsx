
import useAuth from "../hooks/useAuth";
import useStudentProfileData from "../hooks/useStudentProfileData";
import StudentProfileLayout from "../components/layouts/StudentProfileLayout";
import Loading from "../components/Loading";

const Dashboard = () => {
  const { auth } = useAuth();
  const maSo = auth.user?.maSo;
  const {
    userInfo,
    tinChiTichLuy,
    diemTrungBinhHocKy,
    progressState,
    loading,
    error,
  } = useStudentProfileData({ maSo });
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
    <StudentProfileLayout
      userInfo={userInfo}
      tinChiTichLuy={tinChiTichLuy}
      diemTrungBinhHocKy={diemTrungBinhHocKy}
      progressState={progressState}
      showWelcomeHeader={true}
      getGreeting={getGreeting}
    />
  );
};

export default Dashboard;
