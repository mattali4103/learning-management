# Hướng dẫn Export PDF cho Bảng dữ liệu

Hệ thống này cung cấp các giải pháp export bảng dữ liệu thành file PDF với định dạng đẹp và hỗ trợ tiếng Việt.

## 🚀 Cài đặt

Đã cài đặt sẵn các thư viện cần thiết:
- `jspdf`: Tạo file PDF
- `jspdf-autotable`: Tạo bảng trong PDF

## 📁 Cấu trúc files

```
src/
├── utils/
│   └── pdfExport.ts          # Core export functions
├── hooks/
│   └── useTablePDFExport.ts  # React hook
├── components/
│   ├── PDFExportButton.tsx   # Export button component
│   └── PDFExportExample.tsx  # Ví dụ sử dụng
```

## 🔧 Cách sử dụng

### 1. Sử dụng Component có sẵn

Đã tích hợp vào các bảng:
- `KetQuaHocTapTable` - Có nút export ở header
- `KeHoachHocTapTable` - Có nút export ở header

### 2. Sử dụng PDFExportButton

```tsx
import { PDFExportButton } from '../components/PDFExportButton';

// Export cơ bản
<PDFExportButton
  data={tableData}
  title="Kết quả học tập"
  tableType="ketQuaHocTap"
  variant="primary"
/>

// Export với cấu hình tùy chỉnh
<PDFExportButton
  data={tableData}
  title="Bảng tùy chỉnh"
  columns={[
    { header: 'Mã', dataKey: 'ma', width: 30 },
    { header: 'Tên', dataKey: 'ten', width: 70 }
  ]}
  tableType="custom"
/>
```

### 3. Sử dụng Hook

```tsx
import { useTablePDFExport } from '../hooks/useTablePDFExport';

const MyComponent = () => {
  const { exportKetQuaHocTap, exportCustomTable } = useTablePDFExport();

  const handleExport = () => {
    exportKetQuaHocTap(data, 'Kết quả học tập HK1');
  };

  // Export tùy chỉnh
  const handleCustomExport = () => {
    exportCustomTable(
      data,
      [
        { header: 'Mã HP', dataKey: 'maHp', width: 25 },
        { header: 'Tên HP', dataKey: 'tenHp', width: 70 }
      ],
      'Báo cáo tùy chỉnh'
    );
  };
};
```

### 4. Export nhiều bảng

```tsx
import { exportMultipleTablesToPDF } from '../utils/pdfExport';

const exportMultiple = () => {
  exportMultipleTablesToPDF([
    {
      title: 'Kết quả học tập',
      options: {
        columns: ketQuaColumns,
        data: ketQuaData
      }
    },
    {
      title: 'Kế hoạch học tập', 
      options: {
        columns: keHoachColumns,
        data: keHoachData
      }
    }
  ], 'Báo cáo tổng hợp', 'bao-cao.pdf');
};
```

## 🎨 Tùy chỉnh

### Column Configuration

```tsx
const columns = [
  {
    header: 'Tiêu đề cột',
    dataKey: 'field.nested',      // Hỗ trợ nested object
    width: 30,                    // Độ rộng cột (optional)
    align: 'center',              // left|center|right
    formatter: (value) => `${value}%`  // Format dữ liệu
  }
];
```

### Export Options

```tsx
const options = {
  title: 'Tiêu đề báo cáo',
  subtitle: 'Mô tả thêm',
  filename: 'ten-file.pdf',
  columns: columns,
  data: data,
  showIndex: true,               // Hiện cột STT
  pageOrientation: 'landscape',  // portrait|landscape
  customStyles: {
    // Tùy chỉnh jsPDF autoTable styles
    headStyles: { fillColor: [255, 0, 0] }
  }
};
```

## 📋 Loại bảng có sẵn

### 1. Kết quả học tập (`ketQuaHocTap`)
- Mã học phần, Tên học phần, Nhóm HP, Tín chỉ, Điểm chữ, Điểm số

### 2. Kế hoạch học tập (`keHoachHocTap`)  
- Mã học phần, Tên học phần, Tín chỉ, Loại HP, Tiên quyết

### 3. Danh sách sinh viên (`studentList`)
- MSSV, Họ tên, Ngành, Khóa, GPA, Tín chỉ tích lũy

### 4. Tổng quan học kỳ (`semesterOverview`)
- Học kỳ, Năm học, Tín chỉ ĐK, Tín chỉ đạt, GPA HK, GPA TL

## 🎯 Ví dụ chi tiết

Xem file `PDFExportExample.tsx` để có ví dụ đầy đủ về cách sử dụng.

## 🔄 Chạy ví dụ

1. Import component vào route:
```tsx
import PDFExportExample from '../components/PDFExportExample';

// Thêm vào router
<Route path="/pdf-example" component={PDFExportExample} />
```

2. Hoặc sử dụng trực tiếp trong component hiện có

## ⚡ Tips & Best Practices

1. **Kiểm tra dữ liệu**: Luôn kiểm tra `data.length > 0` trước khi export
2. **Nested data**: Sử dụng `dataKey: 'user.profile.name'` cho dữ liệu lồng nhau
3. **Format dữ liệu**: Dùng `formatter` để format số, ngày tháng
4. **Tên file**: Sử dụng tên file có nghĩa và không có ký tự đặc biệt
5. **Performance**: Với bảng lớn (>1000 rows), cân nhắc phân trang

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **"Không có dữ liệu để xuất"**
   - Kiểm tra `data` có được truyền đúng không
   - Đảm bảo `data.length > 0`

2. **"Lỗi khi xuất PDF"** 
   - Kiểm tra cấu hình `columns` đúng format
   - Đảm bảo `dataKey` tồn tại trong dữ liệu

3. **File PDF bị lỗi font**
   - jsPDF sử dụng font mặc định, không hỗ trợ tiếng Việt hoàn hảo
   - Cân nhắc sử dụng thư viện khác nếu cần font tiếng Việt tốt hơn

4. **Bảng quá rộng**
   - Sử dụng `pageOrientation: 'landscape'`
   - Điều chỉnh `width` của từng cột
   - Rút gọn nội dung cột

## 🚀 Mở rộng

Có thể thêm các tính năng:
- Export Excel (xlsx)
- Export CSV
- In trực tiếp
- Lưu template PDF
- Email PDF

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log có lỗi gì không
2. Dữ liệu đầu vào có đúng format không  
3. Cấu hình columns có match với data không
