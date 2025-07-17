import React from 'react';
import { PDFExportButton, ExportDropdown } from '../components/PDFExportButton';
import { useTablePDFExport, TABLE_COLUMNS } from '../hooks/useTablePDFExport';

/**
 * Ví dụ cách sử dụng các tính năng export PDF
 */
const PDFExportExample: React.FC = () => {
  // Dữ liệu mẫu cho kết quả học tập
  const ketQuaHocTapData = [
    {
      id: 1,
      maHp: 'CT101',
      tenHp: 'Lập trình cơ bản',
      nhomHp: 'Cơ sở ngành',
      soTinChi: 3,
      diemChu: 'A',
      diemSo: 8.5,
      dieuKien: true
    },
    {
      id: 2,
      maHp: 'CT201',
      tenHp: 'Cấu trúc dữ liệu và giải thuật',
      nhomHp: 'Cơ sở ngành',
      soTinChi: 4,
      diemChu: 'B+',
      diemSo: 7.8,
      dieuKien: false
    },
    {
      id: 3,
      maHp: 'CT301',
      tenHp: 'Cơ sở dữ liệu',
      nhomHp: 'Chuyên ngành',
      soTinChi: 3,
      diemChu: 'A-',
      diemSo: 8.2,
      dieuKien: true
    }
  ];

  // Dữ liệu mẫu cho kế hoạch học tập
  const keHoachHocTapData = [
    {
      id: 1,
      maHp: 'CT102',
      tenHp: 'Lập trình hướng đối tượng',
      tinChi: 3,
      loaiHp: 'Bắt buộc',
      hocPhanTienQuyet: 'CT101'
    },
    {
      id: 2,
      maHp: 'CT202',
      tenHp: 'Phân tích thiết kế thuật toán',
      tinChi: 3,
      loaiHp: 'Bắt buộc',
      hocPhanTienQuyet: 'CT201'
    }
  ];

  // Hook để sử dụng các tính năng export
  const { exportCustomTable, exportMultipleTables } = useTablePDFExport();

  // Ví dụ export với cấu hình tùy chỉnh
  const handleCustomExport = () => {
    const customColumns = [
      { header: 'Mã HP', dataKey: 'maHp', width: 20 },
      { header: 'Tên học phần', dataKey: 'tenHp', width: 80 },
      { header: 'Điểm', dataKey: 'diemSo', width: 20, align: 'center' as const, formatter: (value: number) => `${value}/10` }
    ];

    exportCustomTable(
      ketQuaHocTapData,
      customColumns,
      'Kết quả học tập tùy chỉnh',
      'ket-qua-tuy-chinh.pdf'
    );
  };

  // Ví dụ export nhiều bảng trong 1 file PDF
  const handleMultiTableExport = () => {
    exportMultipleTables([
      {
        title: 'Kết quả học tập',
        options: {
          columns: [...TABLE_COLUMNS.ketQuaHocTap],
          data: ketQuaHocTapData
        }
      },
      {
        title: 'Kế hoạch học tập',
        options: {
          columns: [...TABLE_COLUMNS.keHoachHocTap],
          data: keHoachHocTapData
        }
      }
    ], 'Báo cáo tổng hợp học tập', 'bao-cao-tong-hop.pdf');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ví dụ Export PDF</h1>

      {/* Section 1: Export buttons cơ bản */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">1. Nút Export Cơ Bản</h2>
        <div className="flex flex-wrap gap-3">
          <PDFExportButton
            data={ketQuaHocTapData}
            title="Kết quả học tập"
            tableType="ketQuaHocTap"
            variant="primary"
          />
          
          <PDFExportButton
            data={keHoachHocTapData}
            title="Kế hoạch học tập"
            tableType="keHoachHocTap"
            variant="secondary"
          />
          
          <PDFExportButton
            data={ketQuaHocTapData}
            title="Export tối giản"
            tableType="ketQuaHocTap"
            variant="minimal"
            size="sm"
          />
        </div>
      </div>

      {/* Section 2: Export dropdown */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">2. Dropdown Export</h2>
        <ExportDropdown
          data={ketQuaHocTapData}
          title="Kết quả học tập"
          tableType="ketQuaHocTap"
        />
      </div>

      {/* Section 3: Export tùy chỉnh */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">3. Export Tùy Chỉnh</h2>
        <div className="flex gap-3">
          <button
            onClick={handleCustomExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export với cột tùy chỉnh
          </button>
          
          <button
            onClick={handleMultiTableExport}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Export nhiều bảng
          </button>
        </div>
      </div>

      {/* Section 4: Bảng preview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">4. Preview Dữ Liệu</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Kết quả học tập</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="border p-2">Mã HP</th>
                  <th className="border p-2">Tên học phần</th>
                  <th className="border p-2">Nhóm HP</th>
                  <th className="border p-2">Tín chỉ</th>
                  <th className="border p-2">Điểm chữ</th>
                  <th className="border p-2">Điểm số</th>
                </tr>
              </thead>
              <tbody>
                {ketQuaHocTapData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{item.maHp}</td>
                    <td className="border p-2">{item.tenHp}</td>
                    <td className="border p-2 text-center">{item.nhomHp}</td>
                    <td className="border p-2 text-center">{item.soTinChi}</td>
                    <td className="border p-2 text-center">{item.diemChu}</td>
                    <td className="border p-2 text-center">{item.diemSo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Kế hoạch học tập</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="border p-2">Mã HP</th>
                  <th className="border p-2">Tên học phần</th>
                  <th className="border p-2">Tín chỉ</th>
                  <th className="border p-2">Loại HP</th>
                  <th className="border p-2">Tiên quyết</th>
                </tr>
              </thead>
              <tbody>
                {keHoachHocTapData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{item.maHp}</td>
                    <td className="border p-2">{item.tenHp}</td>
                    <td className="border p-2 text-center">{item.tinChi}</td>
                    <td className="border p-2 text-center">{item.loaiHp}</td>
                    <td className="border p-2 text-center">{item.hocPhanTienQuyet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFExportExample;
