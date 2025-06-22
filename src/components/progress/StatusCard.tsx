import type { LucideIcon } from 'lucide-react';
import { CheckCircle, AlertTriangle, X, TrendingDown, TrendingUp } from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'error';

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
  totalCredits: number;
  statusType?: StatusType;
}

export default function StatusCard({ currentCredits, totalCredits, statusType }: StatusCardProps) {
  const getStatusInfo = (): StatusInfo => {
    if (statusType) {
      // Sử dụng statusType được truyền vào
      switch (statusType) {
        case 'success':
          return {
            status: 'Đạt tiến độ',
            description: 'Tiến độ tốt',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconBgColor: 'bg-green-500',
            textColor: 'text-green-600',
            icon: CheckCircle,
            trendIcon: TrendingUp,
          };
        case 'warning':
          return {
            status: 'Cảnh báo',
            description: 'Cần theo dõi',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconBgColor: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            icon: AlertTriangle,
            trendIcon: TrendingDown,
          };
        case 'error':
          return {
            status: 'Chưa đạt',
            description: 'Trễ tiến độ',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconBgColor: 'bg-red-500',
            textColor: 'text-red-600',
            icon: X,
            trendIcon: TrendingDown,
          };
        default:
          return {
            status: 'Chưa đạt',
            description: 'Trễ tiến độ',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconBgColor: 'bg-red-500',
            textColor: 'text-red-600',
            icon: X,
            trendIcon: TrendingDown,
          };
      }
    }

    // Logic tính toán tự động dựa trên tín chỉ
    const progressPercent = totalCredits > 0 ? (currentCredits / totalCredits) * 100 : 0;
    
    if (progressPercent >= 80) {
      return {
        status: 'Đạt tiến độ',
        description: 'Tiến độ tốt',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconBgColor: 'bg-green-500',
        textColor: 'text-green-600',
        icon: CheckCircle,
        trendIcon: TrendingUp,
      };
    } else if (progressPercent >= 50) {
      return {
        status: 'Cảnh báo',
        description: 'Cần theo dõi',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconBgColor: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        icon: AlertTriangle,
        trendIcon: TrendingDown,
      };
    } else {
      return {
        status: 'Chưa đạt',
        description: 'Trễ tiến độ',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconBgColor: 'bg-red-500',
        textColor: 'text-red-600',
        icon: X,
        trendIcon: TrendingDown,
      };
    }
  };

  const statusInfo = getStatusInfo();
  const { icon: StatusIcon, trendIcon: TrendIcon } = statusInfo;

  return (
    <div className="text-center">
      <div className={`w-32 h-32 mx-auto mb-4 ${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-2xl flex flex-col items-center justify-center`}>
        <div className={`w-16 h-16 ${statusInfo.iconBgColor} rounded-full flex items-center justify-center mb-2`}>
          <StatusIcon className="w-8 h-8 text-white" />
        </div>
        <span className={`text-xs ${statusInfo.textColor} font-medium`}>{statusInfo.status}</span>
      </div>
      <div className="flex items-center justify-center mb-2">
        <TrendIcon className={`w-5 h-5 ${statusInfo.textColor} mr-2`} />
        <h3 className="font-semibold text-gray-800">Trạng thái</h3>
      </div>
      <p className="text-sm text-gray-600">Tiến độ học tập</p>
      <p className={`text-xs ${statusInfo.textColor} font-medium`}>{statusInfo.description}</p>
    </div>
  );
}
