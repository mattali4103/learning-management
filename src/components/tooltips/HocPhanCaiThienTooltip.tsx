import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, AlertCircle, Target, RefreshCw } from "lucide-react";
import { KQHT_SERVICE } from "../../api/apiEndPoints";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

interface HocPhanCaiThien {
  hocPhan: {
    maHp: string;
    tenHp: string;
    soTinChi: number;
    loaiHp: string;
  };
  diemChu: string;
  diemSo: number;
}

interface HocPhanCaiThienTooltipProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const HocPhanCaiThienTooltip: React.FC<HocPhanCaiThienTooltipProps> = ({
  isVisible,
  position,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [hocPhanCaiThien, setHocPhanCaiThien] = useState<HocPhanCaiThien[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  const fetchHocPhanCaiThien = useCallback(async () => {
    if (!auth?.user?.maSo) {
      setError("Không tìm thấy thông tin sinh viên");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching improvement courses for:", auth.user.maSo);
      const response = await axiosPrivate.get(
        KQHT_SERVICE.GET_HOC_PHAN_CAI_THIEN.replace(":maSo", auth.user.maSo)
      );
      
      console.log("API Response:", response.data);
      
      if (response.data.code === 200) {
        // Ensure data is an array and map it properly
        const rawData = Array.isArray(response.data.data) ? response.data.data : [];
        const mappedData: HocPhanCaiThien[] = rawData.map((item: any) => ({
          hocPhan: item.hocPhan || item, // Handle both formats
          diemChu: item.diemChu || "N/A",
          diemSo: item.diemSo || 0,
        }));
        console.log("Mapped data:", mappedData);
        setHocPhanCaiThien(mappedData);
      } else {
        setError("Không thể tải dữ liệu");
        setHocPhanCaiThien([]);
      }
    } catch (error: any) {
      console.error("Error fetching improvement courses:", error);
      setError(error.response?.data?.message || "Lỗi kết nối đến server");
      setHocPhanCaiThien([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.maSo, axiosPrivate]);

  useEffect(() => {
    if (isVisible && auth?.user?.maSo) {
      fetchHocPhanCaiThien();
    }
  }, [isVisible, auth?.user?.maSo, fetchHocPhanCaiThien]);

  const getDiemColor = (diemSo: number) => {
    if (diemSo >= 8.5) return "text-green-600";
    if (diemSo >= 7.0) return "text-blue-600";
    if (diemSo >= 5.5) return "text-yellow-600";
    if (diemSo >= 4.0) return "text-orange-600";
    return "text-red-600";
  };

  if (!isVisible) return null;

  // Calculate tooltip position to ensure it stays within viewport
  const tooltipStyle = {
    position: "fixed" as const,
    left: Math.min(position.x, window.innerWidth - 400),
    top: Math.max(position.y - 10, 20),
    zIndex: 9999,
  };

  return (
    <>
      {/* Backdrop - transparent để cho phép click through */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        onClick={onClose}
      />
      
      {/* Tooltip */}
      <div
        style={tooltipStyle}
        className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-96 max-h-96 overflow-hidden z-[9999] pointer-events-auto"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Học phần có thể cải thiện</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mr-2" />
              <span className="text-gray-600">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          ) : hocPhanCaiThien.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm font-medium">Không có học phần cần cải thiện</p>
              <p className="text-xs text-center mt-1">
                Tất cả học phần đều đã đạt điểm tốt
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {hocPhanCaiThien.map((item, index) => {
                // Safety check for item structure
                const hocPhan = item?.hocPhan || {};
                const maHp = hocPhan.maHp || "N/A";
                const tenHp = hocPhan.tenHp || "Không có tên";
                const diemSo = item?.diemSo || 0;
                const diemChu = item?.diemChu || "N/A";

                return (
                  <div
                    key={`${maHp}-${index}`}
                    className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-blue-600 min-w-0 flex-shrink-0">
                        {maHp}
                      </span>
                      <span className="mx-2 text-gray-400">-</span>
                      <span className="text-gray-800 flex-1 truncate">
                        {tenHp}
                      </span>
                      <span className="mx-2 text-gray-400">-</span>
                      <span className={`font-bold min-w-0 flex-shrink-0 ${getDiemColor(diemSo)}`}>
                        {diemSo.toFixed(1)} ({diemChu})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && hocPhanCaiThien.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span>Tổng cộng: {hocPhanCaiThien.length} học phần</span>
            </div>
          </div>
        )}

        {/* Arrow pointer */}
        <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
      </div>
    </>
  );
};

export default HocPhanCaiThienTooltip;
