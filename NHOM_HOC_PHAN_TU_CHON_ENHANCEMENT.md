# Cải tiến Modal ThemKHHTModal - Hiển thị Nhóm Học phần Tự chọn

## Các tính năng đã thêm

### 1. Hiển thị Nhóm Học phần Tự chọn từ Chương trình Đào tạo
- **Vị trí**: Modal ThemKHHTModal
- **Tính năng**: Hiển thị các học phần trong nhóm học phần tự chọn thuộc chương trình đào tạo
- **Logic**: Fetch dữ liệu từ API `CTDT_HOC_PHAN_TU_CHON_LIST`

### 2. Loại bỏ Trùng lặp Học phần
- **Logic**: Filter các học phần trùng lặp trong mỗi nhóm tự chọn
- **Implementation**: Sử dụng `findIndex` để loại bỏ học phần có cùng `maHp`

### 3. Hiển thị Trạng thái Hoàn thành
- **Completed**: Đã hoàn thành đủ tín chỉ yêu cầu (màu xanh)
- **In Progress**: Đang thực hiện (màu cam)  
- **Not Started**: Chưa bắt đầu (màu xanh dương)

### 4. Xử lý Học phần có Đánh số (N1, N2, N3...)
- **Logic đặc biệt**: Chỉ cần hoàn thành 1 trong các học phần cùng nhóm
- **Pattern matching**: Tìm học phần có pattern `- N[số]` (ví dụ: "Lập trình Web - N1", "Lập trình Web - N2")
- **Tính tín chỉ**: Nếu hoàn thành 1 học phần trong nhóm → tính tín chỉ cho cả nhóm

## Chi tiết Implementation

### 1. States và Functions đã thêm

#### ThemKHHTModal.tsx
```tsx
// State mới
const [nhomHocPhanTuChon, setNhomHocPhanTuChon] = useState<HocPhanTuChon[]>([]);

// Function fetch dữ liệu
const fetchNhomHocPhanTuChon = useCallback(async () => {
  // Fetch từ API CTDT_HOC_PHAN_TU_CHON_LIST
  // Loại bỏ trùng lặp học phần
}, [axiosPrivate, selectedKhoaHoc, selectedNganh]);

// Truyền props cho CollapsibleSubjectsTable
<CollapsibleSubjectsTable
  nhomHocPhanTuChon={nhomHocPhanTuChon}
  // ... other props
/>
```

#### CollapsibleSubjectsTable.tsx
```tsx
// Interface cập nhật
interface CollapsibleSubjectsTableProps {
  nhomHocPhanTuChon?: HocPhanTuChon[];
  // ... other props
}

// Logic xử lý nhóm có đánh số
const groupCoursesByNumber = (courses: HocPhan[]) => {
  const numberedGroups: { [key: string]: HocPhan[] } = {};
  const singleCourses: HocPhan[] = [];
  
  courses.forEach(course => {
    const numberMatch = course.tenHp?.match(/\s*-\s*N(\d+)$/i);
    if (numberMatch) {
      const baseName = course.tenHp.replace(/\s*-\s*N\d+$/i, '').trim();
      if (!numberedGroups[baseName]) {
        numberedGroups[baseName] = [];
      }
      numberedGroups[baseName].push(course);
    } else {
      singleCourses.push(course);
    }
  });
  
  return { numberedGroups, singleCourses };
};
```

### 2. Logic Tính Trạng thái Hoàn thành

```tsx
// Đối với single courses
singleCourses.forEach(course => {
  if (hocPhanDaHoc.includes(course.maHp || '')) {
    completedCredits += course.tinChi || 0;
  }
});

// Đối với numbered groups - chỉ cần 1 học phần
Object.values(numberedGroups).forEach(groupCourses => {
  const hasCompletedOne = groupCourses.some(course => 
    hocPhanDaHoc.includes(course.maHp || '')
  );
  if (hasCompletedOne) {
    const completedCourse = groupCourses.find(course => 
      hocPhanDaHoc.includes(course.maHp || '')
    ) || groupCourses[0];
    completedCredits += completedCourse.tinChi || 0;
  }
});
```

### 3. UI Enhancements

#### Hiển thị chú thích cho học phần có đánh số
```tsx
if (numberMatch) {
  return (
    <div className="space-y-1">
      <div>{tenHp}</div>
      <div className="text-xs text-blue-600 font-medium">
        💡 Chỉ cần hoàn thành 1 trong các học phần cùng nhóm
      </div>
    </div>
  );
}
```

#### Disable button nếu đã hoàn thành học phần cùng nhóm
```tsx
// Kiểm tra xem có học phần cùng nhóm đã hoàn thành chưa
const isGroupCompleted = sameGroupCourses.some(course => 
  hocPhanDaHoc.includes(course.maHp || '')
);

const buttonDisabled = isAdded || !canAdd || isGroupCompleted;

if (isGroupCompleted) {
  buttonTitle = "Đã hoàn thành học phần khác trong cùng nhóm";
}
```

### 4. Color Coding

- **Green**: Đã hoàn thành đủ tín chỉ yêu cầu
- **Orange**: Đang thực hiện (có học phần đã hoàn thành nhưng chưa đủ)
- **Blue**: Chưa bắt đầu

## Lợi ích

1. **Chính xác**: Hiển thị đúng trạng thái hoàn thành của từng nhóm
2. **Thông minh**: Xử lý đúng logic "chỉ cần hoàn thành 1 trong nhóm"
3. **Trực quan**: Color coding và chú thích rõ ràng
4. **Tránh lỗi**: Prevent việc chọn thêm học phần khi đã hoàn thành cùng nhóm
5. **Performance**: Không fetch lại dữ liệu không cần thiết

## Test Cases

1. ✅ Hiển thị nhóm học phần tự chọn từ CTDT
2. ✅ Loại bỏ trùng lặp học phần trong nhóm
3. ✅ Hiển thị trạng thái hoàn thành chính xác
4. ✅ Xử lý học phần có đánh số (N1, N2, N3...)
5. ✅ Disable button khi đã hoàn thành học phần cùng nhóm
6. ✅ Hiển thị chú thích cho học phần có đánh số
7. ✅ Color coding theo trạng thái
