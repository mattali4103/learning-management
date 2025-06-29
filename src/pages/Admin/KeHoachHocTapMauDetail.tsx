import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import PageHeader from "../../components/PageHeader";
import StatisticsCard from "../../components/StatisticsCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE, PROFILE_SERVICE } from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";
import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";

interface Nganh {
  maNganh: string | number;
  tenNganh: string;
}

interface KeHoachHocTapDetail {
  id: string;
  hocPhan: HocPhan;
  hocKy: HocKy;
  hocPhanCaiThien: boolean;
}

interface Khoa {
  maKhoa: string;
  tenKhoa: string;
  dsnganh: Nganh[];
}

const KeHoachHocTapMauDetail: React.FC = () => {
  const { maNganh, khoaHoc } = useParams<{
    maNganh: string;
    khoaHoc: string;
  }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  // States - simplified
  const [templateDetails, setTemplateDetails] = useState<KeHoachHocTapDetail[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenNganh, setTenNganh] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHocPhan, setSelectedHocPhan] =
    useState<KeHoachHocTapDetail | null>(null);

  const maKhoa = auth.user?.maKhoa || "";

  // Fetch template details based on URL parameters
  const fetchTemplateDetails = useCallback(async () => {
    if (!maNganh || !khoaHoc) {
      setError("Thiếu thông tin mã ngành hoặc khóa học");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, get the nganh info
      const khoaResponse = await axiosPrivate.get(
        PROFILE_SERVICE.GET_KHOA.replace(":maKhoa", maKhoa)
      );

      if (khoaResponse.data.code === 200 && khoaResponse.data.data) {
        const khoaData = khoaResponse.data.data as Khoa;

        if (!khoaData || !khoaData.dsnganh) {
          setError("Không tìm thấy thông tin khoa hoặc ngành");
          setLoading(false);
          return;
        }

        const nganh = khoaData.dsnganh?.find(
          (n) => n.maNganh.toString() === maNganh
        );

        if (!nganh) {
          setError("Không tìm thấy thông tin ngành");
          setLoading(false);
          return;
        }

        setTenNganh(nganh.tenNganh);

        // Then get the template details
        const templateResponse = await axiosPrivate.get(
          KHHT_SERVICE.KHHT_MAU_BY_KHOAHOC_MA_NGANH,
          {
            params: {
              khoaHoc: khoaHoc,
              maNganh: maNganh,
            },
          }
        );

        if (
          templateResponse.data.data &&
          Array.isArray(templateResponse.data.data)
        ) {
          setTemplateDetails(templateResponse.data.data);
        } else {
          setError("Không tìm thấy dữ liệu kế hoạch học tập mẫu");
        }
      } else {
        setError("Không thể lấy thông tin khoa");
      }
    } catch (err) {
      console.error("Error fetching template details:", err);
      setError("Lỗi khi tải dữ liệu kế hoạch học tập mẫu");
    } finally {
      setLoading(false);
    }
  }, [maNganh, khoaHoc, maKhoa, axiosPrivate]);

  useEffect(() => {
    fetchTemplateDetails();
  }, [fetchTemplateDetails]);

  const handleBack = () => {
    navigate("/giangvien/study-plans");
  };

  // Handler functions for actions
  const handleViewDetail = useCallback((detail: KeHoachHocTapDetail) => {
    // Tính năng xem chi tiết học phần - có thể navigate đến trang khác
    console.log("Xem chi tiết học phần:", detail.hocPhan.tenHp);
  }, []);

  const handleEditDetail = useCallback((detail: KeHoachHocTapDetail) => {
    // Tính năng chỉnh sửa học phần - có thể navigate đến trang edit
    console.log("Chỉnh sửa học phần:", detail.hocPhan.tenHp);
  }, []);

  const handleDeleteDetail = useCallback((detail: KeHoachHocTapDetail) => {
    setSelectedHocPhan(detail);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = () => {
    if (selectedHocPhan) {
      // Xóa học phần khỏi danh sách
      const updatedDetails = templateDetails.filter(
        (detail) => detail.id !== selectedHocPhan.id
      );
      setTemplateDetails(updatedDetails);
      setShowDeleteModal(false);
      setSelectedHocPhan(null);

      // TODO: Gọi API để xóa trên server
      console.log("Đã xóa học phần:", selectedHocPhan.hocPhan.tenHp);
    }
  };

  const handleAddHocPhan = () => {
    // Tính năng thêm học phần mới
    console.log("Thêm học phần mới");
  };

  // Enhanced columns with actions and better styling
  const columns = useMemo<ColumnDef<KeHoachHocTapDetail>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600">
              {row.index + 1}
            </span>
          </div>
        ),
        size: 80,
      },
      {
        id: "maHp",
        accessorKey: "hocPhan.maHp",
        header: "Mã học phần",
        cell: ({ getValue }) => (
          <div className="font-mono text-sm text-blue-700 px-3 py-1.5">
            {getValue() as string}
          </div>
        ),
        size: 140,
      },
      {
        id: "tenHp",
        accessorKey: "hocPhan.tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="max-w-xs">
            <div className="font-semibold text-gray-900 text-sm leading-tight">
              {getValue() as string}
            </div>
          </div>
        ),
        size: 300,
      },
      {
        id: "soTinChi",
        accessorKey: "hocPhan.tinChi",
        header: "Tín chỉ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-emerald-700 ">
              {getValue() as number}
            </span>
          </div>
        ),
        size: 100,
      },
      {
        id: "hocKy",
        accessorKey: "hocKy.tenHocKy",
        header: "Học kỳ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
              {getValue() as string}
            </span>
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const detail = row.original;
          return (
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => handleViewDetail(detail)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105"
                title="Xem chi tiết"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditDetail(detail)}
                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all duration-200 hover:scale-105"
                title="Chỉnh sửa"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteDetail(detail)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 140,
      },
    ],
    [handleViewDetail, handleEditDetail, handleDeleteDetail]
  );

  // Calculate statistics from template details
  const statistics = useMemo(() => {
    const totalCredits = templateDetails.reduce(
      (sum, detail) => sum + detail.hocPhan.tinChi,
      0
    );
    const totalSubjects = templateDetails.length;

    // Group by semester
    const semesterGroups = templateDetails.reduce(
      (acc, detail) => {
        const semesterKey = detail.hocKy.tenHocKy;
        if (!acc[semesterKey]) {
          acc[semesterKey] = [];
        }
        acc[semesterKey].push(detail);
        return acc;
      },
      {} as Record<string, KeHoachHocTapDetail[]>
    );

    return {
      totalCredits,
      totalSubjects,
      totalSemesters: Object.keys(semesterGroups).length,
      semesterGroups,
    };
  }, [templateDetails]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Đang tải chi tiết kế hoạch học tập mẫu...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title={`Kế hoạch Học tập Mẫu - ${tenNganh}`}
        description={`Khóa ${khoaHoc} • ${maNganh}`}
        icon={BookOpen}
        iconColor="from-purple-500 to-indigo-600"
        descriptionIcon={GraduationCap}
        backButton={
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/giangvien/study-plans/edit/${maNganh}/${khoaHoc}`)}
              className="flex items-center px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleAddHocPhan}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm học phần
            </button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatisticsCard
          title="Tổng số tín chỉ"
          value={statistics.totalCredits}
          subtitle="tín chỉ"
          icon={BookOpen}
          colorScheme="blue"
          size="md"
          style="modern"
        />
        <StatisticsCard
          title="Tổng số học phần"
          value={statistics.totalSubjects}
          subtitle="học phần"
          icon={GraduationCap}
          colorScheme="green"
          size="md"
          style="modern"
        />
        <StatisticsCard
          title="Số học kỳ"
          value={statistics.totalSemesters}
          subtitle="học kỳ"
          icon={BookOpen}
          colorScheme="purple"
          size="md"
          style="modern"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết kế hoạch học tập
              </h2>
              <p className="text-gray-600 mt-1">
                {templateDetails.length} học phần đã được lên kế hoạch
              </p>
            </div>
          </div>
        </div>

        {templateDetails.length > 0 ? (
          <div className="overflow-hidden">
            <KeHoachHocTapTable
              name="Chi tiết kế hoạch học tập mẫu"
              data={templateDetails}
              columns={columns}
            />
          </div>
        ) : (
          <div className="p-16 text-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              Chưa có học phần nào
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Kế hoạch học tập mẫu này chưa có học phần nào được thêm vào. Hãy
              thêm học phần đầu tiên.
            </p>
            <button
              onClick={handleAddHocPhan}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm học phần đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHocPhan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Xác nhận xóa
                </h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                Bạn có chắc chắn muốn xóa học phần{" "}
                <span className="font-semibold text-blue-600">
                  "{selectedHocPhan.hocPhan.tenHp}"
                </span>{" "}
                khỏi kế hoạch học tập mẫu không?
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedHocPhan(null);
                }}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Xóa học phần
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeHoachHocTapMauDetail;
