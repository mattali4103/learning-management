import { useState, useEffect } from "react";
import { X, BookOpen, AlertTriangle } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KQHT_SERVICE } from "../../api/apiEndPoints";

interface HocPhanDiemFData {
  id?: number;
  maHp?: string;
  maHocPhan?: string;
  tenHp?: string;
  tenHocPhan?: string;
  diemChu?: string;
  diemSo?: number;
  soTinChi?: number;
  hocPhan?: {
    maHp?: string;
    tenHp?: string;
    soTinChi?: number;
    loaiHp?: string;
  };
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
        
        const endpoint = KQHT_SERVICE.GET_HOC_PHAN_DIEM_F.replace(":maSo", maSo);
        const response = await axiosPrivate.get(endpoint);

        if (response.data.code === 200) {
          const responseData = response.data.data || [];
          
          // Handle both flat and nested data structures
          const processedData = Array.isArray(responseData) ? responseData.map((item: any) => {
            if (item.hocPhan) {
              // Nested structure like HocPhanCaiThien
              return {
                id: item.id,
                maHp: item.hocPhan.maHp,
                tenHp: item.hocPhan.tenHp,
                diemChu: item.diemChu,
                diemSo: item.diemSo,
                soTinChi: item.hocPhan.soTinChi || item.soTinChi,
              };
            } else {
              // Flat structure
              return {
                id: item.id,
                maHp: item.maHp || item.maHocPhan,
                tenHp: item.tenHp || item.tenHocPhan,
                diemChu: item.diemChu,
                diemSo: item.diemSo,
                soTinChi: item.soTinChi,
              };
            }
          }) : [];
          
          setData(processedData);
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
          <div className="space-y-1">
            {data.map((item, index) => {
              // Extract data with fallbacks
              const maHp = item.maHp || item.maHocPhan || 'N/A';
              const tenHp = item.tenHp || item.tenHocPhan || 'Không có tên';
              const diemChu = item.diemChu || 'F';
              const soTinChi = item.soTinChi || 0;
              
              return (
                <div
                  key={item.id || index}
                  className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-red-600 min-w-0 flex-shrink-0">
                          {maHp}
                        </span>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="text-gray-800 flex-1 truncate">
                          {tenHp}
                        </span>
                      </div>
                      {soTinChi > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {soTinChi} tín chỉ
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDiemColor(diemChu)}`}
                      >
                        {diemChu}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Arrow pointer */}
      <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
    </div>
  );
}
