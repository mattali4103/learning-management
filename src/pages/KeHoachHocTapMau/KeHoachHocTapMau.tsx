import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  GraduationCap,
  FileText,
  Trash2,
  ChevronRight,
  Upload,
  X,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  KHHT_SERVICE,
  PROFILE_SERVICE,
  HOCPHAN_SERVICE,
} from "../../api/apiEndPoints";
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
  const [keHoachHocTapList, setKeHoachHocTapList] = useState<
    KeHoachHocTapMauData[]
  >([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<KeHoachHocTapMauData | null>(null);
  const maKhoa = auth.user?.maKhoa || "";

  // Import Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importNganh, setImportNganh] = useState("");
  const [importKhoaHoc, setImportKhoaHoc] = useState("");
  const [khoaHocOptions, setKhoaHocOptions] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Fetch functions
  const fetchTemplateList = useCallback(async () => {
    if (danhSachNganh.length === 0) {
      setLoading(false);
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
      setKeHoachHocTapList([]);
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

  const fetchKhoaHocForImport = useCallback(
    async (maNganh: string) => {
      if (!maNganh) {
        setKhoaHocOptions([]);
        return;
      }
      try {
        const response = await axiosPrivate.get<any>(
          HOCPHAN_SERVICE.CTDT_BY_NGANH.replace(":maNganh", maNganh)
        );
        if (response.data.code === 200 && response.data.data) {
          const khoaHocList = response.data.data.map(
            (item: any) => item.khoaHoc
          );
          setKhoaHocOptions(khoaHocList);
        }
      } catch (error) {
        console.error("Error fetching khoa hoc for import:", error);
        setKhoaHocOptions([]);
      }
    },
    [axiosPrivate]
  );

  // useEffect hooks
  useEffect(() => {
    const initializeData = async () => {
      await fetchDanhSachNganh();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (danhSachNganh.length > 0) {
      fetchTemplateList();
    }
  }, [danhSachNganh, fetchTemplateList]);

  useEffect(() => {
    if (showImportModal) {
      fetchKhoaHocForImport(importNganh);
    }
  }, [importNganh, fetchKhoaHocForImport, showImportModal]);

  // Handler functions
  const handleCreateTemplate = () => {
    navigate("/giangvien/study-plans/add");
  };

  const openDeleteModal = (
    event: React.MouseEvent,
    template: KeHoachHocTapMauData
  ) => {
    event.stopPropagation();
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
        setMessage(response.data.message);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    } finally {
      closeDeleteModal();
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setMessage("");
    fetchTemplateList();
  };

  const handleViewTemplate = (template: KeHoachHocTapMauData) => {
    navigate(
      `/giangvien/study-plans/${template.nganh.maNganh}/${template.khoaHoc}`
    );
  };

  // Import Handlers
  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setImportNganh("");
    setImportKhoaHoc("");
    setKhoaHocOptions([]);
    setImportFile(null);
    setImportError("");
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handleImport = async () => {
    if (!importFile || !importNganh || !importKhoaHoc) {
      setImportError("Vui lòng chọn đầy đủ thông tin và file Excel.");
      return;
    }
    setImportError("");
    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("maNganh", importNganh);
      formData.append("khoaHoc", importKhoaHoc);

      const response = await axiosPrivate.post(
        KHHT_SERVICE.KHHT_MAU_IMPORT,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.code === 200) {
        setMessage("Import kế hoạch học tập thành công!");
        setShowSuccessModal(true);
        handleCloseImportModal();
        fetchTemplateList();
      } else {
        setImportError(
          "Import không thành công: " +
            (response.data.message || "Lỗi không xác định")
        );
      }
    } catch (error: any) {
      console.error("Error importing:", error);
      setImportError(
        "Import không thành công: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
    } finally {
      setIsImporting(false);
    }
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenImportModal}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </button>
            <button
              onClick={handleCreateTemplate}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo kế hoạch học tập mới
            </button>
          </div>
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
          size="md"
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
                                (nganh) => nganh.maNganh === khht.nganh.maNganh
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
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
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

      {/* Import Modal */}
      {showImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={handleCloseImportModal}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 rounded-full mb-4">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Import Kế hoạch học tập
              </h2>
              <p className="text-gray-500 mb-6">
                Tải lên file Excel để import dữ liệu một cách nhanh chóng.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn ngành
                  </label>
                  <select
                    value={importNganh}
                    onChange={(e) => setImportNganh(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Chọn ngành --</option>
                    {danhSachNganh.map((nganh) => (
                      <option key={nganh.maNganh} value={nganh.maNganh}>
                        {nganh.tenNganh} ({nganh.maNganh})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn khóa học
                  </label>
                  <select
                    value={importKhoaHoc}
                    onChange={(e) => setImportKhoaHoc(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                    disabled={!importNganh}
                  >
                    <option value="">-- Chọn khóa học --</option>
                    {khoaHocOptions.map((khoaHoc) => (
                      <option key={khoaHoc} value={khoaHoc}>
                        Khóa {khoaHoc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Excel
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  {importFile ? (
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 font-semibold text-gray-700">
                        {importFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(importFile.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        onClick={() => setImportFile(null)}
                        className="mt-2 text-sm text-red-600 hover:underline"
                      >
                        Xóa file
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) =>
                          setImportFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">
                            Nhấn để tải lên
                          </span>{" "}
                          hoặc kéo thả
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Hỗ trợ file .xlsx, .xls
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {importError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseImportModal}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleImport}
                disabled={
                  !importFile || !importNganh || !importKhoaHoc || isImporting
                }
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {isImporting ? "Đang import..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        message={message}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteTemplate}
        isLoading={false}
      />
    </div>
  );
};

export default KeHoachHocTapMau;
