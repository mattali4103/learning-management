import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AdminDashboard = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalPrograms: 0,
    activeSemesters: 0
  });

  useEffect(() => {
    // Simulate loading admin statistics
    const loadStatistics = async () => {
      try {
        // TODO: Replace with actual API calls
        setStatistics({
          totalStudents: 1250,
          totalCourses: 456,
          totalPrograms: 25,
          activeSemesters: 2
        });
      } catch (error) {
        console.error("Error loading admin statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [axiosPrivate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) return "Chào buổi sáng";
    if (hour <= 18 && hour >= 12) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải thông tin quản trị...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {getGreeting()}, Giảng viên!
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <UserCheck className="w-4 h-4 mr-2" />
                Bảng điều khiển quản lý học vụ
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 flex items-center justify-end">
              <AlertCircle className="w-4 h-4 mr-1" />
              {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng sinh viên</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalStudents.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng học phần</p>
              <p className="text-3xl font-bold text-green-600">{statistics.totalCourses.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Chương trình đào tạo</p>
              <p className="text-3xl font-bold text-purple-600">{statistics.totalPrograms}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Học kỳ đang hoạt động</p>
              <p className="text-3xl font-bold text-orange-600">{statistics.activeSemesters}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Thống kê hệ thống</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Báo cáo tín chỉ", description: "Xem báo cáo tín chỉ tích lũy của sinh viên", action: "Xem báo cáo" },
              { label: "Thống kê điểm số", description: "Phân tích điểm trung bình theo ngành/khóa", action: "Xem thống kê" },
              { label: "Báo cáo tiến độ", description: "Theo dõi tiến độ học tập sinh viên", action: "Xem tiến độ" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <button 
                  onClick={() => alert(`Tính năng ${item.label} đang được phát triển`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Quản lý hệ thống</h2>
          </div>
          <div className="space-y-4">
            {[
              { 
                label: "Quản lý Lớp", 
                description: "Xem danh sách lớp, thống kê và theo dõi tiến độ học tập lớp", 
                action: "Xem danh sách",
                route: "/giangvien/students"
              },
              { 
                label: "Chương trình Đào tạo", 
                description: "Xem chương trình đào tạo các ngành thuộc khoa (chỉ đọc)", 
                action: "Xem chi tiết",
                route: "/giangvien/curriculum"
              },
              { 
                label: "Kế hoạch Học tập Mẫu", 
                description: "Tạo và quản lý kế hoạch học tập mẫu cho sinh viên", 
                action: "Quản lý",
                route: "/giangvien/study-plans"
              },
              { 
                label: "Thống kê & Báo cáo", 
                description: "Xem thống kê và báo cáo về tình hình học tập của khoa", 
                action: "Xem báo cáo",
                route: "/giangvien/reports"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <button 
                  onClick={() => navigate(item.route)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-whie rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center text-gray-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">
              Phiên đăng nhập: {auth.user?.maSo} | Quyền: Giảng viên
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="text-sm">
              Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
