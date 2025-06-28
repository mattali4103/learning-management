import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  AlertTriangle,
  X,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export type StatusType = "success" | "warning" | "error";

interface StatusInfo {
  status: string;
  description: string;
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  textColor: string;
  icon: LucideIcon;
  trendIcon: LucideIcon;
}

interface StatusCardProps {
  currentCredits: number;
  totalCredits?: number; // Giữ lại để backward compatibility nhưng không bắt buộc
  currentSemester?: number; // Số học kỳ hiện tại
  statusType?: StatusType;
}

export default function StatusCard({
  currentCredits,
  currentSemester,
  statusType,
}: StatusCardProps) {
  const getStatusInfo = (): StatusInfo => {
    if (statusType) {
      // Sử dụng statusType được truyền vào
      switch (statusType) {
        case "success":
          return {
            status: "Đạt tiến độ",
            description: "Tiến độ tốt",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            iconBgColor: "bg-green-500",
            textColor: "text-green-600",
            icon: CheckCircle,
            trendIcon: TrendingUp,
          };
        case "warning":
          return {
            status: "Cảnh báo",
            description: "Cần theo dõi",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            iconBgColor: "bg-yellow-500",
            textColor: "text-yellow-600",
            icon: AlertTriangle,
            trendIcon: TrendingDown,
          };
        case "error":
          return {
            status: "Chưa đạt",
            description: "Trễ tiến độ",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            iconBgColor: "bg-red-500",
            textColor: "text-red-600",
            icon: X,
            trendIcon: TrendingDown,
          };
        default:
          return {
            status: "Chưa đạt",
            description: "Trễ tiến độ",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            iconBgColor: "bg-red-500",
            textColor: "text-red-600",
            icon: X,
            trendIcon: TrendingDown,
          };
      }
    }

    // Logic tính toán tự động dựa trên tín chỉ trung bình mỗi học kỳ
    const averageCreditsPerSemester =
      currentSemester && currentSemester > 0
        ? currentCredits / currentSemester
        : 0;

    // Nếu chưa có dữ liệu học kỳ, hiển thị trạng thái mặc định
    if (!currentSemester || currentSemester === 0) {
      return {
        status: "Chưa có dữ liệu",
        description: "Chưa có thông tin học kỳ",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        iconBgColor: "bg-gray-500",
        textColor: "text-gray-600",
        icon: AlertTriangle,
        trendIcon: TrendingDown,
      };
    }

    if (averageCreditsPerSemester > 15) {
      return {
        status: "Đạt tiến độ",
        description: `${averageCreditsPerSemester.toFixed(1)} TC/học kỳ`,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        iconBgColor: "bg-green-500",
        textColor: "text-green-600",
        icon: CheckCircle,
        trendIcon: TrendingUp,
      };
    } else if (averageCreditsPerSemester >= 12) {
      return {
        status: "Cảnh báo",
        description: `${averageCreditsPerSemester.toFixed(1)} TC/học kỳ`,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconBgColor: "bg-yellow-500",
        textColor: "text-yellow-600",
        icon: AlertTriangle,
        trendIcon: TrendingDown,
      };
    } else {
      return {
        status: "Chưa đạt",
        description: `${averageCreditsPerSemester.toFixed(1)} TC/học kỳ`,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconBgColor: "bg-red-500",
        textColor: "text-red-600",
        icon: X,
        trendIcon: TrendingDown,
      };
    }
  };

  const statusInfo = getStatusInfo();
  const { icon: StatusIcon, trendIcon: TrendIcon } = statusInfo;

  return (
    <div className="text-center">
      <div
        className={`w-32 h-32 mx-auto mb-4 ${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-2xl flex flex-col items-center justify-center`}
      >
        <div
          className={`w-16 h-16 ${statusInfo.iconBgColor} rounded-full flex items-center justify-center mb-2`}
        >
          <StatusIcon className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="flex items-center justify-center mb-2">
        <TrendIcon className={`w-5 h-5 ${statusInfo.textColor} mr-2`} />
        <h3 className="font-semibold text-gray-800">Trạng thái</h3>
      </div>
      <span className={`text-xs ${statusInfo.textColor} font-medium`}>
        {statusInfo.status}
      </span>
    </div>
  );
}
