import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import type { Nganh } from "../../types/Nganh";
import type { Khoa } from "../../types/Khoa";
import { PROFILE_SERVICE, HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";

const ImportChuongTrinhDaoTao = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);
  const [selectedNganh, setSelectedNganh] = useState<string>("");
  const [khoaHoc, setKhoaHoc] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const maKhoa = auth.user?.maKhoa || "";

  const fetchDanhSachNganh = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_KHOA.replace(":maKhoa", maKhoa)
      );
      if (response.data.code === 200 && response.data.data) {
        const khoaData = response.data.data as Khoa;
        setDanhSachNganh(khoaData.dsnganh || []);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách ngành. Vui lòng thử lại."
      );
      setShowErrorModal(true);
    }
  }, [axiosPrivate, maKhoa]);

  useEffect(() => {
    fetchDanhSachNganh();
  }, [fetchDanhSachNganh]);

  // Drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedNganh || !khoaHoc || !selectedFile) {
      setErrorMessage("Vui lòng chọn ngành, nhập khóa học và chọn file Excel.");
      setShowErrorModal(true);
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("ten", "");
    formData.append("noiDung", "");
    formData.append("maNganh", selectedNganh);
    formData.append("khoaHoc", khoaHoc);
    formData.append("file", selectedFile);

    try {
      const response = await axiosPrivate.post(
        HOCPHAN_SERVICE.CTDT_UPLOAD_EXCEL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.code === 200) {
        setSuccessMessage("Nhập chương trình đào tạo từ Excel thành công!");
        setShowSuccessModal(true);
        setSelectedNganh("");
        setKhoaHoc("");
        setSelectedFile(null);
        setTimeout(() => navigate("/giangvien/ctdt"), 2000);
      } else {
        setErrorMessage(response.data.message || "Có lỗi xảy ra khi nhập file.");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Lỗi kết nối hoặc lỗi server. Vui lòng thử lại."
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50 p-4 md:p-8 space-y-6">
      <PageHeader
        title="Nhập Chương trình Đào tạo từ Excel"
        description="Tải lên file Excel chứa dữ liệu chương trình đào tạo"
        icon={UploadCloud}
        iconColor="from-purple-500 to-indigo-600"
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 py-2 text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        }
      />

      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100 relative">
        <div className="space-y-8">

          {/* Select Ngành */}
          <div className="relative group">
            <label
              htmlFor="major-select"
              className="absolute left-3 -top-3.5 text-sm text-indigo-700 bg-white px-1 rounded-full group-focus-within:text-indigo-900 transition-all duration-200"
            >
              Chọn ngành <span className="text-red-500">*</span>
            </label>
            <select
              id="major-select"
              value={selectedNganh}
              onChange={(e) => setSelectedNganh(e.target.value)}
              className="w-full px-4 py-4 mt-2 border-2 border-gray-200 focus:border-indigo-500 rounded-xl bg-white text-gray-800 focus:outline-none transition shadow-sm"
            >
              <option value="">-- Chọn ngành --</option>
              {danhSachNganh.map((nganh) => (
                <option key={nganh.maNganh} value={nganh.maNganh}>
                  {nganh.tenNganh}
                </option>
              ))}
            </select>
          </div>

          {/* Input Khóa học */}
          <div className="relative group">
            <input
              type="text"
              id="khoa-hoc-input"
              value={khoaHoc}
              onChange={(e) => setKhoaHoc(e.target.value)}
              placeholder=" "
              className="w-full px-4 py-4 border-2 border-gray-200 focus:border-indigo-500 rounded-xl bg-white text-gray-800 focus:outline-none transition shadow-sm peer"
            />
            <label
              htmlFor="khoa-hoc-input"
              className="absolute left-3 -top-3.5 text-sm text-indigo-700 bg-white px-1 rounded-full transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-indigo-700"
            >
              Khóa học <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Upload Excel */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`transition-colors duration-200 border-2 ${
              dragActive
                ? "border-indigo-500 bg-indigo-50"
                : "border-dashed border-gray-200 bg-white"
            } rounded-2xl p-6 flex flex-col items-center justify-center relative cursor-pointer shadow-md group`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="excel-file-input"
              name="excel-file"
              type="file"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            <UploadCloud
              className={`mx-auto mb-2 h-14 w-14 ${
                dragActive ? "text-indigo-500 animate-bounce" : "text-gray-400 group-hover:text-indigo-500"
              } transition`}
              strokeWidth={2}
            />
            <div className="text-center">
              <span className="font-medium text-indigo-700">Kéo & thả file Excel vào đây</span>
              <span className="mx-1 text-gray-400">hoặc</span>
              <span className="underline text-indigo-600 cursor-pointer">Chọn file</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Chỉ chấp nhận file .xlsx hoặc .xls, dung lượng tối đa 10MB
            </p>
            {selectedFile && (
              <p className="text-sm text-indigo-600 mt-3 font-semibold">
                <CheckCircle className="inline-block mr-1 w-4 h-4" />
                {selectedFile.name}
              </p>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
              {loading ? "Đang tải lên..." : "Tải lên"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ErrorMessageModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
       
      />
      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
};

export default ImportChuongTrinhDaoTao;
