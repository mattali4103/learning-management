import React from 'react';
import { jsPDF } from 'jspdf';
import { 
  configureRobotoFont, 
  exportTableToPDF, 
  exportKetQuaHocTapToPDF,
  exportKeHoachHocTapToPDF,
  exportStudentListToPDF,
  exportMultipleTablesToPDF,
  type TableColumn 
} from '../utils/pdfExport';

const PDFExportTest: React.FC = () => {
  // Test data với tiếng Việt có dấu và text dài để test layout và column width
  // Improved column width calculation should prevent "table content could not fit page" warnings
  const testData = [
    {
      maHp: 'QP010',
      tenHp: 'GD quốc phòng và an ninh 1 (*)',
      soTinChi: 2,
      batBuoc: 2,
      tuChon: '',
      soTietLT: 37,
      soTietTH: 8,
      hocPhanTienQuyet: '',
      hocPhanSongHanh: '',
      nhomHp: 'A1',
      diemChu: 'B+',
      diemSo: 7.5,
      tinChi: 2,
      loaiHp: 'Bắt buộc'
    },
    {
      maHp: 'QP011',
      tenHp: 'GD quốc phòng và an ninh 2 (*)',
      soTinChi: 2,
      batBuoc: 2,
      tuChon: '',
      soTietLT: 22,
      soTietTH: 8,
      hocPhanTienQuyet: 'QP010',
      hocPhanSongHanh: '',
      nhomHp: 'A2',
      diemChu: 'A',
      diemSo: 8.5,
      tinChi: 2,
      loaiHp: 'Bắt buộc'
    },
    {
      maHp: 'CT100',
      tenHp: 'Kỹ năng học đại học',
      soTinChi: 2,
      batBuoc: 2,
      tuChon: '',
      soTietLT: 20,
      soTietTH: 20,
      hocPhanTienQuyet: '',
      hocPhanSongHanh: '',
      nhomHp: 'B1',
      diemChu: 'A',
      diemSo: 9.0,
      tinChi: 2,
      loaiHp: 'Bắt buộc'
    },
    {
      maHp: 'CT200',
      tenHp: 'Nền tảng công nghệ thông tin',
      soTinChi: 4,
      batBuoc: 4,
      tuChon: '',
      soTietLT: 45,
      soTietTH: 30,
      hocPhanTienQuyet: '',
      hocPhanSongHanh: '',
      nhomHp: 'C1',
      diemChu: 'B',
      diemSo: 6.8,
      tinChi: 4,
      loaiHp: 'Bắt buộc'
    }
  ];

  const studentData = [
    {
      mssv: 'B2110001',
      hoTen: 'Nguyễn Văn An',
      nganh: { tenNganh: 'Công nghệ thông tin' },
      khoa: 2021,
      gpa: 8.5,
      soTinChiTichLuy: 120
    },
    {
      mssv: 'B2110002', 
      hoTen: 'Trần Thị Bình',
      nganh: { tenNganh: 'Kỹ thuật phần mềm' },
      khoa: 2021,
      gpa: 7.8,
      soTinChiTichLuy: 115
    }
  ];

  const handleTestFontConfiguration = async () => {
    try {
      console.log('Creating PDF document...');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      console.log('Configuring Roboto font...');
      const fontLoaded = await configureRobotoFont(doc);
      
      if (fontLoaded) {
        console.log('Roboto font loaded successfully');
        
        // Test Vietnamese text rendering
        doc.setFontSize(16);
        doc.text('Test Font Roboto - Tiếng Việt có dấu', 20, 30);
        
        doc.setFontSize(14);
        doc.text('Các ký tự đặc biệt: áàảãạăắằẳẵặâấầẩẫậ', 20, 50);
        doc.text('ÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ', 20, 70);
        doc.text('úùủũụưứừửữựýỳỷỹỵđĐ', 20, 90);
        
        doc.setFontSize(12);
        doc.text('Học phần: Giáo dục quốc phòng và an ninh 1', 20, 110);
        doc.text('Ngành: Công nghệ thông tin', 20, 130);
        doc.text('Khoa: Công nghệ thông tin và truyền thông', 20, 150);
        
        // Add current timestamp
        const timestamp = new Date().toLocaleString('vi-VN');
        doc.setFontSize(10);
        doc.text(`Tạo lúc: ${timestamp}`, 20, 180);
        
        // Save the test PDF
        doc.save('test-roboto-font.pdf');
        alert('✅ Test font thành công! PDF đã được tạo với font Roboto.');
      } else {
        console.warn('Font loading failed, using default font');
        
        // Test with default font
        doc.setFontSize(16);
        doc.text('Test with Default Font - Tieng Viet co dau', 20, 30);
        doc.text('(Font Roboto failed to load)', 20, 50);
        
        doc.save('test-default-font.pdf');
        alert('⚠️ Font Roboto không load được, sử dụng font mặc định.');
      }
    } catch (error) {
      console.error('Error during font test:', error);
      alert('❌ Có lỗi xảy ra: ' + error);
    }
  };

  const handleTestTableExport = async () => {
    const columns: TableColumn[] = [
      { header: 'Mã HP', dataKey: 'maHp', width: 25 },
      { header: 'Tên học phần', dataKey: 'tenHp', width: 70 },
      { header: 'Số tín chỉ', dataKey: 'soTinChi', width: 20, align: 'center' },
      { header: 'Bắt buộc', dataKey: 'batBuoc', width: 20, align: 'center' },
      { header: 'Số tiết LT', dataKey: 'soTietLT', width: 20, align: 'center' },
      { header: 'Số tiết TH', dataKey: 'soTietTH', width: 20, align: 'center' },
    ];

    try {
      await exportTableToPDF({
        title: 'Test Bảng với Font Roboto',
        subtitle: 'Sử dụng autoTable và font UTF-8', 
        columns,
        data: testData,
        filename: 'test-table-export.pdf',
        pageOrientation: 'landscape'
      });
      alert('✅ Xuất bảng PDF thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('❌ Có lỗi xảy ra: ' + error);
    }
  };

  const handleTestKetQuaHocTap = async () => {
    try {
      await exportKetQuaHocTapToPDF(testData, 'Kết quả học tập - HK1 2024');
      alert('✅ Xuất PDF kết quả học tập thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('❌ Có lỗi xảy ra: ' + error);
    }
  };

  const handleTestKeHoachHocTap = async () => {
    try {
      await exportKeHoachHocTapToPDF(testData, 'Kế hoạch học tập - Khóa 2021');
      alert('✅ Xuất PDF kế hoạch học tập thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('❌ Có lỗi xảy ra: ' + error);
    }
  };

  const handleTestStudentList = async () => {
    try {
      await exportStudentListToPDF(studentData, 'Danh sách sinh viên - CNTT K21');
      alert('✅ Xuất PDF danh sách sinh viên thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('❌ Có lỗi xảy ra: ' + error);
    }
  };

  const handleTestMultipleTables = async () => {
    try {
      await exportMultipleTablesToPDF([
        {
          title: 'Kết quả học tập',
          options: {
            columns: [
              { header: 'Mã HP', dataKey: 'maHp', width: 25 },
              { header: 'Tên học phần', dataKey: 'tenHp', width: 60 },
              { header: 'Điểm chữ', dataKey: 'diemChu', width: 20, align: 'center' },
              { header: 'Điểm số', dataKey: 'diemSo', width: 20, align: 'center' },
            ],
            data: testData
          }
        },
        {
          title: 'Danh sách sinh viên',
          options: {
            columns: [
              { header: 'MSSV', dataKey: 'mssv', width: 25 },
              { header: 'Họ tên', dataKey: 'hoTen', width: 50 },
              { header: 'GPA', dataKey: 'gpa', width: 20, align: 'center' },
            ],
            data: studentData
          }
        }
      ], 'Báo cáo tổng hợp - HK1 2024', 'bao-cao-tong-hop.pdf');
      alert('✅ Xuất PDF nhiều bảng thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('❌ Có lỗi xảy ra: ' + error);
    }
  };

  const handleGoToPaginationTest = () => {
    // This would navigate to the pagination test component
    // In a real app, you would use React Router or similar
    const newWindow = window.open('/pagination-test', '_blank');
    if (!newWindow) {
      alert('Vui lòng cho phép popup để mở trang test phân trang');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Test PDF Export với Font Roboto & AutoTable</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2 text-blue-800">🎯 Các tính năng được test:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✓ Font Roboto load từ Cloudinary với UTF-8 support</li>
          <li>✓ Export bảng đơn lẻ với <code>exportTableToPDF()</code></li>
          <li>✓ Export nhiều bảng với <code>exportMultipleTablesToPDF()</code></li>
          <li>✓ Export các loại bảng định sẵn (Kết quả, Kế hoạch, Danh sách SV)</li>
          <li>✓ AutoTable styling với alternating colors</li>
          <li>✓ Page numbering và timestamps</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <button
            onClick={handleTestFontConfiguration}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            🔤 Test Font Configuration
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Test cơ bản font Roboto
          </p>
        </div>

        <div>
          <button
            onClick={handleTestTableExport}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            📊 Test Table Export
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Export bảng với autoTable
          </p>
        </div>

        <div>
          <button
            onClick={handleTestKetQuaHocTap}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            � Test Kết quả học tập
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Function export định sẵn
          </p>
        </div>

        <div>
          <button
            onClick={handleTestKeHoachHocTap}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            📋 Test Kế hoạch học tập
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Landscape orientation
          </p>
        </div>

        <div>
          <button
            onClick={handleTestStudentList}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            👥 Test Danh sách SV
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Nested object access
          </p>
        </div>

        <div>
          <button
            onClick={handleTestMultipleTables}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            📚 Test Multiple Tables
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Nhiều bảng trong 1 PDF
          </p>
        </div>

        <div>
          <button
            onClick={handleGoToPaginationTest}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            📄 Test Phân trang & Lựa chọn
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Xuất toàn bộ/theo lựa chọn/theo trang
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">📋 Dữ liệu test:</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Học phần:</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-40">
              {JSON.stringify(testData.slice(0, 2), null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Sinh viên:</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-40">
              {JSON.stringify(studentData, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">📝 Hướng dẫn test:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li><strong>1.</strong> Test font configuration trước để đảm bảo Roboto load được</li>
          <li><strong>2.</strong> Test các function export để kiểm tra bảng hiển thị</li>
          <li><strong>3.</strong> Kiểm tra file PDF tạo ra có hiển thị tiếng Việt đúng không</li>
          <li><strong>4.</strong> Xem console để debug nếu có lỗi</li>
        </ol>
      </div>
    </div>
  );
};

export default PDFExportTest;
