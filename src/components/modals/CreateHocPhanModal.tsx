import { useState } from "react";
import { X } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import type { HocPhan } from "../../types/HocPhan";

interface CreateHocPhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newHocPhan: HocPhan) => void;
  onSubmit: (hocPhanData: Omit<HocPhan, 'maHp'> & { maHp: string }) => Promise<HocPhan>;
}

const CreateHocPhanModal: React.FC<CreateHocPhanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    maHp: "",
    tenHp: "",
    tinChi: 0,
    hocPhanTienQuyet: "",
    loaiHp: "Đại cương",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loaiHpOptions = [
    { value: "Quốc Phòng", label: "Quốc Phòng" },
    { value: "Chính trị", label: "Chính trị" },
    { value: "Đại cương", label: "Đại cương" },
    { value: "Cơ sở ngành", label: "Cơ sở ngành" },
    { value: "Chuyên ngành", label: "Chuyên ngành" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "tinChi" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!formData.maHp.trim()) {
      setError("Mã học phần không được để trống");
      return;
    }
    if (!formData.tenHp.trim()) {
      setError("Tên học phần không được để trống");
      return;
    }
    if (formData.tinChi <= 0) {
      setError("Số tín chỉ phải lớn hơn 0");
      return;
    }
    if (!formData.loaiHp.trim()) {
      setError("Loại học phần không được để trống");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newHocPhan = await onSubmit(formData);
      onSuccess(newHocPhan);
      handleClose();
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi tạo học phần");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      maHp: "",
      tenHp: "",
      tinChi: 0,
      hocPhanTienQuyet: "",
      loaiHp: "Đại cương",
    });
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-1">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Tạo học phần mới
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="maHp" className="block text-sm font-medium text-gray-700 mb-1">
              Mã học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="maHp"
              name="maHp"
              value={formData.maHp}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD:CT123"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="tenHp" className="block text-sm font-medium text-gray-700 mb-1">
              Tên học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tenHp"
              name="tenHp"
              value={formData.tenHp}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Toán rời rạc"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="tinChi" className="block text-sm font-medium text-gray-700 mb-1">
              Số tín chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="tinChi"
              name="tinChi"
              value={formData.tinChi}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="loaiHp" className="block text-sm font-medium text-gray-700 mb-1">
              Loại học phần <span className="text-red-500">*</span>
            </label>
            <CreatableSelect
              id="loaiHp"
              value={loaiHpOptions.find(option => option.value === formData.loaiHp) || { value: formData.loaiHp, label: formData.loaiHp }}
              onChange={(selectedOption) => {
                const value = selectedOption ? selectedOption.value : "";
                setFormData(prev => ({ ...prev, loaiHp: value }));
              }}
              options={loaiHpOptions}
              isDisabled={isSubmitting}
              isClearable
              placeholder="Chọn hoặc nhập loại học phần"
              formatCreateLabel={(inputValue) => `Tạo mới: "${inputValue}"`}
              noOptionsMessage={() => "Không tìm thấy, nhập để tạo mới"}
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                  '&:hover': {
                    borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                  color: state.isSelected ? 'white' : '#374151'
                })
              }}
            />
          </div>

          <div>
            <label htmlFor="hocPhanTienQuyet" className="block text-sm font-medium text-gray-700 mb-1">
              Học phần tiên quyết
            </label>
            <textarea
              id="hocPhanTienQuyet"
              name="hocPhanTienQuyet"
              value={formData.hocPhanTienQuyet}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: CT223,CT224"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo học phần"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHocPhanModal;
