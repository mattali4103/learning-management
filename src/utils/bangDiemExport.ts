import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { KetQuaHocTapTableType } from '../components/table/KetQuaHocTapTable';
import type { SinhVienProfile } from '../types/SinhVienProfile';

// Cloudinary font URL
const ROBOTO_FONT_URL = 'https://res.cloudinary.com/b2110945/raw/upload/v1752383229/Roboto-Regular.ttf';

// Font configuration cho tiếng Việt
const PDF_CONFIG = {
  font: {
    roboto: 'Roboto',
    helvetica: 'helvetica',
    size: {
      title: 16,
      header: 14,
      normal: 12,
      small: 10,
      tiny: 8
    }
  },
  page: {
    margin: 20,
    headerHeight: 50
  },
  colors: {
    black: [0, 0, 0] as [number, number, number],
    gray: [128, 128, 128] as [number, number, number],
    blue: [0, 100, 200] as [number, number, number]
  }
};

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
 */
const configureRobotoFont = async (doc: jsPDF): Promise<boolean> => {
  try {
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

// Hàm render text UTF-8 an toàn
const renderUTF8Text = (doc: jsPDF, text: string, x: number, y: number) => {
  try {
    doc.text(text, x, y);
  } catch (error) {
    // Fallback nếu có lỗi với UTF-8
    console.warn('UTF-8 render error, using fallback:', error);
    doc.text(text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), x, y);
  }
};

// Hàm format ngày tháng
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '';
  }
};

