import React, { useState, useMemo } from 'react';
import { 
  exportTableToPDF,
  type TableColumn,
  type ExportOptions
} from '../utils/pdfExport';

// Sample data for testing
const sampleData = [
  { id: 1, maHp: 'CT101', tenHp: 'Lập trình cơ bản', soTinChi: 3, diem: 8.5, xepLoai: 'Giỏi' },
  { id: 2, maHp: 'CT102', tenHp: 'Cấu trúc dữ liệu và giải thuật', soTinChi: 4, diem: 7.5, xepLoai: 'Khá' },
  { id: 3, maHp: 'CT103', tenHp: 'Cơ sở dữ liệu', soTinChi: 3, diem: 9.0, xepLoai: 'Xuất sắc' },
  { id: 4, maHp: 'CT104', tenHp: 'Mạng máy tính', soTinChi: 3, diem: 7.0, xepLoai: 'Khá' },
  { id: 5, maHp: 'CT105', tenHp: 'Hệ điều hành', soTinChi: 3, diem: 8.0, xepLoai: 'Giỏi' },
  { id: 6, maHp: 'CT106', tenHp: 'Phân tích thiết kế hệ thống', soTinChi: 4, diem: 8.5, xepLoai: 'Giỏi' },
  { id: 7, maHp: 'CT107', tenHp: 'Công nghệ phần mềm', soTinChi: 3, diem: 7.5, xepLoai: 'Khá' },
  { id: 8, maHp: 'CT108', tenHp: 'Trí tuệ nhân tạo', soTinChi: 3, diem: 9.5, xepLoai: 'Xuất sắc' },
  { id: 9, maHp: 'CT109', tenHp: 'Học máy', soTinChi: 4, diem: 8.8, xepLoai: 'Giỏi' },
  { id: 10, maHp: 'CT110', tenHp: 'Xử lý ảnh số', soTinChi: 3, diem: 7.8, xepLoai: 'Khá' },
  { id: 11, maHp: 'CT111', tenHp: 'Phát triển ứng dụng web', soTinChi: 4, diem: 9.2, xepLoai: 'Xuất sắc' },
  { id: 12, maHp: 'CT112', tenHp: 'Bảo mật thông tin', soTinChi: 3, diem: 8.3, xepLoai: 'Giỏi' },
  { id: 13, maHp: 'CT113', tenHp: 'Kiểm thử phần mềm', soTinChi: 3, diem: 7.9, xepLoai: 'Khá' },
  { id: 14, maHp: 'CT114', tenHp: 'DevOps và CI/CD', soTinChi: 3, diem: 8.7, xepLoai: 'Giỏi' },
  { id: 15, maHp: 'CT115', tenHp: 'Blockchain và ứng dụng', soTinChi: 3, diem: 8.1, xepLoai: 'Giỏi' }
];

const columns: TableColumn[] = [
  { header: 'Mã HP', dataKey: 'maHp', width: 60 },
  { header: 'Tên học phần', dataKey: 'tenHp', width: 150 },
  { header: 'Tín chỉ', dataKey: 'soTinChi', width: 50, align: 'center' },
  { header: 'Điểm', dataKey: 'diem', width: 50, align: 'center', formatter: (value) => value?.toFixed(1) || '' },
  { header: 'Xếp loại', dataKey: 'xepLoai', width: 80, align: 'center' }
];

const PDFExportPaginationTest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Calculate pagination
  const totalPages = Math.ceil(sampleData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sampleData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize]);

  // Handle row selection
  const handleRowSelect = (globalIndex: number) => {
    setSelectedRows(prev => 
      prev.includes(globalIndex)
        ? prev.filter(i => i !== globalIndex)
        : [...prev, globalIndex]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === sampleData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sampleData.map((_, index) => index));
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  // Export functions
  const handleExportAll = async () => {
    const options: ExportOptions = {
      title: 'Danh sách học phần - Xuất toàn bộ',
      subtitle: `Tổng cộng ${sampleData.length} học phần`,
      filename: 'hoc-phan-tat-ca.pdf',
      columns,
      data: sampleData,
      showIndex: true,
      selection: { mode: 'all' }
    };

    try {
      await exportTableToPDF(options);
      alert('Xuất toàn bộ dữ liệu thành công!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất file!');
    }
  };

  const handleExportSelection = async () => {
    if (selectedRows.length === 0) {
      alert('Vui lòng chọn ít nhất một dòng để xuất!');
      return;
    }

    const options: ExportOptions = {
      title: 'Danh sách học phần - Xuất theo lựa chọn',
      subtitle: `${selectedRows.length} học phần được chọn`,
      filename: 'hoc-phan-lua-chon.pdf',
      columns,
      data: sampleData,
      showIndex: true,
      selection: { 
        mode: 'selection',
        selectedRows 
      }
    };

    try {
      await exportTableToPDF(options);
      alert('Xuất dữ liệu đã chọn thành công!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất file!');
    }
  };

  const handleExportCurrentPage = async () => {
    const options: ExportOptions = {
      title: 'Danh sách học phần - Xuất trang hiện tại',
      subtitle: `Trang ${currentPage}/${totalPages}`,
      filename: `hoc-phan-trang-${currentPage}.pdf`,
      columns,
      data: sampleData,
      showIndex: true,
      selection: { 
        mode: 'page',
        currentPage,
        pageSize 
      }
    };

    try {
      await exportTableToPDF(options);
      alert(`Xuất trang ${currentPage} thành công!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất file!');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📄 Test PDF Export với Phân trang
          </h1>
          <p className="text-gray-600">
            Demo tính năng xuất PDF với các tùy chọn: Xuất toàn bộ, Xuất theo lựa chọn, Xuất trang hiện tại
          </p>
        </div>

        {/* Export Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleExportAll}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📊 Xuất toàn bộ ({sampleData.length} mục)
            </button>
            
            <button
              onClick={handleExportSelection}
              disabled={selectedRows.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRows.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              ✅ Xuất đã chọn ({selectedRows.length} mục)
            </button>
            
            <button
              onClick={handleExportCurrentPage}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📄 Xuất trang hiện tại ({paginatedData.length} mục)
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Tổng cộng: {sampleData.length} mục</span>
            <span>•</span>
            <span>Đã chọn: {selectedRows.length} mục</span>
            <span>•</span>
            <span>Trang hiện tại: {paginatedData.length} mục</span>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Số mục/trang:
              </label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
              
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {selectedRows.length === sampleData.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Trước
              </button>
              
              <span className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === sampleData.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">STT</th>
                  {columns.map((col, index) => (
                    <th key={index} className="border border-gray-300 px-3 py-2 text-left">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index;
                  const isSelected = selectedRows.includes(globalIndex);
                  
                  return (
                    <tr key={row.id} className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(globalIndex)}
                          className="rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {globalIndex + 1}
                      </td>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-3 py-2">
                          {col.formatter ? col.formatter(row[col.dataKey as keyof typeof row]) : row[col.dataKey as keyof typeof row]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFExportPaginationTest;
