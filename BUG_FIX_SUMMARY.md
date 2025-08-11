# Báo cáo Khắc phục Lỗi - Hiển thị Học kỳ Cụ thể và Nhóm Học phần Tự chọn

## Vấn đề được báo cáo
- Lỗi khi xem học kỳ cụ thể
- Học kỳ thuộc nhóm học phần tự chọn không được hiển thị
- Học phần đã thêm không được hiển thị đúng

## Nguyên nhân gốc rễ
1. **Logic Filter Sai trong AllCoursesCollapsibleTable**: Khi filter theo học kỳ cụ thể (semester-X), hệ thống không đúng cách filter dữ liệu từ `allData` mà vẫn dùng dữ liệu gốc từ nhóm tự chọn.

2. **Thiếu mapping đúng giữa allData và nhóm học phần tự chọn**: Khi hiển thị theo học kỳ, cần lọc từ `allData` (dữ liệu đã thêm) chứ không phải từ danh sách gốc.

3. **Logic xử lý required courses cũng có vấn đề tương tự**: Không filter đúng theo học kỳ.

## Những thay đổi đã thực hiện

### 1. Sửa file `AllCoursesCollapsibleTable.tsx`

#### Thay đổi 1: Logic filter cho Elective Groups
**Vị trí**: Dòng 227-235

**Trước:**
```tsx
} else if (activeTab.startsWith("semester-")) {
  const hocKyId = Number(activeTab.replace("semester-", ""));
  coursesInGroup = addedElectiveCourses.filter(
    (hp: any) => hp.maHocKy === hocKyId
  );
```

**Sau:**
```tsx
} else if (activeTab.startsWith("semester-")) {
  const hocKyId = Number(activeTab.replace("semester-", ""));
  // Find matching courses from allData that belong to this semester and this group
  coursesInGroup = allData.filter(course => 
    course.maHocKy === hocKyId && 
    allElectiveCoursesInGroup.some(hp => hp.maHp === course.maHp)
  );
  console.log(`Semester ${hocKyId} - Group ${group.tenNhom}:`, coursesInGroup);
```

#### Thay đổi 2: Logic filter cho Required Courses
**Vị trí**: Dòng 140-149

**Trước:**
```tsx
} else if (activeTab.startsWith("semester-")) {
  const hocKyId = Number(activeTab.replace("semester-", ""));
  filteredRequiredCourses = filteredRequiredCourses.filter(
    (hp: any) => hp.maHocKy === hocKyId
  );
```

**Sau:**
```tsx
} else if (activeTab.startsWith("semester-")) {
  const hocKyId = Number(activeTab.replace("semester-", ""));
  // Filter to only show courses from allData that belong to this semester
  filteredRequiredCourses = allData.filter(course => 
    course.maHocKy === hocKyId && 
    uniqueRequiredCourses.some(reqCourse => reqCourse.maHp === course.maHp) &&
    !electiveCourseCodes.has(course.maHp)
  );
```

## Giải thích Logic Mới

### 1. Filter cho Nhóm Học phần Tự chọn
- **Trước**: Chỉ filter trong `addedElectiveCourses` (dữ liệu từ nhóm tự chọn gốc)
- **Sau**: Filter trực tiếp từ `allData` (dữ liệu thực tế đã được thêm vào kế hoạch học tập) với điều kiện:
  - `course.maHocKy === hocKyId`: Thuộc học kỳ đang xem
  - `allElectiveCoursesInGroup.some(hp => hp.maHp === course.maHp)`: Thuộc nhóm tự chọn này

### 2. Filter cho Học phần Bắt buộc
- **Trước**: Chỉ filter theo `maHocKy` trong dữ liệu gốc
- **Sau**: Filter từ `allData` với điều kiện:
  - `course.maHocKy === hocKyId`: Thuộc học kỳ đang xem
  - `uniqueRequiredCourses.some(...)`: Là học phần bắt buộc
  - `!electiveCourseCodes.has(...)`: Không thuộc nhóm tự chọn (tránh trùng lặp)

## Lợi ích của việc sửa đổi

1. **Hiển thị đúng dữ liệu**: Khi chọn học kỳ cụ thể, chỉ hiển thị những học phần thực sự đã được thêm vào học kỳ đó
2. **Nhóm học phần tự chọn hiển thị chính xác**: Các nhóm chỉ hiển thị khi có học phần trong học kỳ đó
3. **Tránh trùng lặp**: Logic mới đảm bảo không bị trùng lặp giữa học phần bắt buộc và tự chọn
4. **Performance tốt hơn**: Filter trực tiếp từ dữ liệu đã được load thay vì phải xử lý nhiều lần

## Debug Logs
Đã thêm console.log để debug:
- `console.log("Semester ${hocKyId} - Group ${group.tenNhom}:", coursesInGroup);`
- `console.log("Group validation - coursesInGroup.length:", coursesInGroup.length);`

## Test Cases đã được kiểm tra

1. ✅ Xem tất cả học phần (tab "Tất cả")
2. ✅ Xem theo năm học cụ thể
3. ✅ Xem theo học kỳ cụ thể 
4. ✅ Nhóm học phần tự chọn hiển thị đúng trong từng học kỳ
5. ✅ Học phần bắt buộc hiển thị đúng trong từng học kỳ
6. ✅ Không bị trùng lặp dữ liệu
7. ✅ Modal thêm học phần hoạt động bình thường

## Kết luận
Lỗi đã được khắc phục hoàn toàn. Hệ thống giờ đây sẽ hiển thị chính xác:
- Học phần theo từng học kỳ cụ thể
- Nhóm học phần tự chọn thuộc học kỳ đó
- Học phần đã được thêm vào kế hoạch học tập

Việc sửa đổi này không ảnh hưởng đến các chức năng khác và đảm bảo tính nhất quán của dữ liệu hiển thị.
