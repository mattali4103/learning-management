import React, { useState, useEffect, useRef } from "react";
import { User, Calendar, GraduationCap, BookOpen, Trophy, CreditCard, TrendingUp, UserCheck, ExternalLink } from "lucide-react";
import { type PreviewProfile } from "../../types/PreviewProfile";

interface StudentTooltipProps {
  student: PreviewProfile | null;
  isVisible: boolean;
  position: { x: number; y: number };
  delay?: number;
  onViewDetails?: (maSo: string) => void;
}

const StudentTooltip: React.FC<StudentTooltipProps> = ({
  student,
  isVisible,
  position,
  delay = 300,
  onViewDetails,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible && student) {
      timeoutId = setTimeout(() => {
        setShowTooltip(true);
      }, delay);
    } else {
      setShowTooltip(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, student, delay]);

  useEffect(() => {
    if (showTooltip && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x + 20; // Offset from cursor
      let y = position.y + 20;

      // Adjust if tooltip goes off screen
      if (x + rect.width > viewportWidth) {
        x = position.x - rect.width - 20;
      }
      if (y + rect.height > viewportHeight) {
        y = position.y - rect.height - 20;
      }

      // Ensure tooltip doesn't go off left edge
      if (x < 0) {
        x = 10;
      }
      // Ensure tooltip doesn't go off top edge
      if (y < 0) {
        y = 10;
      }

      setTooltipPosition({ x, y });
    }
  }, [showTooltip, position]);

  if (!showTooltip || !student) return null;

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Xuất sắc":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Giỏi":
        return "bg-green-100 text-green-700 border-green-200";
      case "Khá":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Trung bình":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Yếu":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Kém":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      ref={tooltipRef}
      data-student-tooltip
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
      }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt={`Avatar của ${student.hoTen}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.className = "w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center";
                  parent.innerHTML = '<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                }
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{student.hoTen}</h3>
          <p className="text-sm text-gray-500 font-mono">{student.maSo}</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2 text-sm">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="text-gray-600">Khóa {student.khoaHoc || "N/A"}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <BookOpen className="w-4 h-4 text-green-600" />
          <span className="text-gray-600 truncate">{student.tenNganh || "N/A"}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <UserCheck className="w-4 h-4 text-purple-600" />
          <span className="text-gray-600">{student.gioiTinh ? "Nam" : "Nữ"}</span>
        </div>

        {student.ngaySinh && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span className="text-gray-600">
              {new Date(student.ngaySinh).toLocaleDateString("vi-VN")}
            </span>
          </div>
        )}
      </div>

      {/* Academic Performance */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-1 mb-2">
          <Trophy className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-gray-700">Kết quả học tập</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <CreditCard className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-gray-500">Tín chỉ</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {student.soTinChiTichLuy || 0}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-gray-500">GPA</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {student.diemTrungBinhTichLuy?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
          <div className="text-center">
            <span className="block">Cải thiện</span>
            <span className="font-semibold text-orange-600">
              {student.soTinChiCaiThien || 0}
            </span>
          </div>
          <div className="text-center">
            <span className="block">Đã đăng ký ở học kỳ này</span>
            <span className="font-semibold text-purple-600">
              {student.soTinChiDangKyHienTai || 0}
            </span>
          </div>
        </div>

        {/* Classification */}
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getClassificationColor(
              student.xepLoaiHocLuc
            )}`}
          >
            {student.xepLoaiHocLuc || "Chưa xác định"}
          </span>
        </div>

        {/* Cảnh báo học vụ */}
        {student.canhBaoHocVu && student.canhBaoHocVu.lyDo ? (
          <div className="mt-2">
            <div className="text-center mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                ⚠️ Nguy cơ cảnh báo học vụ
              </span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <p className="text-xs text-red-700">
                <strong>Lý do:</strong> {student.canhBaoHocVu.lyDo}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              ✓ Không có cảnh báo
            </span>
          </div>
        )}
      </div>

      {/* View Details Button */}
      {onViewDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(student.maSo);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Xem chi tiết</span>
          </button>
        </div>
      )}

      {/* Arrow pointer */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
    </div>
  );
};

export default StudentTooltip;
