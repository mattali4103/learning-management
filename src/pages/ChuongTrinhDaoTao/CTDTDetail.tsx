import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Users, GraduationCap } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import type { HocPhan } from "../../types/HocPhan";
import type { Nganh } from "../../types/Nganh";
import Loading from "../../components/Loading";
import PageHeader from "../../components/PageHeader";
import StatisticsCard from "../../components/StatisticsCard";
import { CollapsibleCourseTable } from "../../components/table/CollapsibleCourseTable";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";

interface HocPhanTuChon{
    id: number;
    tenNhom: string;
    tinChiYeuCau: number;
    khoaHoc: string;
    maNganh: number;
    hocPhanTuChonList: HocPhan[];
}

interface ChuongTrinhDaoTaoDetail {
  id: number;
  khoaHoc: string;
  tongSoTinChi: number;
  tongSoTinChiTuChon: number;
  nganh: Nganh;
  hocPhanList: HocPhan[];
  nhomHocPhanTuChon: HocPhanTuChon[];
}

const CTDTDetail = () => {
  const { maNganh, khoaHoc } = useParams<{ maNganh: string; khoaHoc: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  
  const [chuongTrinhDaoTao, setChuongTrinhDaoTao] = useState<ChuongTrinhDaoTaoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tatca");

  // Function to copy course code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`Đã sao chép: ${text}`);
      })
      .catch((error) => {
        alert("Không thể sao chép mã học phần");
        console.error("Copy to clipboard failed:", error);
      });
  };

  // Fetch chi tiết chương trình đào tạo
  const fetchCTDTDetail = useCallback(async () => {
    if (!maNganh || !khoaHoc) return;
    
    try {
      setLoading(true);
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_NGANH.replace(":maNganh", maNganh).replace(":khoaHoc", khoaHoc)
      );
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        setChuongTrinhDaoTao({
          id: data.id || 0,
          khoaHoc: data.khoaHoc || "",
          tongSoTinChi: data.tongSoTinChi || 0,
          tongSoTinChiTuChon: data.tongSoTinChiTuChon || 0,
          nganh: data.nganh || { maNganh: maNganh, tenNganh: "Chưa có tên" },
          hocPhanList: data.hocPhanList || [],
          nhomHocPhanTuChon: data.nhomHocPhanTuChon || [],
        });
      }
    } catch (error) {
      console.error("Error fetching CTDT detail:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maNganh, khoaHoc]);

  useEffect(() => {
    fetchCTDTDetail();
  }, [fetchCTDTDetail]);

  // Get filtered data based on course type
  const allCourses = useMemo(() => chuongTrinhDaoTao?.hocPhanList || [], [chuongTrinhDaoTao?.hocPhanList]);
  
  const filteredCoursesByType = useMemo(() => {
    if (activeTab === "tatca") {
      return allCourses;
    }
    return allCourses.filter(hp => hp.loaiHp === activeTab);
  }, [allCourses, activeTab]);

  // Calculate statistics by course type
  const courseTypeStatistics = useMemo(() => {
    const totalCourses = allCourses.length;
    const daiCuongCourses = allCourses.filter(hp => hp.loaiHp === "Đại cương").length;
    const coSoNganhCourses = allCourses.filter(hp => hp.loaiHp === "Cơ sở ngành").length;
    const chuyenNganhCourses = allCourses.filter(hp => hp.loaiHp === "Chuyên ngành").length;
    
    return {
      totalCourses,
      daiCuongCourses,
      coSoNganhCourses,
      chuyenNganhCourses,
    };
  }, [allCourses]);

  // Get elective course groups for the current active tab
  const filteredElectiveGroups = useMemo(() => {
    const allGroups = chuongTrinhDaoTao?.nhomHocPhanTuChon || [];
    if (activeTab === "tatca") {
      return allGroups;
    }
    // Filter groups that have courses of the selected type
    return allGroups.filter(nhom => 
      nhom.hocPhanTuChonList?.some(hp => hp.loaiHp === activeTab)
    );
  }, [chuongTrinhDaoTao?.nhomHocPhanTuChon, activeTab]);


  if (loading) {
    return <Loading />;
  }

  if (!chuongTrinhDaoTao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy chương trình đào tạo
          </h2>
          <p className="text-gray-600">Vui lòng kiểm tra lại mã ngành.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title={`${chuongTrinhDaoTao.nganh.tenNganh} - Khóa ${chuongTrinhDaoTao.khoaHoc}`}
        description={`Mã ngành: ${chuongTrinhDaoTao.nganh.maNganh} • Chương trình đào tạo khóa ${chuongTrinhDaoTao.khoaHoc}`}
        icon={BookOpen}
        iconColor="from-green-500 to-emerald-600"
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatisticsCard
          title="Tổng số tín chỉ"
          value={chuongTrinhDaoTao.tongSoTinChi}
          icon={GraduationCap}
          colorScheme="blue"
          size="md"
        />
        
        <StatisticsCard
          title="Tín chỉ tự chọn"
          value={chuongTrinhDaoTao.tongSoTinChiTuChon}
          icon={Users}
          colorScheme="green"
          size="md"
        />
        
        <StatisticsCard
          title="Tổng môn học"
          value={
            (chuongTrinhDaoTao.hocPhanList?.length || 0) + 
            (chuongTrinhDaoTao.nhomHocPhanTuChon?.reduce((total, nhom) => total + (nhom.hocPhanTuChonList?.length || 0), 0) || 0)
          }
          icon={BookOpen}
          colorScheme="purple"
          size="md"
        />
      </div>

      {/* Tab Navigation & Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"> 
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("tatca")}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === "tatca"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">
              Tất cả ({courseTypeStatistics.totalCourses})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("Đại cương")}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === "Đại cương"
                ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">
              Đại Cương ({courseTypeStatistics.daiCuongCourses})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("Cơ sở ngành")}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === "Cơ sở ngành"
                ? "bg-purple-50 text-purple-700 border-b-2 border-purple-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">
              Cơ Sở Ngành ({courseTypeStatistics.coSoNganhCourses})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("Chuyên ngành")}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === "Chuyên ngành"
                ? "bg-orange-50 text-orange-700 border-b-2 border-orange-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">
              Chuyên Ngành ({courseTypeStatistics.chuyenNganhCourses})
            </span>
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          <CollapsibleCourseTable
            name={activeTab === "tatca" 
              ? "Chi tiết chương trình đào tạo" 
              : `Chi tiết chương trình đào tạo - ${activeTab}`
            }
            requiredCourses={filteredCoursesByType}
            electiveGroups={filteredElectiveGroups}
            activeTab={activeTab}
            loading={loading}
            emptyStateTitle={activeTab === "tatca" ? "Chưa có học phần nào" : `Chưa có học phần ${activeTab}`}
            emptyStateDescription={
              activeTab === "tatca" 
                ? "Hiện tại chưa có học phần nào trong chương trình đào tạo" 
                : `Hiện tại chưa có học phần ${activeTab} nào`
            }
            onCopyToClipboard={copyToClipboard}
          />
        </div>
      </div>
    </div>
  );
};

export default CTDTDetail;
