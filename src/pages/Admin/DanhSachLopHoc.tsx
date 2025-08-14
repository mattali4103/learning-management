import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Eye, GraduationCap } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { PROFILE_SERVICE } from "../../api/apiEndPoints";
import { fetchKhoaData } from "../../api/khoaService";
import useAuth from "../../hooks/useAuth";
import type { Khoa } from "../../types/Khoa";

interface Lop {
  maLop: string;
  tenLop: string;
  siSo: number | 0;
  siSoCon: number | 0;
  chuNhiem: string;
  danhSachSinhVien: SinhVien[];
}



interface SinhVien {
  maSo: string;
  hoTen: string;
  khoaHoc: string;
  maNganh: string;
  tenNganh: string;
  ngaySinh: Date;
  gioiTinh: boolean;
  maLop: string;
}

interface ThongKe {
  soLopHoc: number;
  tongSoSinhVien: number;
  siSoTrungBinh: number;
}

const DanhSachLopHoc = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [lop, setLop] = useState<Lop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [khoa, setKhoa] = useState<Khoa>();
  const [thongKe, setThongKe] = useState<ThongKe>({
    soLopHoc: 0,
    tongSoSinhVien: 0,
    siSoTrungBinh: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();
  const maKhoa = auth.user?.maKhoa || "";

  //Fetch Ngành trong khoa
  const fetchKhoaDataHandler = useCallback(async () => {
    try {
      setLoading(true);
      const khoaData = await fetchKhoaData(axiosPrivate, maKhoa);
      setKhoa(khoaData);
    } catch (error) {
      console.error("Error fetching class list:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maKhoa]);

  // Fetch thống kê lớp theo từng ngành hoặc theo chủ nhiệm
  const fetchThongKeLop = useCallback(async () => {
    try {
      setLoading(true);
      
      if (auth.user?.roles === "GIANGVIEN") {
        // Lấy thống kê lớp chủ nhiệm cho giảng viên
        const maSoGiangVien = auth.user.maSo;
        const response = await axiosPrivate.get(
          PROFILE_SERVICE.THONGKE_LOP_BY_CHUNHIEM.replace(":maSo", maSoGiangVien)
        );
        
        if (response.data.code === 200 && response.data.data) {
          const data = response.data.data;
          setThongKe({
            soLopHoc: data.soLopHoc || 0,
            tongSoSinhVien: data.tongSoSinhVien || 0,
            siSoTrungBinh: data.siSoTrungBinh || 0,
          });
        } else {
          setThongKe({
            soLopHoc: 0,
            tongSoSinhVien: 0,
            siSoTrungBinh: 0,
          });
        }
      } else {
        // Admin hoặc vai trò khác - lấy theo khoa và ngành
        if (!khoa?.dsnganh || khoa.dsnganh.length === 0) return;
        
        const requests = khoa.dsnganh.map((nganh) =>
          axiosPrivate.get(PROFILE_SERVICE.THONGKE_LOP, {
            params: {
              maNganh: nganh.maNganh,
            },
          })
        );
        
        const responses = await Promise.all(requests);

        let soLopHoc = 0;
        let tongSoSinhVien = 0;
        
        responses.forEach((response) => {
          if (response.data.code === 200 && response.data.data) {
            const data = response.data.data;
            soLopHoc += data.soLopHoc || 0;
            tongSoSinhVien += data.tongSoSinhVien || 0;
          }
        });
        
        const siSoTrungBinh = soLopHoc > 0 ? tongSoSinhVien / soLopHoc : 0;
        
        setThongKe({
          soLopHoc,
          tongSoSinhVien,
          siSoTrungBinh,
        });
      }
      
      setError(null);
    } catch (error) {
      console.error("Error fetching class statistics:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
      setThongKe({
        soLopHoc: 0,
        tongSoSinhVien: 0,
        siSoTrungBinh: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, khoa, auth]);



  // Fetch danh sách lớp theo vai trò
  const fetchDanhSachLop = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (auth.user?.roles === "GIANGVIEN") {
        // Chỉ lấy danh sách lớp chủ nhiệm của giảng viên
        const maSoGiangVien = auth.user.maSo;
        response = await axiosPrivate.get(
          PROFILE_SERVICE.GET_DS_LOP_CHUNHIEM.replace(":maSo", maSoGiangVien)
        );
        if (response.data.code === 200 && Array.isArray(response.data.data)) {
          setLop(response.data.data);
        } else {
          setLop([]);
          setError(response.data.message || "Không tìm thấy lớp chủ nhiệm.");
        }
      } else {
        // Admin hoặc các vai trò khác lấy theo khoa
        response = await axiosPrivate.get(
          PROFILE_SERVICE.GET_DS_LOP_BY_KHOA.replace(":maKhoa", maKhoa)
        );
        setLop(response.data || []);
      }
      console.log("Danh sách lớp:", response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching class list:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
      setLop([]);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maKhoa, auth]);

  // Filter danh sách lớp
  const filteredLop = lop.filter(
    (lopItem) =>
      lopItem.tenLop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lopItem.maLop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to class details
  const handleClassClick = (maLop: string) => {
    navigate(`/giangvien/lop/${maLop}`);
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchDanhSachLop();
    if (auth.user?.roles !== "GIANGVIEN") {
      fetchKhoaDataHandler();
    }
  }, [fetchDanhSachLop, fetchKhoaDataHandler, auth]);

  // Fetch thống kê khi đã có dữ liệu khoa (cho admin) hoặc ngay lập tức (cho giảng viên)
  useEffect(() => {
    if (auth.user?.roles === "GIANGVIEN") {
      // Giảng viên không cần đợi dữ liệu khoa
      fetchThongKeLop();
    } else if (khoa?.dsnganh && khoa.dsnganh.length > 0) {
      // Admin cần có dữ liệu khoa trước
      fetchThongKeLop();
    }
  }, [khoa, fetchThongKeLop, auth]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Đang tải danh sách lớp...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Lớp</h1>
              <p className="text-gray-600">
                {auth.user?.roles === "GIANGVIEN" 
                  ? "Xem thống kê và quản lý các lớp chủ nhiệm" 
                  : "Xem thống kê và quản lý các lớp thuộc khoa"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {auth.user?.roles === "GIANGVIEN" ? "Số lớp chủ nhiệm" : "Tổng số lớp"}
              </p>
              <p className="text-3xl font-bold text-blue-600">{thongKe.soLopHoc}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {auth.user?.roles === "GIANGVIEN" ? "Tổng SV chủ nhiệm" : "Tổng sinh viên"}
              </p>
              <p className="text-3xl font-bold text-green-600">
                {thongKe.tongSoSinhVien}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp theo tên, mã lớp..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {filteredLop.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm 
                ? "Không tìm thấy lớp phù hợp" 
                : auth.user?.roles === "GIANGVIEN" 
                  ? "Chưa được phân công lớp chủ nhiệm" 
                  : "Chưa có lớp nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm"
                : auth.user?.roles === "GIANGVIEN"
                  ? "Vui lòng liên hệ phòng đào tạo để được phân công lớp chủ nhiệm"
                  : "Hiện tại chưa có lớp nào trong hệ thống"}
            </p>
            {auth.user?.roles === "GIANGVIEN" && !searchTerm && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">ℹ</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Thông tin
                    </h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Chỉ giảng viên được phân công làm chủ nhiệm lớp mới có thể xem thông tin lớp tại đây.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Danh sách lớp</h2>
              <p className="text-gray-600">Tìm thấy {filteredLop.length} lớp</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLop.map((lopItem) => (
                <div
                  key={lopItem.maLop}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
                  onClick={() => handleClassClick(lopItem.maLop)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {lopItem.tenLop}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Mã lớp: {lopItem.maLop}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        Sĩ số: {lopItem.siSoCon || 0}/{lopItem.siSo}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      <span>Chủ nhiệm: {lopItem.chuNhiem}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Nhấp để xem chi tiết
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Xem</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DanhSachLopHoc;
