import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Users, GraduationCap, Edit, Trash2 } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import type { HocPhan } from "../../types/HocPhan";
import type { Nganh } from "../../types/Nganh";
import Loading from "../../components/Loading";
import PageHeader from "../../components/PageHeader";
import StatisticsCard from "../../components/StatisticsCard";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import { HocPhanTable } from "../../components/table/HocPhanTable";
import DeleteModal from "../../components/modals/DeleteModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";

interface HocPhanTuChon{
    id: number;
    tenNhom: string;
    tinChiYeuCau: number;
    khoaHoc: string;
    maNganh: number;
    hocPhanTuChonList: HocPhan[];
}

interface ChuongTrinhDaoTaoDetail {
  id: number;
  khoaHoc: string;
  tongSoTinChi: number;
  tongSoTinChiTuChon: number;
  nganh: Nganh;
  hocPhanList: HocPhan[];
  nhomHocPhanTuChon: HocPhanTuChon[];
}

const CTDTDetail = () => {
  const { maNganh, khoaHoc } = useParams<{ maNganh: string; khoaHoc: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  
  const [chuongTrinhDaoTao, setChuongTrinhDaoTao] = useState<ChuongTrinhDaoTaoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to copy course code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`Đã sao chép: ${text}`);
      })
      .catch((error) => {
        alert("Không thể sao chép mã học phần");
        console.error("Copy to clipboard failed:", error);
      });
  };

  // Fetch chi tiết chương trình đào tạo
  const fetchCTDTDetail = useCallback(async () => {
    if (!maNganh || !khoaHoc) return;
    
    try {
      setLoading(true);
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_NGANH_KHOAHOC.replace(":maNganh", maNganh).replace(":khoaHoc", khoaHoc)
      );
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        console.log(data)
        setChuongTrinhDaoTao({
          id: data.id || 0,
          khoaHoc: data.khoaHoc || "",
          tongSoTinChi: data.tongSoTinChi || 0,
          tongSoTinChiTuChon: data.tongSoTinChiTuChon || 0,
          nganh: data.nganh || { maNganh: maNganh, tenNganh: "Mạng máy tính và truyền thông dữ liệu" },
          hocPhanList: data.hocPhanList || [],
          nhomHocPhanTuChon: data.nhomHocPhanTuChon || [],
        });
      }
    } catch (error) {
      console.error("Error fetching CTDT detail:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maNganh, khoaHoc]);

  useEffect(() => {
    fetchCTDTDetail();
  }, [fetchCTDTDetail]);

  const handleEdit = () => {
    if (maNganh && khoaHoc) {
      navigate(`/giangvien/ctdt/edit/${maNganh}/${khoaHoc}`);
    }
  };

  const handleDelete = async () => {
    if (!chuongTrinhDaoTao) return;
    setIsDeleting(true);
    try {
      await axiosPrivate.delete(HOCPHAN_SERVICE.CTDT_DELETE.replace(":id", chuongTrinhDaoTao.id.toString()));
      setSuccessMessage("Xóa chương trình đào tạo thành công!");
      setShowSuccessModal(true);
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        navigate("/giangvien/ctdt");
      }, 1500);
    } catch (err) {
      setErrorMessage("Không thể xóa chương trình đào tạo. Vui lòng thử lại.");
      setShowErrorModal(true);
      console.error("Error deleting CTDT:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get all courses
  const allCourses = useMemo(() => chuongTrinhDaoTao?.hocPhanList || [], [chuongTrinhDaoTao?.hocPhanList]);
  
  // Get all elective course groups
  const allElectiveGroups = useMemo(() => chuongTrinhDaoTao?.nhomHocPhanTuChon || [], [chuongTrinhDaoTao?.nhomHocPhanTuChon]);


  if (loading) {
    return <Loading />;
  }

  if (!chuongTrinhDaoTao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy chương trình đào tạo
          </h2>
          <p className="text-gray-600">Vui lòng kiểm tra lại mã ngành.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title={`${chuongTrinhDaoTao.nganh.tenNganh} - Khóa ${chuongTrinhDaoTao.khoaHoc}`}
        description={`Mã ngành: ${chuongTrinhDaoTao.nganh.maNganh} • Chương trình đào tạo khóa ${chuongTrinhDaoTao.khoaHoc}`}
        icon={BookOpen}
        iconColor="from-green-500 to-emerald-600"
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        }
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </button>
          </div>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-6">
        <StatisticsCard
          title="Tổng số học phần"
          value={
            (chuongTrinhDaoTao.hocPhanList?.length || 0) + 
            (chuongTrinhDaoTao.nhomHocPhanTuChon?.reduce((total, nhom) => total + (nhom.hocPhanTuChonList?.length || 0), 0) || 0)
          }
          icon={BookOpen}
          colorScheme="purple"
          size="md"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <HocPhanTable
            name="Chi tiết chương trình đào tạo"
            requiredCourses={allCourses}
            electiveGroups={allElectiveGroups}
            activeTab="tatca"
            loading={loading}
            emptyStateTitle="Chưa có học phần nào"
            emptyStateDescription="Hiện tại chưa có học phần nào trong chương trình đào tạo"
            onCopyToClipboard={copyToClipboard}
          />
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa toàn bộ chương trình đào tạo này không? Hành động này không thể hoàn tác."
        isLoading={isDeleting}
      />
      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
      <ErrorMessageModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default CTDTDetail;
