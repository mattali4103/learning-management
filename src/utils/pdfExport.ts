import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Cloudinary font URL
const ROBOTO_FONT_URL = 'https://res.cloudinary.com/b2110945/raw/upload/v1752383229/Roboto-Regular.ttf';

// PDF Configuration
const PDF_CONFIG = {
  font: {
    roboto: 'Roboto',
    helvetica: 'helvetica',
    size: {
      title: 18,
      header: 14,
      body: 11,
      small: 9
    }
  },
  colors: {
    primary: [59, 130, 246],     // Blue
    secondary: [107, 114, 128],   // Gray
    success: [16, 185, 129],      // Green
    warning: [245, 158, 11],      // Yellow
    error: [239, 68, 68]          // Red
  },
  page: {
    format: 'a4' as const,
    orientation: 'portrait' as const,
    margin: 20
  }
};

// Interface for table column configuration
export interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
}

// Interface for export options
export interface SelectionOptions {
  mode: 'all' | 'selection' | 'page';
  selectedRows?: number[]; // Used for 'selection' mode
  currentPage?: number;    // Used for 'page' mode
  pageSize?: number;       // Used for 'page' mode
}

// Interface for export options
export interface ExportOptions {
  title?: string;
  subtitle?: string;
  filename?: string;
  columns: TableColumn[];
  data: any[];
  showIndex?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  customStyles?: any;
  selection?: SelectionOptions;
}

// Helper function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(buffer);
  let binaryString = '';
  const chunkSize = 8192;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binaryString);
};

/**
 * Configure Roboto font for jsPDF with UTF-8 support
 * This function loads the Roboto font from Cloudinary and sets it up in jsPDF
 * to properly display Vietnamese characters and other UTF-8 text.
 * 
 * @param doc - The jsPDF document instance
 * @returns Promise<boolean> - Returns true if font was loaded successfully, false otherwise
 */
export const configureRobotoFont = async (doc: jsPDF): Promise<boolean> => {
  try {
    console.log('Loading Roboto font from Cloudinary...');
    
    const fontResponse = await fetch(ROBOTO_FONT_URL);
    
    if (!fontResponse.ok) {
      console.warn(`Failed to fetch Roboto font, status: ${fontResponse.status}`);
      return false;
    }
    
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontArrayBuffer);
    
    // Add the font to jsPDF
    doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    
    // Set Roboto as the default font
    doc.setFont("Roboto", "normal");
    
    console.log('Roboto font loaded and configured successfully');
    return true;
  } catch (error) {
    console.warn('Failed to load Roboto font from Cloudinary, falling back to default:', error);
    return false;
  }
};

// Helper function to render UTF-8 text
const renderUTF8Text = (doc: jsPDF, text: string, x: number, y: number, options?: any): void => {
  try {
    doc.text(text, x, y, options);
  } catch (error) {
    console.warn('UTF-8 text encoding error, using original text:', error);
    doc.text(text, x, y, options);
  }
};

// Helper function to get nested object value
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Export table data to PDF with UTF-8 support and Roboto font
 */
