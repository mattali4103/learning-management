import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {

  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";

import Loading from "../../components/Loading";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import DeleteModal from "../../components/modals/DeleteModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";


const KeHoachHocTapUnified = () => {


  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { maSo } = auth.user || {};

  // Fetch dữ liệu học kỳ từ API
  const fetchHocKy = useCallback(
    async (maSo: string) => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          KHHT_SERVICE.GET_HOCKY.replace(":maSo", maSo),
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (response.status === 200 && response.data?.code === 200) {
          const hocKyData = response.data.data;
          localStorage.setItem("hocKy", JSON.stringify(hocKyData));
          setError(null);
        } else {
          throw new Error(
            `API returned code: ${response.data?.code || response.status}`
          );
        }
      } catch (error) {
        console.error("Error fetching hoc ky:", error);
        setError("Không thể lấy thông tin học kỳ. Vui lòng thử lại.");
        try {
          const localData = localStorage.getItem("hocKy");
          if (localData) {

            setError(null);
          }
        } catch (localError) {
          console.error(
            "Lỗi khi parse dữ liệu học kỳ từ localStorage:",
            localError
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [axiosPrivate]
  );

  useEffect(() => {
    if (maSo) {
      fetchHocKy(maSo);
    }
  }, [maSo, fetchHocKy]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Loading chỉ cho navigation data */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu học kỳ...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : (
        /* Nội dung hiển thị */
        <UnifiedContentDisplay />
      )}
    </div>
  );
};

const UnifiedContentDisplay = () => {
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();
  const { maSo, khoaHoc, maNganh } = auth.user || {};
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allData, setAllData] = useState<KeHoachHocTap[]>([]);

  // State cho delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hocPhanToDelete, setHocPhanToDelete] = useState<KeHoachHocTap | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab states
  const [activeMainTab, setActiveMainTab] = useState<"overview" | "coursetype" | "year">("overview");
  const [activeCourseTypeTab, setActiveCourseTypeTab] = useState<string>("all");
  const [activeYearTab, setActiveYearTab] = useState<string>("all");

  // Modal states for success/error messages
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Hàm xử lý xóa học phần
  const fetchDeleteHocPhan = useCallback(
    async (id: number) => {
      try {
        setIsDeleting(true);
        const response = await axiosPrivate.delete(
          KHHT_SERVICE.DELETE.replace(":id", id.toString()),
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (response.status === 200 && response.data?.code === 200) {
          setError(null);
          // Reload trang sau khi xóa thành công
          window.location.reload();
        } else {
          throw new Error(
            `API returned code: ${response.data?.code || response.status}`
          );
        }
      } catch (error) {
        console.error("Error deleting hoc phan:", error);
        setError("Không thể xóa học phần. Vui lòng thử lại.");
      } finally {
        setIsDeleting(false);
      }
    },
    [axiosPrivate]
  );

  // Hàm mở modal xác nhận xóa
  const handleDeleteClick = useCallback((hocPhan: KeHoachHocTap) => {
    setHocPhanToDelete(hocPhan);
    setIsDeleteModalOpen(true);
  }, []);

  // Hàm xác nhận xóa
  const handleConfirmDelete = useCallback(() => {
    if (hocPhanToDelete && !isDeleting) {
      fetchDeleteHocPhan(hocPhanToDelete.id);
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [hocPhanToDelete, isDeleting, fetchDeleteHocPhan]);

  // Hàm đóng modal
  const handleCloseModal = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [isDeleting]);

  const columns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        accessorKey: "id",
        header: "STT",
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "maHp",
        header: "Mã học phần",
        cell: ({ row }) => (
          <div className="font-mono text-sm text-blue-700 px-3 py-1.5">
            {row.getValue("maHp")}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ getValue }) => (
          <div className="max-w-xs">
            <div className="font-semibold text-gray-900 text-sm leading-tight">
              {getValue() as string}
            </div>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-emerald-700">
              {getValue() as number}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "loaiHp",
        header: "Loại học phần",
        cell: ({ row }) => {
          const loaiHp = row.getValue("loaiHp") as string;
          const colorMap: Record<string, string> = {
            "Đại cương": "bg-blue-100 text-blue-800",
            "Cơ sở ngành": "bg-green-100 text-green-800",
            "Chuyên ngành": "bg-purple-100 text-purple-800",
          };
          return (
            <div className="flex justify-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[loaiHp] || "bg-gray-100 text-gray-800"}`}
              >
                {loaiHp}
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "maHocKy",
        accessorKey: "tenHocKy",
        header: "Học kỳ",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1.5">
              {getValue() as string}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "namHocId",
        accessorKey: "namBdNamKt",
        header: "Năm học",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600">
              {getValue() as string}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "Tiên quyết",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {(getValue() as string) || "Không"}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200 group"
              title="Xóa học phần"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleDeleteClick]
  );

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tất cả 3 loại học phần cùng lúc
        const [daiCuongResponse, coSoResponse, chuyenNganhResponse] =
          await Promise.all([
            axiosPrivate.post<any>(KHHT_SERVICE.KHHT_SINHVIEN_BY_LOAI_HP, {
              maSo: maSo,
              khoaHoc: khoaHoc,
              maNganh: maNganh,
              loaiHp: "Đại cương",
            }),
            axiosPrivate.post<any>(KHHT_SERVICE.KHHT_SINHVIEN_BY_LOAI_HP, {
              maSo: maSo,
              khoaHoc: khoaHoc,
              maNganh: maNganh,
              loaiHp: "Cơ sở ngành",
            }),
            axiosPrivate.post<any>(KHHT_SERVICE.KHHT_SINHVIEN_BY_LOAI_HP, {
              maSo: maSo,
              khoaHoc: khoaHoc,
              maNganh: maNganh,
              loaiHp: "Chuyên ngành",
            }),
          ]);

        // Xử lý và gộp dữ liệu
        const processResponse = (response: any): KeHoachHocTap[] => {
          if (response.status === 200 && response.data?.code === 200) {
            return response.data.data.map((item: any) => ({
              id: item.id,
              maHp: item.hocPhan.maHp,
              tenHp: item.hocPhan.tenHp,
              tinChi: item.hocPhan.tinChi,
              hocPhanTienQuyet: item.hocPhan.hocPhanTienQuyet,
              loaiHp: item.hocPhan.loaiHp,
              maHocKy: item.hocKy.maHocKy,
              tenHocKy: item.hocKy.tenHocKy,
              namHocId: item.namHoc.id,
              namBdNamKt: item.namHoc.namBatDau + "-" + item.namHoc.namKetThuc,
            }));
          }
          return [];
        };

        const allHocPhan = [
          ...processResponse(daiCuongResponse),
          ...processResponse(coSoResponse),
          ...processResponse(chuyenNganhResponse),
        ];

        setAllData(allHocPhan);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (maSo && khoaHoc && maNganh) {
      fetchAllData();
    }
  }, [axiosPrivate, maSo, khoaHoc, maNganh]);

  // Calculate statistics from all data
  const statistics = useMemo(() => {
    const totalCredits = allData.reduce((sum, item) => sum + item.tinChi, 0);
    const totalSubjects = allData.length;
    
    // Count by course type
    const daiCuongCount = allData.filter(item => item.loaiHp === "Đại cương").length;
    const coSoNganhCount = allData.filter(item => item.loaiHp === "Cơ sở ngành").length;
    const chuyenNganhCount = allData.filter(item => item.loaiHp === "Chuyên ngành").length;
    // Count unique semesters
    const semesterSet = new Set<string>();
    allData.forEach(item => {
      if (item.tenHocKy && item.namBdNamKt) {
        semesterSet.add(`${item.tenHocKy}-${item.namBdNamKt}`);
      }
    });

    return {
      totalCredits,
      totalSubjects,
      totalSemesters: semesterSet.size,
      daiCuongCount,
      coSoNganhCount,
      chuyenNganhCount,
    };
  }, [allData]);

  // Get unique years for year tab
  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    allData.forEach(item => {
      if (item.namBdNamKt) {
        years.add(item.namBdNamKt);
      }
    });
    return Array.from(years).sort();
  }, [allData]);

  // Hàm để lọc dữ liệu theo năm học và học kỳ
  const filteredData = useMemo(() => {
    if (!allData || allData.length === 0) return [];

    let filtered = [...allData];

    // Lọc theo ID năm học từ params
    const namHocIdParam = searchParams.get("namHocId");
    if (namHocIdParam) {
      const namHocId = parseInt(namHocIdParam);
      filtered = filtered.filter((item) => item.namHocId === namHocId);
    }

    // Lọc theo ID học kỳ từ params
    const hocKyIdParam = searchParams.get("hocKyId");
    if (hocKyIdParam) {
      const hocKyId = parseInt(hocKyIdParam);
      filtered = filtered.filter((item) => item.maHocKy === hocKyId);
    }

    // Additional filtering based on active tabs
    if (activeMainTab === "coursetype" && activeCourseTypeTab !== "all") {
      filtered = filtered.filter(item => item.loaiHp === activeCourseTypeTab);
    }

    if (activeMainTab === "year" && activeYearTab !== "all") {
      filtered = filtered.filter(item => item.namBdNamKt === activeYearTab);
    }

    return filtered;
  }, [allData, searchParams, activeMainTab, activeCourseTypeTab, activeYearTab]);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Loading showOverlay={false} message="Đang tải dữ liệu học phần..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
          Lỗi: {error}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Main Tab Bar */}
        <div className="flex space-x-2 border-b border-blue-400 mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-xl shadow-md px-2 pt-2">
          <button
            className={`px-6 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm
              ${
                activeMainTab === "overview"
                  ? "bg-white border-x border-t border-b-0 border-blue-500 text-blue-700 shadow-lg z-10"
                  : "bg-blue-50 text-blue-500 hover:text-blue-700 hover:bg-white/80"
              }
            `}
            onClick={() => setActiveMainTab("overview")}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tổng quan
            </div>
          </button>
          <button
            className={`px-6 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm
              ${
                activeMainTab === "coursetype"
                  ? "bg-white border-x border-t border-b-0 border-blue-500 text-blue-700 shadow-lg z-10"
                  : "bg-blue-50 text-blue-500 hover:text-blue-700 hover:bg-white/80"
              }
            `}
            onClick={() => setActiveMainTab("coursetype")}
          >
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Theo loại học phần
            </div>
          </button>
          <button
            className={`px-6 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm
              ${
                activeMainTab === "year"
                  ? "bg-white border-x border-t border-b-0 border-blue-500 text-blue-700 shadow-lg z-10"
                  : "bg-blue-50 text-blue-500 hover:text-blue-700 hover:bg-white/80"
              }
            `}
            onClick={() => setActiveMainTab("year")}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Theo năm học
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeMainTab === "overview" && (
            <div>
              <KeHoachHocTapTable
                name="Tất cả học phần trong kế hoạch học tập"
                data={filteredData}
                columns={columns}
                loading={loading}
              />
            </div>
          )}

          {activeMainTab === "coursetype" && (
            <div>
              {/* Course Type Sub-tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveCourseTypeTab("all")}
                  className={`flex-1 px-6 py-4 text-center transition-colors ${
                    activeCourseTypeTab === "all"
                      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">
                    Tất cả ({statistics.totalSubjects})
                  </span>
                </button>
                <button
                  onClick={() => setActiveCourseTypeTab("Đại cương")}
                  className={`flex-1 px-6 py-4 text-center transition-colors ${
                    activeCourseTypeTab === "Đại cương"
                      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">
                    Đại Cương ({statistics.daiCuongCount})
                  </span>
                </button>
                <button
                  onClick={() => setActiveCourseTypeTab("Cơ sở ngành")}
                  className={`flex-1 px-6 py-4 text-center transition-colors ${
                    activeCourseTypeTab === "Cơ sở ngành"
                      ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">
                    Cơ Sở Ngành ({statistics.coSoNganhCount})
                  </span>
                </button>
                <button
                  onClick={() => setActiveCourseTypeTab("Chuyên ngành")}
                  className={`flex-1 px-6 py-4 text-center transition-colors ${
                    activeCourseTypeTab === "Chuyên ngành"
                      ? "bg-purple-50 text-purple-700 border-b-2 border-purple-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">
                    Chuyên Ngành ({statistics.chuyenNganhCount})
                  </span>
                </button>
              </div>

              <KeHoachHocTapTable
                name={activeCourseTypeTab === "all" 
                  ? "Tất cả học phần" 
                  : `Học phần ${activeCourseTypeTab}`
                }
                data={filteredData}
                columns={columns}
                loading={loading}
              />
            </div>
          )}

          {activeMainTab === "year" && (
            <div>
              {/* Year Sub-tabs */}
              <div className="flex flex-wrap border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveYearTab("all")}
                  className={`px-6 py-4 text-center transition-colors ${
                    activeYearTab === "all"
                      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">
                    Tất cả ({statistics.totalSubjects})
                  </span>
                </button>
                {uniqueYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setActiveYearTab(year)}
                    className={`px-6 py-4 text-center transition-colors ${
                      activeYearTab === year
                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium">
                      {year} ({allData.filter(item => item.namBdNamKt === year).length})
                    </span>
                  </button>
                ))}
              </div>
              <KeHoachHocTapTable
                name={activeYearTab === "all" 
                  ? "Tất cả năm học" 
                  : `Năm học ${activeYearTab}`
                }
                data={filteredData}
                columns={columns}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseModal}
        title="Xác nhận xóa học phần"
        message={`Bạn có chắc chắn muốn xóa học phần "${hocPhanToDelete?.tenHp}" không? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
      />

      {showSuccessModal && (
        <SuccessMessageModal
          isOpen={showSuccessModal}
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage("");
          }}
        />
      )}

      {showErrorModal && (
        <ErrorMessageModal
          isOpen={showErrorModal}
          message={errorMessage}
          onClose={() => {
            setShowErrorModal(false);
            setErrorMessage("");
          }}
        />
      )}
    </div>
  );
};

export default KeHoachHocTapUnified;
