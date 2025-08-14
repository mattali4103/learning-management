import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  Search,
  Filter,
  User,
  ChevronDown,
  List,
  Grid3X3,
  Download,
  BarChart3,
  UserCheck,
} from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { PROFILE_SERVICE } from "../../api/apiEndPoints";
import PageHeader from "../../components/PageHeader";
import { StudentTable } from "../../components/table/StudentTable";
import StudentClassificationPieChart, {
  type PreviewProfile,
} from "../../components/chart/XepLoaiSinhVienPieChart";
import AccumulatedCreditBarChart from "../../components/chart/AccumulatedCreditBarChart";
import StudentTooltip from "../../components/tooltips/StudentTooltip";
import { useTablePDFExport } from "../../hooks/useTablePDFExport";
import ExportModal from "../../components/modals/ExportModal";
import useAuth from "../../hooks/useAuth";

const ThongTinLopHoc = () => {
  const { maLop } = useParams<{ maLop: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [previewProfiles, setPreviewProfiles] = useState<PreviewProfile[]>([]);

  const [error, setError] = useState<string | null>(null);

  // PDF Export hook
  const { exportCustomTable } = useTablePDFExport();

  // Enhanced student list states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">(
    "all"
  );
  const [filterClassification, setFilterClassification] = useState("all");
  const [filterCreditRange, setFilterCreditRange] = useState<string | null>(
    null
  );
  const [filterCanhBao, setFilterCanhBao] = useState<
    "all" | "warning" | "normal"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "maSo" | "khoaHoc">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const studentsPerPage = 12;

  // Tab state
  const [activeTab, setActiveTab] = useState<"students" | "statistics">(
    "statistics"
  );

  // Export modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedClassifications, setSelectedClassifications] = useState<
    string[]
  >([]);

  // Modal states for student preview
  const [selectedStudentForPreview, setSelectedStudentForPreview] =
    useState<PreviewProfile | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Navigation handler
  const handleViewStudentProfile = (maSo: string) => {
    navigate(`/giangvien/lop/${maLop}/student/${maSo}`);
  };

  // Preview tooltip handlers
  const handleShowStudentPreview = (
    student: PreviewProfile,
    event: React.MouseEvent
  ) => {
    // If clicking the same student, toggle tooltip
    if (selectedStudentForPreview?.maSo === student.maSo && isTooltipVisible) {
      handleHidePreview();
      return;
    }

    setSelectedStudentForPreview(student);
    setMousePosition({ x: event.clientX, y: event.clientY });
    setIsTooltipVisible(true);
  };

  const handleHidePreview = () => {
    setIsTooltipVisible(false);
    setSelectedStudentForPreview(null);
  };

  const handleViewStudentDetails = (maSo: string) => {
    window.open(`/giangvien/lop/${maLop}/student/${maSo}`, "_blank");
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest("[data-student-card]") &&
        !target.closest("[data-student-tooltip]")
      ) {
        handleHidePreview();
      }
    };

    if (isTooltipVisible) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isTooltipVisible]);

  // Fetch preview profiles for all students in the class
  const fetchAllPreviewProfiles = useCallback(async () => {
    if (!maLop) return;

    setLoading(true);
    try {
      // If user is a GIANGVIEN, check if they are in charge of this class
      if (auth?.user?.roles === "GIANGVIEN") {
        const maSoGiangVien = auth.user.maSo;
        const response = await axiosPrivate.get(
          PROFILE_SERVICE.GET_DS_LOP_CHUNHIEM.replace(":maSo", maSoGiangVien)
        );

        if (response.data.code === 200 && Array.isArray(response.data.data)) {
          const assignedClasses = response.data.data.map(
            (lop: any) => lop.maLop
          );
          if (!assignedClasses.includes(maLop)) {
            setError("Bạn không có quyền xem thông tin của lớp này.");
            setPreviewProfiles([]);
            setLoading(false);
            return;
          }
        } else {
          // Handle case where fetching assigned classes fails
          setError("Không thể xác thực quyền truy cập cho lớp này.");
          setPreviewProfiles([]);
          setLoading(false);
          return;
        }
      }

      // Proceed to fetch student profiles for the class
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_PREVIEW_PROFILE.replace(":maLop", maLop)
      );

      if (response.data.code === 200 && response.data.data) {
        const profilesData: PreviewProfile[] = response.data.data;
        setPreviewProfiles(profilesData);
        setError(null);
      } else {
        setPreviewProfiles([]);
        // Optionally set a more specific error message if needed
        setError(
          response.data.message ||
            "Không tìm thấy thông tin sinh viên cho lớp này."
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
      setPreviewProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [maLop, axiosPrivate, auth]);

  // Lọc và sắp xếp sinh viên - Bây giờ sử dụng PreviewProfile trực tiếp
  const getFilteredAndSortedStudents = () => {
    if (!previewProfiles || previewProfiles.length === 0) return [];

    // Process students to update classification for those with 0 credits and 0 GPA
    const processedStudents = previewProfiles.map((student) => {
      // If student has 0 accumulated credits and 0 GPA, classify as "Kém"
      if (
        (student.soTinChiTichLuy === 0 || !student.soTinChiTichLuy) &&
        (student.diemTrungBinhTichLuy === 0 || !student.diemTrungBinhTichLuy)
      ) {
        return {
          ...student,
          xepLoaiHocLuc: student.xepLoaiHocLuc || "Kém",
        };
      }
      return student;
    });

    const filtered = processedStudents.filter((student) => {
      const matchesSearch =
        student.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.maSo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.tenNganh.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender =
        filterGender === "all" ||
        (filterGender === "male" && student.gioiTinh) ||
        (filterGender === "female" && !student.gioiTinh);

      const matchesClassification =
        filterClassification === "all" ||
        student.xepLoaiHocLuc === filterClassification;

      const matchesCreditRange = () => {
        if (!filterCreditRange) return true;

        const credits = student.soTinChiTichLuy || 0;
        const rangeParts = filterCreditRange.replace(" tín chỉ", "").split("-");

        if (rangeParts.length === 2) {
          const min = parseInt(rangeParts[0], 10);
          const max = parseInt(rangeParts[1], 10);
          return credits >= min && credits <= max;
        } else if (filterCreditRange.startsWith(">")) {
          const min = parseInt(filterCreditRange.replace(">", "").replace(" tín chỉ", ""), 10);
          return credits > min;
        }
        return true;
      };

      const matchesCanhBao =
        filterCanhBao === "all" ||
        (filterCanhBao === "warning" &&
          student.canhBaoHocVu &&
          student.canhBaoHocVu.lyDo &&
          student.canhBaoHocVu.lyDo.trim() !== "") ||
        (filterCanhBao === "normal" &&
          (!student.canhBaoHocVu ||
            !student.canhBaoHocVu.lyDo ||
            student.canhBaoHocVu.lyDo.trim() === ""));

      return (
        matchesSearch &&
        matchesGender &&
        matchesClassification &&
        matchesCreditRange() &&
        matchesCanhBao
      );
    });

    // Lọc sinh viên
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

  // Logic phân trang
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
  }, [
    searchTerm,
    filterGender,
    filterClassification,
    filterCreditRange,
    filterCanhBao,
    sortBy,
    sortOrder,
  ]);

  // Fetch thống kê tín chỉ của lớp

  // Process students for charts - Apply same logic as filtering
  const getProcessedStudentsForCharts = () => {
    if (!previewProfiles || previewProfiles.length === 0) return [];

    return previewProfiles.map((student) => {
      // Nếu sinh viên có 0 tín chỉ tích lũy và 0 điểm trung bình, phân loại là "Kém"
      if (
        (student.soTinChiTichLuy === 0 || !student.soTinChiTichLuy) &&
        (student.diemTrungBinhTichLuy === 0 || !student.diemTrungBinhTichLuy)
      ) {
        return {
          ...student,
          xepLoaiHocLuc: student.xepLoaiHocLuc || "Kém",
        };
      }
      return student;
    });
  };

  // Lấy các xếp loại học lực có sẵn trong lớp
  const getAvailableClassifications = () => {
    const students = getProcessedStudentsForCharts();
    const classifications = [
      ...new Set(students.map((student) => student.xepLoaiHocLuc)),
    ];
    return classifications.filter(
      (classification) => classification && classification.trim() !== ""
    );
  };

  const handleClassificationClick = (classification: string) => {
    setActiveTab("students");
    setFilterClassification(classification);
    setFilterCreditRange(null); // Reset other filter
  };

  const handleCreditRangeClick = (range: string) => {
    setActiveTab("students");
    setFilterCreditRange(range);
    setFilterClassification("all"); // Reset other filter
  };

  // Quay lại danh sách lớp
  const backToClassList = () => {
    navigate("/giangvien/lop");
  };

  // Export danh sách sinh viên theo xếp loại
  const handleExportStudentList = () => {
    if (!selectedClassifications || selectedClassifications.length === 0) {
      alert("Vui lòng chọn ít nhất một xếp loại để xuất");
      return;
    }

    // Get all processed students
    const allProcessedStudents = getProcessedStudentsForCharts();

    // Filter data based on selection
    let dataToExport;
    let titleSuffix;
    let filenameSuffix;

    if (selectedClassifications[0] === "all") {
      // Export all students
      dataToExport = allProcessedStudents;
      titleSuffix = "Tất cả";
      filenameSuffix = "danh-sach-sinh-vien";
    } else {
      // Xuất file theo xếp loại đã chọn
      dataToExport = allProcessedStudents.filter((student) =>
        selectedClassifications.includes(student.xepLoaiHocLuc)
      );
      titleSuffix = `xếp loại: ${selectedClassifications.join(", ")}`;
      filenameSuffix = `xep-loai-${selectedClassifications.join("-").toLowerCase()}`;
    }

    if (!dataToExport || dataToExport.length === 0) {
      alert("Không có dữ liệu sinh viên để xuất");
      return;
    }

    const columns = [
      { header: "MSSV", dataKey: "maSo", width: 30 },
      { header: "Họ và tên", dataKey: "hoTen", width: 50 },
      {
        header: "Giới tính",
        dataKey: "gioiTinh",
        width: 20,
        align: "center" as const,
        formatter: (value: boolean) => (value ? "Nam" : "Nữ"),
      },
      {
        header: "Ngày sinh",
        dataKey: "ngaySinh",
        width: 30,
        align: "center" as const,
        formatter: (value: Date) =>
          value ? new Date(value).toLocaleDateString("vi-VN") : "N/A",
      },
      {
        header: "Điểm TB",
        dataKey: "diemTrungBinhTichLuy",
        width: 20,
        align: "center" as const,
        formatter: (value: number) =>
          value !== undefined && value !== null ? value.toFixed(2) : "0.00",
      },
    ];

    const title = `Danh sách sinh viên lớp ${maLop} (${titleSuffix})`;
    const filename = `danh-sach-sinh-vien-lop-${maLop}-${filenameSuffix}.pdf`;

    exportCustomTable(dataToExport, columns, title, filename);
    setShowExportModal(false);
    setSelectedClassifications([]); // Reset selection
  };

  // Load dữ liệu khi component mount hoặc maLop thay đổi
  useEffect(() => {
    if (maLop) {
      fetchAllPreviewProfiles();
    }
  }, [maLop, fetchAllPreviewProfiles]);
  // Hiển thị loading
  if (loading) {
    return (
      <div className="min-h-[calc(100vh - 64px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
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

  // Hiển thị thông báo khi lớp không có sinh viên nào
  if (!loading && (!previewProfiles || previewProfiles.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        {/* Header */}
        <PageHeader
          title={`Quản lý lớp ${maLop}`}
          description="Lớp học chưa có sinh viên"
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

        {/* Empty State */}
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Lớp {maLop} chưa có sinh viên
            </h2>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={backToClassList}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Quay lại danh sách lớp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bỏ qua trường hợp không có sinh viên nào trong lớp
  // Bỏ qua kiểm tra selectedClass vì giờ chúng ta sử dụng previewProfiles trực tiếp

  return (
    <div className="bg-gradient-to-br h-full from-blue-50 via-white to-indigo-50 p-4  flex flex-col">
      {/* Header */}
      <PageHeader
        title={`Quản lý lớp ${maLop}`}
        description={`Sĩ số: ${previewProfiles?.length || 0} sinh viên`}
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
        actions={
          previewProfiles && previewProfiles.length > 0 ? (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Xuất PDF</span>
            </button>
          ) : null
        }
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      {previewProfiles && previewProfiles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "statistics"
                  ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Thống kê & Biểu đồ</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "students"
                  ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Danh sách sinh viên</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {previewProfiles?.length || 0}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Statistics Charts */}
      {previewProfiles &&
        previewProfiles.length > 0 &&
        activeTab === "statistics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96">
            <div className="h-80">
              <StudentClassificationPieChart
                students={getProcessedStudentsForCharts()}
                onClassificationClick={handleClassificationClick}
              />
            </div>
            <div className="h-80">
              <AccumulatedCreditBarChart
                students={getProcessedStudentsForCharts()}
                onRangeClick={handleCreditRangeClick}
              />
            </div>
          </div>
        )}

      {/* Empty Statistics Message */}
      {previewProfiles &&
        previewProfiles.length === 0 &&
        activeTab === "statistics" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-3">
                Chưa có dữ liệu thống kê
              </h3>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                Biểu đồ thống kê sẽ hiển thị khi lớp có sinh viên. 
                Các biểu đồ sẽ bao gồm phân loại học lực và thống kê tín chỉ tích lũy.
              </p>
            </div>
          </div>
        )}

      {/* Students List */}
      {activeTab === "students" && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
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
                {filterClassification !== "all" && (
                  <p className="text-sm text-blue-600 mt-1">
                    Đang lọc theo xếp loại:{" "}
                    <span className="font-semibold">{filterClassification}</span>
                  </p>
                )}
                {filterCreditRange && (
                  <p className="text-sm text-blue-600 mt-1">
                    Đang lọc theo tín chỉ:{" "}
                    <span className="font-semibold">{filterCreditRange}</span>
                  </p>
                )}
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

                {/* Clear active chart filters */}
                {(filterClassification !== "all" || filterCreditRange) && (
                  <button
                    onClick={() => {
                      setFilterClassification("all");
                      setFilterCreditRange(null);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <span>Xoá bộ lọc biểu đồ</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                      setFilterGender(
                        e.target.value as "all" | "male" | "female"
                      )
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>

                  {/* Classification Filter */}
                  <select
                    value={filterClassification}
                    onChange={(e) => setFilterClassification(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả xếp loại</option>
                    <option value="Xuất sắc">Xuất sắc</option>
                    <option value="Giỏi">Giỏi</option>
                    <option value="Khá">Khá</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Yếu">Yếu</option>
                    <option value="Kém">Kém</option>
                    <option value="Chưa xác định">Chưa xác định</option>
                  </select>

                  {/* Cảnh báo học vụ Filter */}
                  <select
                    value={filterCanhBao}
                    onChange={(e) =>
                      setFilterCanhBao(
                        e.target.value as "all" | "warning" | "normal"
                      )
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="warning">Có cảnh báo</option>
                    <option value="normal">Bình thường</option>
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

          {previewProfiles?.length > 0 ? (
            <>
              {/* Student Display */}
              <div className="p-4 flex-1 overflow-y-auto">
                {getFilteredAndSortedStudents().length === 0 ? (
                  /* No students match current filters */
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Không tìm thấy sinh viên
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      Không có sinh viên nào phù hợp với bộ lọc hiện tại. 
                      Vui lòng thử điều chỉnh các tiêu chí tìm kiếm.
                    </p>
                    
                    {/* Quick filter reset options */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Xóa từ khóa: "{searchTerm}"
                        </button>
                      )}
                      {filterClassification !== "all" && (
                        <button
                          onClick={() => setFilterClassification("all")}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Xóa lọc xếp loại: {filterClassification}
                        </button>
                      )}
                      {filterGender !== "all" && (
                        <button
                          onClick={() => setFilterGender("all")}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          Xóa lọc giới tính
                        </button>
                      )}
                      {filterCanhBao !== "all" && (
                        <button
                          onClick={() => setFilterCanhBao("all")}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                          Xóa lọc cảnh báo
                        </button>
                      )}
                      {filterCreditRange && (
                        <button
                          onClick={() => setFilterCreditRange(null)}
                          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          Xóa lọc tín chỉ: {filterCreditRange}
                        </button>
                      )}
                      
                      {/* Reset all filters button */}
                      {(searchTerm || filterClassification !== "all" || filterGender !== "all" || filterCanhBao !== "all" || filterCreditRange) && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setFilterClassification("all");
                            setFilterGender("all");
                            setFilterCanhBao("all");
                            setFilterCreditRange(null);
                          }}
                          className="px-4 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                        >
                          Xóa tất cả bộ lọc
                        </button>
                      )}
                    </div>
                  </div>
                ) : viewMode === "grid" ? (
                  /* Grid View - Card Layout with Avatar Left + Info Right */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {getPaginatedStudents().students.map((previewProfile) => {
                      const isSelected =
                        selectedStudentForPreview?.maSo ===
                          previewProfile.maSo && isTooltipVisible;
                      return (
                        <div
                          key={previewProfile.maSo}
                          data-student-card
                          className={`bg-white border rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer group ${
                            isSelected
                              ? "border-blue-500 shadow-md ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                          onClick={(e) =>
                            handleShowStudentPreview(previewProfile, e)
                          }
                        >
                          {/* Main Content Area */}
                          <div className="flex items-center space-x-2">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                              {previewProfile.avatarUrl ? (
                                <img
                                  src={previewProfile.avatarUrl}
                                  alt={`Avatar của ${previewProfile.hoTen}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to default icon if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.className =
                                        "w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform";
                                      parent.innerHTML =
                                        '<User className="w-5 h-5 text-white" />';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Student Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                                {previewProfile.hoTen}
                              </h3>
                              <p className="text-xs text-gray-500 font-mono">
                                {previewProfile.maSo}
                              </p>
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <span>
                                  {previewProfile.gioiTinh ? "Nam" : "Nữ"}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  {previewProfile.ngaySinh
                                    ? new Date(
                                        previewProfile.ngaySinh
                                      ).toLocaleDateString("vi-VN")
                                    : "N/A"}
                                </span>
                                {/* Cảnh báo học vụ - inline */}
                                {previewProfile.canhBaoHocVu &&
                                  previewProfile.canhBaoHocVu.lyDo &&
                                  previewProfile.canhBaoHocVu.lyDo.trim() !==
                                    "" && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span
                                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs"
                                        title="Nguy cơ cảnh báo học vụ"
                                      >
                                        ⚠️
                                      </span>
                                    </>
                                  )}
                              </div>
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
                    loading={false}
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
                            Math.min(
                              prev + 1,
                              getPaginatedStudents().totalPages
                            )
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
        </div>
      )}

      {/* Student Tooltip */}
      <div data-student-tooltip>
        <StudentTooltip
          student={selectedStudentForPreview}
          isVisible={isTooltipVisible}
          position={mousePosition}
          delay={300} // 300ms delay
          onViewDetails={handleViewStudentDetails}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        availableClassifications={getAvailableClassifications()}
        selectedClassifications={selectedClassifications}
        onClassificationChange={setSelectedClassifications}
        onExport={handleExportStudentList}
      />
    </div>
  );
};

export default ThongTinLopHoc;
