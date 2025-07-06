# useHocKyData Hook

Custom hook để quản lý dữ liệu học kỳ và năm học trong ứng dụng Learning Management System.

## Mục đích

Hook này được tạo ra để:
- Tách biệt logic API và xử lý dữ liệu học kỳ/năm học khỏi component chính
- Tái sử dụng logic này ở các component khác nhau
- Dễ dàng bảo trì và test
- Tối ưu hiệu suất với caching và memoization

## Cách sử dụng

```typescript
import useHocKyData from '../hooks/useHocKyData';

const MyComponent = () => {
  const khoaHoc = "2020-2024";
  const maNganh = "CNTT";
  
  const {
    namHocList,
    hocKyList,
    isLoading,
    error,
    fetchHocKy,
    clearError
  } = useHocKyData(khoaHoc, maNganh);

  useEffect(() => {
    fetchHocKy();
  }, [fetchHocKy]);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {/* Render namHocList và hocKyList */}
    </div>
  );
};
```

## API

### Parameters
- `khoaHoc` (string): Khóa học của sinh viên
- `maNganh` (string): Mã ngành của sinh viên

### Returns
- `namHocList`: Danh sách năm học đã được xử lý và sắp xếp
- `hocKyList`: Danh sách học kỳ đã được xử lý
- `isLoading`: Trạng thái loading khi fetch dữ liệu
- `error`: Thông báo lỗi nếu có
- `fetchHocKy`: Function để fetch dữ liệu học kỳ
- `clearError`: Function để xóa error

## Types

```typescript
interface NamHocListItem {
  id: number;
  tenNamHoc: string; // Format: "YYYY-YYYY"
}

interface HocKyListItem {
  id: number;
  tenHocky: string;
  namHocId: number;
}
```

## Tính năng

1. **Auto Processing**: Tự động xử lý dữ liệu từ API thành format phù hợp cho UI
2. **Memoization**: Sử dụng useMemo để tối ưu hiệu suất
3. **Error Handling**: Xử lý lỗi một cách thống nhất
4. **Loading State**: Quản lý trạng thái loading
5. **Dependency Management**: Tự động re-fetch khi khoaHoc hoặc maNganh thay đổi

## Migration từ code cũ

**Trước khi sử dụng hook:**
```typescript
// Phải viết lại logic này ở mọi component
const [hocKyFromAPI, setHocKyFromApi] = useState<HocKy[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchHocKy = useCallback(async () => {
  // Logic fetch và xử lý dữ liệu...
}, [dependencies]);

const namHocList = useMemo(() => {
  // Logic xử lý namHocList...
}, [hocKyFromAPI]);

const hocKyList = useMemo(() => {
  // Logic xử lý hocKyList...
}, [hocKyFromAPI]);
```

**Sau khi sử dụng hook:**
```typescript
// Chỉ cần 1 dòng
const { namHocList, hocKyList, isLoading, error, fetchHocKy } = useHocKyData(khoaHoc, maNganh);
```

## Lợi ích

1. **DRY (Don't Repeat Yourself)**: Tránh lặp lại code
2. **Separation of Concerns**: Tách biệt logic data và UI
3. **Testability**: Dễ dàng test riêng biệt
4. **Reusability**: Có thể sử dụng ở nhiều component
5. **Maintainability**: Dễ bảo trì và cập nhật
