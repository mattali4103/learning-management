import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  KHHT_SERVICE,
  PROFILE_SERVICE,
  KQHT_SERVICE,
} from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import TinChiChart from "../../components/chart/TinChiChart";
import GPAChart from "../../components/chart/GPAChart";
import CreditProgressCard from "../../components/progress/CreditProgressCard";
import GPAProgressCard from "../../components/progress/GPAProgressCard";
import StatusCard from "../../components/progress/StatusCard";
import PageHeader from "../../components/PageHeader";
import {
  User,
  Calendar,
  BookOpen,
  Award,
  GraduationCap,
  Clock,
  Target,
  ArrowLeft,
} from "lucide-react";

interface UserInfo {
  maSo: string;
  hoTen: string;
  ngaySinh: Date;
  gioiTinh: boolean;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
}

interface ThongKeTinChiByHocKy {
  hocKy: any;
  soTinChiCaiThien: number;
  soTinChiDangKy: number;
}

interface ThongKeTinChi {
  tongSoTinChi: number;
  soTinChiTichLuy: number;
  soTinChiCaiThien: number;
}

interface DiemTrungBinhHocKy {
  hocKy: {
    maHocKy: number;
    tenHocKy: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    namHoc: {
      id: number;
      namBatDau: string;
      namKetThuc: string;
    };
  };
  diemTrungBinh: number;
  diemTrungBinhTichLuy: number;
}

