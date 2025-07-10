import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import KetQuaHocTap from "./pages/KetQuaHocTap/KetQuaHocTap";
import KetQuaHocTapDetail from "./pages/KetQuaHocTap/KetQuaHocTapDetail";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import Unauthorized from "./pages/Unauthorized";
import { KetQuaHocTapLayout } from "./pages/KetQuaHocTap/KetQuaHocTapLayout";
import KeHoachHocTap, {
  KeHoachHocTapPage,
} from "./pages/KeHoachHocTap/KeHoachHocTap";
import NhapKeHoachHocTap from "./pages/KeHoachHocTap/NhapKeHoachHocTap";
import KeHoachHocTapUnified from "./pages/KeHoachHocTap/KeHoachHocTapUnified";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ChuongTrinhDaoTao from "./pages/ChuongTrinhDaoTao/ChuongTrinhDaoTao";
import CTDTDetail from "./pages/ChuongTrinhDaoTao/CTDTDetail";
import ReportsAndStatistics from "./pages/Admin/ReportsAndStatistics";
import DanhSachLopHoc from "./pages/Admin/DanhSachLopHoc";
import ThongTinLopHoc from "./pages/Admin/ThongTinLopHoc";
import ThongTinSinhVien from "./pages/Admin/ThongTinSinhVien";
import KeHoachHocTapMau from "./pages/KeHoachHocTapMau/KeHoachHocTapMau";
import KeHoachHocTapMauDetail from "./pages/KeHoachHocTapMau/KeHoachHocTapMauDetail";
import ThemKHHTMau from "./pages/KeHoachHocTapMau/ThemKHHTMau";
import ChinhSuaKHHTMau from "./pages/KeHoachHocTapMau/ChinhSuaKHHTMau";
import ProfileManagement from "./pages/Profile/ProfileManagement";
import CertificateManagement from "./pages/Profile/CertificateManangement";
import ProfileLayout from "./pages/Profile/ProfileLayout";

const ROLES = {
  SINHVIEN: "SINHVIEN",
  GIANGVIEN: "GIANGVIEN",
  ADMIN: "ADMIN",
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<Layout />}>
        {/* Private routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.SINHVIEN]} />}>
          <Route path="/" element={<Dashboard />} />
          
          {/* Profile routes */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<ProfileManagement />} />
            <Route path="sinhvien" element={<ProfileManagement />} />
            <Route path="chungchi" element={<CertificateManagement />} />
          </Route>
          
          {/* Ke Hoach Hoc Tap routes */}
          <Route path="/khht" element={<KeHoachHocTap />}>
            <Route index element={<KeHoachHocTapPage />} />
            <Route path="chung" element={<KeHoachHocTapPage />} />
            <Route path="detail" element={<KeHoachHocTapUnified />} />
            <Route path="add" element={<NhapKeHoachHocTap />} />
          </Route>
          
          {/* Ket Qua Hoc Tap routes */}
          <Route path="/kqht" element={<KetQuaHocTapLayout />}>
            <Route index element={<KetQuaHocTap />} />
            <Route path="chung" element={<KetQuaHocTap />} />
            <Route path="chitiet" element={<KetQuaHocTapDetail />} />
          </Route>
        </Route>  
        <Route
          element={
            <RequireAuth allowedRoles={[ROLES.GIANGVIEN, ROLES.ADMIN]} />
          }
        >
          {/* Teacher/Admin Dashboard and main routes */}
          <Route path="/giangvien" element={<AdminDashboard />} />
          <Route path="/giangvien/reports" element={<ReportsAndStatistics />} />
          
          {/* Quản Lí Lớp */}
          <Route path="/giangvien/lop">
            <Route index element={<DanhSachLopHoc />} />
            <Route path=":maLop" element={<ThongTinLopHoc />} />
            <Route path=":maLop/student/:maSo" element={<ThongTinSinhVien />} />
          </Route>
          
          {/* Quản Lí Chương Trình Đào Tạo */}
          <Route path="/giangvien/chuongtrinhdaotao">
            <Route index element={<ChuongTrinhDaoTao />} />
            <Route path="detail/:maNganh/:khoaHoc" element={<CTDTDetail />} />
          </Route>
          
          {/* Quản lí KHHT Mẫu*/}
          <Route path="/giangvien/study-plans">
            <Route index element={<KeHoachHocTapMau />} />
            <Route path="create" element={<ThemKHHTMau />} />
            <Route path="add/:maNganh/:khoaHoc" element={<ChinhSuaKHHTMau />} />
            <Route path="edit/:maNganh/:khoaHoc" element={<ChinhSuaKHHTMau />} />
            <Route path=":maNganh/:khoaHoc" element={<KeHoachHocTapMauDetail />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
