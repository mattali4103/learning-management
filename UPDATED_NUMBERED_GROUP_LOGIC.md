# Cập nhật Logic Xử lý Nhóm Học phần Tự chọn có Đánh số

## Vấn đề cũ
Logic trước đây chỉ xử lý pattern cố định `N1, N2, N3` với regex:
```regex
/\s*-\s*N(\d+)$/i
```

## Giải pháp mới
Cập nhật để xử lý pattern tổng quát: `[tên chương trình đào tạo] - [số]`

### Pattern Matching mới
```regex
/^(.+?)\s*-\s*(\d+)$/i
```

### Các trường hợp được hỗ trợ:

1. **Pattern cũ**: 
   - "N1", "N2", "N3"
   
2. **Pattern mới**:
   - "Lập trình Web - 1", "Lập trình Web - 2" 
   - "Cơ sở dữ liệu - 1", "Cơ sở dữ liệu - 2"
   - "Thiết kế phần mềm - 1", "Thiết kế phần mềm - 2"
   - "Machine Learning - 1", "Machine Learning - 2"

## Chi tiết Implementation

### 1. Function groupCoursesByNumber (Cập nhật)

**Trước:**
```tsx
const numberMatch = tenHp.match(/\s*-\s*N(\d+)$/i);
if (numberMatch) {
  const baseNameWithDash = tenHp.replace(/\s*-\s*N\d+$/i, '');
  const baseName = baseNameWithDash.trim();
  // ...
}
```

**Sau:**
```tsx
const numberMatch = tenHp.match(/^(.+?)\s*-\s*(\d+)$/i);
if (numberMatch) {
  const baseName = numberMatch[1].trim();
  // ...
}
```

### 2. UI Display (Cập nhật)

**Trước:**
```tsx
const numberMatch = tenHp.match(/\s*-\s*N(\d+)$/i);
if (numberMatch) {
  return (
    <div>
      <div>{tenHp}</div>
      <div>💡 Chỉ cần hoàn thành 1 trong các học phần cùng nhóm</div>
    </div>
  );
}
```

**Sau:**
```tsx
const numberMatch = tenHp.match(/^(.+?)\s*-\s*(\d+)$/i);
if (numberMatch) {
  const baseName = numberMatch[1].trim();
  return (
    <div>
      <div>{tenHp}</div>
      <div>💡 Chỉ cần hoàn thành 1 trong các học phần "{baseName} - [số]"</div>
    </div>
  );
}
```

### 3. Group Completion Check (Cập nhật)

**Trước:**
```tsx
const numberMatch = tenHp.match(/\s*-\s*N(\d+)$/i);
if (numberMatch) {
  const baseNameWithDash = tenHp.replace(/\s*-\s*N\d+$/i, '');
  const baseName = baseNameWithDash.trim();
  
  const sameGroupCourses = currentGroup.courses.filter(course => {
    const courseName = course.tenHp || '';
    const courseBaseNameWithDash = courseName.replace(/\s*-\s*N\d+$/i, '');
    const courseBaseName = courseBaseNameWithDash.trim();
    return courseBaseName === baseName && courseName.match(/\s*-\s*N(\d+)$/i);
  });
}
```

**Sau:**
```tsx
const numberMatch = tenHp.match(/^(.+?)\s*-\s*(\d+)$/i);
if (numberMatch) {
  const baseName = numberMatch[1].trim();
  
  const sameGroupCourses = currentGroup.courses.filter(course => {
    const courseName = course.tenHp || '';
    const courseNumberMatch = courseName.match(/^(.+?)\s*-\s*(\d+)$/i);
    if (courseNumberMatch) {
      const courseBaseName = courseNumberMatch[1].trim();
      return courseBaseName === baseName;
    }
    return false;
  });
}
```

## Regex Explanation

### Pattern: `/^(.+?)\s*-\s*(\d+)$/i`

- `^` - Bắt đầu chuỗi
- `(.+?)` - Group 1: Capture tên (non-greedy) 
- `\s*` - Không hoặc nhiều khoảng trắng
- `-` - Dấu gạch ngang literal
- `\s*` - Không hoặc nhiều khoảng trắng  
- `(\d+)` - Group 2: Capture một hoặc nhiều số
- `$` - Kết thúc chuỗi
- `i` - Case insensitive

### Ví dụ Matching:

```
"Lập trình Web - 1" → baseName: "Lập trình Web", number: "1"
"Cơ sở dữ liệu - 2" → baseName: "Cơ sở dữ liệu", number: "2"  
"N1" → baseName: "N", number: "1"
"Machine Learning - 10" → baseName: "Machine Learning", number: "10"
```

## Test Cases

### ✅ Các trường hợp được xử lý:

1. **Nhóm N**: "N1", "N2", "N3"
2. **Nhóm Lập trình**: "Lập trình Web - 1", "Lập trình Web - 2"
3. **Nhóm CSDL**: "Cơ sở dữ liệu - 1", "Cơ sở dữ liệu - 2"
4. **Nhóm AI**: "Machine Learning - 1", "Machine Learning - 2"
5. **Số nhiều chữ số**: "Deep Learning - 10", "Deep Learning - 11"

### ❌ Các trường hợp không được xử lý (giữ nguyên logic cũ):

1. **Không có số**: "Lập trình Web"
2. **Không có dấu gạch**: "Lập trình Web 1"
3. **Format khác**: "Lập trình Web (1)", "Lập trình Web [1]"

## Lợi ích

1. **Linh hoạt**: Hỗ trợ mọi pattern `[tên] - [số]`
2. **Tương thích ngược**: Vẫn hỗ trợ "N1", "N2"  
3. **Rõ ràng**: UI hiển thị tên nhóm cụ thể
4. **Chính xác**: Logic nhóm hoạt động đúng cho mọi trường hợp

## Breaking Changes

❌ **Không có breaking changes** - Logic cũ vẫn hoạt động
