import { BookOpen } from "lucide-react";
import type { HocPhan } from "../../types/HocPhan";

interface AddToCTDTConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hocPhan: HocPhan | null;
  khoaHoc: string;
  tenNganh: string;
}

const AddToCTDTConfirmModal: React.FC<AddToCTDTConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hocPhan,
  khoaHoc,
  tenNganh,
}) => {
  if (!isOpen || !hocPhan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-1">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tạo học phần thành công!
              </h3>
              <p className="text-sm text-gray-600">
                Học phần đã được tạo thành công
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Chi tiết học phần:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Mã HP:</span> {hocPhan.maHp}</p>
              <p><span className="font-medium">Tên HP:</span> {hocPhan.tenHp}</p>
              <p><span className="font-medium">Số tín chỉ:</span> {hocPhan.tinChi}</p>
              <p><span className="font-medium">Loại HP:</span> {hocPhan.loaiHp}</p>
              {hocPhan.hocPhanTienQuyet && (
                <p><span className="font-medium">Tiên quyết:</span> {hocPhan.hocPhanTienQuyet}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Bạn có muốn thêm học phần này vào chương trình đào tạo hiện tại không?</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Ngành: {tenNganh} - Khóa: {khoaHoc}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Không
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Có, thêm vào CTĐT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCTDTConfirmModal;
