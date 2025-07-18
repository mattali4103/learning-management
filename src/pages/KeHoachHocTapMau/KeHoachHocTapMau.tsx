import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  GraduationCap,
  FileText,
  Trash2,
  ChevronRight,
} from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE, PROFILE_SERVICE } from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";
import DeleteModal from "../../components/modals/DeleteModal";
import PageHeader from "../../components/PageHeader";
import StatisticsCard from "../../components/StatisticsCard";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";

interface Nganh {
  maNganh: string;
  tenNganh: string;
}

interface KeHoachHocTapMauData {
  khoaHoc: string;
  nganh: Nganh;
}

interface Khoa {
  maKhoa: string;
  tenKhoa: string;
  dsnganh: Nganh[];
}

const KeHoachHocTapMau = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);
  const [keHoachHocTapList, setKeHoachHocTapList] = useState<KeHoachHocTapMauData[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<KeHoachHocTapMauData | null>(null);
  const maKhoa = auth.user?.maKhoa || "";

  // Fetch functions
  const fetchTemplateList = useCallback(async () => {
    if (danhSachNganh.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const allTemplates: KeHoachHocTapMauData[] = [];

      for (const nganh of danhSachNganh) {
        try {
          const response = await axiosPrivate.get(
            KHHT_SERVICE.KHHT_MAU_BY_NGANH,
            {
              params: {
                maNganh: nganh.maNganh,
              },
            }
          );
          if (response.data.code === 200 && response.data.data) {
            const templates: KeHoachHocTapMauData[] = response.data.data.map(
              (item: any) => ({
                khoaHoc: item.khoaHoc,
                nganh: item.nganhDTO,
              })
            );
            allTemplates.push(...templates);
          }
        } catch {
          // Silent error handling - could add proper error notification here
        }
      }
      setKeHoachHocTapList(allTemplates);
    } catch {
      // Silent error handling - consider adding proper error notification
    } finally {
      setLoading(false);
    }
  }, [danhSachNganh, axiosPrivate]);

  const fetchDanhSachNganh = async () => {
    try {
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_KHOA.replace(":maKhoa", maKhoa)
      );
      if (response.data.code === 200 && response.data.data) {
        const khoaData = response.data.data as Khoa;
        setDanhSachNganh(khoaData.dsnganh || []);
      }
    } catch {
      setDanhSachNganh([]);
    }
  };

  // useEffect hooks
  useEffect(() => {
    const initializeData = async () => {
      await fetchDanhSachNganh();
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch templates after we have the list of nganh
  useEffect(() => {
    if (danhSachNganh.length > 0) {
      fetchTemplateList();
    }
  }, [danhSachNganh, fetchTemplateList]);

  // Handler functions
  const handleCreateTemplate = () => {
    navigate("/giangvien/study-plans/create");
  };

  const openDeleteModal = (
    event: React.MouseEvent,
    template: KeHoachHocTapMauData
  ) => {
    event.stopPropagation(); // Prevent navigating to the template detail
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const response = await axiosPrivate.delete(
        KHHT_SERVICE.KHHT_MAU_DELETE_BY_KHOAHOC,
        {
          data: {
            maNganh: templateToDelete.nganh.maNganh,
            khoaHoc: templateToDelete.khoaHoc,
          },
        }
      );
      if (response.data.code === 200) {
        setShowSuccessModal(true);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      // Handle error, e.g., show an error message to the user
    } finally {
      closeDeleteModal();
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setMessage("")
    fetchTemplateList();
    navigate("/giangvien/study-plans");
  };

  const handleViewTemplate = (template: KeHoachHocTapMauData) => {
    navigate(
      `/giangvien/study-plans/${template.nganh.maNganh}/${template.khoaHoc}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Đang tải danh sách kế hoạch học tập mẫu...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title="Kế hoạch Học tập Mẫu"
        description="Quản lý kế hoạch học tập mẫu cho sinh viên"
        icon={FileText}
        descriptionIcon={GraduationCap}
        actions={
          <button
            onClick={handleCreateTemplate}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo kế hoạch mới
          </button>
        }
      />

      {/* Statistics Card */}
      <div className="grid grid-cols-1 gap-6">
        <StatisticsCard
          title="Tổng kế hoạch học tập mẫu"
          value={keHoachHocTapList.length}
          subtitle={
            keHoachHocTapList.length === 0
              ? "Chưa có kế hoạch nào"
              : `${keHoachHocTapList.length} kế hoạch có sẵn`
          }
          icon={FileText}
          colorScheme="blue"
          size="lg"
          style="modern"
        />
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {keHoachHocTapList.length === 0 ? (
          <div className="p-16 text-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              Chưa có kế hoạch học tập mẫu
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Tạo kế hoạch học tập mẫu đầu tiên để hướng dẫn sinh viên trong
              việc học tập
            </p>
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tạo kế hoạch học tập mẫu mới
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keHoachHocTapList.map((khht, index) => (
                <div
                  key={`${khht.nganh.maNganh}-${khht.khoaHoc}-${index}`}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => handleViewTemplate(khht)}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-8 translate-x-8 opacity-60 group-hover:opacity-80 transition-opacity"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight">
                              {danhSachNganh.find(
                                (nganh) =>
                                  nganh.maNganh === khht.nganh.maNganh
                              )?.tenNganh || "Kế hoạch học tập"}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                              Mã ngành: {khht.nganh.maNganh}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                            <Calendar className="w-3 h-3 mr-1" />
                            Khóa {khht.khoaHoc}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                          <span className="font-medium">Xem chi tiết</span>
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>

                  {/* Delete button - initially hidden */}
                  <button
                    onClick={(event) => openDeleteModal(event, khht)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        message={message}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={() => {
          handleDeleteTemplate();
          setShowSuccessModal(true); // Show success after confirmation and closing delete modal
        }}
        isLoading={false} // You'll likely have a state for delete loading
      />
    </div>
  );
};

export default KeHoachHocTapMau;
