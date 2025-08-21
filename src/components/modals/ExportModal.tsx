import { Download, X } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableClassifications: string[];
  selectedClassifications: string[];
  onClassificationChange: (classifications: string[]) => void;
  sortBy: "maSo" | "name";
  onSortChange: (sortBy: "maSo" | "name") => void;
  onExport: () => void;
}

const ExportModal = ({
  isOpen,
  onClose,
  availableClassifications,
  selectedClassifications,
  onClassificationChange,
  sortBy,
  onSortChange,
  onExport
}: ExportModalProps) => {
  if (!isOpen) {
    return null;
  }

  const handleClassificationChange = (value: string) => {
    if (value === "") {
      onClassificationChange([]);
    } else {
      onClassificationChange([value]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >

      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Xuất danh sách sinh viên</h2>
              <p className="text-sm text-gray-600">Chọn xếp loại học lực muốn xuất</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Classification Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Chọn xếp loại học lực
              </h3>

              <select
                value={selectedClassifications[0] || ""}
                onChange={(e) => handleClassificationChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">-- Chọn xếp loại --</option>
                <option value="all">Tất cả sinh viên</option>
                {availableClassifications.map((classification) => (
                  <option key={classification} value={classification}>
                    {classification}
                  </option>
                ))}
              </select>

              {availableClassifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Không có dữ liệu xếp loại học lực</p>
                </div>
              )}
            </div>

            {/* Sort Option */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Sắp xếp danh sách
              </h3>

              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as "maSo" | "name")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="maSo">Theo mã số sinh viên (B2110945, B2110946, ...)</option>
                <option value="name">Theo tên sinh viên (A-Z)</option>
              </select>

              <div className="mt-2 text-xs text-gray-500">
                <p>• <strong>Theo mã số:</strong> Sắp xếp theo thứ tự mã số sinh viên từ nhỏ đến lớn</p>
                <p>• <strong>Theo tên:</strong> Sắp xếp theo thứ tự bảng chữ cái của họ tên</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedClassifications.length > 0 ? (
              <>
                Đã chọn: {selectedClassifications[0] === "all" ? "Tất cả sinh viên" : selectedClassifications[0]}
              </>
            ) : (
              'Chưa chọn xếp loại nào'
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onExport}
              disabled={selectedClassifications.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
