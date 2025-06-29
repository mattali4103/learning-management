import { useState, useEffect } from "react";
import { Users, Search, Filter, Eye, AlertTriangle, TrendingUp } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PageHeader from "../../components/PageHeader";

interface Student {
  id: string;
  maSinhVien: string;
  hoTen: string;
  email: string;
  khoa: string;
  nganh: string;
  khoaHoc: string;
  namNhapHoc: number;
  gpa: number;
  soTinChiTichLuy: number;
  trangThaiHocTap: "Bình thường" | "Cảnh báo" | "Buộc thôi học";
  hocKyHienTai: number;
  ngayCapNhat: string;
}

const ThonTinSinhVien = () => {
  const axiosPrivate = useAxiosPrivate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data cho khoa của giảng viên
  const facultyInfo = {
    tenKhoa: "Công nghệ thông tin",
    maKhoa: "CNTT"
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
        // TODO: Fetch students từ API theo khoa của giảng viên
        const mockStudents: Student[] = [
          {
            id: "1",
            maSinhVien: "B2012001",
            hoTen: "Nguyễn Văn An",
            email: "nvan@student.ctu.edu.vn",
            khoa: "Công nghệ thông tin",
            nganh: "Kỹ thuật phần mềm",
            khoaHoc: "2020-2024",
            namNhapHoc: 2020,
            gpa: 3.25,
            soTinChiTichLuy: 95,
            trangThaiHocTap: "Bình thường",
            hocKyHienTai: 7,
            ngayCapNhat: "2024-01-15"
          },
          {
            id: "2",
            maSinhVien: "B2012002",
            hoTen: "Trần Thị Bình",
            email: "ttbinh@student.ctu.edu.vn",
            khoa: "Công nghệ thông tin",
            nganh: "Khoa học máy tính",
            khoaHoc: "2020-2024",
            namNhapHoc: 2020,
            gpa: 2.85,
            soTinChiTichLuy: 88,
            trangThaiHocTap: "Cảnh báo",
            hocKyHienTai: 7,
            ngayCapNhat: "2024-01-15"
          },
          {
            id: "3",
            maSinhVien: "B2112003",
            hoTen: "Lê Hoàng Cường",
            email: "lhcuong@student.ctu.edu.vn",
            khoa: "Công nghệ thông tin",
            nganh: "Hệ thống thông tin",
            khoaHoc: "2021-2025",
            namNhapHoc: 2021,
            gpa: 3.65,
            soTinChiTichLuy: 72,
            trangThaiHocTap: "Bình thường",
            hocKyHienTai: 5,
            ngayCapNhat: "2024-01-15"
          }
        ];
        setStudents(mockStudents);
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [axiosPrivate]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.maSinhVien.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || student.khoaHoc === selectedCourse;
    const matchesMajor = selectedMajor === "all" || student.nganh === selectedMajor;
    const matchesStatus = selectedStatus === "all" || student.trangThaiHocTap === selectedStatus;
    return matchesSearch && matchesCourse && matchesMajor && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bình thường": return "text-green-600 bg-green-100";
      case "Cảnh báo": return "text-yellow-600 bg-yellow-100";
      case "Buộc thôi học": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.5) return "text-green-600";
    if (gpa >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách sinh viên...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title={`Quản lý Sinh viên - ${facultyInfo.tenKhoa}`}
        description="Theo dõi tiến độ học tập sinh viên thuộc khoa"
        icon={Users}
        iconColor="from-blue-500 to-indigo-600"
      />

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng sinh viên</p>
              <p className="text-3xl font-bold text-blue-600">{students.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">GPA trung bình</p>
              <p className="text-3xl font-bold text-green-600">
                {students.length > 0 ? (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cần cảnh báo</p>
              <p className="text-3xl font-bold text-yellow-600">
                {students.filter(s => s.trangThaiHocTap === "Cảnh báo").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tín chỉ TB/SV</p>
              <p className="text-3xl font-bold text-purple-600">
                {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.soTinChiTichLuy, 0) / students.length) : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã sinh viên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả khóa học</option>
            <option value="2020-2024">2020-2024</option>
            <option value="2021-2025">2021-2025</option>
            <option value="2022-2026">2022-2026</option>
            <option value="2023-2027">2023-2027</option>
          </select>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả ngành</option>
            <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
            <option value="Khoa học máy tính">Khoa học máy tính</option>
            <option value="Hệ thống thông tin">Hệ thống thông tin</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Cảnh báo">Cảnh báo</option>
            <option value="Buộc thôi học">Buộc thôi học</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sinh viên
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngành học
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPA
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tín chỉ
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.hoTen}</div>
                      <div className="text-sm text-gray-500">{student.maSinhVien}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.nganh}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{student.khoaHoc}</div>
                    <div className="text-gray-500">Học kỳ {student.hocKyHienTai}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${getGpaColor(student.gpa)}`}>
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.soTinChiTichLuy}/120
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.trangThaiHocTap)}`}>
                      {student.trangThaiHocTap}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThonTinSinhVien;
