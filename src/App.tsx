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
import KeHoachHocTapUnified from "./pages/KeHoachHocTap/KeHoachHocTapUnified";
import CTDTDetail from "./pages/ChuongTrinhDaoTao/CTDTDetail";
import DanhSachLopHoc from "./pages/Admin/DanhSachLopHoc";
import ThongTinLopHoc from "./pages/Admin/ThongTinLopHoc";
import ThongTinSinhVien from "./pages/Admin/ThongTinSinhVien";
import KeHoachHocTapMau from "./pages/KeHoachHocTapMau/KeHoachHocTapMau";
import KeHoachHocTapMauDetail from "./pages/KeHoachHocTapMau/KeHoachHocTapMauDetail";
import ProfileManagement from "./pages/Profile/ProfileManagement";
import CertificateManagement from "./pages/Profile/CertificateManangement";
import ProfileLayout from "./pages/Profile/ProfileLayout";
import PDFExportExample from "./components/PDFExportExample";
import PDFExportPaginationTest from "./components/PDFExportPaginationTest";
import KeHoachHocTapView from "./pages/KeHoachHocTap/KeHoachHocTapView";
import ThemChuongTrinhDaoTao from "./pages/ChuongTrinhDaoTao/ThemChuongTrinhDaoTao";
import ChuongTrinhDaoTao from "./pages/ChuongTrinhDaoTao/ChuongTrinhDaoTao";
import ImportChuongTrinhDaoTao from "./pages/ChuongTrinhDaoTao/ImportChuongTrinhDaoTao";
import ThemKeHoachHocTapMau from "./pages/KeHoachHocTapMau/ThemKeHoachHocTapMau";
import KeHoachHocTapDetail from "./pages/KeHoachHocTap/KeHoachHocTapDetail";
const ROLES = {
  SINHVIEN: "SINHVIEN",
  GIANGVIEN: "GIANGVIEN",
  TRUONGKHOA: "TRUONGKHOA",
  ADMIN: "ADMIN",
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/test" element={<PDFExportExample />} />
      <Route path="/pagination-test" element={<PDFExportPaginationTest />} />
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
            <Route path="chitiet" element={<KeHoachHocTapDetail />} />
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
            <RequireAuth allowedRoles={[ROLES.TRUONGKHOA, ROLES.GIANGVIEN]} />
          }
        >
          {/* Teacher/Admin main routes */}
          {/* Redirect to first available page */}
          <Route path="/giangvien" element={<DanhSachLopHoc />} />

          {/* Quản Lí Lớp */}
          <Route path="/giangvien/lop">
            <Route index element={<DanhSachLopHoc />} />
            <Route path=":maLop" element={<ThongTinLopHoc />} />
            <Route path=":maLop/student/:maSo" element={<ThongTinSinhVien />} />
            <Route
              path=":maLop/student/:maSo/khht"
              element={<KeHoachHocTapView />}
            />
            <Route
              path=":maLop/student/:maSo/kqht"
              element={<KetQuaHocTapDetail />}
            />
          </Route>

          {/* Quản Lí Chương Trình Đào Tạo */}
          <Route path="/giangvien/ctdt">
            <Route index element={<ChuongTrinhDaoTao />} />
            <Route path="detail/:maNganh/:khoaHoc" element={<CTDTDetail />} />
            <Route path="them" element={<ThemChuongTrinhDaoTao />} />
            <Route path="edit/:maNganh/:khoaHoc" element={<ThemChuongTrinhDaoTao />} />
            <Route path="import" element={<ImportChuongTrinhDaoTao />} />
          </Route>

          {/* Quản lí KHHT Mẫu*/}
          <Route path="/giangvien/study-plans">
            <Route index element={<KeHoachHocTapMau />} />
            <Route
              path="edit/:maNganh/:khoaHoc"
              element={<ThemKeHoachHocTapMau />}
            />
            <Route
              path=":maNganh/:khoaHoc"
              element={<KeHoachHocTapMauDetail />}
            />
            <Route path="add" element={<ThemKeHoachHocTapMau />} />
          </Route>
        </Route>
        <Route element={<RequireAuth allowedRoles={[ROLES.GIANGVIEN, ROLES.TRUONGKHOA]} />}>
          {/* TRUONG KHOA routes */}
          {/* Teacher/Admin main routes */}
          {/* Redirect to first available page */}
          <Route path="/truongkhoa" element={<DanhSachLopHoc />} />

          {/* Quản Lí Lớp */}
          <Route path="/truongkhoa/lop">
            <Route index element={<DanhSachLopHoc />} />
            <Route path=":maLop" element={<ThongTinLopHoc />} />
            <Route path=":maLop/student/:maSo" element={<ThongTinSinhVien />} />
            <Route
              path=":maLop/student/:maSo/khht"
              element={<KeHoachHocTapView />}
            />
            <Route
              path=":maLop/student/:maSo/kqht"
              element={<KetQuaHocTapDetail />}
            />
          </Route>

          {/* Quản Lí Chương Trình Đào Tạo */}
          <Route path="/truongkhoa/ctdt">
            <Route index element={<ChuongTrinhDaoTao />} />
            <Route path="detail/:maNganh/:khoaHoc" element={<CTDTDetail />} />
            <Route path="them" element={<ThemChuongTrinhDaoTao />} />
            <Route path="edit/:maNganh/:khoaHoc" element={<ThemChuongTrinhDaoTao />} />
            <Route path="import" element={<ImportChuongTrinhDaoTao />} />
          </Route>

          {/* Quản lí KHHT Mẫu*/}
          <Route path="/truongkhoa/study-plans">
            <Route index element={<KeHoachHocTapMau />} />
            <Route
              path="edit/:maNganh/:khoaHoc"
              element={<ThemKeHoachHocTapMau />}
            />
            <Route
              path=":maNganh/:khoaHoc"
              element={<KeHoachHocTapMauDetail />}
            />
            <Route path="add" element={<ThemKeHoachHocTapMau />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
