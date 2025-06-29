import { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Edit2, Trash2, Clock, Users } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PageHeader from "../../components/PageHeader";

interface Course {
  id: string;
  maHocPhan: string;
  tenHocPhan: string;
  soTinChi: number;
  loaiHocPhan: string;
  khoa: string;
  nganh: string;
  namHoc: string;
  hocKy: number;
  moTa: string;
  soSinhVienDangKy: number;
  trangThai: "active" | "inactive";
  ngayTao: string;
}

const CourseManagement = () => {
  const axiosPrivate = useAxiosPrivate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        // TODO: Replace with actual API call
        const mockCourses: Course[] = [
          {
            id: "1",
            maHocPhan: "CT101",
            tenHocPhan: "Nhập môn Công nghệ thông tin",
            soTinChi: 3,
            loaiHocPhan: "Bắt buộc",
            khoa: "Công nghệ thông tin",
            nganh: "Kỹ thuật phần mềm",
            namHoc: "2023-2024",
            hocKy: 1,
            moTa: "Giới thiệu tổng quan về công nghệ thông tin",
            soSinhVienDangKy: 120,
            trangThai: "active",
            ngayTao: "2023-08-15"
          },
          {
            id: "2",
            maHocPhan: "CT201",
            tenHocPhan: "Cấu trúc dữ liệu và Giải thuật",
            soTinChi: 4,
            loaiHocPhan: "Bắt buộc",
            khoa: "Công nghệ thông tin",
            nganh: "Kỹ thuật phần mềm",
            namHoc: "2023-2024",
            hocKy: 2,
            moTa: "Nghiên cứu các cấu trúc dữ liệu và giải thuật cơ bản",
            soSinhVienDangKy: 95,
            trangThai: "active",
            ngayTao: "2023-08-15"
          },
          {
            id: "3",
            maHocPhan: "CT301",
            tenHocPhan: "Phát triển ứng dụng Web",
            soTinChi: 3,
            loaiHocPhan: "Tự chọn",
            khoa: "Công nghệ thông tin",
            nganh: "Kỹ thuật phần mềm",
            namHoc: "2023-2024",
            hocKy: 3,
            moTa: "Học cách phát triển ứng dụng web hiện đại",
            soSinhVienDangKy: 78,
            trangThai: "active",
            ngayTao: "2023-08-15"
          }
        ];
        setCourses(mockCourses);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [axiosPrivate]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.tenHocPhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.maHocPhan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || course.loaiHocPhan === selectedType;
    const matchesDepartment = selectedDepartment === "all" || course.khoa === selectedDepartment;
    return matchesSearch && matchesType && matchesDepartment;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Bắt buộc": return "text-red-600 bg-red-100";
      case "Tự chọn": return "text-blue-600 bg-blue-100";
      case "Tốt nghiệp": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách học phần...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý học phần"
        description="Thêm, sửa, xóa học phần và chương trình đào tạo"
        icon={BookOpen}
        iconColor="from-green-500 to-emerald-600"
        actions={
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Thêm học phần
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên học phần, mã học phần..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tất cả loại học phần</option>
            <option value="Bắt buộc">Bắt buộc</option>
            <option value="Tự chọn">Tự chọn</option>
            <option value="Tốt nghiệp">Tốt nghiệp</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tất cả khoa</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Kinh tế">Kinh tế</option>
            <option value="Nông nghiệp">Nông nghiệp</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học phần
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tín chỉ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khoa/Ngành
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Năm/Học kỳ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đăng ký
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{course.tenHocPhan}</div>
                      <div className="text-sm text-gray-500">{course.maHocPhan}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(course.loaiHocPhan)}`}>
                      {course.loaiHocPhan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {course.soTinChi}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{course.khoa}</div>
                    <div className="text-gray-500">{course.nganh}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{course.namHoc}</div>
                    <div className="text-gray-500">Học kỳ {course.hocKy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {course.soSinhVienDangKy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.trangThai)}`}>
                      {course.trangThai === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{courses.length}</p>
            <p className="text-sm text-gray-600">Tổng học phần</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{courses.filter(c => c.loaiHocPhan === "Bắt buộc").length}</p>
            <p className="text-sm text-gray-600">Bắt buộc</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{courses.filter(c => c.loaiHocPhan === "Tự chọn").length}</p>
            <p className="text-sm text-gray-600">Tự chọn</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{courses.reduce((sum, c) => sum + c.soSinhVienDangKy, 0)}</p>
            <p className="text-sm text-gray-600">Lượt đăng ký</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
