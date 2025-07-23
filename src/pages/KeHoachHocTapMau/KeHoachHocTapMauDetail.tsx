import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CollapsibleCourseTable } from "../../components/table/CollapsibleCourseTable";

import PageHeader from "../../components/PageHeader";
import StatisticsCard from "../../components/StatisticsCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  HOCPHAN_SERVICE,
  KHHT_SERVICE,
  PROFILE_SERVICE,
} from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";
import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";
import DeleteModal from "../../components/modals/DeleteModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import type { Khoa } from "../../types/Khoa";
import type { HocPhanTuChon } from "../../types/HocPhanTuChon";

interface KeHoachHocTapDetail {
  id: string;
  hocPhan: HocPhan;
  hocKy: HocKy;
  hocPhanCaiThien: boolean;
}
const KeHoachHocTapMauDetail = () => {
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
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hocPhanTuChon, setHocPhanTuChon] = useState<HocPhanTuChon[]>([]);

  const [selectedHocPhan, setSelectedHocPhan] =
    useState<KeHoachHocTapDetail | null>(null);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("tatca");

  const maKhoa = auth.user?.maKhoa || "";

  const fetchHocPhanTuChon = useCallback(async () => {
    setLoading(true);
    try {
      if (!khoaHoc || !maNganh) {
        throw new Error("Missing required parameters: khoaHoc or maNganh");
      }
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_HOC_PHAN_TU_CHON_LIST,
        {
          params: {
            khoaHoc: khoaHoc,
            maNganh: maNganh,
          },
        }
      );
      if (response.data.code === 200 && Array.isArray(response.data.data)) {
        const hocPhanTuChon: HocPhanTuChon[] = response.data.data || [];
        console.log("Fetched elective subjects:", hocPhanTuChon);
        setHocPhanTuChon(hocPhanTuChon);
      }
    } catch (error) {
      console.error("Error fetching elective subjects:", error);
      setError("Lỗi khi tải danh sách học phần tự chọn");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, khoaHoc, maNganh]);

  // Fetch template details based on URL parameters
  const fetcKHHTDetail = useCallback(async () => {
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
    fetcKHHTDetail();
    fetchHocPhanTuChon();
  }, [fetcKHHTDetail, fetchHocPhanTuChon]);

  const handleBack = () => {
    navigate("/giangvien/study-plans");
  };

  // Xoá học phần khi xác nhận xoá
  const confirmDelete = async () => {
    if (selectedHocPhan) {
      // Đóng modal xác nhận ngay khi bấm đồng ý
      setShowDeleteModal(false);
      setSelectedHocPhan(null);
      setLoading(true);
      try {
        const response = await axiosPrivate.delete(
          KHHT_SERVICE.KHHT_MAU_DELETE,
          {
            data: {
              id: selectedHocPhan.id,
            },
          }
        );
        setSuccessMessage(response.data.message || "Xóa học phần thành công.");
        setSuccessModalOpen(true);
        // Xoá khỏi UI
        const updatedDetails = templateDetails.filter(
          (detail) => detail.id !== selectedHocPhan.id
        );
        setTemplateDetails(updatedDetails);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi xóa học phần."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeletePlan = () => {
    setShowDeletePlanModal(true);
  };

  const confirmDeletePlan = async () => {
    setLoading(true);
    if (!maNganh || !khoaHoc) {
      setError("Không thể xác định kế hoạch học tập để xóa.");
      return;
    }
    try {
      const response = await axiosPrivate.delete(
        KHHT_SERVICE.KHHT_MAU_DELETE_BY_KHOAHOC,
        {
          data: {
            maNganh: maNganh,
            khoaHoc: khoaHoc,
          },
        }
      );
      if (response.data.code == 200) {
        setSuccessMessage(
          response.data.message || "Xóa kế hoạch học tập thành công."
        );
        setShowDeletePlanModal(false);
        setSuccessModalOpen(true);
      }
    } catch (err) {
      console.error("Error deleting study plan:", err);
      setError("Đã xảy ra lỗi khi xóa kế hoạch học tập. Vui lòng thử lại.");
      setShowDeletePlanModal(false); // Close modal on error to show the error message
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from template details
  const statistics = useMemo(() => {
    const totalCredits = templateDetails.reduce(
      (sum, detail) => sum + detail.hocPhan.tinChi,
      0
    );
    const totalSubjects = templateDetails.length;

    // Group by semester (unique by both year and semester name)
    const semesterSet = new Set<string>();
    templateDetails.forEach((detail) => {
      if (detail.hocKy && detail.hocKy.tenHocKy && detail.hocKy.namHoc) {
        const key = `${detail.hocKy.tenHocKy}__${detail.hocKy.namHoc.namBatDau}-${detail.hocKy.namHoc.namKetThuc}`;
        semesterSet.add(key);
      }
    });

    return {
      totalCredits,
      totalSubjects,
      totalSemesters: semesterSet.size,
    };
  }, [templateDetails]);

  // Get filtered data based on course type
  const allCourses = useMemo(() => templateDetails || [], [templateDetails]);

  const filteredCoursesByType = useMemo(() => {
    if (activeDetailTab === "tatca") {
      return allCourses;
    }
    return allCourses.filter(
      (detail) => detail.hocPhan.loaiHp === activeDetailTab
    );
  }, [allCourses, activeDetailTab]);

  // Calculate statistics by course type
  const courseTypeStatistics = useMemo(() => {
    const totalCourses = allCourses.length;
    const daiCuongCourses = allCourses.filter(
      (detail) => detail.hocPhan.loaiHp === "Đại cương"
    ).length;
    const coSoNganhCourses = allCourses.filter(
      (detail) => detail.hocPhan.loaiHp === "Cơ sở ngành"
    ).length;
    const chuyenNganhCourses = allCourses.filter(
      (detail) => detail.hocPhan.loaiHp === "Chuyên ngành"
    ).length;

    return {
      totalCourses,
      daiCuongCourses,
      coSoNganhCourses,
      chuyenNganhCourses,
    };
  }, [allCourses]);

  // Get elective course groups for the current active tab
  const filteredElectiveGroups = useMemo(() => {
    const allGroups = hocPhanTuChon || [];
    if (activeDetailTab === "tatca") {
      return allGroups;
    }

    // Filter groups that have courses of the selected type
    return allGroups.filter((nhom) =>
      nhom.hocPhanTuChonList?.some((hp) => hp.loaiHp === activeDetailTab)
    );
  }, [hocPhanTuChon, activeDetailTab]);

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
      {successModalOpen && successMessage && (
        <SuccessMessageModal
          isOpen={successModalOpen}
          message={successMessage}
          onClose={() => {
            setSuccessModalOpen(false);
            setSuccessMessage(null);
          }}
        />
      )}
      {/* Header */}
      <PageHeader
        title={`Kế hoạch Học tập Mẫu`}
        description={`Ngành: ${tenNganh} • Khóa: ${khoaHoc} • Mã ngành: ${maNganh}`}
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
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              onClick={() =>
                navigate(`/giangvien/study-plans/edit/${maNganh}/${khoaHoc}`)
              }
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <Edit className="w-5 h-5 mr-2" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDeletePlan}
              className="flex items-center px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Xóa
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
      {/* Tab content */}
      <>
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Course Type Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveDetailTab("tatca")}
              className={`flex-1 px-6 py-3 text-center transition-colors ${
                activeDetailTab === "tatca"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">
                Tất cả ({courseTypeStatistics.totalCourses})
              </span>
            </button>
            <button
              onClick={() => setActiveDetailTab("Đại cương")}
              className={`flex-1 px-6 py-3 text-center transition-colors ${
                activeDetailTab === "Đại cương"
                  ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">
                Đại Cương ({courseTypeStatistics.daiCuongCourses})
              </span>
            </button>
            <button
              onClick={() => setActiveDetailTab("Cơ sở ngành")}
              className={`flex-1 px-6 py-3 text-center transition-colors ${
                activeDetailTab === "Cơ sở ngành"
                  ? "bg-purple-50 text-purple-700 border-b-2 border-purple-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">
                Cơ Sở Ngành ({courseTypeStatistics.coSoNganhCourses})
              </span>
            </button>
            <button
              onClick={() => setActiveDetailTab("Chuyên ngành")}
              className={`flex-1 px-6 py-4 text-center transition-colors ${
                activeDetailTab === "Chuyên ngành"
                  ? "bg-orange-50 text-orange-700 border-b-2 border-orange-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">
                Chuyên Ngành ({courseTypeStatistics.chuyenNganhCourses})
              </span>
            </button>
          </div>

          {/* Course Content */}
          <div className="p-3">
            {filteredCoursesByType.length === 0 &&
            filteredElectiveGroups.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {activeDetailTab === "tatca"
                    ? "Chưa có học phần nào"
                    : `Chưa có học phần ${activeDetailTab}`}
                </h3>
                <p className="text-gray-500">
                  {activeDetailTab === "tatca"
                    ? "Kế hoạch học tập mẫu này chưa có học phần nào được thêm vào."
                    : `Hiện tại chưa có học phần ${activeDetailTab} nào`}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Required Courses Section */}
                {filteredCoursesByType.length > 0 && (
                  <div className="overflow-hidden mb-8">
                    <CollapsibleCourseTable
                      name={
                        activeDetailTab === "tatca"
                          ? "Kế hoạch học tập"
                          : `Học phần ${activeDetailTab}`
                      }
                      requiredCourses={filteredCoursesByType.map(
                        (detail) => detail.hocPhan
                      )}
                      electiveGroups={filteredElectiveGroups as any}
                      activeTab={activeDetailTab}
                      loading={loading}
                      emptyStateTitle="Không có học phần"
                      emptyStateDescription="Không có học phần phù hợp với bộ lọc hiện tại."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
      {/* Delete Confirmation Modal for deleting a subject */}
      <DeleteModal
        isOpen={showDeleteModal && !!selectedHocPhan}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedHocPhan(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa học phần"
        message={
          selectedHocPhan
            ? `Bạn có chắc chắn muốn xóa học phần "${selectedHocPhan.hocPhan.tenHp}" khỏi kế hoạch học tập mẫu không?`
            : "Bạn có chắc chắn muốn xóa học phần này khỏi kế hoạch học tập mẫu không?"
        }
        isLoading={false}
      />

      {/* Delete Plan Confirmation Modal for deleting the whole plan */}
      <DeleteModal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        onConfirm={confirmDeletePlan}
        title="Xác nhận xóa kế hoạch học tập"
        message={`Bạn có chắc chắn muốn xóa toàn bộ kế hoạch học tập mẫu cho ngành "${tenNganh}" khóa "${khoaHoc}"? Toàn bộ kế hoạch sẽ bị xóa vĩnh viễn.`}
        isLoading={false}
      />
    </div>
  );
};

export default KeHoachHocTapMauDetail;
