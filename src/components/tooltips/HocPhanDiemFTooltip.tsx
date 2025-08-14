import { useState, useEffect } from "react";
import { X, BookOpen, AlertTriangle } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KQHT_SERVICE } from "../../api/apiEndPoints";

interface HocPhanDiemFData {
  id: number;
  maHp: string;
  tenHp: string;
  diemChu: string;
  diemSo: number;
  soTinChi: number;
  [key: string]: any;
}

interface HocPhanDiemFTooltipProps {
  isVisible: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const getDiemColor = (diemChu: string): string => {
  switch (diemChu) {
    case "F":
      return "text-red-600 bg-red-50 border-red-200";
    case "D":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "D+":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export default function HocPhanDiemFTooltip({
  isVisible,
  onClose,
  position,
  onMouseEnter,
  onMouseLeave,
}: HocPhanDiemFTooltipProps) {
  const [data, setData] = useState<HocPhanDiemFData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { maSo } = auth.user || {};

  useEffect(() => {
    const fetchHocPhanDiemF = async () => {
      if (!maSo || !isVisible) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosPrivate.get(
          KQHT_SERVICE.GET_HOC_PHAN_DIEM_F.replace(":maSo", maSo)
        );

        if (response.data.code === 200) {
          const responseData = response.data.data || [];
          setData(Array.isArray(responseData) ? responseData : []);
        } else {
          setError("Không thể tải dữ liệu học phần nợ");
        }
      } catch (error) {
        console.error("Error fetching hoc phan diem F:", error);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchHocPhanDiemF();
    } else {
      // Reset state khi tooltip bị ẩn
      setData([]);
      setLoading(false);
      setError(null);
    }
  }, [maSo, axiosPrivate, isVisible]);

  // Không hiển thị tooltip nếu isVisible = false
  if (!isVisible) {
    return null;
  }

  // Tính toán vị trí tooltip để không bị tràn ra khỏi màn hình
  const tooltipStyle = {
    position: "fixed" as const,
    left: Math.min(position.x, window.innerWidth - 400),
    top: Math.min(position.y - 10, window.innerHeight - 300),
    zIndex: 1000,
  };

  return (
    <div
      style={tooltipStyle}
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-md min-w-80"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Học phần nợ
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <p>Không có học phần nợ</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.maHp} - {item.tenHp}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDiemColor(
                      item.diemChu
                    )}`}
                  >
                    {item.diemChu}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Tổng cộng: {data.length} học phần nợ
          </p>
        </div>
      )}
    </div>
  );
}