export const exportTableToPDF = async (options: ExportOptions): Promise<void> => {
  const {
    title = 'Báo cáo',
    subtitle,
    filename = 'bao-cao.pdf',
    columns,
    data,
    showIndex = true,
    pageOrientation = 'portrait',
    customStyles = {}
  } = options;

  if (!data || data.length === 0) {
    throw new Error('Không có dữ liệu để xuất');
  }

  // Create new PDF document
  const doc = new jsPDF({
    orientation: pageOrientation,
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  // Configure Roboto font
  const fontLoaded = await configureRobotoFont(doc);
  
  // Ensure font is properly set before drawing table
  if (fontLoaded) {
    doc.setFont(PDF_CONFIG.font.roboto, 'normal');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.page.margin;

  // Add title
  if (title) {
    doc.setFontSize(PDF_CONFIG.font.size.title);
    doc.setTextColor(0, 0, 0);
    
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    renderUTF8Text(doc, title, titleX, yPosition);
    yPosition += 12;
  }

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(PDF_CONFIG.font.size.header);
    doc.setTextColor(60, 60, 60);
    
    const subtitleWidth = doc.getTextWidth(subtitle);
    const subtitleX = (pageWidth - subtitleWidth) / 2;
    renderUTF8Text(doc, subtitle, subtitleX, yPosition);
    yPosition += 10;
  }

  // Add timestamp
  const timestamp = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(PDF_CONFIG.font.size.small);
  doc.setTextColor(120, 120, 120);
  renderUTF8Text(doc, `Xuất ngày: ${timestamp}`, PDF_CONFIG.page.margin, yPosition);
  yPosition += 15;

  // Prepare table headers
  const headers = showIndex 
    ? ['STT', ...columns.map(col => col.header)]
    : columns.map(col => col.header);

  // Prepare table data
  const tableData = data.map((row, index) => {
    const rowData = columns.map(col => {
      const value = getNestedValue(row, col.dataKey);
      const formattedValue = col.formatter ? col.formatter(value) : (value || '');
      return String(formattedValue);
    });
    
    return showIndex ? [String(index + 1), ...rowData] : rowData;
  });

  // Calculate column widths (for reference, autoTable will handle actual widths)
  const availableWidth = pageWidth - (2 * PDF_CONFIG.page.margin);
  calculateColumnWidths(columns, availableWidth, showIndex);

  // Force set font before autoTable
  if (fontLoaded) {
    doc.setFont(PDF_CONFIG.font.roboto, 'normal');
  }

  // Use jsPDF autoTable for table rendering
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPosition,
    margin: { left: PDF_CONFIG.page.margin, right: PDF_CONFIG.page.margin },
    columnStyles: getColumnStyles(columns, showIndex),
    headStyles: {
      fillColor: PDF_CONFIG.colors.primary as [number, number, number],
      textColor: [255, 255, 255],
      fontSize: PDF_CONFIG.font.size.body + 1,
      fontStyle: 'normal',
      halign: 'center',
      font: PDF_CONFIG.font.roboto
    },
    bodyStyles: {
      fontSize: PDF_CONFIG.font.size.body,
      textColor: [0, 0, 0],
      font: PDF_CONFIG.font.roboto
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255]
    },
    styles: {
      font: PDF_CONFIG.font.roboto,
      cellPadding: 4,
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
      ...customStyles
    },
    didDrawPage: () => {
      // Add page numbers
      const pageNumber = doc.getNumberOfPages();
      doc.setFontSize(PDF_CONFIG.font.size.small);
      doc.setTextColor(120, 120, 120);
      renderUTF8Text(
        doc,
        `Trang ${pageNumber}`,
        pageWidth - PDF_CONFIG.page.margin - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    },
    willDrawCell: (data: any) => {
      // Ensure Roboto font is used for all cells, especially headers
      if (data.section === 'head') {
        doc.setFont(PDF_CONFIG.font.roboto, 'normal');
      }
    },
    didParseCell: (data: any) => {
      // Force font for header cells
      if (data.section === 'head') {
        data.cell.styles.font = PDF_CONFIG.font.roboto;
        data.cell.styles.fontStyle = 'normal';
      }
    }
  });

  // Save the PDF
  doc.save(filename);
};

// Helper function to calculate column widths
const calculateColumnWidths = (
  columns: TableColumn[], 
  availableWidth: number, 
  showIndex: boolean
): number[] => {
  const indexWidth = showIndex ? 15 : 0;
  
  const widths: number[] = [];
  
  if (showIndex) {
    widths.push(indexWidth);
  }
  
  // Calculate widths based on column type and header length
  columns.forEach(col => {
    if (col.width) {
      widths.push(col.width);
      return;
    }
    
    const header = col.header.toLowerCase();
    const dataKey = col.dataKey.toLowerCase();
    
    // Auto-calculate based on content type
    if (header.includes('mã') || dataKey.includes('ma')) {
      widths.push(25);
    } else if (header.includes('tên') || dataKey.includes('ten')) {
      widths.push(60);
    } else if (header.includes('điểm') || dataKey.includes('diem')) {
      widths.push(20);
    } else if (header.includes('tín chỉ') || dataKey.includes('tinchi')) {
      widths.push(18);
    } else {
      widths.push(30);
    }
  });
  
  // Scale to fit available width
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  if (totalWidth > availableWidth) {
    const scale = availableWidth / totalWidth;
    return widths.map(w => w * scale);
  }
  
  return widths;
};