// Hàm xuất bảng điểm theo mẫu D5050A0
export const exportBangDiemToPDF = async (
  ketQuaData: KetQuaHocTapTableType[],
  sinhVienInfo: SinhVienProfile,
  title: string = 'Bảng Ghi Điểm Thi Học Kỳ'
): Promise<void> => {
  if (!ketQuaData || ketQuaData.length === 0) {
    throw new Error('Không có dữ liệu để xuất bảng điểm');
  }

  if (!sinhVienInfo) {
    throw new Error('Không có thông tin sinh viên');
  }

  // Tạo PDF document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  // Cấu hình font
  const fontLoaded = await configureRobotoFont(doc);
  
  if (fontLoaded) {
    doc.setFont(PDF_CONFIG.font.roboto, 'normal');
  } else {
    doc.setFont(PDF_CONFIG.font.helvetica, 'normal');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.page.margin;

  // Header - Thông tin trường và mẫu
  doc.setFontSize(PDF_CONFIG.font.size.header);
  doc.setTextColor(...PDF_CONFIG.colors.black);
  
  // Trường Đại Học Cần Thơ (bên trái)
  renderUTF8Text(doc, 'Trường Đại Học Cần Thơ', PDF_CONFIG.page.margin, yPosition);
  
  yPosition += 15;

  // Tiêu đề chính
  doc.setFontSize(PDF_CONFIG.font.size.title);
  doc.setTextColor(...PDF_CONFIG.colors.black);
  const titleText = title;
  const titleWidth = doc.getTextWidth(titleText);
  renderUTF8Text(doc, titleText, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 20;

  // Thông tin sinh viên
  doc.setFontSize(PDF_CONFIG.font.size.normal);
  doc.setTextColor(...PDF_CONFIG.colors.black);

  // Họ và tên - Mã số (cùng dòng)
  const hoTenText = `Họ Và Tên ${sinhVienInfo.hoTen || '[họ tên sinh viên]'}`;
  const maSoText = `Mã Số: ${sinhVienInfo.maSo || '[maSo]'}`;
  
  renderUTF8Text(doc, hoTenText, PDF_CONFIG.page.margin, yPosition);
  const maSoWidth = doc.getTextWidth(maSoText);
  renderUTF8Text(doc, maSoText, pageWidth - PDF_CONFIG.page.margin - maSoWidth, yPosition);
  yPosition += 8;

  // Ngày sinh
  const ngaySinhText = `Ngày Sinh ${formatDate(sinhVienInfo.ngaySinh) || '[ngaySinh]'}`;
  renderUTF8Text(doc, ngaySinhText, PDF_CONFIG.page.margin, yPosition);
  yPosition += 8;

  // Ngành - Mã ngành (cùng dòng)
  const nganhText = `Ngành ${sinhVienInfo.tenNganh || '[Tên Ngành]'}`;
  const maNganhText = `${sinhVienInfo.maLop || '[mã lớp]'}`;
  
  renderUTF8Text(doc, nganhText, PDF_CONFIG.page.margin, yPosition);
  const maNganhWidth = doc.getTextWidth(maNganhText);
  renderUTF8Text(doc, maNganhText, pageWidth - PDF_CONFIG.page.margin - maNganhWidth, yPosition);
  yPosition += 15;

  // Tạo bảng điểm
  const tableColumns = [
    { header: 'Mã học phần', dataKey: 'maHp' },
    { header: 'Tên học phần', dataKey: 'tenHp' },
    { header: 'Số tín chỉ', dataKey: 'soTinChi' },
    { header: 'Điểm chữ', dataKey: 'diemChu' },
    { header: 'Điểm số', dataKey: 'diemSo' },
    { header: 'Học kỳ', dataKey: 'hocKy' },
    { header: 'Năm học', dataKey: 'namHoc' }
  ];

  // Chuẩn bị dữ liệu cho bảng
  const tableData = ketQuaData.map((item) => ({
    maHp: item.maHp || '',
    tenHp: item.tenHp || '',
    soTinChi: item.soTinChi || 0,
    diemChu: item.diemChu || '',
    diemSo: item.diemSo ? item.diemSo.toFixed(1) : '',
    hocKy: item.hocKy?.tenHocKy || '',
    namHoc: item.hocKy?.namHoc 
      ? `${item.hocKy.namHoc.namBatDau}-${item.hocKy.namHoc.namKetThuc}` 
      : ''
  }));

  // Tạo bảng với autoTable
  autoTable(doc, {
    startY: yPosition,
    head: [tableColumns.map(col => col.header)],
    body: tableData.map(row => tableColumns.map(col => row[col.dataKey as keyof typeof row])),
    theme: 'grid',
    styles: {
      font: fontLoaded ? PDF_CONFIG.font.roboto : PDF_CONFIG.font.helvetica,
      fontSize: PDF_CONFIG.font.size.small,
      cellPadding: 4,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: PDF_CONFIG.font.size.small,
      font: fontLoaded ? PDF_CONFIG.font.roboto : PDF_CONFIG.font.helvetica,
      cellPadding: 5,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 }, // Mã HP
      1: { halign: 'left', cellWidth: 100 },  // Tên HP (tăng để hiển thị đầy đủ)
      2: { halign: 'center', cellWidth: 20 }, // Tín chỉ
      3: { halign: 'center', cellWidth: 20 }, // Điểm chữ
      4: { halign: 'center', cellWidth: 20 }, // Điểm số
      5: { halign: 'center', cellWidth: 35 }, // Học kỳ
      6: { halign: 'center', cellWidth: 32 }  // Năm học
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.1,
    margin: { 
      left: PDF_CONFIG.page.margin, 
      right: PDF_CONFIG.page.margin 
    },
    willDrawCell: (data: any) => {
      // Ensure font is used for all cells
      if (data.section === 'head') {
        doc.setFont(fontLoaded ? PDF_CONFIG.font.roboto : PDF_CONFIG.font.helvetica, 'normal');
      }
    },
    didParseCell: (data: any) => {
      // Force font for header cells
      if (data.section === 'head') {
        data.cell.styles.font = fontLoaded ? PDF_CONFIG.font.roboto : PDF_CONFIG.font.helvetica;
        data.cell.styles.fontStyle = 'normal';
      }
    }
  });

  // Lấy vị trí Y sau bảng
  yPosition = (doc as any).lastAutoTable.finalY + 20;


  doc.setFontSize(PDF_CONFIG.font.size.normal);
  doc.setTextColor(...PDF_CONFIG.colors.black);
  

  // Footer - Thông tin xuất file
  const timestamp = new Date().toLocaleString('vi-VN');
  doc.setFontSize(PDF_CONFIG.font.size.small);
  doc.setTextColor(...PDF_CONFIG.colors.gray);
  renderUTF8Text(doc, `Xuất ngày: ${timestamp}`, PDF_CONFIG.page.margin, yPosition);

  // Số trang
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(PDF_CONFIG.font.size.small);
    doc.setTextColor(...PDF_CONFIG.colors.gray);
    renderUTF8Text(
      doc,
      `Trang ${i}/${totalPages}`,
      pageWidth - PDF_CONFIG.page.margin - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Lưu file với tên theo mẫu
  const filename = `Bang-diem-${sinhVienInfo.maSo || 'SinhVien'}-${new Date().getFullYear()}.pdf`;
  doc.save(filename);
};
