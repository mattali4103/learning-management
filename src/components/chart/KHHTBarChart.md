# KHHTBarChart Component Usage Guide

## Overview
`KHHTBarChart` là một component biểu đồ cột có thể hiển thị hai loại dữ liệu:
1. **Kế hoạch học tập (KHHT)**: Hiển thị số tín chỉ và số môn học theo học kỳ
2. **Thống kê tín chỉ**: Hiển thị số tín chỉ đăng ký và tín chỉ cải thiện theo học kỳ

## Props

### KHHTBarChartProps
```typescript
interface KHHTBarChartProps {
  rawData: RawKHHTData[];
  height?: number;
  chartType?: 'khht' | 'statistics'; // Mặc định: 'khht'
}
```

### RawKHHTData Interface
```typescript
interface RawKHHTData {
  id: number;
  maHp: string;
  tenHp: string;
  dieuKien: boolean;
  nhomHp: string;
  soTinChi: number;
  diemChu: string;
  diemSo: number;
  hocKy: {
    maHocKy: number;
    tenHocKy: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    namHoc: {
      id: number;
      namBatDau: string;
      namKetThuc: string;
    };
  };
  namHoc: {
    id: number;
    namBatDau: string;
    namKetThuc: string;
  };
  // Additional properties for statistics
  soTinChiDangKy?: number;
  soTinChiCaiThien?: number;
}
```

## Usage Examples

### 1. Biểu đồ Kế hoạch học tập (mặc định)
```tsx
<KHHTBarChart 
  rawData={keHoachHocTapData} 
  height={400} 
  chartType="khht"
/>
```

### 2. Biểu đồ Thống kê tín chỉ
```tsx
<KHHTBarChart 
  rawData={convertTinChiToChartData(tinChiThongKe)} 
  height={400} 
  chartType="statistics"
/>
```

## Data Conversion for Statistics

Để sử dụng dữ liệu từ API `COUNT_TINCHI_GROUP_BY_HOCKY`, cần convert như sau:

```typescript
// API Response format
interface TinChiThongKe {
  hocKy: {
    maHocKy: number;
    tenHocKy: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    namHoc: {
      id: number;
      namBatDau: string;
      namKetThuc: string;
    };
  };
  soTinChiDangKy: number;
  soTinChiCaiThien: number;
}

// Convert function
const convertTinChiToChartData = (data: TinChiThongKe[]): RawKHHTData[] => {
  return data.map((item, index) => ({
    id: index + 1,
    maHp: `STAT_${item.hocKy.maHocKy}`,
    tenHp: `Thống kê ${item.hocKy.tenHocKy}`,
    dieuKien: false,
    nhomHp: "Thống kê",
    soTinChi: item.soTinChiDangKy,
    diemChu: "",
    diemSo: 0,
    hocKy: {
      maHocKy: item.hocKy.maHocKy,
      tenHocKy: item.hocKy.tenHocKy,
      ngayBatDau: item.hocKy.ngayBatDau,
      ngayKetThuc: item.hocKy.ngayKetThuc,
      namHoc: {
        id: item.hocKy.namHoc.id,
        namBatDau: item.hocKy.namHoc.namBatDau,
        namKetThuc: item.hocKy.namHoc.namKetThuc,
      },
    },
    namHoc: {
      id: item.hocKy.namHoc.id,
      namBatDau: item.hocKy.namHoc.namBatDau,
      namKetThuc: item.hocKy.namHoc.namKetThuc,
    },
    soTinChiDangKy: item.soTinChiDangKy,
    soTinChiCaiThien: item.soTinChiCaiThien,
  } as RawKHHTData));
};
```

## Chart Types Comparison

| Chart Type | Bar 1 | Bar 2 | Màu Bar 1 | Màu Bar 2 |
|------------|-------|-------|-----------|-----------|
| `khht` | Số tín chỉ | Số môn học | #3b82f6 (Blue) | #f59e0b (Amber) |
| `statistics` | Tín chỉ đăng ký | Tín chỉ cải thiện | #3b82f6 (Blue) | #10b981 (Green) |

## Features

- **Responsive**: Tự động điều chỉnh kích thước theo container
- **Interactive**: Click vào bar để navigation (chỉ cho KHHT)
- **Tooltip**: Hiển thị thông tin chi tiết khi hover
- **Legend**: Chú thích rõ ràng cho các loại dữ liệu
- **Empty State**: Hiển thị thông báo khi không có dữ liệu
- **Sorting**: Tự động sắp xếp theo năm học và học kỳ

## API Endpoint

Biểu đồ thống kê sử dụng endpoint:
```
GET /api/khht/sinhvien/tinchi/count_by_hoc_ky/:maSo
```

Response format:
```json
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "hocKy": {
        "maHocKy": 1,
        "tenHocKy": "Học Kỳ 1",
        "ngayBatDau": "2021-09-01",
        "ngayKetThuc": "2022-01-18",
        "namHoc": {
          "id": 1,
          "namBatDau": "2021",
          "namKetThuc": "2022"
        }
      },
      "soTinChiDangKy": 8,
      "soTinChiCaiThien": 0
    }
  ]
}
```
