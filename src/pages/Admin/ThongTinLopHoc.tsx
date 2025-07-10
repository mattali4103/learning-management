import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Eye,
  BookOpen,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  GraduationCap,
  User,
  ChevronDown,
  List,
  Grid3X3,
} from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE, PROFILE_SERVICE } from "../../api/apiEndPoints";
import PageHeader from "../../components/PageHeader";
import { StudentTable } from "../../components/table/StudentTable";
import StudentClassificationPieChart from "../../components/chart/XepLoaiSinhVienPieChart";
import AccumulatedCreditBarChart from "../../components/chart/AccumulatedCreditBarChart";

interface PreviewProfile {
  avatarUrl: string;
  maSo: string;
  hoTen: string;
  maLop: string;
  tenNganh: string;
  xepLoaiHocLuc: string;
  diemTrungBinhTichLuy: number;
  soTinChiTichLuy: number;
  soTinChiCaiThien: number;
  soTinChiDangKyHienTai: number;
  khoaHoc: string;
  maNganh: string;
  ngaySinh: Date;
  gioiTinh: boolean;
}

interface ThongKeKHHTLOP {
  maSo: string;
  soTinChiDangKy: number;
  soTinChiCaiThien: number;
}

const ThongTinLopHoc = () => {
  const { maLop } = useParams<{ maLop: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [previewProfiles, setPreviewProfiles] = useState<PreviewProfile[]>([]);
  const [statistics, setStatistics] = useState<ThongKeKHHTLOP[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Enhanced student list states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "maSo" | "khoaHoc">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const studentsPerPage = 8;

  // Navigation handler
  const handleViewStudentProfile = (maSo: string) => {
    navigate(`/giangvien/lop/${maLop}/student/${maSo}`);
  };

  // Fetch preview profiles for all students in the class
  const fetchAllPreviewProfiles = useCallback(async () => {
    if (!maLop) return;

    try {
      setLoading(true);
      console.log("Fetching preview profiles for class:", maLop);

      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_PREVIEW_PROFILE.replace(":maLop", maLop)
      );

      console.log("Preview profiles response:", response.data);

      if (response.data.code === 200 && response.data.data) {
        // The API returns an array of PreviewProfile objects
        const profilesData: PreviewProfile[] = response.data.data;
        console.log("Setting preview profiles:", profilesData);
        setPreviewProfiles(profilesData);
        setError(null);
      } else {
        console.log("No preview profiles from API");
        setPreviewProfiles([]);
      }
    } catch (error) {
      console.error("Error fetching preview profiles:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
      setPreviewProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [maLop, axiosPrivate]);

  // Filter and sort students - Now using PreviewProfile directly
  const getFilteredAndSortedStudents = () => {
    if (!previewProfiles || previewProfiles.length === 0) return [];

    const filtered = previewProfiles.filter((student) => {
      const matchesSearch =
        student.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.maSo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.tenNganh.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender =
        filterGender === "all" ||
        (filterGender === "male" && student.gioiTinh) ||
        (filterGender === "female" && !student.gioiTinh);

      return matchesSearch && matchesGender;
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.hoTen;
          bValue = b.hoTen;
          break;
        case "maSo":
          aValue = a.maSo;
          bValue = b.maSo;
          break;
        case "khoaHoc":
          aValue = a.khoaHoc;
          bValue = b.khoaHoc;
          break;
        default:
          aValue = a.hoTen;
          bValue = b.hoTen;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === "asc" ? comparison : -comparison;
      }
      return 0;
    });

    return filtered;
  };

  // Pagination logic
  const getPaginatedStudents = () => {
    const filtered = getFilteredAndSortedStudents();
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    return {
      students: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / studentsPerPage),
    };
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGender, sortBy, sortOrder]);

  // Fetch thống kê tín chỉ của lớp
  const fetchThongKeTinChi = useCallback(async () => {
    if (!maLop) return;

    try {
      setDetailLoading(true);
      const response = await axiosPrivate.post(
        KHHT_SERVICE.COUNT_TINCHI_IN_LOP.replace(":maLop", maLop)
      );
      if (response.data.code === 200 && response.data.data) {
        setStatistics(response.data.data);
      } else {
        // Không có dữ liệu thống kê không phải là lỗi nghiêm trọng
        setStatistics([]);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Không set error cho thống kê vì có thể lớp chưa có dữ liệu
      setStatistics([]);
    } finally {
      setDetailLoading(false);
    }
  }, [axiosPrivate, maLop]);

  // Quay lại danh sách lớp
  const backToClassList = () => {
    navigate("/giangvien/lop");
  };

  // Load dữ liệu khi component mount hoặc maLop thay đổi
  useEffect(() => {
    if (maLop) {
      fetchAllPreviewProfiles();
      fetchThongKeTinChi();
    }
  }, [maLop, fetchAllPreviewProfiles, fetchThongKeTinChi]);
  // Hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Đang tải thông tin lớp...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu không tìm thấy lớp
  if (error && previewProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={backToClassList}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại danh sách lớp
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Skip rendering if still loading
  // Removed the check for selectedClass since we're now using previewProfiles directly

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title={`Quản lý lớp ${maLop}`}
        description={`Sĩ số: ${previewProfiles?.length || 0} sinh viên • Chủ nhiệm: N/A`}
        icon={Users}
        iconColor="from-blue-500 to-indigo-600"
        backButton={
          <button
            onClick={backToClassList}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics Charts */}
      {previewProfiles && previewProfiles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentClassificationPieChart students={previewProfiles} />
          <AccumulatedCreditBarChart students={previewProfiles} />
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Danh sách sinh viên trong lớp
              </h2>
              <p className="text-gray-600">
                {getFilteredAndSortedStudents().length} /{" "}
                {previewProfiles?.length || 0} sinh viên
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Lưới</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Danh sách</span>
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sinh viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Gender Filter */}
                <select
                  value={filterGender}
                  onChange={(e) =>
                    setFilterGender(e.target.value as "all" | "male" | "female")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "maSo" | "khoaHoc")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sắp xếp theo tên</option>
                  <option value="maSo">Sắp xếp theo mã số</option>
                  <option value="khoaHoc">Sắp xếp theo khóa học</option>
                </select>

                {/* Sort Order */}
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {detailLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <span className="mt-3 text-gray-600">
              Đang tải thông tin sinh viên...
            </span>
          </div>
        ) : previewProfiles?.length > 0 ? (
          <>
            {/* Student Display */}
            <div className="p-6">
              {viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPaginatedStudents().students.map((previewProfile) => {
                    return (
                      <div
                        key={previewProfile.maSo}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 text-sm">
                                  {previewProfile.hoTen}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {previewProfile.maSo}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <GraduationCap className="w-3 h-3" />
                                <span>
                                  Khóa {previewProfile.khoaHoc || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <BookOpen className="w-3 h-3" />
                                <span className="truncate">
                                  {previewProfile.tenNganh || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <User className="w-3 h-3" />
                                <span>
                                  {previewProfile.gioiTinh ? "Nam" : "Nữ"}
                                </span>
                              </div>

                              {previewProfile.ngaySinh && (
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(
                                      previewProfile.ngaySinh
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                              )}

                              {/* Enhanced Credit and GPA Statistics */}
                              <div className="mt-2 p-2 bg-gray-50 rounded">
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-blue-600 font-medium">
                                      Tín chỉ tích luỹ:
                                    </span>
                                    <span className="font-semibold">
                                      {previewProfile.soTinChiTichLuy || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-green-600 font-medium">
                                      GPA:
                                    </span>
                                    <span className="font-semibold">
                                      {previewProfile.diemTrungBinhTichLuy?.toFixed(
                                        2
                                      ) || "0.00"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-orange-600 font-medium">
                                      Tín Chỉ Cải thiện:
                                    </span>
                                    <span className="font-semibold text-orange-600">
                                      {previewProfile.soTinChiCaiThien || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-600 font-medium">
                                      Tín Chỉ Đăng Ký Hiện Tại:
                                    </span>
                                    <span className="font-semibold">
                                      {previewProfile.soTinChiDangKyHienTai ||
                                        0}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-1 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      previewProfile.xepLoaiHocLuc ===
                                      "Xuất sắc"
                                        ? "bg-purple-100 text-purple-700"
                                        : previewProfile.xepLoaiHocLuc ===
                                            "Giỏi"
                                          ? "bg-green-100 text-green-700"
                                          : previewProfile.xepLoaiHocLuc ===
                                              "Khá"
                                            ? "bg-blue-100 text-blue-700"
                                            : previewProfile.xepLoaiHocLuc ===
                                                "Trung bình"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {previewProfile.xepLoaiHocLuc ||
                                      "Chưa xác định"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() =>
                                handleViewStudentProfile(previewProfile.maSo)
                              }
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Xem hồ sơ sinh viên"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View - Using TanStack Table */
                <StudentTable
                  data={getFilteredAndSortedStudents()}
                  loading={detailLoading}
                  onViewProfile={handleViewStudentProfile}
                />
              )}
            </div>

            {/* Pagination - Only for Grid View */}
            {viewMode === "grid" && getPaginatedStudents().totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * studentsPerPage + 1}-
                    {Math.min(
                      currentPage * studentsPerPage,
                      getPaginatedStudents().total
                    )}
                    trong tổng số {getPaginatedStudents().total} sinh viên
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    {Array.from(
                      { length: getPaginatedStudents().totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === getPaginatedStudents().totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => {
                        if (index > 0 && array[index - 1] < page - 1) {
                          return [
                            <span
                              key={`ellipsis-${page}`}
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>,
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 text-sm border rounded ${
                                currentPage === page
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>,
                          ];
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm border rounded ${
                              currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, getPaginatedStudents().totalPages)
                        )
                      }
                      disabled={
                        currentPage === getPaginatedStudents().totalPages
                      }
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Chưa có sinh viên
            </h3>
            <p className="text-gray-500">Lớp này chưa có sinh viên nào</p>
          </div>
        )}

        {/* Statistics Table */}
        {statistics.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                Thống kê tín chỉ chi tiết theo sinh viên
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Dữ liệu này đã được tích hợp vào danh sách sinh viên ở trên
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThongTinLopHoc;
