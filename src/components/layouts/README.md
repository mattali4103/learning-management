# Student Profile Layout Components

## Tổng quan

Thư mục này chứa các component layout được tái sử dụng để hiển thị thông tin hồ sơ sinh viên một cách nhất quán trong toàn bộ ứng dụng.

## Components

### StudentProfileLayout

Component chính để hiển thị layout hồ sơ sinh viên, bao gồm:
- Header (tùy chọn)
- Welcome header (cho Dashboard)
- Progress section với:
  - Credit progress card
  - Academic classification
  - Academic warning (nếu có)
  - Combined credit/GPA chart
  - Statistics cards
- Student info section
- Additional content area (có thể tùy chỉnh)
- Footer với timestamp

#### Props

```typescript
interface StudentProfileLayoutProps {
  userInfo: PreviewProfile | null;
  tinChiTichLuy: ThongKeTinChiByHocKy[];
  diemTrungBinhHocKy: DiemTrungBinhHocKy[];
  progressState: ProgressState;
  header?: ReactNode;
  additionalContent?: ReactNode;
  showWelcomeHeader?: boolean;
  getGreeting?: () => string;
}
```

#### Sử dụng

```tsx
import StudentProfileLayout from "../../components/layouts/StudentProfileLayout";
import useStudentProfileData from "../../hooks/useStudentProfileData";

const MyComponent = () => {
  const { userInfo, tinChiTichLuy, diemTrungBinhHocKy, progressState } = 
    useStudentProfileData({ maSo });

  return (
    <StudentProfileLayout
      userInfo={userInfo}
      tinChiTichLuy={tinChiTichLuy}
      diemTrungBinhHocKy={diemTrungBinhHocKy}
      progressState={progressState}
      showWelcomeHeader={true} // Cho Dashboard
      getGreeting={() => "Chào buổi sáng"} // Tùy chọn
      header={<CustomHeader />} // Tùy chọn
      additionalContent={<CustomContent />} // Tùy chọn
    />
  );
};
```

## Hook

### useStudentProfileData

Hook để fetch và quản lý dữ liệu hồ sơ sinh viên.

#### Tham số

```typescript
interface UseStudentProfileDataProps {
  maSo: string | undefined;
}
```

#### Trả về

```typescript
interface UseStudentProfileDataReturn {
  userInfo: PreviewProfile | null;
  tinChiTichLuy: ThongKeTinChiByHocKy[];
  diemTrungBinhHocKy: DiemTrungBinhHocKy[];
  progressState: ProgressState;
  loading: boolean;
  error: string | null;
}
```

#### Sử dụng

```tsx
import useStudentProfileData from "../../hooks/useStudentProfileData";

const MyComponent = () => {
  const { 
    userInfo, 
    tinChiTichLuy, 
    diemTrungBinhHocKy, 
    progressState, 
    loading, 
    error 
  } = useStudentProfileData({ maSo: "B2014595" });

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  // Sử dụng dữ liệu...
};
```

## Lợi ích

1. **Tái sử dụng code**: Giảm duplicate code giữa Dashboard và ThongTinSinhVien
2. **Nhất quán UI**: Đảm bảo giao diện nhất quán trong toàn bộ ứng dụng
3. **Dễ bảo trì**: Thay đổi một lần, áp dụng toàn bộ
4. **Linh hoạt**: Có thể tùy chỉnh header và content bổ sung
5. **Type safety**: Đầy đủ TypeScript interfaces

## Ví dụ Implementation

### Dashboard
```tsx
const Dashboard = () => {
  const { auth } = useAuth();
  const data = useStudentProfileData({ maSo: auth.user?.maSo });

  return (
    <StudentProfileLayout
      {...data}
      showWelcomeHeader={true}
      getGreeting={() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Chào buổi sáng";
        if (hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
      }}
    />
  );
};
```

### ThongTinSinhVien
```tsx
const ThongTinSinhVien = () => {
  const { maSo, maLop } = useParams();
  const data = useStudentProfileData({ maSo });

  const header = (
    <PageHeader
      title={`Hồ sơ sinh viên: ${data.userInfo?.hoTen}`}
      // ... other props
    />
  );

  return (
    <StudentProfileLayout
      {...data}
      header={header}
      showWelcomeHeader={false}
    />
  );
};
```
