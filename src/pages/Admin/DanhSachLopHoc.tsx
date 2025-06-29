import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Eye, BarChart3, GraduationCap } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { PROFILE_SERVICE } from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";

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

const DanhSachLopHoc = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [lop, setLop] = useState<Lop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();
  const maKhoa = auth.user?.maKhoa || "";

  // Fetch danh sách lớp theo khoa
  const fetchDanhSachLop = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(PROFILE_SERVICE.GET_DS_LOP_BY_KHOA.replace(":maKhoa", maKhoa));
      setLop(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching class list:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maKhoa]);

  // Filter danh sách lớp
  const filteredLop = lop.filter(lopItem =>
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
  }, [fetchDanhSachLop]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách lớp...</span>
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
              <p className="text-gray-600">Xem thống kê và quản lý các lớp thuộc khoa</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng số lớp</p>
              <p className="text-3xl font-bold text-blue-600">{lop.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng sinh viên</p>
              <p className="text-3xl font-bold text-green-600">
                {lop.reduce((sum, lopItem) => sum + (lopItem.danhSachSinhVien?.length || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sĩ số trung bình</p>
              <p className="text-3xl font-bold text-purple-600">
                {lop.length > 0 ? (lop.reduce((sum, lopItem) => sum + (lopItem.danhSachSinhVien?.length || 0), 0) / lop.length).toFixed(1) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
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
              {searchTerm ? "Không tìm thấy lớp phù hợp" : "Chưa có lớp nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Thử thay đổi từ khóa tìm kiếm" : "Hiện tại chưa có lớp nào trong hệ thống"}
            </p>
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
                      <h3 className="font-semibold text-gray-800 mb-2">{lopItem.tenLop}</h3>
                      <p className="text-sm text-gray-600 mb-3">Mã lớp: {lopItem.maLop}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Sĩ số: {lopItem.danhSachSinhVien?.length || 0}/{lopItem.siSo}</span>
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