const ThongTinSinhVien = () => {
  const { maSo, maLop } = useParams<{ maSo: string; maLop?: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tinChiTichLuy, setTinChiTichLuy] = useState<ThongKeTinChiByHocKy[]>([]);
  const [thongKeTinChi, setThongKeTinChi] = useState<ThongKeTinChi>({
    tongSoTinChi: 0,
    soTinChiTichLuy: 0,
    soTinChiCaiThien: 0,
  });
  const [diemTrungBinhHocKy, setDiemTrungBinhHocKy] = useState<DiemTrungBinhHocKy[]>([]);

  // Fetch student information
  useEffect(() => {
    if (!maSo) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileResponse = await axiosPrivate.get(
          PROFILE_SERVICE.GET_MY_PROFILE.replace(":maSo", maSo)
        );

        if (profileResponse.status === 200 && profileResponse.data?.code === 200) {
          setUserInfo(profileResponse.data.data);
          
          // Use student's data for subsequent API calls
          const studentData = profileResponse.data.data;
          
          // Fetch credit statistics
          try {
            const creditResponse = await axiosPrivate.get(
              KHHT_SERVICE.COUNT_TINCHI_IN_KHHT
                .replace(":khoaHoc", studentData.khoaHoc || "")
                .replace(":maNganh", studentData.maNganh || "")
                .replace(":maSo", maSo)
            );

            if (creditResponse.status === 200 && creditResponse.data?.code === 200) {
              setThongKeTinChi(creditResponse.data.data);
            }
          } catch (error) {
            console.warn("Could not fetch credit statistics:", error);
          }

          // Fetch credit accumulation by semester
          try {
            const tinChiResponse = await axiosPrivate.get(
              KHHT_SERVICE.COUNT_TINCHI_GROUP_BY_HOCKY.replace(":maSo", maSo)
            );

            if (tinChiResponse.status === 200 && tinChiResponse.data?.code === 200) {
              setTinChiTichLuy(tinChiResponse.data.data);
            }
          } catch (error) {
            console.warn("Could not fetch credit accumulation:", error);
          }

          // Fetch GPA by semester
          try {
            const gpaResponse = await axiosPrivate.post(
              KQHT_SERVICE.GET_DIEM_TRUNG_BINH_BY_HOCKY,
              { maSo: maSo }
            );

            if (gpaResponse.status === 200 && gpaResponse.data?.code === 200) {
              setDiemTrungBinhHocKy(gpaResponse.data.data);
            }
          } catch (error) {
            console.warn("Could not fetch GPA data:", error);
          }
        } else {
          throw new Error(`API returned code: ${profileResponse.data?.code || profileResponse.status}`);
        }
      } catch (error) {
        setError("Không thể lấy thông tin sinh viên. Vui lòng thử lại.");
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [axiosPrivate, maSo]);

  // Calculate statistics from actual data
  const statistics = useMemo(() => {
    const { tongSoTinChi, soTinChiTichLuy, soTinChiCaiThien } = thongKeTinChi;
    const tinChiConLai = Math.max(0, tongSoTinChi - soTinChiTichLuy);

    // Calculate cumulative GPA from latest GPA data
    const latestGPA =
      diemTrungBinhHocKy.length > 0
        ? diemTrungBinhHocKy[diemTrungBinhHocKy.length - 1].diemTrungBinhTichLuy
        : 0;

    return {
      tongSoTinChi,
      soTinChiTichLuy,
      tinChiConLai,
      soTinChiCaiThien,
      tinChiCanCaiThien: 0,
      diemTBTichLuy: latestGPA,
    };
  }, [thongKeTinChi, diemTrungBinhHocKy]);

  // Navigation handlers
  const handleBack = () => {
    if (maLop) {
      navigate(`/giangvien/lop/${maLop}`);
    } else {
      navigate("/giangvien/lop");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <Loading showOverlay={false} message="Đang tải thông tin sinh viên..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header with Back Button */}
      <PageHeader
        title={`Hồ sơ sinh viên: ${userInfo?.hoTen}`}
        description={`${userInfo?.maSo} - ${userInfo?.tenNganh}${maLop ? ` - Lớp ${maLop}` : ''}`}
        icon={GraduationCap}
        iconColor="from-blue-500 to-indigo-600"
        descriptionIcon={User}
        backButton={
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
      />

      {/* Progress Section with Circular Progress Bars */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Tiến độ học tập</h2>
        </div>

        {/* Main Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tín chỉ tích lũy */}
          <CreditProgressCard
            currentCredits={statistics.soTinChiTichLuy}
            totalCredits={156}
          />

          {/* Điểm trung bình tích lũy */}
          <GPAProgressCard currentGPA={statistics.diemTBTichLuy} maxGPA={4.0} />

          {/* Trạng thái tiến độ */}
          <StatusCard
            currentCredits={statistics.soTinChiTichLuy}
            totalCredits={statistics.tongSoTinChi}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {tinChiTichLuy.length}
            </p>
            <p className="text-sm text-gray-600">Học kỳ đã hoàn thành</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {(() => {
                if (tinChiTichLuy.length === 0) return 0;

                let totalTinChiRiengLe = 0;
                for (let i = 0; i < tinChiTichLuy.length; i++) {
                  const tinChiHocKy =
                    i === 0
                      ? tinChiTichLuy[i].soTinChiDangKy
                      : tinChiTichLuy[i].soTinChiDangKy -
                        tinChiTichLuy[i - 1].soTinChiDangKy;
                  totalTinChiRiengLe += tinChiHocKy;
                }

                return (totalTinChiRiengLe / tinChiTichLuy.length).toFixed(1);
              })()}
            </p>
            <p className="text-sm text-gray-600">Tín chỉ TB/học kỳ</p>
          </div>

          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <GraduationCap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">
              {((statistics.soTinChiTichLuy / 156) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Tiến độ tổng thể</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Thông tin sinh viên</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Mã số sinh viên",
                value: userInfo?.maSo,
                icon: BookOpen,
              },
              { label: "Họ và tên", value: userInfo?.hoTen, icon: User },
              {
                label: "Ngày sinh",
                value: userInfo?.ngaySinh
                  ? new Date(userInfo.ngaySinh).toLocaleDateString("vi-VN")
                  : "",
                icon: Calendar,
              },
              {
                label: "Giới tính",
                value: userInfo?.gioiTinh === true ? "Nữ" : "Nam",
                icon: User,
              },
              { label: "Lớp", value: userInfo?.maLop, icon: GraduationCap },
              { label: "Khóa học", value: userInfo?.khoaHoc, icon: Calendar },
              { label: "Ngành học", value: userInfo?.tenNganh, icon: BookOpen },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <IconComponent className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 block">
                      {item.label}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tin Chi Chart */}
          <TinChiChart
            data={
              tinChiTichLuy && tinChiTichLuy.length > 0
                ? tinChiTichLuy.map((item, index) => {
                    const hocKyId = item.hocKy?.maHocKy || null;
                    const namHocId = item.hocKy?.namHoc?.id || null;

                    return {
                      name: `Học kỳ ${index + 1}`,
                      tinChiTichLuy: item.soTinChiDangKy || 0,
                      tinChiCaiThien: item.soTinChiCaiThien || 0,
                      hocKyId,
                      namHocId,
                    };
                  })
                : []
            }
          />
          {/* GPA Chart */}
          <GPAChart
            data={
              diemTrungBinhHocKy && diemTrungBinhHocKy.length > 0
                ? diemTrungBinhHocKy.map((item, index) => {
                    const hocKyId = item.hocKy?.maHocKy || null;
                    const namHocId = item.hocKy?.namHoc?.id || null;

                    return {
                      name: `Học kỳ ${index + 1}`,
                      diem: Number(item.diemTrungBinhTichLuy) || 0,
                      hocKyId,
                      namHocId,
                    };
                  })
                : []
            }
          />
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm">
              Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThongTinSinhVien;
