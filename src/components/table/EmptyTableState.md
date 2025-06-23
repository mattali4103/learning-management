# EmptyTableState Component

Component tái sử dụng để hiển thị trạng thái rỗng của bảng với khả năng tuỳ chỉnh cao.

## Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `title` | `string` | `"Chưa nhập kế hoạch học tập"` | Tiêu đề hiển thị |
| `description` | `string` | `"Không có dữ liệu để hiển thị cho mục này"` | Mô tả chi tiết |
| `icon` | `React.ComponentType<any>` | `FileText` | Icon hiển thị (từ lucide-react) |
| `showWarningBadge` | `boolean` | `true` | Có hiển thị badge cảnh báo không |

## Cách sử dụng

### Sử dụng cơ bản (mặc định)
```tsx
<EmptyTableState />
```

### Tuỳ chỉnh title và description
```tsx
<EmptyTableState
  title="Chưa có kết quả học tập"
  description="Bạn chưa có điểm nào được ghi nhận"
/>
```

### Tuỳ chỉnh icon
```tsx
import { Users, BookOpen, Award } from "lucide-react";

<EmptyTableState
  title="Chưa có sinh viên"
  description="Chưa có sinh viên nào đăng ký khóa học này"
  icon={Users}
/>
```

### Không hiển thị badge cảnh báo
```tsx
<EmptyTableState
  title="Hoàn thành!"
  description="Bạn đã hoàn thành tất cả học phần"
  icon={Award}
  showWarningBadge={false}
/>
```

## Ví dụ trong bảng

```tsx
{table.getRowModel().rows.length > 0 ? (
  // Render table rows
  table.getRowModel().rows.map((row) => (
    // ... row content
  ))
) : (
  <tr>
    <td colSpan={columns.length} className="px-5 py-8 text-center text-gray-500 bg-gray-50 border-b-1 border-gray-200">
      <EmptyTableState
        title="Chưa có kết quả học tập"
        description="Không có dữ liệu để hiển thị cho học kỳ này"
      />
    </td>
  </tr>
)}
```

## Style

Component được thiết kế với:
- Icon kích thước 16x16 (64px)
- Badge cảnh báo màu vàng với icon TriangleAlert
- Text màu xám với typography phù hợp
- Spacing và alignment tối ưu cho bảng
- Responsive và accessible