// Helper function to get column styles for autoTable
const getColumnStyles = (columns: TableColumn[], showIndex: boolean): any => {
  const styles: any = {};
  
  if (showIndex) {
    styles[0] = { halign: 'center', cellWidth: 15 };
  }
  
  columns.forEach((col, index) => {
    const colIndex = showIndex ? index + 1 : index;
    styles[colIndex] = {
      halign: col.align || 'left',
      cellWidth: col.width || 'auto'
    };
  });
  
  return styles;
};

/**
 * Export multiple tables to a single PDF
 */
export const exportMultipleTablesToPDF = async (
  tables: Array<{
    title: string;
    options: Omit<ExportOptions, 'title' | 'filename'>;
  }>,
  globalTitle: string = 'Báo cáo tổng hợp',
  filename: string = 'bao-cao-tong-hop.pdf'
): Promise<void> => {
  if (!tables || tables.length === 0) {
    throw new Error('Không có bảng nào để xuất');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configure Roboto font
  const fontLoaded = await configureRobotoFont(doc);
  
  // Ensure font is properly set
  if (fontLoaded) {
    doc.setFont(PDF_CONFIG.font.roboto, 'normal');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.page.margin;

  // Add global title
  doc.setFontSize(PDF_CONFIG.font.size.title);
  doc.setTextColor(0, 0, 0);
  const titleWidth = doc.getTextWidth(globalTitle);
  renderUTF8Text(doc, globalTitle, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 15;

  // Add timestamp
  const timestamp = new Date().toLocaleString('vi-VN');
  doc.setFontSize(PDF_CONFIG.font.size.small);
  doc.setTextColor(120, 120, 120);
  renderUTF8Text(doc, `Xuất ngày: ${timestamp}`, PDF_CONFIG.page.margin, yPosition);
  yPosition += 20;

  // Process each table
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    
    if (i > 0) {
      doc.addPage();
      yPosition = PDF_CONFIG.page.margin;
    }

    // Add table title
    doc.setFontSize(PDF_CONFIG.font.size.header);
    doc.setTextColor(0, 0, 0);
    renderUTF8Text(doc, table.title, PDF_CONFIG.page.margin, yPosition);
    yPosition += 15;

    // Export this table
    const { columns, data, showIndex = true, customStyles = {} } = table.options;
    
    if (data && data.length > 0) {
      const headers = showIndex 
        ? ['STT', ...columns.map(col => col.header)]
        : columns.map(col => col.header);

      const tableData = data.map((row, index) => {
        const rowData = columns.map(col => {
          const value = getNestedValue(row, col.dataKey);
          const formattedValue = col.formatter ? col.formatter(value) : (value || '');
          return String(formattedValue);
        });
        
        return showIndex ? [String(index + 1), ...rowData] : rowData;
      });

      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: yPosition,
        margin: { left: PDF_CONFIG.page.margin, right: PDF_CONFIG.page.margin },
        columnStyles: getColumnStyles(columns, showIndex),
        headStyles: {
          fillColor: PDF_CONFIG.colors.primary as [number, number, number],
          textColor: [255, 255, 255],
          fontSize: PDF_CONFIG.font.size.body + 1,
          fontStyle: 'normal',
          halign: 'center',
          font: PDF_CONFIG.font.roboto
        },
        bodyStyles: {
          fontSize: PDF_CONFIG.font.size.body,
          textColor: [0, 0, 0],
          font: PDF_CONFIG.font.roboto
        },
        alternateRowStyles: {
          fillColor: [250, 252, 255]
        },
        styles: {
          font: PDF_CONFIG.font.roboto,
          cellPadding: 4,
          lineColor: [180, 180, 180],
          lineWidth: 0.3,
          ...customStyles
        },
        willDrawCell: (data: any) => {
          // Ensure Roboto font is used for all cells, especially headers
          if (data.section === 'head') {
            doc.setFont(PDF_CONFIG.font.roboto, 'normal');
          }
        },
        didParseCell: (data: any) => {
          // Force font for header cells
          if (data.section === 'head') {
            data.cell.styles.font = PDF_CONFIG.font.roboto;
            data.cell.styles.fontStyle = 'normal';
          }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(PDF_CONFIG.font.size.small);
    doc.setTextColor(120, 120, 120);
    renderUTF8Text(
      doc,
      `Trang ${i}/${totalPages}`,
      pageWidth - PDF_CONFIG.page.margin - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(filename);
};

// Predefined export functions for common tables
export const exportKetQuaHocTapToPDF = async (data: any[], title: string = 'Kết quả học tập'): Promise<void> => {
  const columns: TableColumn[] = [
    { header: 'Mã học phần', dataKey: 'maHp', width: 25 },
    { header: 'Tên học phần', dataKey: 'tenHp', width: 60 },
    { header: 'Nhóm HP', dataKey: 'nhomHp', width: 20 },
    { header: 'Tín chỉ', dataKey: 'soTinChi', width: 15, align: 'center' },
    { header: 'Điểm chữ', dataKey: 'diemChu', width: 20, align: 'center' },
    { header: 'Điểm số', dataKey: 'diemSo', width: 20, align: 'center', formatter: (value) => value?.toFixed(1) || '' },
  ];

  await exportTableToPDF({
    title,
    columns,
    data,
    filename: 'ket-qua-hoc-tap.pdf'
  });
};

export const exportKeHoachHocTapToPDF = async (data: any[], title: string = 'Kế hoạch học tập'): Promise<void> => {
  const columns: TableColumn[] = [
    { header: 'Mã học phần', dataKey: 'maHp', width: 25 },
    { header: 'Tên học phần', dataKey: 'tenHp', width: 70 },
    { header: 'Tín chỉ', dataKey: 'tinChi', width: 15, align: 'center' },
    { header: 'Loại HP', dataKey: 'loaiHp', width: 25 },
    { header: 'Tiên quyết', dataKey: 'hocPhanTienQuyet', width: 25 },
  ];

  await exportTableToPDF({
    title,
    columns,
    data,
    filename: `${title}.pdf`,
    pageOrientation: 'portrait'
  });
};

export const exportStudentListToPDF = async (data: any[], title: string = 'Danh sách sinh viên'): Promise<void> => {
  const columns: TableColumn[] = [
    { header: 'MSSV', dataKey: 'mssv', width: 25 },
    { header: 'Họ và tên', dataKey: 'hoTen', width: 50 },
    { header: 'Ngành', dataKey: 'nganh.tenNganh', width: 40 },
    { header: 'Khóa', dataKey: 'khoa', width: 15, align: 'center' },
    { header: 'GPA', dataKey: 'gpa', width: 20, align: 'center', formatter: (value) => value?.toFixed(2) || '' },
    { header: 'Tín chỉ TL', dataKey: 'soTinChiTichLuy', width: 20, align: 'center' },
  ];

  await exportTableToPDF({
    title,
    columns,
    data,
    filename: 'danh-sach-sinh-vien.pdf'
  });
};

export const exportSemesterOverviewToPDF = async (data: any[], title: string = 'Tổng quan học kỳ'): Promise<void> => {
  const columns: TableColumn[] = [
    { header: 'Học kỳ', dataKey: 'hocKy', width: 20, align: 'center' },
    { header: 'Năm học', dataKey: 'namHoc', width: 25, align: 'center' },
    { header: 'Tín chỉ ĐK', dataKey: 'tinChiDangKy', width: 20, align: 'center' },
    { header: 'Tín chỉ đạt', dataKey: 'tinChiDat', width: 20, align: 'center' },
    { header: 'GPA HK', dataKey: 'gpaHocKy', width: 20, align: 'center', formatter: (value) => value?.toFixed(2) || '' },
    { header: 'GPA TL', dataKey: 'gpaTichLuy', width: 20, align: 'center', formatter: (value) => value?.toFixed(2) || '' },
  ];

  await exportTableToPDF({
    title,
    columns,
    data,
    filename: 'tong-quan-hoc-ky.pdf'
  });
};
