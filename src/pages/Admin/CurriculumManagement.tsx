import { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Edit2, Eye, Copy, FileText, Calendar } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

interface CurriculumProgram {
  id: string;
  tenChuongTrinh: string;
  maChuongTrinh: string;
  nganh: string;
  khoaHoc: string;
  namBatDau: number;
  namKetThuc: number;
  tongTinChi: number;
  soHocKy: number;
  trangThai: "Đang áp dụng" | "Dự thảo" | "Ngừng áp dụng";
  ngayTao: string;
  nguoiTao: string;
  moTa: string;
}

interface Subject {
  id: string;
  maHocPhan: string;
  tenHocPhan: string;
  soTinChi: number;
  hocKy: number;
  loaiHocPhan: "Bắt buộc" | "Tự chọn" | "Tốt nghiệp";
  monTienQuyet?: string[];
}

const CurriculumManagement = () => {
  const axiosPrivate = useAxiosPrivate();
  const [programs, setPrograms] = useState<CurriculumProgram[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("programs");

  const facultyInfo = {
    tenKhoa: "Công nghệ thông tin",
    maKhoa: "CNTT"
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data cho chương trình đào tạo
        const mockPrograms: CurriculumProgram[] = [
          {
            id: "1",
            tenChuongTrinh: "Chương trình đào tạo Kỹ thuật phần mềm",
            maChuongTrinh: "KTPM2020",
            nganh: "Kỹ thuật phần mềm",
            khoaHoc: "2020-2024",
            namBatDau: 2020,
            namKetThuc: 2024,
            tongTinChi: 120,
            soHocKy: 8,
            trangThai: "Đang áp dụng",
            ngayTao: "2020-05-15",
            nguoiTao: "TS. Nguyễn Văn A",
            moTa: "Chương trình đào tạo cử nhân Kỹ thuật phần mềm theo chuẩn ABET"
          },
          {
            id: "2", 
            tenChuongTrinh: "Chương trình đào tạo Khoa học máy tính",
            maChuongTrinh: "KHMT2021",
            nganh: "Khoa học máy tính",
            khoaHoc: "2021-2025",
            namBatDau: 2021,
            namKetThuc: 2025,
            tongTinChi: 120,
            soHocKy: 8,
            trangThai: "Đang áp dụng",
            ngayTao: "2021-06-20",
            nguoiTao: "TS. Trần Thị B",
            moTa: "Chương trình đào tạo cử nhân Khoa học máy tính chuyên sâu về AI"
          },
          {
            id: "3",
            tenChuongTrinh: "Chương trình đào tạo KTPM cập nhật 2024",
            maChuongTrinh: "KTPM2024",
            nganh: "Kỹ thuật phần mềm",
            khoaHoc: "2024-2028",
            namBatDau: 2024,
            namKetThuc: 2028,
            tongTinChi: 125,
            soHocKy: 8,
            trangThai: "Dự thảo",
            ngayTao: "2024-01-10",
            nguoiTao: "TS. Lê Văn C",
            moTa: "Chương trình cập nhật với các môn học mới về DevOps, Cloud"
          }
        ];

        // Mock data cho môn học
        const mockSubjects: Subject[] = [
          {
            id: "1",
            maHocPhan: "CT101",
            tenHocPhan: "Nhập môn Công nghệ thông tin",
            soTinChi: 3,
            hocKy: 1,
            loaiHocPhan: "Bắt buộc"
          },
          {
            id: "2",
            maHocPhan: "CT201",
            tenHocPhan: "Cấu trúc dữ liệu và Giải thuật",
            soTinChi: 4,
            hocKy: 2,
            loaiHocPhan: "Bắt buộc",
            monTienQuyet: ["CT101"]
          },
          {
            id: "3",
            maHocPhan: "CT301",
            tenHocPhan: "Phát triển ứng dụng Web",
            soTinChi: 3,
            hocKy: 3,
            loaiHocPhan: "Tự chọn",
            monTienQuyet: ["CT201"]
          }
        ];

        setPrograms(mockPrograms);
        setSubjects(mockSubjects);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [axiosPrivate]);

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.tenChuongTrinh.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.maChuongTrinh.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMajor = selectedMajor === "all" || program.nganh === selectedMajor;
    const matchesStatus = selectedStatus === "all" || program.trangThai === selectedStatus;
    return matchesSearch && matchesMajor && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang áp dụng": return "text-green-600 bg-green-100";
      case "Dự thảo": return "text-yellow-600 bg-yellow-100";
      case "Ngừng áp dụng": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case "Bắt buộc": return "text-red-600 bg-red-100";
      case "Tự chọn": return "text-blue-600 bg-blue-100";
      case "Tốt nghiệp": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu chương trình đào tạo...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Chương trình Đào tạo - {facultyInfo.tenKhoa}</h1>
              <p className="text-gray-600">Quản lý chương trình đào tạo cho các ngành thuộc khoa</p>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Tạo chương trình mới
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng chương trình</p>
              <p className="text-3xl font-bold text-green-600">{programs.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đang áp dụng</p>
              <p className="text-3xl font-bold text-blue-600">
                {programs.filter(p => p.trangThai === "Đang áp dụng").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Dự thảo</p>
              <p className="text-3xl font-bold text-yellow-600">
                {programs.filter(p => p.trangThai === "Dự thảo").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit2 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng môn học</p>
              <p className="text-3xl font-bold text-purple-600">{subjects.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === "programs"
                ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">Chương trình đào tạo</span>
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === "subjects"
                ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">Môn học</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chương trình, môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tất cả ngành</option>
              <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
              <option value="Khoa học máy tính">Khoa học máy tính</option>
              <option value="Hệ thống thông tin">Hệ thống thông tin</option>
            </select>
            {activeTab === "programs" && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang áp dụng">Đang áp dụng</option>
                <option value="Dự thảo">Dự thảo</option>
                <option value="Ngừng áp dụng">Ngừng áp dụng</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "programs" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chương trình
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngành học
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khóa học
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
                  {filteredPrograms.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{program.tenChuongTrinh}</div>
                          <div className="text-sm text-gray-500">{program.maChuongTrinh}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.nganh}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{program.khoaHoc}</div>
                        <div className="text-gray-500">{program.soHocKy} học kỳ</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.tongTinChi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(program.trangThai)}`}>
                          {program.trangThai}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-900 p-1 rounded-lg hover:bg-purple-50">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tín chỉ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học kỳ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn tiên quyết
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subject.tenHocPhan}</div>
                          <div className="text-sm text-gray-500">{subject.maHocPhan}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubjectTypeColor(subject.loaiHocPhan)}`}>
                          {subject.loaiHocPhan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subject.soTinChi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subject.hocKy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subject.monTienQuyet ? subject.monTienQuyet.join(", ") : "Không"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurriculumManagement;
