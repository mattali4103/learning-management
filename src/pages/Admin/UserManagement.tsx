import { useState, useEffect } from "react";
import { Users, Search, Plus, Edit2, Trash2, Eye } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PageHeader from "../../components/PageHeader";

interface User {
  id: string;
  maSo: string;
  hoTen: string;
  email: string;
  role: string;
  khoa: string;
  nganh: string;
  trangThai: "active" | "inactive";
  ngayTao: string;
}

const UserManagement = () => {
  const axiosPrivate = useAxiosPrivate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // TODO: Replace with actual API call
        const mockUsers: User[] = [
          {
            id: "1",
            maSo: "B2012345",
            hoTen: "Nguyễn Văn An",
            email: "nvan@student.ctu.edu.vn",
            role: "SINHVIEN",
            khoa: "Công nghệ thông tin",
            nganh: "Kỹ thuật phần mềm",
            trangThai: "active",
            ngayTao: "2023-09-01"
          },
          {
            id: "2",
            maSo: "GV001",
            hoTen: "TS. Trần Thị Bình",
            email: "ttbinh@ctu.edu.vn",
            role: "GIANGVIEN",
            khoa: "Công nghệ thông tin",
            nganh: "Khoa học máy tính",
            trangThai: "active",
            ngayTao: "2020-01-15"
          },
          {
            id: "3",
            maSo: "ADMIN01",
            hoTen: "Nguyễn Quản Trị",
            email: "admin@ctu.edu.vn",
            role: "ADMIN",
            khoa: "Hệ thống",
            nganh: "Quản trị",
            trangThai: "active",
            ngayTao: "2019-08-01"
          }
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [axiosPrivate]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.maSo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleName = (role: string) => {
    switch (role) {
      case "SINHVIEN": return "Sinh viên";
      case "GIANGVIEN": return "Giảng viên";
      case "ADMIN": return "Quản trị viên";
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách người dùng...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý người dùng"
        description="Thêm, sửa, xóa tài khoản người dùng trong hệ thống"
        icon={Users}
        iconColor="from-blue-500 to-indigo-600"
        actions={
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã số, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="SINHVIEN">Sinh viên</option>
            <option value="GIANGVIEN">Giảng viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khoa/Ngành
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.hoTen}</div>
                      <div className="text-sm text-gray-500">{user.maSo}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{user.khoa}</div>
                    <div className="text-gray-500">{user.nganh}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.trangThai)}`}>
                      {user.trangThai === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.ngayTao).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === "SINHVIEN").length}</p>
            <p className="text-sm text-gray-600">Sinh viên</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === "GIANGVIEN").length}</p>
            <p className="text-sm text-gray-600">Giảng viên</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "ADMIN").length}</p>
            <p className="text-sm text-gray-600">Quản trị viên</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
