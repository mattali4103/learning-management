import { useCallback } from 'react';
import { 
  exportTableToPDF, 
  exportKetQuaHocTapToPDF, 
  exportKeHoachHocTapToPDF,
  exportStudentListToPDF,
  exportMultipleTablesToPDF,
  type ExportOptions,
  type TableColumn 
} from '../utils/pdfExport';

/**
 * Hook for table PDF export functionality
 */
export const useTablePDFExport = () => {
  
  // Generic table export
  const exportTable = useCallback(async (options: ExportOptions) => {
    try {
      await exportTableToPDF(options);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.');
    }
  }, []);

  // Export Kết quả học tập
  const exportKetQuaHocTap = useCallback(async (data: any[], title?: string) => {
    try {
      await exportKetQuaHocTapToPDF(data, title);
    } catch (error) {
      console.error('Lỗi khi xuất PDF kết quả học tập:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.');
    }
  }, []);

  // Export Kế hoạch học tập
  const exportKeHoachHocTap = useCallback(async (data: any[], title?: string) => {
    try {
      await exportKeHoachHocTapToPDF(data, title);
    } catch (error) {
      console.error('Lỗi khi xuất PDF kế hoạch học tập:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.');
    }
  }, []);

  // Export Danh sách sinh viên
  const exportStudentList = useCallback(async (data: any[], title?: string) => {
    try {
      await exportStudentListToPDF(data, title);
    } catch (error) {
      console.error('Lỗi khi xuất PDF danh sách sinh viên:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.');
    }
  }, []);

  // Export multiple tables
  const exportMultipleTables = useCallback((
    tables: Array<{
      title: string;
      options: Omit<ExportOptions, 'title' | 'filename'>;
    }>,
    globalTitle?: string,
    filename?: string
  ) => {
    try {
      exportMultipleTablesToPDF(tables, globalTitle, filename);
    } catch (error) {
      console.error('Lỗi khi xuất PDF nhiều bảng:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.');
    }
  }, []);

  // Export with custom columns (flexible for any table)
  const exportCustomTable = useCallback((
    data: any[],
    columns: TableColumn[],
    title: string,
    filename?: string,
    options?: Partial<ExportOptions>
  ) => {
    try {
      exportTableToPDF({
        title,
        filename: filename || `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        columns,
        data,
        ...options
      });
    } catch (error) {
      console.error('Lỗi khi xuất PDF bảng tùy chỉnh:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.');
    }
  }, []);

  return {
    exportTable,
    exportKetQuaHocTap,
    exportKeHoachHocTap,
    exportStudentList,
    exportMultipleTables,
    exportCustomTable
  };
};

/**
 * Common column configurations for different table types
 */
export const TABLE_COLUMNS = {
  ketQuaHocTap: [
    { header: 'Mã học phần', dataKey: 'maHp', width: 25 },
    { header: 'Tên học phần', dataKey: 'tenHp', width: 60 },
    { header: 'Nhóm HP', dataKey: 'nhomHp', width: 20 },
    { header: 'Tín chỉ', dataKey: 'soTinChi', width: 15, align: 'center' as const },
    { header: 'Điểm chữ', dataKey: 'diemChu', width: 20, align: 'center' as const },
    { header: 'Điểm số', dataKey: 'diemSo', width: 20, align: 'center' as const, formatter: (value: number) => value?.toFixed(1) || '' },
  ],
  keHoachHocTap: [
    { header: 'Mã học phần', dataKey: 'maHp', width: 25 },
    { header: 'Tên học phần', dataKey: 'tenHp', width: 70 },
    { header: 'Tín chỉ', dataKey: 'tinChi', width: 15, align: 'center' as const },
    { header: 'Loại HP', dataKey: 'loaiHp', width: 25 },
    { header: 'Tiên quyết', dataKey: 'hocPhanTienQuyet', width: 25 },
  ],
  studentList: [
    { header: 'MSSV', dataKey: 'mssv', width: 25 },
    { header: 'Họ và tên', dataKey: 'hoTen', width: 50 },
    { header: 'Ngành', dataKey: 'nganh.tenNganh', width: 40 },
    { header: 'Khóa', dataKey: 'khoa', width: 15, align: 'center' as const },
    { header: 'GPA', dataKey: 'gpa', width: 20, align: 'center' as const, formatter: (value: number) => value?.toFixed(2) || '' },
    { header: 'Tín chỉ TL', dataKey: 'soTinChiTichLuy', width: 20, align: 'center' as const },
  ],
  semesterOverview: [
    { header: 'Học kỳ', dataKey: 'tenHocKy', width: 30 },
    { header: 'Năm học', dataKey: 'tenNamHoc', width: 30 },
    { header: 'Tín chỉ đăng ký', dataKey: 'soTinChiDangKy', width: 25, align: 'center' as const },
    { header: 'Tín chỉ đạt', dataKey: 'soTinChiDat', width: 25, align: 'center' as const },
    { header: 'GPA học kỳ', dataKey: 'diemTBHocKy', width: 25, align: 'center' as const, formatter: (value: number) => value?.toFixed(2) || '' },
    { header: 'GPA tích lũy', dataKey: 'diemTBTichLuy', width: 25, align: 'center' as const, formatter: (value: number) => value?.toFixed(2) || '' },
  ]
} as const;
