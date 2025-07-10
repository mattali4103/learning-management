import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  Award,
  Upload,
  Download,
  Loader2,
  Eye,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Edit,
  Grid3X3,
  List,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { PROFILE_SERVICE } from "../../api/apiEndPoints";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import PageHeader from "../../components/PageHeader";
import type { Certificate, CertificateForm } from "../../types/Certificate";

const CertificateManagement: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("Thao tác thành công!");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingCertificate, setEditingCertificate] =
    useState<Certificate | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table"); // Thêm state cho view mode

  // Form state
  const [formData, setFormData] = useState<CertificateForm>({
    tenChungChi: "",
    ngayCap: "",
  });

  // Fetch danh sách văn bằng chứng chỉ
  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_CERTIFICATES.replace(":maSo", auth.user?.maSo || "")
      );

      if (response.data.code === 200) {
        setCertificates(response.data.data);
      } else {
        setErrorMessage("Không thể tải danh sách văn bằng, chứng chỉ");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Error fetching certificates:", error);
      setErrorMessage("Lỗi khi tải danh sách văn bằng, chứng chỉ");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [auth.user?.maSo, axiosPrivate]);

  // Upload file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Kích thước file không được vượt quá 10MB");
        setShowErrorModal(true);
        return;
      }

      // Kiểm tra loại file (chỉ chấp nhận PDF và hình ảnh)
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(
          "Chỉ chấp nhận file PDF hoặc hình ảnh (JPEG, PNG, GIF)"
        );
        setShowErrorModal(true);
        return;
      }

      setSelectedFile(file);

      // Tạo preview cho file
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof CertificateForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tenChungChi: "",
      ngayCap: "",
    });

    setSelectedFile(null);
    setFilePreview(null);
    setEditingCertificate(null);
  };

  // Bắt đầu thêm mới
  const startAddNew = () => {
    resetForm();
    setIsAddingNew(true);
  };

  // Bắt đầu chỉnh sửa
  const startEditing = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      tenChungChi: certificate.tenChungChi,
      ngayCap: formatDateForInput(certificate.ngayCap),
    });
  };

  // Hủy thêm mới/chỉnh sửa
  const cancelEdit = () => {
    resetForm();
    setIsAddingNew(false);
  };

  // Xem preview chứng chỉ
  const viewCertificate = (url: string) => {
    setPreviewUrl(url);
  };

  // Đóng preview
  const closePreview = () => {
    setPreviewUrl(null);
  };

  // Validate form
  const validateForm = (): { isValid: boolean; message: string } => {
    if (!formData.tenChungChi.trim()) {
      return {
        isValid: false,
        message: "Tên văn bằng/chứng chỉ không được để trống",
      };
    }

    if (formData.tenChungChi.trim().length < 3) {
      return {
        isValid: false,
        message: "Tên văn bằng/chứng chỉ phải có ít nhất 3 ký tự",
      };
    }

    if (!formData.ngayCap) {
      return { isValid: false, message: "Vui lòng chọn ngày cấp" };
    }

    // Kiểm tra ngày cấp không được trong tương lai
    const today = new Date();
    const capDate = new Date(formData.ngayCap);
    if (capDate > today) {
      return {
        isValid: false,
        message: "Ngày cấp không thể là ngày trong tương lai",
      };
    }

    if (isAddingNew && !selectedFile) {
      return { isValid: false, message: "Vui lòng chọn file chứng chỉ" };
    }

    return { isValid: true, message: "" };
  };

  // Lưu chứng chỉ mới
  const saveCertificate = async () => {
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      setShowErrorModal(true);
      return;
    }

    try {
      setUploading(true);
      // FormData để upload
      const formDataToSend = new FormData();
      formDataToSend.append("maSo", auth.user?.maSo || "");
      formDataToSend.append("tenChungChi", formData.tenChungChi);
      formDataToSend.append("ngayCap", formData.ngayCap);

      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      let response;

      if (isAddingNew) {
        // Thêm mới
        response = await axiosPrivate.post(
          PROFILE_SERVICE.UPLOAD_CERTIFICATE,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setSuccessMessage("Thêm chứng chỉ thành công!");
      } else if (editingCertificate) {
        // Cập nhật
        response = await axiosPrivate.put(
          PROFILE_SERVICE.UPDATE_CERTIFICATE.replace(
            ":id",
            editingCertificate.id.toString()
          ),
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setSuccessMessage("Cập nhật chứng chỉ thành công!");
      }

      if (response && response.data.code === 200) {
        resetForm();
        setIsAddingNew(false);
        setShowSuccessModal(true);
        fetchCertificates(); // Refresh danh sách
      } else {
        setErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Error saving certificate:", error);
      setErrorMessage(error.message || "Lỗi khi lưu văn bằng, chứng chỉ");
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  // Xóa chứng chỉ
  const deleteCertificate = async (id: string) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa văn bằng/chứng chỉ này không?")
    ) {
      return;
    }

    try {
      setUploading(true);
      const response = await axiosPrivate.delete(
        PROFILE_SERVICE.DELETE_CERTIFICATE.replace(":id", id)
      );

      if (response.data.code === 200) {
        setSuccessMessage("Xóa chứng chỉ thành công!");
        setShowSuccessModal(true);
        fetchCertificates(); // Refresh danh sách
      } else {
        setErrorMessage("Có lỗi xảy ra khi xóa");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Error deleting certificate:", error);
      setErrorMessage("Lỗi khi xóa văn bằng, chứng chỉ");
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  // Format date từ yyyy-MM-dd hoặc ISO string sang dd/MM/yyyy
  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Format date cho input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  // Load certificates khi component mount
  useEffect(() => {
    if (auth.user?.maSo) {
      fetchCertificates();
    }
  }, [auth.user?.maSo, fetchCertificates]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <PageHeader
          title="Văn bằng & Chứng chỉ"
          description="Quản lý và cập nhật văn bằng, chứng chỉ của bạn"
          icon={Award}
          iconColor="from-orange-500 to-amber-600"
        />
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Văn bằng & Chứng chỉ"
        description="Quản lý và cập nhật văn bằng, chứng chỉ của bạn"
        icon={Award}
        iconColor="from-orange-500 to-amber-600"
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        }
        actions={
          <div className="flex items-center space-x-2">
            {!isAddingNew && !editingCertificate && (
              <button
                onClick={startAddNew}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm chứng chỉ</span>
              </button>
            )}
            <button
              onClick={fetchCertificates}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Làm mới danh sách"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            {/* View mode toggle */}
            {certificates.length > 0 && (
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Hiển thị dạng bảng"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Hiển thị dạng lưới"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Form thêm/sửa chứng chỉ */}
      {(isAddingNew || editingCertificate) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {isAddingNew
                ? "Thêm văn bằng/chứng chỉ mới"
                : "Chỉnh sửa văn bằng/chứng chỉ"}
            </h2>
            <button
              onClick={cancelEdit}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveCertificate();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loại văn bằng/chứng chỉ */}
              {/* Tên văn bằng/chứng chỉ */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên văn bằng/chứng chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tenChungChi}
                  onChange={(e) =>
                    handleInputChange("tenChungChi", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ví dụ: Chứng chỉ IELTS, Bằng Tốt nghiệp..."
                  required
                  minLength={3}
                />
                {formData.tenChungChi && formData.tenChungChi.length < 3 && (
                  <p className="text-xs text-red-500 mt-1">
                    Tên phải có ít nhất 3 ký tự
                  </p>
                )}
              </div>

              {/* Ngày cấp */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày cấp <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.ngayCap}
                  onChange={(e) => handleInputChange("ngayCap", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  max={new Date().toISOString().split("T")[0]} // Không cho phép chọn ngày tương lai
                />
              </div>
            </div>

            {/* File upload */}
            <div className="form-group md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isAddingNew
                  ? "Tải lên file chứng chỉ *"
                  : "Cập nhật file chứng chỉ (không bắt buộc)"}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf,image/jpeg,image/png,image/gif"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Chọn file</span>
                </button>
                {selectedFile && (
                  <span className="text-sm text-gray-600">
                    {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ PDF, JPEG, PNG, GIF. Kích thước tối đa: 10MB
              </p>
            </div>

            {/* Preview của file */}
            {filePreview && (
              <div className="form-group md:col-span-2 mt-2">
                <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </p>
                  {selectedFile?.type === "application/pdf" ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <FileText className="h-5 w-5" />
                      <span>PDF document selected</span>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-hidden">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Lưu</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách văn bằng, chứng chỉ */}
      {certificates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
          <Award className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            Chưa có văn bằng, chứng chỉ nào
          </h3>
          {!isAddingNew && (
            <button
              onClick={startAddNew}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm chứng chỉ đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table view */}
          {viewMode === "table" && (
            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên chứng chỉ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày cấp
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {certificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cert.tenChungChi}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateDisplay(cert.ngayCap)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => viewCertificate(cert.imageUrl)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Xem"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <a
                                href={cert.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Mở trong tab mới"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => startEditing(cert)}
                                className="text-amber-600 hover:text-amber-900 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteCertificate(cert.id.toString())
                                }
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Grid view */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative bg-gray-100">
                    <img
                      src={cert.imageUrl}
                      alt={cert.tenChungChi}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => viewCertificate(cert.imageUrl)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                      {cert.tenChungChi}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Ngày cấp:</span>{" "}
                      {formatDateDisplay(cert.ngayCap)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewCertificate(cert.imageUrl)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Xem</span>
                        </button>
                        <a
                          href={cert.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Mở</span>
                        </a>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditing(cert)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCertificate(cert.id.toString())}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile responsive view for table mode */}
          {viewMode === "table" && (
            <div className="md:hidden space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {cert.tenChungChi}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Ngày cấp:</span>{" "}
                          {formatDateDisplay(cert.ngayCap)}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Đơn vị cấp:</span>{" "}
                          {cert.noiCap}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => viewCertificate(cert.imageUrl)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Xem</span>
                        </button>
                        <a
                          href={cert.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Mở</span>
                        </a>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditing(cert)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCertificate(cert.id.toString())}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Xem văn bằng/chứng chỉ</h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto p-4 flex-grow">
              {previewUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[70vh]"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Certificate Preview"
                  className="max-w-full mx-auto"
                />
              )}
            </div>
            <div className="border-t p-4 flex justify-end">
              <a
                href={previewUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Tải xuống</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showSuccessModal && (
        <SuccessMessageModal
          isOpen={showSuccessModal}
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      {showErrorModal && (
        <ErrorMessageModal
          isOpen={showErrorModal}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
};

export default CertificateManagement;
