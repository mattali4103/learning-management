import React from 'react';
import { FileDown, Download, FileText } from 'lucide-react';
import { useTablePDFExport, TABLE_COLUMNS } from '../hooks/useTablePDFExport';
import type { TableColumn } from '../utils/pdfExport';

interface PDFExportButtonProps {
  data: any[];
  title: string;
  filename?: string;
  columns?: TableColumn[];
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  disabled?: boolean;
  className?: string;
  // Predefined table types
  tableType?: 'ketQuaHocTap' | 'keHoachHocTap' | 'studentList' | 'semesterOverview' | 'custom';
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  data,
  title,
  filename,
  columns,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  showText = true,
  disabled = false,
  className = '',
  tableType = 'custom'
}) => {
  const { exportTable, exportKetQuaHocTap, exportKeHoachHocTap, exportStudentList } = useTablePDFExport();

  // Get base styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400';
      case 'minimal':
        return 'bg-transparent hover:bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    // Use predefined export functions for specific table types
    switch (tableType) {
      case 'ketQuaHocTap':
        await exportKetQuaHocTap(data, title);
        break;
      case 'keHoachHocTap':
        await exportKeHoachHocTap(data, title);
        break;
      case 'studentList':
        await exportStudentList(data, title);
        break;
      case 'semesterOverview':
        await exportTable({
          title,
          filename: filename || 'tong-quan-hoc-ky.pdf',
          columns: [...TABLE_COLUMNS.semesterOverview],
          data
        });
        break;
      case 'custom':
      default:
        if (!columns || columns.length === 0) {
          alert('Vui lòng cung cấp cấu hình cột cho bảng!');
          return;
        }
        await exportTable({
          title,
          filename: filename || `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          columns,
          data
        });
        break;
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
    <span>Xuất PDF</span>
  ) : null;

  const icon = showIcon ? (
    <FileDown className={getIconSize()} />
  ) : null;

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      className={`
        ${baseStyles}
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      title={`Xuất ${title} thành file PDF`}
    >
      {icon}
      {buttonText}
    </button>
  );
};

// Specialized export buttons for specific table types
export const KetQuaHocTapExportButton: React.FC<Omit<PDFExportButtonProps, 'tableType'>> = (props) => (
  <PDFExportButton {...props} tableType="ketQuaHocTap" />
);

export const KeHoachHocTapExportButton: React.FC<Omit<PDFExportButtonProps, 'tableType'>> = (props) => (
  <PDFExportButton {...props} tableType="keHoachHocTap" />
);

export const StudentListExportButton: React.FC<Omit<PDFExportButtonProps, 'tableType'>> = (props) => (
  <PDFExportButton {...props} tableType="studentList" />
);

export const SemesterOverviewExportButton: React.FC<Omit<PDFExportButtonProps, 'tableType'>> = (props) => (
  <PDFExportButton {...props} tableType="semesterOverview" />
);

// Dropdown export button with multiple format options
interface ExportDropdownProps {
  data: any[];
  title: string;
  tableType?: PDFExportButtonProps['tableType'];
  columns?: TableColumn[];
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  title,
  tableType = 'custom',
  columns,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { exportTable, exportKetQuaHocTap, exportKeHoachHocTap, exportStudentList } = useTablePDFExport();

  const handlePDFExport = () => {
    // Same logic as PDFExportButton
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    switch (tableType) {
      case 'ketQuaHocTap':
        exportKetQuaHocTap(data, title);
        break;
      case 'keHoachHocTap':
        exportKeHoachHocTap(data, title);
        break;
      case 'studentList':
        exportStudentList(data, title);
        break;
      case 'semesterOverview':
        exportTable({
          title,
          filename: 'tong-quan-hoc-ky.pdf',
          columns: [...TABLE_COLUMNS.semesterOverview],
          data
        });
        break;
      case 'custom':
      default:
        if (!columns || columns.length === 0) {
          alert('Vui lòng cung cấp cấu hình cột cho bảng!');
          return;
        }
        exportTable({
          title,
          filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          columns,
          data
        });
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={!data || data.length === 0}
      >
        <Download className="w-4 h-4" />
        <span>Xuất dữ liệu</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              <button
                onClick={handlePDFExport}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="w-4 h-4 text-red-500" />
                Xuất PDF
              </button>
              {/* You can add more export options here like Excel, CSV */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PDFExportButton;
