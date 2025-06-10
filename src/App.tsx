import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Login from "./components/Login";
import Hello from "./components/Hello";
import { useAuth } from "./hooks/UseAuth";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import KetQuaHocTap from "./pages/KetQuaHocTap/KetQuaHocTap";
import KetQuaHocTapDetail from "./pages/KetQuaHocTap/KetQuaHocTapDetail";
import KeHoachHocTap from "./pages/KeHoachHocTap/KeHoachHocTap";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/khht">
            <Route index element={<KeHoachHocTap />} />
            <Route path="chung" element={<KeHoachHocTap />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kqht">
            <Route index element={<KetQuaHocTap />} />
            <Route path="chung" index element={<KetQuaHocTap />} />
            <Route path="chitiet" element={<KetQuaHocTapDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
