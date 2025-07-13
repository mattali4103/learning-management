import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Users, GraduationCap, Copy } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import type { HocPhan } from "../../types/HocPhan";
import type { Nganh } from "../../types/Nganh";
import Loading from "../../components/Loading";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
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

  // Columns for required courses table
  const requiredCoursesColumns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600">
              {row.index + 1}
            </span>
          </div>
        ),
        size: 80,
        enableSorting: false,
      },
      {
        id: "maHp",
        accessorKey: "maHp",
        header: "Mã học phần",
        cell: ({ getValue }) => {
          const code = getValue() as string;
          return (
            <div 
              className="font-mono text-sm text-blue-700 px-3 py-1.5 flex items-center cursor-pointer group"
              onClick={() => copyToClipboard(code)}
              title="Click để sao chép mã học phần"
            >
              {code}
              <Copy className="w-3.5 h-3.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        },
        size: 140,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "tenHp",
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="max-w-xs">
            <div className="font-semibold text-gray-900 text-sm leading-tight">
              {getValue() as string || "Chưa có tên"}
            </div>
          </div>
        ),
        size: 300,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "tinChi",
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700">
              {getValue() as number || 0}
            </span>
          </div>
        ),
        size: 100,
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        id: "loaiHp",
        accessorKey: "loaiHp",
        header: "Loại học phần",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {getValue() as string || "N/A"}
            </span>
          </div>
        ),
        size: 120,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "hocPhanTienQuyet",
        accessorKey: "hocPhanTienQuyet",
        header: "Tiên quyết",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {getValue() as string || "-"}
            </span>
          </div>
        ),
        size: 150,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
    ],
    []
  );

  // Columns for elective courses table
  const electiveCoursesColumns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600">
              {row.index + 1}
            </span>
          </div>
        ),
        size: 80,
        enableSorting: false,
      },
      {
        id: "maHp",
        accessorKey: "maHp",
        header: "Mã học phần",
        cell: ({ getValue }) => {
          const code = getValue() as string;
          return (
            <div 
              className="font-mono text-sm text-green-700 px-3 py-1.5 flex items-center cursor-pointer group"
              onClick={() => copyToClipboard(code)}
              title="Click để sao chép mã học phần"
            >
              {code}
              <Copy className="w-3.5 h-3.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        },
        size: 140,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "tenHp",
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="max-w-xs">
            <div className="font-semibold text-gray-900 text-sm leading-tight">
              {getValue() as string || "Chưa có tên"}
            </div>
          </div>
        ),
        size: 300,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "tinChi",
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-green-700">
              {getValue() as number || 0}
            </span>
          </div>
        ),
        size: 100,
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        id: "loaiHp",
        accessorKey: "loaiHp",
        header: "Loại học phần",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {getValue() as string || "N/A"}
            </span>
          </div>
        ),
        size: 120,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        id: "hocPhanTienQuyet",
        accessorKey: "hocPhanTienQuyet",
        header: "Tiên quyết",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {getValue() as string || "-"}
            </span>
          </div>
        ),
        size: 150,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
    ],
    []
  );

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
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {chuongTrinhDaoTao.nganh.tenNganh} - Khóa {chuongTrinhDaoTao.khoaHoc}
            </h1>
            <p className="text-gray-600">
              Mã ngành: {chuongTrinhDaoTao.nganh.maNganh} • Chương trình đào tạo khóa {chuongTrinhDaoTao.khoaHoc}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng số tín chỉ</p>
              <p className="text-3xl font-bold text-blue-600">
                {chuongTrinhDaoTao.tongSoTinChi}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tín chỉ tự chọn</p>
              <p className="text-3xl font-bold text-green-600">
                {chuongTrinhDaoTao.tongSoTinChiTuChon}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng môn học</p>
              <p className="text-3xl font-bold text-purple-600">
                {(chuongTrinhDaoTao.hocPhanList?.length || 0) + 
                 (chuongTrinhDaoTao.nhomHocPhanTuChon?.reduce((total, nhom) => total + (nhom.hocPhanTuChonList?.length || 0), 0) || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Summary Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết chương trình đào tạo
              </h2>
              <p className="text-gray-600 mt-1">
                {courseTypeStatistics.totalCourses} học phần bắt buộc • 
                {chuongTrinhDaoTao?.nhomHocPhanTuChon?.length || 0} nhóm tự chọn • 
                {courseTypeStatistics.daiCuongCourses} Đại Cương • 
                {courseTypeStatistics.coSoNganhCourses} Cơ Sở Ngành • 
                {courseTypeStatistics.chuyenNganhCourses} Chuyên Ngành
              </p>
            </div>
          </div>
        </div>
        
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
          <div>
            {filteredCoursesByType.length === 0 && filteredElectiveGroups.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {activeTab === "tatca" ? "Chưa có học phần nào" : `Chưa có học phần ${activeTab}`}
                </h3>
                <p className="text-gray-500">
                  {activeTab === "tatca" 
                    ? "Hiện tại chưa có học phần nào trong chương trình đào tạo" 
                    : `Hiện tại chưa có học phần ${activeTab} nào`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Required Courses Section */}
                {filteredCoursesByType.length > 0 && (
                  <div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {activeTab === "tatca" 
                              ? "Danh sách học phần bắt buộc" 
                              : `Danh sách học phần bắt buộc - ${activeTab}`
                            }
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Tổng cộng {filteredCoursesByType.length} học phần bắt buộc
                            {activeTab !== "tatca" && ` loại ${activeTab}`} trong chương trình đào tạo
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          activeTab === "tatca" ? "bg-blue-100 text-blue-800" :
                          activeTab === "Đại cương" ? "bg-green-100 text-green-800" :
                          activeTab === "Cơ sở ngành" ? "bg-purple-100 text-purple-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {filteredCoursesByType.reduce((total: number, hp: HocPhan) => total + (hp.tinChi || 0), 0)} tín chỉ
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden mb-8">
                      <KeHoachHocTapTable
                        name={activeTab === "tatca" ? "Học phần bắt buộc" : `Học phần bắt buộc ${activeTab}`}
                        data={filteredCoursesByType}
                        columns={requiredCoursesColumns}
                        emptyStateTitle={activeTab === "tatca" ? "Chưa có học phần bắt buộc" : `Chưa có học phần bắt buộc ${activeTab}`}
                        emptyStateDescription={
                          activeTab === "tatca" 
                            ? "Hiện tại chưa có học phần bắt buộc nào trong chương trình đào tạo"
                            : `Hiện tại chưa có học phần bắt buộc ${activeTab} nào trong chương trình đào tạo`
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Elective Course Groups Section */}
                {filteredElectiveGroups.length > 0 && (
                  <div>
                    <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-800">
                            {activeTab === "tatca" 
                              ? "Danh sách nhóm học phần tự chọn" 
                              : `Nhóm học phần tự chọn - ${activeTab}`
                            }
                          </h3>
                          <p className="text-emerald-600 text-sm">
                            Tổng cộng {filteredElectiveGroups.length} nhóm học phần tự chọn
                            {activeTab !== "tatca" && ` có chứa học phần ${activeTab}`}
                          </p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                          {filteredElectiveGroups.reduce((total, nhom) => total + (nhom.tinChiYeuCau || 0), 0)} tín chỉ yêu cầu
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {filteredElectiveGroups.map((nhom, nhomIndex) => {
                        // Filter courses in this group by type if not showing all
                        const coursesInGroup = activeTab === "tatca" 
                          ? nhom.hocPhanTuChonList || []
                          : (nhom.hocPhanTuChonList || []).filter(hp => hp.loaiHp === activeTab);

                        return (
                          <div
                            key={`${nhom.id}-${nhomIndex}`}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                          >
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                                  Nhóm học phần tự chọn: {nhom.tenNhom}
                                </h3>
                                <p className="text-emerald-600 text-sm">
                                  Yêu cầu: <span className="font-medium">{nhom.tinChiYeuCau}</span> tín chỉ
                                  {activeTab !== "tatca" && (
                                    <span className="ml-2">• Hiển thị {coursesInGroup.length} học phần {activeTab}</span>
                                  )}
                                </p>
                              </div>
                              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                                {coursesInGroup.length} học phần
                              </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <KeHoachHocTapTable
                                name={`Nhóm ${nhom.tenNhom}`}
                                data={coursesInGroup}
                                columns={electiveCoursesColumns}
                                emptyStateTitle="Chưa có học phần tự chọn"
                                emptyStateDescription={
                                  activeTab === "tatca"
                                    ? `Nhóm ${nhom.tenNhom} chưa có học phần tự chọn nào`
                                    : `Nhóm ${nhom.tenNhom} chưa có học phần ${activeTab} nào`
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTDTDetail;
