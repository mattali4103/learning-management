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
          <Route path="/" element={<Dashboard />} />{" "}
          <Route path="/khht" element={<KeHoachHocTap />}>
            <Route index element={<KeHoachHocTapPage />} />
            <Route path="chung" element={<KeHoachHocTapPage />} />
            <Route path="detail" element={<KeHoachHocTapUnified />} />
            <Route path="add" element={<NhapKeHoachHocTap />} />
          </Route>
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
        ></Route>
      </Route>
    </Routes>
  );
}

export default App;
