import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Camera,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { PROFILE_SERVICE } from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import PageHeader from "../../components/PageHeader";

interface SinhVienProfile {
  maSo: string;
  hoTen: string;
  ngaySinh: Date | string;
  gioiTinh: boolean;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  queQuan?: string;
  danToc?: string;
  tonGiao?: string;
  cccd?: string;
  ngayCapCCCD?: Date | string;
  noiCapCCCD?: string;
  avatar?: string;
}

// Interface for API request with string dates
interface SinhVienProfileRequest {
  maSo: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: boolean;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  queQuan?: string;
  danToc?: string;
  tonGiao?: string;
  cccd?: string;
  ngayCapCCCD?: string;
  noiCapCCCD?: string;
  avatar?: string;
}

const ProfileManagement: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [profile, setProfile] = useState<SinhVienProfile | null>(null);
  const [editProfile, setEditProfile] = useState<SinhVienProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"avatar" | "info">("info");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [tempAvatarFile, setTempAvatarFile] = useState<File | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_MY_PROFILE.replace(":maSo", auth.user?.maSo || "")
      );
      if (response.data.code === 200) {
        setProfile(response.data.data);
        setEditProfile(response.data.data);
      } else {
        setErrorMessage("Không thể tải thông tin profile");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setErrorMessage("Lỗi khi tải thông tin profile");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, auth.user?.maSo]);

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrorMessage("Kích thước file không được vượt quá 5MB");
        setShowErrorModal(true);
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WebP)");
        setShowErrorModal(true);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Set temp avatar with the file for later upload
      setTempAvatarFile(file);
      setIsEditingAvatar(true);
    } catch (error: any) {
      console.error("Error processing avatar:", error);
      setErrorMessage("Lỗi khi xử lý avatar");
      setShowErrorModal(true);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!tempAvatarFile) return;

    try {
      setSaving(true);
      
      // Upload to server
      const formData = new FormData();
      formData.append("avatar", tempAvatarFile);
      formData.append("maSo", auth.user?.maSo || "");

      const response = await axiosPrivate.put(
        PROFILE_SERVICE.UPDATE_AVATAR,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 200) {
        const avatarUrl = response.data.data.url;
        setProfile((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
        setEditProfile((prev) =>
          prev ? { ...prev, avatar: avatarUrl } : null
        );
        setIsEditingAvatar(false);
        setTempAvatar(null);
        setTempAvatarFile(null);
        setAvatarPreview(null);
        setShowSuccessModal(true);
        // Fetch lại dữ liệu mới nhất
        fetchProfile();
      } else {
        setErrorMessage("Lỗi khi tải lên avatar");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      setErrorMessage("Lỗi khi cập nhật avatar");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAvatar = () => {
    setIsEditingAvatar(false);
    setTempAvatar(null);
    setTempAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleTabChange = (tab: "avatar" | "info") => {
    // Reset avatar editing state when switching tabs
    if (tab !== "avatar") {
      handleCancelAvatar();
    }
    setActiveTab(tab);
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof SinhVienProfile, value: any) => {
    setEditProfile((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // Convert Date to string for API (yyyy-MM-dd format)
  const convertDateToString = (date: Date | string | undefined) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    return date.toISOString().split('T')[0];
  };

  // Save profile
  const handleSave = async () => {
    if (!editProfile) return;
    try {
      setSaving(true);
      // Chỉ gửi những trường có thể thay đổi, convert Date to string
      const updateData: SinhVienProfileRequest = {
        maSo: editProfile.maSo,
        hoTen: editProfile.hoTen,
        ngaySinh: convertDateToString(editProfile.ngaySinh),
        gioiTinh: editProfile.gioiTinh,
        maLop: editProfile.maLop,
        khoaHoc: editProfile.khoaHoc,
        tenNganh: editProfile.tenNganh,
        // Các trường có thể chỉnh sửa
        soDienThoai: editProfile.soDienThoai,
        email: editProfile.email,
        diaChi: editProfile.diaChi,
        queQuan: editProfile.queQuan,
        danToc: editProfile.danToc,
        tonGiao: editProfile.tonGiao,
        cccd: editProfile.cccd,
        ngayCapCCCD: convertDateToString(editProfile.ngayCapCCCD),
        noiCapCCCD: editProfile.noiCapCCCD,
        avatar: editProfile.avatar,
      };
      
      const response = await axiosPrivate.put(
        PROFILE_SERVICE.UPDATE_SINHVIEN_PROFILE,
        updateData
      );
      
      if (response.data.code === 200) {
        setProfile(editProfile);
        setIsEditing(false);
        setAvatarPreview(null);
        setShowSuccessModal(true);
        // Fetch lại dữ liệu mới nhất
        fetchProfile();
      } else {
        setErrorMessage("Lỗi khi cập nhật thông tin");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setErrorMessage("Lỗi khi cập nhật thông tin");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
    setAvatarPreview(null);
    // Reset avatar editing state as well
    handleCancelAvatar();
  };

  // Format date for display as DD/MM/YYYY
  const formatDateForDisplay = (date: Date | string) => {
    if (!date) return "";

    const str = typeof date === "string" ? date : date.toISOString();

    // If it's already in MM/DD/YYYY format, convert to DD/MM/YYYY for display
    if (str.includes("/")) {
      const [month, day, year] = str.split("/");
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    // Otherwise, parse as normal date and format as DD/MM/YYYY
    const d = new Date(str);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date for HTML5 date input (yyyy-MM-dd)
  const formatDateForInput = (date: Date | string) => {
    if (!date) return "";

    const str = typeof date === "string" ? date : date.toISOString();

    // If it's already in MM/DD/YYYY format, convert to yyyy-MM-dd for input
    if (str.includes("/")) {
      const [month, day, year] = str.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Otherwise, parse as normal date and format as yyyy-MM-dd
    const d = new Date(str);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (auth.user?.maSo) {
      fetchProfile();
    }
  }, [auth.user?.maSo, fetchProfile]);

  if (loading) {
    return <Loading />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Không thể tải thông tin profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Thông tin cá nhân"
        description="Cập nhật thông tin cá nhân và avatar của bạn"
        icon={User}
        iconColor="from-blue-500 to-purple-600"
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
            {activeTab === "avatar" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <span>Chọn ảnh</span>
              </button>
            )}
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange("info")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "info"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Thông tin cơ bản
            </button>
            <button
              onClick={() => handleTabChange("avatar")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "avatar"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Ảnh đại diện
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "info" && (
            <div>
              {/* Thông báo về các trường không thể chỉnh sửa */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800">
                      Thông tin cơ bản
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>Không thể chỉnh sửa:</strong> Mã số sinh viên, Họ
                      và tên, Ngày sinh, Lớp, Khóa học, Ngành học
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Có thể chỉnh sửa:</strong> Thông tin liên hệ, Địa
                      chỉ, Giấy tờ tùy thân
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              <div className="mb-6 flex justify-end">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Hủy</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã số */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <div className="flex items-center">
                      <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                      <span>Mã số sinh viên</span>
                      <Lock className="inline h-3 w-3 ml-2 text-gray-500" />
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editProfile?.maSo || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium"
                  />
                </div>

                {/* Họ tên */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <div className="flex items-center">
                      <User className="inline h-4 w-4 mr-2 text-blue-600" />
                      <span>Họ và tên</span>
                      <Lock className="inline h-3 w-3 ml-2 text-gray-500" />
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editProfile?.hoTen || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium"
                  />
                </div>

                {/* Ngày sinh */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <div className="flex items-center">
                      <Calendar className="inline h-4 w-4 mr-2 text-blue-600" />
                      <span>Ngày sinh</span>
                      <Lock className="inline h-3 w-3 ml-2 text-gray-500" />
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formatDateForDisplay(editProfile?.ngaySinh || "")}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium"
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                {/* Giới tính */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-blue-600" />
                    Giới tính
                  </label>
                  <select
                    value={editProfile?.gioiTinh ? "true" : "false"}
                    onChange={(e) =>
                      handleInputChange("gioiTinh", e.target.value === "true")
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>

                {/* Lớp */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <div className="flex items-center">
                      <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                      <span>Lớp</span>
                      <Lock className="inline h-3 w-3 ml-2 text-gray-500" />
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editProfile?.maLop || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium"
                  />
                </div>

                {/* Khóa học */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <div className="flex items-center">
                      <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                      <span>Khóa học</span>
                      <Lock className="inline h-3 w-3 ml-2 text-gray-500" />
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editProfile?.khoaHoc || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium"
                  />
                </div>

                {/* Ngành */}
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <div className="flex items-center">
                      <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                      <span>Ngành học</span>
                      <Lock className="inline h-3 w-3 ml-2 text-gray-500" />
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editProfile?.tenNganh || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium"
                  />
                </div>

                {/* Số điện thoại */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Phone className="inline h-4 w-4 mr-2 text-blue-600" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editProfile?.soDienThoai || ""}
                    onChange={(e) =>
                      handleInputChange("soDienThoai", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Mail className="inline h-4 w-4 mr-2 text-blue-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editProfile?.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Địa chỉ */}
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-blue-600" />
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={editProfile?.diaChi || ""}
                    onChange={(e) =>
                      handleInputChange("diaChi", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Quê quán */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-blue-600" />
                    Quê quán
                  </label>
                  <input
                    type="text"
                    value={editProfile?.queQuan || ""}
                    onChange={(e) =>
                      handleInputChange("queQuan", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Dân tộc */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-blue-600" />
                    Dân tộc
                  </label>
                  <input
                    type="text"
                    value={editProfile?.danToc || ""}
                    onChange={(e) =>
                      handleInputChange("danToc", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Tôn giáo */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-blue-600" />
                    Tôn giáo
                  </label>
                  <input
                    type="text"
                    value={editProfile?.tonGiao || ""}
                    onChange={(e) =>
                      handleInputChange("tonGiao", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* CCCD */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                    CCCD/CMND
                  </label>
                  <input
                    type="text"
                    value={editProfile?.cccd || ""}
                    onChange={(e) => handleInputChange("cccd", e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Ngày cấp CCCD */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-blue-600" />
                    Ngày cấp CCCD
                  </label>
                  {!isEditing ? (
                    <input
                      type="text"
                      value={formatDateForDisplay(
                        editProfile?.ngayCapCCCD || ""
                      )}
                      disabled
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium"
                      placeholder="dd/mm/yyyy"
                    />
                  ) : (
                    <input
                      type="date"
                      value={formatDateForInput(editProfile?.ngayCapCCCD || "")}
                      onChange={(e) =>
                        handleInputChange(
                          "ngayCapCCCD",
                          new Date(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border-2 border-blue-400 rounded-md bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  )}
                </div>

                {/* Nơi cấp CCCD */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-blue-600" />
                    Nơi cấp CCCD
                  </label>
                  <input
                    type="text"
                    value={editProfile?.noiCapCCCD || ""}
                    onChange={(e) =>
                      handleInputChange("noiCapCCCD", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-800 enabled:bg-white enabled:text-gray-900 enabled:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "avatar" && (
            <div>
              {/* Thông báo về avatar */}
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Camera className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-purple-800">
                      Ảnh đại diện
                    </h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Cập nhật ảnh đại diện của bạn. Hình ảnh sẽ được hiển thị
                      trên hồ sơ và các trang khác.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                {/* Avatar Display */}
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                    {(() => {
                      const displayAvatar =
                        avatarPreview ||
                        (isEditingAvatar ? tempAvatar : editProfile?.avatar);
                      return displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                          <User className="h-24 w-24 text-white" />
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Avatar Instructions */}
                <div className="text-center max-w-md">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Hướng dẫn
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Click vào icon camera để chọn ảnh</li>
                      <li>• Kích thước tối đa: 5MB</li>
                      <li>• Định dạng: JPEG, PNG, GIF, WebP</li>
                      <li>• Khuyến nghị: Ảnh vuông tỷ lệ 1:1</li>
                    </ul>
                  </div>
                </div>

                {/* Avatar Change Notice */}
                {isEditingAvatar && (
                  <div className="text-center max-w-md">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <p className="text-sm text-blue-700 font-medium">
                          Bạn đã chọn ảnh mới. Nhấn "Lưu" để cập nhật avatar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Avatar Action Buttons */}
                <div className="flex justify-center space-x-4 mt-6">
                  {isEditingAvatar && (
                    <button
                      onClick={handleCancelAvatar}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Hủy</span>
                    </button>
                  )}
                  <button
                    onClick={handleSaveAvatar}
                    disabled={saving || !tempAvatarFile}
                    className={`flex items-center space-x-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                      isEditingAvatar && tempAvatarFile
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? "Đang lưu..." : "Lưu avatar"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSuccessModal && (
        <SuccessMessageModal
          isOpen={showSuccessModal}
          message="Cập nhật thông tin thành công!"
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

export default ProfileManagement;
