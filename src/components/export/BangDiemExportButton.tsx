import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { PROFILE_SERVICE } from '../../api/apiEndPoints';
import { exportBangDiemToPDF } from '../../utils/bangDiemExport';
import type { KetQuaHocTapTableType } from '../table/KetQuaHocTapTable';

interface BangDiemExportButtonProps {
  data: KetQuaHocTapTableType[];
  maSo: string;
  title?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
  disabled?: boolean;
}

export const BangDiemExportButton: React.FC<BangDiemExportButtonProps> = ({
  data,
  maSo,
  title = 'Bảng ghi điểm thi học kỳ',
  variant = 'primary',
  size = 'md',
  showText = true,
  showIcon = true,
  className = '',
  disabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'secondary':
        return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';
      case 'minimal':
        return 'bg-transparent hover:bg-gray-100 text-gray-600 border-transparent';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'md':
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      case 'md':
      default:
        return 'w-5 h-5';
    }
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất bảng điểm!');
      return;
    }

    if (!maSo) {
      alert('Không tìm thấy mã số sinh viên!');
      return;
    }

    try {
      setIsExporting(true);

      // Fetch thông tin sinh viên từ API
      const profileResponse = await axiosPrivate.get(
        PROFILE_SERVICE.GET_MY_PROFILE.replace(':maSo', maSo)
      );

      if (profileResponse.status !== 200 || profileResponse.data?.code !== 200) {
        throw new Error('Không thể lấy thông tin sinh viên');
      }

      const sinhVienInfo = profileResponse.data.data;
      
      // Export bảng điểm với thông tin sinh viên
      await exportBangDiemToPDF(data, sinhVienInfo, title);
    } catch (error) {
      console.error('Lỗi khi xuất bảng điểm:', error);
      alert('Có lỗi xảy ra khi xuất bảng điểm. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    border rounded-lg font-medium 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current
  `;

  const buttonText = showText ? (
    <span>{isExporting ? 'Đang xuất...' : 'Xuất bảng điểm'}</span>
  ) : null;

  const icon = showIcon ? (
    isExporting ? (
      <Loader2 className={`${getIconSize()} animate-spin`} />
    ) : (
      <FileDown className={getIconSize()} />
    )
  ) : null;

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0 || isExporting}
      className={`
        ${baseStyles}
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      title={`Xuất ${title} thành file PDF theo mẫu D5050A0`}
    >
      {icon}
      {buttonText}
    </button>
  );
};

export default BangDiemExportButton;
